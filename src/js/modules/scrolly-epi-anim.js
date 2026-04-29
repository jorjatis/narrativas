import { gsap } from "gsap";

export default function scrollyEpiAnimation() {
  const container = document.querySelector(".v-n-scrolly--epi");
  if (!container) return;

  const step = container.querySelector('.step[data-step="1"]');
  if (!step) return;

  // -------------------------
  // ESTADOS INICIALES
  // -------------------------
  gsap.set([
    ".epi-botas",
    ".epi-guante-izq",
    ".epi-guante-der",
    ".epi-mono",
    ".epi-comunicador",
    ".epi-cubrecabeza",
    ".epi-gafas",
    ".epi-casco"
  ], {
    opacity: 0,
    x: 0,
    y: 0
  });

  gsap.set(".epi-tag", {
    width: 0,
    overflow: "hidden"
  });

  gsap.set(".epi-tag__line", {
    width: 0
  });

  gsap.set(".epi-tag__txt", {
    y: -10,
    opacity: 0
  });

  // -------------------------
  // TIMELINE
  // -------------------------
  const tl = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.5,
      ease: "power2.out"
    }
  });

  tl
    // PIEZAS
    .to(".epi-mono", { opacity: 1 }, 0)
    .to(".epi-botas", { opacity: 1, y: 35 }, 0)
    .to(".epi-guante-izq", { opacity: 1, x: -20, y: 20 }, 0)
    .to(".epi-guante-der", { opacity: 1, x: 20, y: 30 }, 0)
    .to(".epi-comunicador", { opacity: 1, x: -20, y: -60 }, 0)
    .to(".epi-cubrecabeza", { opacity: 1, y: -40 }, 0)
    .to(".epi-gafas", { opacity: 1, x: -50 }, 0)
    .to(".epi-casco", { opacity: 1, x: 25, y: -80 }, 0)

    // TAGS
    .to(".epi-tag", {
      width: "100%",
      duration: 0.4,
      stagger: 0.05
    }, "<")

    .to(".epi-tag__line", {
      width: "100%",
      duration: 0.3,
      stagger: 0.05
    }, "<")

    .to(".epi-tag__txt", {
      y: 0,
      opacity: 1,
      duration: 0.25,
    }, "-=0.2");

  // -------------------------
  // OBSERVER (CLAVE)
  // -------------------------
  let hasPlayed = false;

  const observer = new MutationObserver(() => {
    const isActive = step.classList.contains("is-active");

    if (isActive && !hasPlayed) {
      tl.restart();
      hasPlayed = true;
    }

    if (!isActive) {
      tl.pause(0);
      hasPlayed = false;
    }
  });

  observer.observe(step, {
    attributes: true,
    attributeFilter: ["class"]
  });
}