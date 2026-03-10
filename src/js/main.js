(function () {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    console.warn("GSAP o ScrollTrigger no están disponibles.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  function initAll() {

    ScrollTrigger.refresh();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initAll();
  });
})();