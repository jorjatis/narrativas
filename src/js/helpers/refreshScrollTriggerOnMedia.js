import { ScrollTrigger } from "gsap/ScrollTrigger";

const DEBOUNCE_MS = 120;

/**
 * Recalcula ScrollTrigger cuando media lazy (img/iframe) cambia el layout.
 * Necesario en prod: el markup trae loading="lazy" y no se puede quitar.
 *
 * No reacciona a VIDEO/SOURCE ni a players Brightcove/video-js: al pinchar
 * disparan loadedmetadata/loadeddata y un refresh recalcula los pins de
 * cronología, provocando un salto de scroll hacia arriba.
 */
export default function refreshScrollTriggerOnMedia(root = document) {
  let timer = null;
  let pending = false;

  const doRefresh = () => {
    pending = false;
    ScrollTrigger.refresh();
  };

  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Si el usuario está scrolleando (p. ej. dentro de un pin), esperar
      // al final para no saltar hacia el chrono en iOS.
      if (ScrollTrigger.isScrolling()) {
        pending = true;
        return;
      }
      doRefresh();
    }, DEBOUNCE_MS);
  };

  const onScrollEnd = () => {
    if (!pending) return;
    clearTimeout(timer);
    timer = setTimeout(doRefresh, DEBOUNCE_MS);
  };
  ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);

  const onMediaEvent = (e) => {
    const el = e.target;
    if (!el || !el.tagName) return;
    const tag = el.tagName;

    // Solo layout-relevant: imgs lazy e iframes. VIDEO/SOURCE no: el player
    // ya reserva ratio (vjs-fluid) y los eventos se disparan al interactuar.
    if (tag !== "IMG" && tag !== "IFRAME") return;

    if (el.closest?.(".video-player, .video-js, video-js")) return;

    refresh();
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
    pending = false;
    ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
    root.removeEventListener("load", onMediaEvent, true);
    root.removeEventListener("loadedmetadata", onMediaEvent, true);
    root.removeEventListener("loadeddata", onMediaEvent, true);
    root.removeEventListener("error", onMediaEvent, true);
  };
}
