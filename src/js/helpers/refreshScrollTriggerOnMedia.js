import { ScrollTrigger } from "gsap/ScrollTrigger";

const DEBOUNCE_MS = 120;

/**
 * Recalcula ScrollTrigger cuando media lazy (img/video/iframe) cambia el layout.
 * Necesario en prod: el markup trae loading="lazy" y no se puede quitar.
 */
export default function refreshScrollTriggerOnMedia(root = document) {
  let timer = null;

  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, DEBOUNCE_MS);
  };

  const onMediaEvent = (e) => {
    const el = e.target;
    if (!el || !el.tagName) return;
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "IFRAME" || tag === "SOURCE") {
      refresh();
    }
  };

  // capture: load no burbujea
  root.addEventListener("load", onMediaEvent, true);
  root.addEventListener("loadedmetadata", onMediaEvent, true);
  root.addEventListener("loadeddata", onMediaEvent, true);
  root.addEventListener("error", onMediaEvent, true);

  if (document.fonts?.ready) {
    document.fonts.ready.then(refresh).catch(() => {});
  }

  return () => {
    clearTimeout(timer);
    root.removeEventListener("load", onMediaEvent, true);
    root.removeEventListener("loadedmetadata", onMediaEvent, true);
    root.removeEventListener("loadeddata", onMediaEvent, true);
    root.removeEventListener("error", onMediaEvent, true);
  };
}
