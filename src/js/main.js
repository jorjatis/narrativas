import "./vendors/gsap.min.js";
import "./vendors/ScrollTrigger.min.js";

import { relocatePreHeader } from "./imports/relocatePreHeader.js";
import { initScrollIndicator } from "./imports/initScrollIndicator.js";
import { initPreHeaderScroll } from "./imports/preHeaderScroll.js";
import { initScrollZoomMorph } from "./imports/scrollZoomMorph.js";

/* =====================================================
   PRE INIT
===================================================== */

// Bloquear scroll mientras carga
document.documentElement.style.overflow = "hidden";
document.body.style.overflow = "hidden";

// Evitar restauración automática de scroll
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Forzar inicio arriba
window.scrollTo(0, 0);


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    console.warn("GSAP o ScrollTrigger no están disponibles.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Init módulos
  relocatePreHeader();
  initScrollIndicator();
  initPreHeaderScroll();
  initScrollZoomMorph();

  ScrollTrigger.addEventListener("refreshInit", () => {
    gsap.set(".overlay", { clearProps: "transform,opacity" });
  });

  const onResize = gsap.utils.debounce(() => {
    ScrollTrigger.refresh();
  }, 200);

  window.addEventListener("resize", onResize);

  ScrollTrigger.refresh();
});


/* =====================================================
   WINDOW LOAD
===================================================== */

window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";

  if (window.ScrollTrigger) {
    requestAnimationFrame(() => {
      window.ScrollTrigger.refresh();
    });
  }
});


/* =====================================================
   BEFORE UNLOAD
===================================================== */

window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});