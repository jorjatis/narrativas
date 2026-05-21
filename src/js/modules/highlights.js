import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function highlights() {
  gsap.registerPlugin(ScrollTrigger);

  const items = document.querySelectorAll('.v-d-p strong');
  if (items.length === 0) return;

  items.forEach((target) => {
    gsap.to(target, {
      scrollTrigger: {
        trigger: target,
        start: "top 80%",
        end: "bottom bottom",
        toggleClass: "is-marked",
        once: true
      }
    });
  });
}