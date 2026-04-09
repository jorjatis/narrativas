import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function parallaxPreHeader() {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = {
    getOffsetHeader
  };

  setupGlobalEffects();
  setupLayers(ctx);
}

// ===============================
// Helpers
// ===============================

function getOffsetHeader() {
  const vhA = document.querySelector(".v-h-a")?.offsetHeight || 0;
  const vh = document.querySelector(".v-h")?.offsetHeight || 0;
  return -(vhA + vh);
}

// ===============================
// Efectos globales (blur / atmósfera)
// ===============================

function setupGlobalEffects() {
  gsap.to([
    ".gaviota",
    ".faro",
  ], {
    filter: "blur(8px)",
    ease: "none",
    scrollTrigger: {
      trigger: ".v-n-preh-prlx__l--01",
      start: "top top",
      end: "50% top",
      scrub: true
    }
  });

  gsap.to(".mar-c", {
    filter: "blur(4px)",
    ease: "none",
    scrollTrigger: {
      trigger: ".v-n-preh-prlx__l--01",
      start: "top top",
      end: "80% top",
      scrub: true
    }
  });
}

// ===============================
// Capas principales (parallax)
// ===============================

function setupLayers({ getOffsetHeader }) {
  // Peñón + bloque 02
  gsap.to([
    ".penon-01",
  ], {
    y: -220,
    force3D: true,
    ease: "none",
    scrollTrigger: {
      trigger: ".v-n-preh-prlx__l--01",
      start: "top top",
      end: "50% top",
      scrub: true
    }
  });

  // Peñón + bloque 02
  gsap.to([
    ".v-n-preh-prlx__l--02"
  ], {
    marginTop: -221,
    force3D: true,
    ease: "none",
    scrollTrigger: {
      trigger: ".v-n-preh-prlx__l--01",
      start: "top top",
      end: "50% top",
      scrub: true
    }
  });

  // Gaviota (scroll)
  gsap.to(".gaviota", {
    y: 250,
    x: -300,
    scale: 0,
    force3D: true,
    ease: "none",
    scrollTrigger: {
      trigger: ".v-n-preh-prlx__l--01",
      start: () => `${getOffsetHeader()} top`,
      end: "50% top",
      scrub: true
    }
  });

  // Caminante grafiti
  gsap.to(".caminante", {
    y: -70,
    x: 100,
    ease: "none",
    force3D: true,
    scrollTrigger: {
      trigger: ".grafiti-c",
      start: "top center",
      end: () => `${window.innerHeight * 1} center`,
      scrub: true
    }
  });
}