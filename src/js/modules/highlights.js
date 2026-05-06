import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function highlights() {
  gsap.registerPlugin(ScrollTrigger);

  const items = document.querySelectorAll('.v-d-p strong');
  if (items.length === 0) return;
  
  ScrollTrigger.batch(items, {
    start: "top 80%",
    onEnter: batch => gsap.to(batch, { overwrite: true, className: "is-marked" }),
    once: true
  });
}