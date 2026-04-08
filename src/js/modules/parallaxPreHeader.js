import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function parallaxPreHeader() {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = {
    getOffsetHeader
  };

  setupGlobalEffects();
  // setupLayers(ctx);
  // setupAmbientAnimations();
  setupTexts();
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
  gsap.to([".gaviota-c", ".cielo-c"],
    {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    }
  );

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

  gsap.to(".mar", {
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
    ".v-n-preh-prlx__l--02"
  ], {
    y: -220,
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
    ease: "none",
    scrollTrigger: {
      trigger: ".v-n-preh-prlx__l--01",
      start: () => `${getOffsetHeader()} top`,
      end: "50% top",
      scrub: true
    }
  });
}

// ===============================
// Animaciones ambientales (loops)
// ===============================

function setupAmbientAnimations() {
  // Gaviota flotando
  gsap.timeline({ repeat: -1, yoyo: true })
    .to(".gaviota-c", {
      y: -15,
      x: 8,
      rotation: 1.5,
      duration: 2,
      ease: "sine.inOut"
    })
    .to(".gaviota-c", {
      y: -25,
      x: -6,
      rotation: -1,
      duration: 2.5,
      ease: "sine.inOut"
    });

  // Cielo
  gsap.fromTo(".cielo",
    {
      x: "-50%"
    },
    {
      x: "0",
      duration: 80,
      ease: "none"
    }
  );

  // Mar
  gsap.timeline({ repeat: -1, yoyo: true })
    .to(".mar", {
      y: -3,
      x: 12,
      duration: 3,
      ease: "sine.inOut"
    })
    .to(".mar", {
      y: 3,
      x: -12,
      duration: 4,
      ease: "sine.inOut"
    });
}

// ===============================
// Textos
// ===============================

function animateText(target, options = {}) {
  return gsap.fromTo(target,
    {
      opacity: 0,
      y: 20,
      filter: "blur(12px)"
    },
    {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "power3.out",
      ...options
    }
  );
}

function setupFirstText() {
  animateText(".v-n-preh-txt--01 p");
}

function setupSecondText() {
  animateText(".v-n-preh-txt--02 p", {
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".v-n-preh-prlx__l--02",
      start: "top 80%"
    }
  });
}

function setupTexts() {
  setupFirstText();
  setupSecondText();
}