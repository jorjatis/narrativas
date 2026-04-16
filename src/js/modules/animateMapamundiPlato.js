import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function animateMapamundiPlato() {
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".v-n-mth--11 figure",
      start: "20% center",
      end: "80% center",
      markers: true,
      scrub: true
    }
  });

  tl.to([".v-n-mth--11 .v-n-img--1", ".v-n-mth--11 .v-n-img--3"], {
    rotate: 180,
    ease: "none",
    duration: 1 
  })
}