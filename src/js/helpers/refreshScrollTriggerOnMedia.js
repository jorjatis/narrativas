import { ScrollTrigger } from "gsap/ScrollTrigger";

const DEBOUNCE_MS = 120;
const TOLERANCE_PX = 2;

function docTop(el) {
  return el.getBoundingClientRect().top + window.scrollY;
}

function pinnedTriggers() {
  return ScrollTrigger.getAll().filter((t) => t.pin && t.pin.parentNode);
}

/**
 * Recalcula ScrollTrigger cuando cambia el layout por encima de los pins
 * (img lazy, fuentes, publi, player Brightcove, paywall...).
 * Necesario en prod: el JS arranca antes de que la página termine de montar.
 *
 * Solo refresca si algún pin-spacer se ha movido respecto al último refresh:
 * un refresh innecesario (p. ej. al pinchar el vídeo) salta el scroll en iOS.
 */
export default function refreshScrollTriggerOnMedia(root = document) {
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
    // Dentro de un pin y scrolleando: esperar al final (salto en iOS).
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

  // capture: load no burbujea
  root.addEventListener("load", onMediaEvent, true);
  root.addEventListener("error", onMediaEvent, true);

  // En prod el main puede tener alto fijo (paywall), así que se observa
  // también el contenedor del artículo de cada chrono.
  const ro = new ResizeObserver(schedule);
  ro.observe(document.body);
  document.querySelectorAll(".v-n-chrono").forEach((node) => {
    ro.observe(node.closest(".v-d") || node.parentElement);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }

  return () => {
    clearTimeout(timer);
    pending = false;
    ro.disconnect();
    ScrollTrigger.removeEventListener("refresh", record);
    ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
    root.removeEventListener("load", onMediaEvent, true);
    root.removeEventListener("error", onMediaEvent, true);
  };
}
