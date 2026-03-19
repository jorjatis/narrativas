import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function animScrollHeader() {
  gsap.registerPlugin(ScrollTrigger);

  // =====================================================
  // ESTADOS INICIALES
  // =====================================================

  gsap.set(".v-a--d-s-1 .v-a-t, .v-a--d-s-1 .v-a-p-t", {
    y: 20
  });

  gsap.set(".v-a--d-s-1 .v-a-s-t", {
    y: 40
  });

  gsap.set(".v-a--d-s-1 .v-a-inf-c", {
    y: 0
  });

  // =====================================================
  // INTRO (al cargar)
  // =====================================================

  const introTl = gsap.timeline();

  introTl
    .to(".artemis-capsule", {
      autoAlpha: 1,
      duration: 1,
      ease: "power2.out"
    })
    .to(".v-a-t", {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.4")
    .to(".v-a-p-t", {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.5");

  // =====================================================
  // FLOATING (MUY SUTIL, SIN ROMPER SCROLL)
  // =====================================================

  gsap.to(".artemis-capsule", {
    y: "+=6",
    duration: 2.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // =====================================================
  // FASE 1 — SCROLL (pin + desmontaje)
  // =====================================================

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".v-a--d-s-1",
      start: "top top",
      end: "+=800",
      scrub: true,
      pin: true,
      anticipatePin: 1
    }
  });

  // Rotación cápsula
  tl.to(".artemis-capsule", {
    rotate: 0,
    ease: "none"
  }, 0);

  // Separación capas
  tl.to(".artemis-media--01", {
    y: -220,
    ease: "power2.out"
  }, 0);

  tl.to(".artemis-media--02", {
    y: -110,
    x: 10,
    ease: "power2.out"
  }, 0.05);

  tl.to(".artemis-media--03", {
    y: -5,
    x: 12,
    ease: "power2.out"
  }, 0.1);

  tl.to(".artemis-media--04", {
    y: 80,
    x: 30,
    scale: 0.8,
    ease: "power2.out"
  }, 0.15);

  // Empuje del texto
  tl.to(".v-a--d-s-1 .v-a-inf-c", {
    y: 80,
    ease: "none"
  }, 0.1);

  // =====================================================
  // 🧩 FASE 2 — Subtítulo
  // =====================================================

  ScrollTrigger.create({
    trigger: ".v-a--d-s-1",
    start: "bottom+=300 bottom",
    once: true,
    onEnter: () => {

      gsap.set(".v-a--d-s-1 .v-a-s-t", {
        display: "block",
        opacity: 0,
        y: 40
      });

      requestAnimationFrame(() => {
        gsap.to(".v-a--d-s-1 .v-a-s-t", {
          opacity: 0.4,
          y: 0,
          duration: 1.2,
          ease: "expo.out"
        });
      });

    }
  });


  ScrollTrigger.refresh();
}