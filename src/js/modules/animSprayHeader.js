export default function animSprayHeader() {
  const container = document.querySelector(".manchas");
  if (!container) return;

  gsap.registerPlugin(ScrollTrigger);

  const izq = Array.from(container.querySelectorAll(".mancha-izq"));
  const dcha = Array.from(container.querySelectorAll(".mancha-dcha"));

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: "top 70%",
      toggleActions: "play none none none",
      once: true
    }
  });

  // 👉 EXPLOSIÓN (solo el primero)
  if (izq[0]) {
    tl.from(izq[0], {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(2.5)"
    });
  }

  if (dcha[0]) {
    tl.from(dcha[0], {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(2.5)"
    }, "<0.2");
  }

  // 👉 CHORROS (EXCLUYENDO el primero)
  if (izq.length > 1) {
    tl.from(izq.slice(1), {
      y: () => gsap.utils.random(-60, -100),
      scaleY: () => gsap.utils.random(0.4, 0.7),
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      transformOrigin: "top center",
      stagger: 0.15
    }, "<0");
  }

  if (dcha.length > 1) {
    tl.from(dcha.slice(1), {
      y: () => gsap.utils.random(-60, -110),
      scaleY: () => gsap.utils.random(0.4, 0.7),
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      transformOrigin: "top center",
      stagger: 0.15
    }, "<0.2");
  }
}