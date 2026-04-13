import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function animateMapamundiPlato() {
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".v-n-mth--11 figure",
      start: "top 80%",
      end: "30% 70%",
      scrub: true
    }
  });

  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".v-n-mth--11 figure",
      start: "40% 80%",
      end: "80% 70%",
      scrub: true
    }
  });

  tl.to(".v-n-mth--11 figure", {
    rotate: 0,
    ease: "none",
    duration: 1 
  });

  tl2.to(".v-n-img--2", {
    rotate: -0,
    ease: "none",
    duration: 1
  });
}