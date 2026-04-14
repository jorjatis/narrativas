import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function animateMapamundiPlato() {
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".v-n-mth--11 figure",
      start: "25% center",
      end: "bottom center",
      scrub: true
    }
  });

  tl.to(".v-n-mth--11 .v-n-img--1", {
    rotate: 180,
    ease: "none",
    duration: 1 
  })
}