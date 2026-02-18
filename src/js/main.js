import "./vendors/gsap.min.js";
import "./vendors/ScrollTrigger.min.js";

import { relocatePreHeader } from "./imports/relocatePreHeader.js";
import { initScrollIndicator } from "./imports/initScrollIndicator.js";
import { initPreHeaderScroll } from "./imports/preHeaderScroll.js";
import { initScrollZoomMorph } from "./imports/scrollZoomMorph.js";

document.addEventListener("DOMContentLoaded", () => {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    console.warn("GSAP o ScrollTrigger no están disponibles.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  relocatePreHeader();
  initScrollIndicator();
  initPreHeaderScroll();
  initScrollZoomMorph();
});

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
});