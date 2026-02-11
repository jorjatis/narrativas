import "../js/kraken.js";
import "../js/gsap.min.js";
import "../js/ScrollTrigger.min.js";

import { initPreHeaderScroll } from "./preHeaderScroll.js";
import { initScrollZoomMorph } from "./scrollZoomMorph.js";

document.addEventListener("DOMContentLoaded", () => {
  initPreHeaderScroll();
  initScrollZoomMorph();
});