import observeInView from "../helpers/observeInView";
import { prefersReducedMotion } from "../helpers/prefersReducedMotion";

export default function scrollStoryHeader() {
  const headers = document.querySelectorAll(".v-n-ss-h.has-animation");
  if (!headers.length) return;

  if (prefersReducedMotion()) {
    headers.forEach((header) => header.classList.remove("has-animation"));
    return;
  }

  observeInView({
    target: headers,
    threshold: 0,
    rootMargin: "0px 0px -40% 0px",
    once: true,
    onEnter: ({ target }) => {
      target.classList.remove("has-animation");
    }
  });
}
