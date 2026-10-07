import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../helpers/prefersReducedMotion.js";

gsap.registerPlugin(ScrollTrigger);

/** Relative timeline weight for full graphic travel (0 → 1). */
const SEGMENT_SCALE = 1;
/** Relative timeline weight per cartela pass (bottom → top). */
const CARTELA_SCROLL_UNITS = 0.85;
/** Page-scroll pixels per timeline unit (~4 viewports → ritmo más cercano al scroll normal). */
const SCROLL_PX_PER_UNIT = () => Math.max(window.innerHeight * 4, 2400);
const RESIZE_DEBOUNCE_MS = 150;
/** Cabecera sticky. */
const HEADER_OFFSET = () =>
  window.matchMedia("(min-width: 699px)").matches ? 58 : 50;
const MQ_CHRONO_DESK = "(min-width: 1250px)";

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

  const updateHeads = (graphic) => {
    if (!heads || !heads.offsetParent) return;
    const names = graphic.querySelector(".v-n-chrono__names");
    const namesH = names ? names.offsetHeight : 0;
    const gy = Number(gsap.getProperty(graphic, "y")) || 0;
    // Bajo los nombres al inicio; al scrollear sube hasta top: 0 y se queda
    gsap.set(heads, { top: Math.max(0, namesH + gy) });
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

    const viewportH = viewport.clientHeight;
    const graphicH = graphic.offsetHeight;
    const travel = Math.max(graphicH - viewportH, 0);

    gsap.set(graphic, { y: 0 });
    gsap.set(
      cartelas.map((c) => c.el),
      { yPercent: 100, autoAlpha: 0 }
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

        tl.set(el, { autoAlpha: 1 });
        tl.fromTo(
          el,
          { yPercent: 100 },
          { yPercent: -100, duration: CARTELA_SCROLL_UNITS }
        );
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
    ".v-n-chrono__graphic img, .v-n-chrono__heads img"
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
