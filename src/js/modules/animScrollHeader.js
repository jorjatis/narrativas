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

  // gsap.set(".v-a--d-s-1 .v-a-s-t", {
  //   y: 40
  // });

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

  gsap.to(".artemis-capsule", {
    y: "+=12",
    x: "+=6",
    duration: 2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
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