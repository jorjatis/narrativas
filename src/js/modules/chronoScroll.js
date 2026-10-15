import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../helpers/prefersReducedMotion.js";

gsap.registerPlugin(ScrollTrigger);

/** Relative timeline weight for full graphic travel (0 → 1). */
const SEGMENT_SCALE = 1;
const MQ_CHRONO_DESK = "(min-width: 1250px)";
/**
 * La cartela recorre px al mismo ritmo que el gráfico (px de timeline por
 * px de scroll). >1 la hace un poco más rápida para que el cambio no se note.
 */
const CARTELA_VS_GRAPHIC = 1.2;
/**
 * Page-scroll pixels per timeline unit.
 * Desktop: ~4 viewports. Mobile (&lt;1250): ~6.5 viewports (gráfico más lento).
 */
const SCROLL_PX_PER_UNIT = () => {
  const vh = Math.max(window.innerHeight, 600);
  const isDesk = window.matchMedia(MQ_CHRONO_DESK).matches;
  return vh * (isDesk ? 4 : 6.5);
};
const RESIZE_DEBOUNCE_MS = 150;
/** Cabecera sticky + 8px aire: 66 desk (58+8) / 58 mobile (50+8). */
const HEADER_OFFSET = () =>
  window.matchMedia("(min-width: 699px)").matches ? 66 : 58;

function clamp01(n) {
  return gsap.utils.clamp(0, 1, Number.isFinite(n) ? n : 0);
}

function readCartelas(root) {
  return gsap.utils
    .toArray(root.querySelectorAll(".v-n-chrono__cartela"))
    .map((el) => ({
      el,
      at: clamp01(parseFloat(el.dataset.at)),
    }))
    .sort((a, b) => a.at - b.at);
}

function waitForImage(img) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalHeight > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function waitForImages(imgs) {
  return Promise.all(imgs.filter(Boolean).map(waitForImage));
}

function activeGraphic(root) {
  const desk = root.querySelector(".v-n-chrono__graphic--desk");
  const mov = root.querySelector(".v-n-chrono__graphic--mov");
  const isDesk = window.matchMedia(MQ_CHRONO_DESK).matches;
  if (isDesk && desk) return desk;
  if (mov) return mov;
  return root.querySelector(".v-n-chrono__graphic");
}

function setupChrono(root) {
  const stage = root.querySelector(".v-n-chrono__stage");
  const viewport = root.querySelector(".v-n-chrono__viewport");
  const heads = root.querySelector(".v-n-chrono__heads");
  const namesSticky = root.querySelector(".v-n-chrono__names-sticky");
  const legendMap = root.querySelector(".v-n-chrono__legend-map");
  const legendView = root.querySelector(".v-n-chrono__legend-view");

  if (!stage || !viewport) return () => {};

  if (prefersReducedMotion()) {
    root.classList.add("v-n-chrono--reduced");
    return () => {};
  }

  const cartelas = readCartelas(root);
  let ctx = null;
  let resizeTimer = null;
  let destroyed = false;

  /** Iguala el hueco del graphic a la altura real del sticky (evita saltito al pin). */
  const syncStickyGaps = (graphic) => {
    const isDesk = window.matchMedia(MQ_CHRONO_DESK).matches;

    if (!isDesk && namesSticky) {
      const gap = graphic.querySelector(".v-n-chrono__names-gap");
      const h = namesSticky.offsetHeight;
      if (gap && h > 0) {
        gap.style.aspectRatio = "auto";
        gap.style.height = `${h}px`;
      }
      gsap.set(namesSticky, { top: 0 });
      return;
    }

    if (heads?.offsetParent) {
      const gap = graphic.querySelector(".v-n-chrono__faces-gap");
      const h = heads.offsetHeight;
      if (gap && h > 0) {
        gap.style.aspectRatio = "auto";
        gap.style.height = `${h}px`;
      }
    }
  };

  const updateHeads = (graphic) => {
    const isDesk = window.matchMedia(MQ_CHRONO_DESK).matches;

    // Mobile: nombres siempre sticky arriba
    if (!isDesk && namesSticky?.offsetParent) {
      gsap.set(namesSticky, { top: 0 });
      return;
    }

    // Desktop: las caras siguen el hueco .faces-gap y luego pinan en top: 0
    if (!heads || !heads.offsetParent) return;
    const gap = graphic.querySelector(".v-n-chrono__faces-gap");
    if (!gap) return;
    const viewportRect = viewport.getBoundingClientRect();
    const gapRect = gap.getBoundingClientRect();
    gsap.set(heads, { top: Math.max(0, gapRect.top - viewportRect.top) });
  };

  const updateLegend = (graphic) => {
    if (!legendMap || !legendView) return;
    if (!root.querySelector(".v-n-chrono__legend")?.offsetParent) return;

    const mapH = legendMap.offsetHeight;
    const viewportH = viewport.clientHeight;
    const graphicH = graphic.offsetHeight;
    if (mapH <= 0 || graphicH <= 0) return;

    const travel = Math.max(graphicH - viewportH, 0);
    const viewH = Math.max((viewportH / graphicH) * mapH, 8);
    const y = Math.abs(Number(gsap.getProperty(graphic, "y")) || 0);
    const progress = travel > 0 ? clamp01(y / travel) : 0;

    gsap.set(legendView, {
      height: viewH,
      y: progress * Math.max(mapH - viewH, 0),
    });
  };

  const onScrub = (graphic) => {
    updateHeads(graphic);
    updateLegend(graphic);
  };

  const build = () => {
    if (destroyed) return;

    if (ctx) {
      ctx.revert();
      ctx = null;
    }

    const graphic = activeGraphic(root);
    if (!graphic) return;

    gsap.set(graphic, { y: 0 });
    syncStickyGaps(graphic);

    const viewportH = viewport.clientHeight;
    const graphicH = graphic.offsetHeight;
    const travel = Math.max(graphicH - viewportH, 0);

    // Entrada/salida respecto al viewport (no yPercent del alto propio:
    // cartelas cortas "aparecían" a medias al hacerse visibles).
    gsap.set(
      cartelas.map((c) => c.el),
      { yPercent: 0, y: viewportH, autoAlpha: 0 }
    );
    onScrub(graphic);

    ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "none" } });

      let prevAt = 0;
      cartelas.forEach(({ el, at }) => {
        const delta = at - prevAt;
        if (delta > 0.0001) {
          tl.to(graphic, {
            y: -travel * at,
            duration: delta * SEGMENT_SCALE,
            onUpdate: () => onScrub(graphic),
          });
        } else {
          tl.set(graphic, { y: -travel * at });
          tl.add(() => onScrub(graphic));
        }

        const cartelaH = el.offsetHeight;
        const travelPx = viewportH + cartelaH;
        // Misma velocidad que el gráfico, un poco más rápida.
        const duration =
          travel > 1
            ? travelPx / (travel * CARTELA_VS_GRAPHIC)
            : travelPx / Math.max(viewportH, 1);
        tl.set(el, { autoAlpha: 1 });
        tl.fromTo(el, { y: viewportH }, { y: -cartelaH, duration });
        tl.set(el, { autoAlpha: 0 });

        prevAt = at;
      });

      if (prevAt < 1 - 0.0001) {
        tl.to(graphic, {
          y: -travel,
          duration: (1 - prevAt) * SEGMENT_SCALE,
          onUpdate: () => onScrub(graphic),
        });
      } else {
        tl.set(graphic, { y: -travel });
      }

      ScrollTrigger.create({
        trigger: stage,
        start: () => `top ${HEADER_OFFSET()}px`,
        end: () =>
          `+=${Math.max(tl.duration() * SCROLL_PX_PER_UNIT(), viewportH)}`,
        pin: true,
        scrub: true,
        animation: tl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: () => onScrub(graphic),
        onRefresh: () => onScrub(graphic),
      });
    }, root);

    ScrollTrigger.refresh();
  };

  const imgs = root.querySelectorAll(
    ".v-n-chrono__graphic img, .v-n-chrono__heads img, .v-n-chrono__names-sticky img, .v-n-chrono__cartela img"
  );
  waitForImages([...imgs]).then(() => {
    if (!destroyed) build();
  });

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      waitForImages([...imgs]).then(() => {
        if (!destroyed) build();
      });
    }, RESIZE_DEBOUNCE_MS);
  };

  window.addEventListener("resize", onResize);

  return () => {
    destroyed = true;
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    if (ctx) ctx.revert();
  };
}

/**
 * Pin + scrub de cronologías .v-n-chrono.
 * Desk: names scrollean, faces sticky, body scrollea.
 * Mobile: names sticky, body scrollea.
 * Cartelas: data-at="0–1" (fracción del scroll del graphic).
 */
export default function chronoScroll(root = document) {
  const nodes = root.querySelectorAll(".v-n-chrono");
  if (!nodes.length) return;

  const cleanups = [];
  nodes.forEach((node) => {
    cleanups.push(setupChrono(node));
  });

  return () => cleanups.forEach((fn) => fn && fn());
}
