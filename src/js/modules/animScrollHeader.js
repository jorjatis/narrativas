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
  // INTRO
  // =====================================================

  const introTl = gsap.timeline();

  introTl
    .to(".artemis-capsule", {
      autoAlpha: 1,
      duration: 1,
      ease: "power2.out"
    })
    .to(".v-a--d-s-1 .v-a-inf-c .v-a-t", {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.4")
    .to(".v-a--d-s-1 .v-a-inf-c .v-a-p-t", {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.5");

  // =====================================================
  // FLOATING DE LA CAPSULA
  // =====================================================

  // gsap.to(".artemis-capsule", {
  //   y: "+=6",
  //   duration: 2.5,
  //   ease: "sine.inOut",
  //   yoyo: true,
  //   repeat: -1
  // });

  // =====================================================
  // FASE 1 — SCROLL
  // =====================================================

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".v-a-wrapper",
      start: "top top",
      end: "+=800",
      scrub: true,
      pin: ".v-a--d-s-1",
      pinSpacing: true,
      anticipatePin: 1
    }
  });

  tl.to(".artemis-media--01", {
    y: -55,
    x: 138,
    rotate: 79,
    ease: "power2.out"
  }, 0);

  tl.to(".artemis-media--02", {
    y: -25,
    x: 1,
    rotate: 50,
    scale: 0.85,
    ease: "power2.out"
  }, 0.05);

  tl.to(".artemis-media--03", {
    y: 65,
    x: -102,
    rotate: 20,
    ease: "power2.out"
  }, 0.1);

  // =====================================================
  // FASE 2 — Indicador de scroll
  // =====================================================

  ScrollTrigger.create({
    trigger: ".v-d-w",
    start: "top+=300 top",
    once: true,
    onEnter: () => {
      gsap.to(".scr-ind", {
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  });

  // =====================================================
  // FASE 3 — Subtítulo
  // =====================================================

  ScrollTrigger.create({
    trigger: ".v-a--d-s-1",
    start: "bottom+=300 bottom",
    once: true,
    onEnter: () => {

      gsap.set(".v-d--abc > .v-a-s-t", {
        display: "block",
        opacity: 0,
        y: 40
      });

      requestAnimationFrame(() => {
        gsap.to(".v-d--abc > .v-a-s-t", {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "expo.out"
        });
      });

    }
  });

  ScrollTrigger.refresh();
}