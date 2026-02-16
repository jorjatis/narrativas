import "../js/kraken.js";
import "../js/gsap.min.js";
import "../js/ScrollTrigger.min.js";

import { initPreHeaderScroll } from "./preHeaderScroll.js";
import { initScrollZoomMorph } from "./scrollZoomMorph.js";
import { initHorizontalScroll } from "./scrollHorizontal.js";

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {
  initPreHeaderScroll();
  initScrollZoomMorph();
  initHorizontalScroll();
});

// Reset de scrollTrigger al cargar para evitar saltos
window.addEventListener("load", () => {
  if (!window.ScrollTrigger) return;

  ScrollTrigger.clearScrollMemory();
  window.scrollTo(0, 0);
  ScrollTrigger.refresh(true);
});

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};