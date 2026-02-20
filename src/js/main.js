import "./vendors/gsap.min.js";
import "./vendors/ScrollTrigger.min.js";

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