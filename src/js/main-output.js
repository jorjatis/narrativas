(function () {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    console.warn("GSAP o ScrollTrigger no están disponibles.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // NOTE: Módulos
  function moduleMockup() {
    const mockUp = document.querySelector(".claseMockUp");

    if (!mockUp) return;
    if (!mockUp || !gsap || !ScrollTrigger) return;

    // codigo que sea
  }

  // NOTE: Iniciar modulos
  function initAll() {
    moduleMockup();

    if (ScrollTrigger) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }

  function start() {
    window.scrollTo({
      top: 0,
      behavior: "auto"
    });

    initAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();