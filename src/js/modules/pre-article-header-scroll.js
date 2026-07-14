import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../helpers/prefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  scroll: {
    // Altura de scroll (en múltiplos de viewport) por segundo de timeline.
    // Ajusta el "largo" del pin: más alto = hay que scrollear más (más lento).
    speed: 0.28,
    scrub: 0.5
  },
  text: {
    enterScale: 0.15,
    exitScale: 10
  },
  timing: {
    text1Hold: 1.4,      // tiempo visible el texto 1 antes de irse
    textEnter: 1.8,      // entrada de los textos secundarios (pequeño -> 1)
    textHold: 1,         // tiempo visible antes de salir
    textExit: 3,         // zoom de salida hacia cámara
    textFade: 1.4,       // fundido de salida
    textFadeOffset: 1.6  // cuándo empieza el fundido dentro de la salida
  },
  images: {
    fromScale: 0,
    duration: 2.4,
    stagger: 0.35
  },
  infoDuration: 0.6,
  endHold: 2.5           // pin extra al final (scroll con la pantalla fija)
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Desplazamiento en px para que el centro del figure coincida
 * con el centro de .intro-img-c (posición final en CSS %).
 * Lecturas en batch para evitar forced reflow.
 */
function measureCenterOffsets(figures, container) {
  const containerRect = container.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerCenterY = containerRect.top + containerRect.height / 2;
  const figureRects = figures.map((figure) => figure.getBoundingClientRect());

  return figureRects.map((rect) => ({
    x: containerCenterX - (rect.left + rect.width / 2),
    y: containerCenterY - (rect.top + rect.height / 2)
  }));
}

function waitForImages(figures) {
  const imgs = figures.flatMap((figure) => [...figure.querySelectorAll("img")]);

  return Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        })
    )
  );
}

/**
 * Devuelve texto 1 (entrada por CSS) y el resto de paneles de texto,
 * que comparten el mismo efecto (entrar pequeño -> crecer -> zoom de salida).
 */
function collectTextPanels(root) {
  const panels = [...root.querySelectorAll(".intro-text")];
  const text1El = panels.find((el) => el.classList.contains("intro-text--1"));
  const secondary = panels
    .filter((el) => el !== text1El)
    .map((el) => ({ el, zoom: el.querySelector(".intro-text__zoom") }))
    .filter((panel) => panel.zoom);

  return {
    text1El,
    text1Zoom: text1El?.querySelector(".intro-text__zoom"),
    secondary
  };
}

// ---------------------------------------------------------------------------
// Fases
// ---------------------------------------------------------------------------

function addTextExit(timeline, zoomEl, exitStart) {
  const { exitScale } = CONFIG.text;
  const { textExit, textFade, textFadeOffset } = CONFIG.timing;

  timeline
    .to(zoomEl, {
      scale: exitScale,
      duration: textExit,
      ease: "power1.in"
    }, exitStart)
    .to(zoomEl, {
      autoAlpha: 0,
      duration: textFade,
      ease: "power1.in"
    }, exitStart + textFadeOffset);
}

/**
 * Restaura la nitidez del texto al volver arriba del todo:
 * elimina el transform/filter inline para que el navegador
 * rasterice el texto a resolución nativa (sin dientes de sierra).
 */
function restoreTextSharpness(text1Zoom, secondaryZooms) {
  gsap.set(text1Zoom, { clearProps: "transform,filter,opacity,visibility" });
  secondaryZooms.forEach((zoom) => {
    gsap.set(zoom, { autoAlpha: 0, clearProps: "transform,filter" });
  });
}

// ---------------------------------------------------------------------------
// Timeline principal
// ---------------------------------------------------------------------------

function buildTimeline(elements, getOffsets) {
  const { root, stage, text1El, text1Zoom, secondary, imgContainer, figures } = elements;
  const { enterScale } = CONFIG.text;
  const { text1Hold, textEnter, textHold, textExit } = CONFIG.timing;
  const { fromScale, duration: imgDuration, stagger } = CONFIG.images;

  const secondaryZooms = secondary.map((panel) => panel.zoom);
  let imagesStartTime = 0;
  let imagesActive = false;
  let atTop = true;

  gsap.set(secondary.map((panel) => panel.el), { autoAlpha: 0, zIndex: 1 });
  gsap.set(imgContainer, { zIndex: 1, pointerEvents: "none" });

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      // El largo del pin se calcula según la duración total del timeline,
      // así al añadir textos o el endHold se amplía solo.
      end: () => "+=" + Math.round(window.innerHeight * timeline.duration() * CONFIG.scroll.speed),
      pin: stage,
      scrub: CONFIG.scroll.scrub,
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const currentTime = self.progress * timeline.duration();

        const shouldImages = currentTime >= imagesStartTime;
        if (shouldImages !== imagesActive) {
          imagesActive = shouldImages;
          root.classList.toggle("intro-images-active", shouldImages);
        }

        if (self.progress < 0.003) {
          if (!atTop) {
            atTop = true;
            root.classList.remove("intro-scroll-active");
            restoreTextSharpness(text1Zoom, secondaryZooms);
          }
        } else if (atTop) {
          atTop = false;
          root.classList.add("intro-scroll-active");
        }
      },
      onLeave: () => {
        root.classList.add("intro-scroll-complete");
        root.classList.remove("intro-scroll-active");
        gsap.set(figures, { clearProps: "transform,willChange", autoAlpha: 1 });
        gsap.set([text1Zoom, ...secondaryZooms], { clearProps: "transform,filter" });
      },
      onEnterBack: () => {
        root.classList.remove("intro-scroll-complete");
        atTop = false;
        root.classList.add("intro-scroll-active");
      }
    }
  });

  let t = 0;

  // --- Texto 1 (la entrada la hace el CSS con .is-loaded) ---
  timeline
    .set(text1El, { zIndex: 3 }, 0)
    .set(text1Zoom, { scale: 1, autoAlpha: 1, transformOrigin: "center center" }, 0);

  t += text1Hold;
  addTextExit(timeline, text1Zoom, t);
  const text1Gone = t + textExit;
  timeline.set(text1El, { zIndex: 1 }, text1Gone);
  t = text1Gone;

  // --- Textos secundarios (2, 3, ...): mismo efecto en secuencia ---
  secondary.forEach(({ el, zoom }) => {
    timeline
      .set(el, { autoAlpha: 1, zIndex: 3 }, t)
      .fromTo(
        zoom,
        { scale: enterScale, autoAlpha: 0, transformOrigin: "center center", immediateRender: false },
        { scale: 1, autoAlpha: 1, duration: textEnter, ease: "power2.out" },
        t
      );

    const exitStart = t + textEnter + textHold;
    addTextExit(timeline, zoom, exitStart);
    const gone = exitStart + textExit;
    timeline.set(el, { autoAlpha: 0, zIndex: 1 }, gone);
    t = gone;
  });

  // --- Imágenes: salen del centro y escalan a su sitio con stagger ---
  imagesStartTime = t;

  timeline
    .set(
      figures,
      {
        x: (index) => getOffsets()[index]?.x ?? 0,
        y: (index) => getOffsets()[index]?.y ?? 0,
        scale: fromScale,
        autoAlpha: 0,
        transformOrigin: "center center",
        force3D: true,
        willChange: "transform"
      },
      0
    )
    .set(imgContainer, { zIndex: 4, pointerEvents: "auto" }, imagesStartTime)
    .to(
      figures,
      {
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: imgDuration,
        stagger,
        ease: "power1.out",
        force3D: true
      },
      imagesStartTime
    );

  // --- .intro-img-info: fundido 0 -> 1 al empezar su bloque, sin esperar ---
  const infos = [...root.querySelectorAll(".intro-img-info")];
  infos.forEach((info) => {
    const figure = info.closest(".intro-img");
    const index = figure ? figures.indexOf(figure) : -1;
    const at = index >= 0 ? imagesStartTime + index * stagger : imagesStartTime;

    timeline.fromTo(
      info,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: CONFIG.infoDuration, ease: "power1.out" },
      at
    );
  });

  const imagesEnd = imagesStartTime + imgDuration + stagger * Math.max(0, figures.length - 1);
  t = imagesEnd;

  // --- Pin extra al final (scroll con la pantalla fija) ---
  timeline.to({}, { duration: CONFIG.endHold }, t);

  return timeline;
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export default function preArticleHeaderScroll() {
  const root = document.querySelector(".v-a-preh");
  if (!root) return null;

  const stage = root.querySelector(".intro-stage");
  const imgContainer = root.querySelector(".intro-img-c");
  const figures = [...root.querySelectorAll(".intro-img")];
  const { text1El, text1Zoom, secondary } = collectTextPanels(root);

  if (!stage || !text1El || !text1Zoom || !imgContainer || !figures.length) {
    return null;
  }

  if (prefersReducedMotion()) {
    root.classList.add("intro-scroll-complete");
    gsap.set(figures, { autoAlpha: 1, clearProps: "transform" });
    return null;
  }

  const infos = [...root.querySelectorAll(".intro-img-info")];
  gsap.set(figures, { autoAlpha: 0, scale: 0 });
  gsap.set(infos, { autoAlpha: 0 });

  const elements = { root, stage, text1El, text1Zoom, secondary, imgContainer, figures };
  let timeline = null;
  let resizeTimer = null;

  const createTimeline = () => {
    gsap.set(figures, { clearProps: "transform" });
    const imageOffsets = measureCenterOffsets(figures, imgContainer);
    const getOffsets = () => imageOffsets;

    timeline?.scrollTrigger?.kill();
    timeline?.kill();
    timeline = buildTimeline(elements, getOffsets);
    root.classList.add("intro-scroll-ready");
    ScrollTrigger.refresh();
  };

  waitForImages(figures).then(() => {
    requestAnimationFrame(createTimeline);
  });

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createTimeline, 250);
  };

  window.addEventListener("resize", onResize, { passive: true });

  return {
    kill() {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
    }
  };
}
