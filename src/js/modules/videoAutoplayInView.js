import observeInView from "../helpers/observeInView.js";
import { prefersReducedMotion } from "../helpers/prefersReducedMotion.js";

/**
 * Reproduce videos .v-n-video-autoplay cuando el 50% del elemento entra en viewport.
 * Pausa al salir. Requiere muted + playsinline para autoplay en navegadores.
 */
export default function videoAutoplayInView(root) {
  root = root || document;
  const videos = root.querySelectorAll("video.v-n-video-autoplay");
  if (!videos.length) return null;

  if (prefersReducedMotion()) {
    videos.forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
    });
    return null;
  }

  return observeInView({
    target: videos,
    threshold: 0.5,
    once: false,
    onEnter: (entry) => {
      const video = entry.target;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    },
    onLeave: (entry) => {
      entry.target.pause();
    },
  });
}
