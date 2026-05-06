import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function scrollyEpiAnimation() {
  gsap.registerPlugin(ScrollTrigger);

  const container = document.querySelector(".v-n-scrolly--epi");
  if (!container) return;

  const step = container.querySelector('.step[data-step="1"]');
  if (!step) return;

  const elements = {
    pieces: [
      ".epi-botas", ".epi-guante-izq", ".epi-guante-der", ".epi-mono",
      ".epi-comunicador", ".epi-cubrecabeza", ".epi-gafas", ".epi-casco"
    ],
    tags: ".epi-tag",
    lines: ".epi-tag__line",
    texts: ".epi-tag__txt"
  };

  gsap.set(elements.pieces, { opacity: 0, x: 0, y: 0 });
  gsap.set(elements.tags, { width: 0, overflow: "hidden" });
  gsap.set(elements.lines, { width: 0 });
  gsap.set(elements.texts, { y: -10, opacity: 0 });

  const tl = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power2.out" }
  });

  tl.to(".epi-mono", { opacity: 1 }, 0)
    .to(".epi-botas", { opacity: 1, y: 35 }, 0)
    .to(".epi-guante-izq", { opacity: 1, x: -20, y: 20 }, 0)
    .to(".epi-guante-der", { opacity: 1, x: 20, y: 30 }, 0)
    .to(".epi-comunicador", { opacity: 1, x: -20, y: -60 }, 0)
    .to(".epi-cubrecabeza", { opacity: 1, y: -40 }, 0)
    .to(".epi-gafas", { opacity: 1, x: -50 }, 0)
    .to(".epi-casco", { opacity: 1, x: 25, y: -80 }, 0)
    .to(elements.tags, { width: "100%", duration: 0.4, stagger: 0.05 }, "<")
    .to(elements.lines, { width: "100%", duration: 0.3, stagger: 0.05 }, "<")
    .to(elements.texts, { y: 0, opacity: 1, duration: 0.25 }, "-=0.2");

  ScrollTrigger.create({
    trigger: step,
    start: "top center",
    end: "bottom center",
    onEnter: () => tl.play(),
    onLeaveBack: () => tl.reverse(),
    fastScrollEnd: true 
  });
}