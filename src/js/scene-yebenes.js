import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import refreshScrollTriggerOnMedia from "./helpers/refreshScrollTriggerOnMedia";

gsap.registerPlugin(ScrollTrigger);

// A partir del tercer plano, la cámara es esa misma ilustración.
const FRAMES = {
  wide: {
    w: 1920,
    h: 1080,
    points: [
      { x: 0.369, y: 0.35 },
      { x: 0.563, y: 0.472 },
    ],
  },
  narrow: {
    w: 875,
    h: 1080,
    points: [
      { x: 0.368, y: 0.332 },
      { x: 0.592, y: 0.506 },
    ],
  },
};

function frameFor(width) {
  return width < 700 ? FRAMES.narrow : FRAMES.wide;
}

// Scroll (en alturas de viewport) por unidad de recorrido sobre la imagen.
const SCROLL_PER_UNIT = 2.05;
// Tres planos antes del vídeo: cada uno se queda un poco y se cruza con el siguiente.
const S1 = 0.85;
const XF = 0.4;
const S2 = 0.7;
const S3 = 1;
const SOUT = 0.45;
const SLIDES = S1 + XF + S2 + XF + S3 + SOUT;
// El vídeo aéreo empieza en cuanto se ha ido el último plano.
const INTRO = 0;
// La aérea se queda en pantalla, y un poco más antes de salir.
const AERIAL_HOLD = 1.6;
// Travelling desde el plano general hasta el primer punto.
const APPROACH = 1.25;
// Salir de cada punto cuesta scroll, con un margen extra antes de moverse.
const HOLD = 1.6;
// Travelling de vuelta al plano general.
const EXIT = 1.25;
// El indicador aguanta un tramo al entrar en la escena.
const INDICATOR_PX = 280;

const CLIP_HIDDEN = "inset(0% 0% 100% 0%)";
const CLIP_SHOWN = "inset(0% 0% 0% 0%)";

function normDist(a, b, aspect) {
  return Math.hypot((a.x - b.x) * aspect, a.y - b.y);
}

function headerOffset() {
  const header = document.querySelector(".v-h");
  if (!header) return 0;
  const cs = getComputedStyle(header);
  if (cs.display === "none" || cs.visibility === "hidden") return 0;
  if (cs.position !== "sticky" && cs.position !== "fixed") return 0;
  return Math.round(header.getBoundingClientRect().height) || 0;
}

function mediaSrc(video) {
  return (
    video?.getAttribute("src") ||
    video?.querySelector("source")?.getAttribute("src") ||
    ""
  );
}

function playVideo(video) {
  if (!mediaSrc(video)) return;
  try {
    video.currentTime = 0;
  } catch (e) {
    /* metadata aún no disponible */
  }
  const pending = video.play();
  if (pending) pending.catch(() => {});
}

function stopVideo(video) {
  if (!video) return;
  video.pause();
  try {
    video.currentTime = 0;
  } catch (e) {
    /* sin metadata */
  }
}

function buildCallout(mark) {
  const dot = mark.querySelector(".scene-yebenes__dot");
  const line = mark.querySelector(".scene-yebenes__line");
  const frame = mark.querySelector(".scene-yebenes__frame");
  const video = mark.querySelector("video");

  if (mediaSrc(video)) frame.classList.add("has-media");

  gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 0.55, autoAlpha: 0 });
  gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

  const tl = gsap.timeline({ paused: true });
  tl.to(dot, { autoAlpha: 1, scale: 1, duration: 0.38, ease: "power2.out" })
    .to(line, { scaleX: 1, duration: 0.42, ease: "power2.inOut" }, "-=0.06")
    .fromTo(
      frame,
      { clipPath: CLIP_HIDDEN },
      { clipPath: CLIP_SHOWN, duration: 0.58, ease: "power2.inOut" },
      "-=0.08"
    );

  return { mark, frame, video, tl, open: false };
}

function buildAerial(aerial) {
  const video = aerial.querySelector("video");
  gsap.set(aerial, { autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true });
  tl.fromTo(
    aerial,
    { clipPath: CLIP_HIDDEN },
    { clipPath: CLIP_SHOWN, duration: 0.58, ease: "power2.inOut" }
  );

  return { mark: aerial, frame: aerial, video, tl, open: false };
}

export function initSceneYebenes() {
  const root = document.querySelector(".scene-yebenes");
  if (!root || root.dataset.bound === "1") return;
  root.dataset.bound = "1";

  refreshScrollTriggerOnMedia();

  const stage = root.querySelector(".scene-yebenes__stage");
  const world = root.querySelector(".scene-yebenes__world");
  const image = root.querySelector(".scene-yebenes__img");
  const aerial = root.querySelector(".scene-yebenes__aerial");
  const callouts = root.querySelector(".scene-yebenes__callouts");
  const marks = [...root.querySelectorAll(".scene-yebenes__mark")];
  if (!stage || !world || !aerial || marks.length < 2) return;

  const opening = frameFor(stage.clientWidth || window.innerWidth);
  const points = opening.points;
  const T01 = normDist(points[0], points[1], opening.w / opening.h) * SCROLL_PER_UNIT;
  const PRE = SLIDES + INTRO;
  const FIRST_STOP = PRE + AERIAL_HOLD + APPROACH;
  const TOTAL = FIRST_STOP + HOLD + T01 + HOLD + EXIT;

  const holdStarts = [FIRST_STOP, FIRST_STOP + HOLD + T01];
  const aerialStart = PRE / TOTAL;
  const aerialEnd = (PRE + AERIAL_HOLD) / TOTAL;
  const s1Until = S1 / TOTAL;
  const s2From = (S1 + XF) / TOTAL;
  const s2Until = (S1 + XF + S2) / TOTAL;
  const s3From = (S1 + XF + S2 + XF) / TOTAL;
  const s3Until = (S1 + XF + S2 + XF + S3) / TOTAL;

  const state = {
    fit: { x: 0, y: 0, scale: 1 },
    points: points.map(() => ({ x: 0, y: 0 })),
  };

  const layout = () => {
    const top = headerOffset();
    root.style.setProperty("--scene-top", `${top}px`);

    const vw = stage.clientWidth;
    const vh = stage.clientHeight || window.innerHeight - top;
    const shot = frameFor(vw);
    const slideAspect = shot.w / shot.h;
    let slideW = vw;
    let slideH = slideW / slideAspect;
    if (slideH > vh) {
      slideH = vh;
      slideW = slideH * slideAspect;
    }
    root.style.setProperty("--slide-w", `${slideW}px`);
    root.style.setProperty("--slide-h", `${slideH}px`);
    const zoom = vw < 700 ? 1.85 : 2.25;
    const imgH = vh * zoom;
    const imgW = imgH * slideAspect;

    gsap.set(world, { width: imgW, height: imgH, transformOrigin: "0% 0%" });

    const frame = marks[0].querySelector(".scene-yebenes__frame");
    const padX = 12;
    const calloutSpan = (frame?.offsetLeft || 0) + (frame?.offsetWidth || 200) + padX;
    const frameH = frame?.offsetHeight || vh * 0.5;
    const anchorX = Math.min(vw / 2, Math.max(padX, vw - calloutSpan));
    const anchorY = Math.min(vh - frameH / 2 - 12, Math.max(frameH / 2 + 12, vh / 2));

    callouts.style.setProperty("--anchor-x", `${anchorX}px`);
    callouts.style.setProperty("--anchor-y", `${anchorY}px`);

    state.points = shot.points.map((point) => ({
      x: anchorX - point.x * imgW,
      y: anchorY - point.y * imgH,
    }));

    const fitScale = Math.min(vw / imgW, vh / imgH);
    state.fit = {
      scale: fitScale,
      x: (vw - imgW * fitScale) / 2,
      y: (vh - imgH * fitScale) / 2,
    };
  };

  const mm = gsap.matchMedia();

  mm.add(
    {
      reduce: "(prefers-reduced-motion: reduce)",
      always: "(min-width: 1px)",
    },
    (context) => {
      if (context.conditions.reduce) {
        root.classList.add("is-static", "is-ready");
        return () => root.classList.remove("is-static", "is-ready");
      }

      const items = marks.map((mark) => {
        callouts.appendChild(mark);
        mark.classList.add("is-anchored");
        mark.style.left = "";
        mark.style.top = "";
        return buildCallout(mark);
      });
      const aerialItem = buildAerial(aerial);

      const show = (item) => {
        item.open = true;
        item.fade?.kill();
        gsap.set(item.mark, { autoAlpha: 1 });
        item.frame.classList.add("is-playing");
        item.tl.timeScale(1);
        item.tl.restart();
        playVideo(item.video);
      };

      const hide = (item) => {
        item.open = false;
        item.frame.classList.remove("is-playing");
        stopVideo(item.video);
        item.tl.pause();
        item.fade = gsap.to(item.mark, {
          autoAlpha: 0,
          duration: 0.18,
          ease: "power1.out",
          overwrite: "auto",
        });
      };

      const dim = () => {
        gsap.to(image, { filter: "saturate(0.5)", duration: 0.45, ease: "power1.out", overwrite: true });
      };

      const clearDim = () => {
        gsap.to(image, { filter: "saturate(1)", duration: 0.2, ease: "power1.out", overwrite: true });
      };

      const showCallout = (item) => {
        show(item);
        item.dimCall?.kill();
        item.dimCall = gsap.delayedCall(0.4, dim);
      };

      const hideCallout = (item) => {
        item.dimCall?.kill();
        hide(item);
        clearDim();
      };

      const indicator = root.querySelector(".scr-ind");
      const slides = [...root.querySelectorAll(".scene-yebenes__slide")];
      const slide1 = slides[0];
      const lead = root.querySelector(".scene-yebenes__lead");
      const iryoTag = slide1.querySelector(".scene-yebenes__tag--iryo");
      const aveLabel = slide1.querySelector(".scene-yebenes__ave-label");
      const aveShaft = slide1.querySelector(".scene-yebenes__ave-shaft");
      const aveHead = slide1.querySelector(".scene-yebenes__ave-head");
      const narrow = window.matchMedia("(max-width: 699px)").matches;
      const slide1Notes = [iryoTag, aveLabel, aveHead, aveShaft];
      const noteGroups = ["wagons", "iryo", "machine"].map((name) =>
        [
          slides[2].querySelector(`.scene-yebenes__cap--${name}`),
          slides[2].querySelector(`.scene-yebenes__curve--${name}`),
        ].filter(Boolean)
      );
      const noteNodes = noteGroups.flat();

      gsap.set(slide1Notes, { autoAlpha: 0 });
      gsap.set(lead, { autoAlpha: 0 });
      gsap.set(aveShaft, {
        scaleX: 0,
        transformOrigin: narrow ? "left center" : "right center",
      });
      gsap.set(noteNodes, { autoAlpha: 0 });

      const tl1 = gsap.timeline({ paused: true });
      tl1
        .fromTo(iryoTag, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power1.out", immediateRender: false })
        .fromTo(aveLabel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out", immediateRender: false }, "-=0.15")
        .fromTo(aveShaft, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut", immediateRender: false })
        .fromTo(aveHead, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: "power1.out", immediateRender: false });

      const tl3 = gsap.timeline({ paused: true });
      noteGroups.forEach((group, index) => {
        tl3.fromTo(
          group,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.42, ease: "power1.out", immediateRender: false },
          index * 0.2
        );
      });

      let slide1On = false;
      let slide2On = false;
      let slide3On = false;
      let slide1Fade = null;
      let slide2Fade = null;
      let slide3Fade = null;

      const hideNotes = (nodes, timeline) => {
        timeline.pause();
        return gsap.to(nodes, {
          autoAlpha: 0,
          duration: 0.32,
          ease: "power1.out",
        });
      };

      gsap.set(world, { autoAlpha: 0 });

      const sync = (progress, active) => {
        const started = active || progress > 0.001;
        if (started && progress < s1Until) {
          if (!slide1On) {
            slide1On = true;
            slide1Fade?.kill();
            gsap.set(aveShaft, { autoAlpha: 1, scaleX: 0 });
            tl1.invalidate().restart();
          }
        } else if (slide1On) {
          slide1On = false;
          slide1Fade = hideNotes(slide1Notes, tl1);
        }

        if (progress >= s2From && progress < s2Until) {
          if (!slide2On) {
            slide2On = true;
            slide2Fade?.kill();
            gsap.to(lead, { autoAlpha: 1, duration: 0.45, ease: "power1.out", overwrite: "auto" });
          }
        } else if (slide2On) {
          slide2On = false;
          slide2Fade = gsap.to(lead, { autoAlpha: 0, duration: 0.32, ease: "power1.out", overwrite: "auto" });
        }

        if (progress >= s3From && progress < s3Until) {
          if (!slide3On) {
            slide3On = true;
            slide3Fade?.kill();
            tl3.invalidate().restart();
          }
        } else if (slide3On) {
          slide3On = false;
          slide3Fade = hideNotes(noteNodes, tl3);
        }

        const aerialInside = progress >= aerialStart && progress < aerialEnd;
        if (aerialInside && !aerialItem.open) show(aerialItem);
        else if (!aerialInside && aerialItem.open) hide(aerialItem);

        items.forEach((item, index) => {
          const start = holdStarts[index] / TOTAL;
          const end = (holdStarts[index] + HOLD) / TOTAL;
          const inside = progress >= start && progress < end;
          if (inside && !item.open) showCallout(item);
          else if (!inside && item.open) hideCallout(item);
        });
      };

      const syncIndicator = (self) => {
        if (!indicator) return;
        const passed = self.scroll() - self.start;
        const visible = passed < INDICATOR_PX;
        indicator.classList.toggle("is-visible", visible);
        indicator.setAttribute("aria-hidden", String(!visible));
      };

      layout();
      ScrollTrigger.addEventListener("refreshInit", layout);

      const camera = gsap.timeline({
        defaults: { ease: "none", force3D: true },
        scrollTrigger: {
          trigger: root,
          start: () => `top ${headerOffset()}px`,
          end: () => `+=${(stage.clientHeight || window.innerHeight) * TOTAL}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            sync(self.progress, self.isActive);
            syncIndicator(self);
          },
          onRefresh: (self) => {
            sync(self.progress, self.isActive);
            syncIndicator(self);
          },
        },
      });

      const at = (pos) => ({
        x: () => pos().x,
        y: () => pos().y,
      });

      camera.fromTo(
        world,
        {
          x: () => state.fit.x,
          y: () => state.fit.y,
          scale: () => state.fit.scale,
        },
        {
          ...at(() => state.points[0]),
          scale: 1,
          duration: APPROACH,
        },
        PRE + AERIAL_HOLD
      );

      const shots = slides.map((slide) => slide.querySelector("picture"));
      const atSlide = (units) => units;
      camera.to(shots[0], { autoAlpha: 0, duration: XF, immediateRender: false }, atSlide(S1));
      camera.to(shots[1], { autoAlpha: 1, duration: XF, immediateRender: false }, atSlide(S1));
      camera.to(shots[1], { autoAlpha: 0, duration: XF, immediateRender: false }, atSlide(S1 + XF + S2));
      camera.to(shots[2], { autoAlpha: 1, duration: XF, immediateRender: false }, atSlide(S1 + XF + S2));
      camera.to(shots[2], { autoAlpha: 0, duration: SOUT, immediateRender: false }, atSlide(S1 + XF + S2 + XF + S3));
      camera.to(world, { autoAlpha: 1, duration: SOUT, immediateRender: false }, atSlide(S1 + XF + S2 + XF + S3));
      camera.fromTo(
        world,
        { ...at(() => state.points[0]), scale: 1 },
        { ...at(() => state.points[1]), scale: 1, duration: T01, immediateRender: false },
        FIRST_STOP + HOLD
      );
      camera.fromTo(
        world,
        { ...at(() => state.points[1]), scale: 1 },
        {
          x: () => state.fit.x,
          y: () => state.fit.y,
          scale: () => state.fit.scale,
          duration: EXIT,
          immediateRender: false,
        },
        FIRST_STOP + HOLD + T01 + HOLD
      );

      root.classList.add("is-ready");

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", layout);
        items.forEach((item) => {
          const { mark } = item;
          const x = mark.dataset.x;
          const y = mark.dataset.y;
          world.appendChild(mark);
          mark.classList.remove("is-anchored");
          mark.style.left = `${x}%`;
          mark.style.top = `${y}%`;
        });
        gsap.killTweensOf([image, aerial]);
        gsap.set(aerial, { clearProps: "opacity,visibility" });
        gsap.set(image, { clearProps: "filter" });
        root.classList.remove("is-ready");
      };
    }
  );
}
