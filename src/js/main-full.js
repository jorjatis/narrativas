const DEBOUNCE_MS = 120;
const TOLERANCE_PX = 2;

function docTop(el) {
  return el.getBoundingClientRect().top + window.scrollY;
}

function pinnedTriggers() {
  return ScrollTrigger.getAll().filter((t) => t.pin && t.pin.parentNode);
}

function refreshScrollTriggerOnMedia(root = document) {
  let timer = null;
  let pending = false;
  const tops = new Map();

  const record = () => {
    tops.clear();
    pinnedTriggers().forEach((t) => tops.set(t, docTop(t.pin.parentNode)));
  };

  const isStale = () =>
    pinnedTriggers().some((t) => {
      const prev = tops.get(t);
      return (
        prev === undefined ||
        Math.abs(docTop(t.pin.parentNode) - prev) > TOLERANCE_PX
      );
    });

  const check = () => {
    if (!isStale()) return;
    if (
      ScrollTrigger.isScrolling() &&
      pinnedTriggers().some((t) => t.isActive)
    ) {
      pending = true;
      return;
    }
    pending = false;
    ScrollTrigger.refresh();
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(check, DEBOUNCE_MS);
  };

  const onScrollEnd = () => {
    if (pending) schedule();
  };

  ScrollTrigger.addEventListener("refresh", record);
  ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
  record();

  const onMediaEvent = (e) => {
    const tag = e.target?.tagName;
    if (tag === "IMG" || tag === "IFRAME") schedule();
  };

  root.addEventListener("load", onMediaEvent, true);
  root.addEventListener("error", onMediaEvent, true);

  const ro = window.ResizeObserver ? new ResizeObserver(schedule) : null;
  if (ro) {
    ro.observe(document.body);
    document.querySelectorAll(".v-d").forEach((node) => ro.observe(node));
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }

  return () => {
    clearTimeout(timer);
    pending = false;
    ro?.disconnect();
    ScrollTrigger.removeEventListener("refresh", record);
    ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
    root.removeEventListener("load", onMediaEvent, true);
    root.removeEventListener("error", onMediaEvent, true);
  };
}

gsap.registerPlugin(ScrollTrigger);

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

const SCROLL_PER_UNIT = 2.05;
const SLIDE_HOLDS = [1.05, 1.1, 1.2];
const SOUT = 0.35;
const AERIAL_HOLD = 1.85;
const APPROACH = 1.25;
const HOLD = 1.9;
const EXIT = 1.25;
const PACE = {
  wide: { slides: 1.1, videos: 1.45, moves: 1.1 },
  narrow: { slides: 1.7, videos: 2.7, moves: 1.5 },
};
const SHOT_FADE = 0.6;
const INDICATOR_PX = 280;
const SCRUB = { wide: 0.55, narrow: 1.2 };

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

function keepInstantScroll() {
  const html = document.documentElement;
  const force = () => {
    if (
      html.style.getPropertyValue("scroll-behavior") !== "auto" ||
      html.style.getPropertyPriority("scroll-behavior") !== "important"
    ) {
      html.style.setProperty("scroll-behavior", "auto", "important");
    }
  };
  force();
  new MutationObserver(force).observe(html, {
    attributes: true,
    attributeFilter: ["style"],
  });
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

  return { mark, frame, video, tl, open: false, hiding: false, hideGen: 0 };
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

  return { mark: aerial, frame: aerial, video, tl, open: false, hiding: false, hideGen: 0 };
}

function initSceneYebenes() {
  const root = document.querySelector(".scene-yebenes");
  if (!root || root.dataset.bound === "1") return;
  root.dataset.bound = "1";

  keepInstantScroll();
  refreshScrollTriggerOnMedia();

  const stage = root.querySelector(".scene-yebenes__stage");
  const world = root.querySelector(".scene-yebenes__world");
  const image = root.querySelector(".scene-yebenes__img");
  const aerial = root.querySelector(".scene-yebenes__aerial");
  const callouts = root.querySelector(".scene-yebenes__callouts");
  const marks = [...root.querySelectorAll(".scene-yebenes__mark")];
  if (!stage || !world || !aerial || marks.length < 2) return;

  const state = {
    fit: { x: 0, y: 0, scale: 1 },
    points: FRAMES.wide.points.map(() => ({ x: 0, y: 0 })),
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
      narrow: "(max-width: 699px)",
      always: "(min-width: 1px)",
    },
    (context) => {
      if (context.conditions.reduce) {
        root.classList.add("is-static", "is-ready");
        return () => root.classList.remove("is-static", "is-ready");
      }

      const narrow = context.conditions.narrow;
      const pace = narrow ? PACE.narrow : PACE.wide;
      const opening = frameFor(stage.clientWidth || window.innerWidth);
      const [p0, p1] = opening.points;

      const slideEnds = [];
      SLIDE_HOLDS.reduce((sum, hold) => {
        slideEnds.push(sum + hold * pace.slides);
        return slideEnds[slideEnds.length - 1];
      }, 0);
      const PRE = slideEnds[slideEnds.length - 1] + SOUT * pace.slides;
      const aerialHold = AERIAL_HOLD * pace.videos;
      const hold = HOLD * pace.videos;
      const approach = APPROACH * pace.moves;
      const travel = normDist(p0, p1, opening.w / opening.h) * SCROLL_PER_UNIT * pace.moves;
      const exit = EXIT * pace.moves;
      const firstStop = PRE + aerialHold + approach;
      const TOTAL = firstStop + hold + travel + hold + exit;

      const holdStarts = [firstStop, firstStop + hold + travel];
      const aerialStart = PRE / TOTAL;
      const aerialEnd = (PRE + aerialHold) / TOTAL;

      const items = marks.map((mark) => {
        callouts.appendChild(mark);
        mark.classList.add("is-anchored");
        mark.style.left = "";
        mark.style.top = "";
        return buildCallout(mark);
      });
      const aerialItem = buildAerial(aerial);

      const show = (item) => {
        item.hideGen += 1;
        item.hiding = false;
        item.open = true;
        item.fade?.kill();
        item.tl.eventCallback("onComplete", null);
        gsap.set(item.mark, { autoAlpha: 1 });
        item.frame.classList.add("is-playing");
        item.tl.timeScale(1);
        item.tl.restart();
        playVideo(item.video);
      };

      const hide = (item, force = false) => {
        if (!force && item.hiding) return;
        const gen = ++item.hideGen;
        item.hiding = true;
        const close = () => {
          if (item.hideGen !== gen) return;
          item.hiding = false;
          item.open = false;
          item.tl.eventCallback("onComplete", null);
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

        item.tl.eventCallback("onComplete", null);
        if (!force && item.tl.isActive()) {
          item.tl.eventCallback("onComplete", close);
          return;
        }
        close();
      };

      gsap.set(image, { "--sat": 1 });

      const dim = () => {
        gsap.to(image, { "--sat": 0.5, duration: 0.45, ease: "power1.out", overwrite: "auto" });
      };

      const clearDim = () => {
        gsap.to(image, { "--sat": 1, duration: 0.2, ease: "power1.out", overwrite: "auto" });
      };

      const showCallout = (item) => {
        show(item);
        item.dimCall?.kill();
        item.dimCall = gsap.delayedCall(0.4, dim);
      };

      const hideCallout = (item, force = false) => {
        item.dimCall?.kill();
        hide(item, force);
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

      const shots = slides.map((slide) => slide.querySelector("picture"));
      const WORLD = shots.length;
      const LAST = shots.length - 1;
      let current = 0;
      let zTop = 1;

      gsap.set(shots, { autoAlpha: (index) => (index === 0 ? 1 : 0) });
      gsap.set(world, { autoAlpha: 0 });

      const stageAt = (progress) => {
        const units = progress * TOTAL;
        const index = slideEnds.findIndex((end) => units < end);
        return index === -1 ? WORLD : index;
      };

      const showShot = (index) => {
        if (index >= LAST) gsap.set(world, { autoAlpha: 1 });

        if (index === WORLD || index === LAST) {
          gsap.set(shots[LAST], { autoAlpha: 0, overwrite: true });
          gsap.to(
            shots.filter((_, i) => i !== LAST),
            {
              autoAlpha: 0,
              duration: SHOT_FADE,
              ease: "power1.inOut",
              overwrite: true,
            }
          );
          return;
        }

        const incoming = shots[index];
        gsap.set(slides[index], { zIndex: ++zTop });
        gsap.to(incoming, {
          autoAlpha: 1,
          duration: SHOT_FADE,
          ease: "power1.inOut",
          overwrite: true,
          onComplete: () => {
            if (current !== index) return;
            gsap.set(
              shots.filter((shot) => shot !== incoming),
              { autoAlpha: 0, overwrite: true }
            );
            gsap.set(world, { autoAlpha: 0 });
          },
        });
      };

      const sync = (progress, active) => {
        const started = active || progress > 0.001;
        const next = stageAt(progress);
        if (next !== current) {
          current = next;
          showShot(next);
        }

        if (started && current === 0) {
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

        if (current === 1) {
          if (!slide2On) {
            slide2On = true;
            slide2Fade?.kill();
            gsap.to(lead, { autoAlpha: 1, duration: 0.45, ease: "power1.out", overwrite: "auto" });
          }
        } else if (slide2On) {
          slide2On = false;
          slide2Fade = gsap.to(lead, { autoAlpha: 0, duration: 0.32, ease: "power1.out", overwrite: "auto" });
        }

        if (current === 2) {
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
        if (aerialInside && !aerialItem.open) {
          items.forEach((item) => {
            if (item.open) hideCallout(item, true);
          });
          show(aerialItem);
        } else if (!aerialInside && aerialItem.open) {
          hide(aerialItem, items.some((item) => item.open));
        }

        items.forEach((item, index) => {
          const start = holdStarts[index] / TOTAL;
          const end = (holdStarts[index] + hold) / TOTAL;
          const inside = progress >= start && progress < end;
          if (inside && !item.open) {
            if (aerialItem.open) hide(aerialItem, true);
            showCallout(item);
          } else if (!inside && item.open) hideCallout(item);
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
        onUpdate() {
          const st = this.scrollTrigger;
          const progress = this.progress();
          sync(progress, Boolean(st?.isActive) || progress > 0.001);
          if (st) syncIndicator(st);
        },
        scrollTrigger: {
          trigger: root,
          start: () => `top ${headerOffset()}px`,
          end: () => `+=${(stage.clientHeight || window.innerHeight) * TOTAL}`,
          pin: true,
          scrub: narrow ? SCRUB.narrow : SCRUB.wide,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            sync(self.animation?.progress() ?? self.progress, self.isActive);
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
          duration: approach,
        },
        PRE + aerialHold
      );
      camera.fromTo(
        world,
        { ...at(() => state.points[0]), scale: 1 },
        { ...at(() => state.points[1]), scale: 1, duration: travel, immediateRender: false },
        firstStop + hold
      );
      camera.fromTo(
        world,
        { ...at(() => state.points[1]), scale: 1 },
        {
          x: () => state.fit.x,
          y: () => state.fit.y,
          scale: () => state.fit.scale,
          duration: exit,
          immediateRender: false,
        },
        firstStop + hold + travel + hold
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
        gsap.killTweensOf([image, aerial, world, ...shots]);
        gsap.set([aerial, world, ...shots], { clearProps: "opacity,visibility" });
        gsap.set(slides, { clearProps: "zIndex" });
        gsap.set(image, { clearProps: "--sat" });
        root.classList.remove("is-ready");
      };
    }
  );
}

function initAll() {
  initSceneYebenes();
}

initAll();