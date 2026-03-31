export default function animSprayHeader() {
  const container = document.querySelector(".manchas-c");
  if (!container) return;

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: "top 70%",
      toggleActions: "play none none none",
      once: true
    }
  });

  // Splats
  tl.from(".mancha-izq img:first-child", {
    scale: 0,
    opacity: 0,
    duration: 0.4,
    ease: "back.out(2)"
  });

  tl.from(".mancha-dcha img:first-child", {
    scale: 0,
    opacity: 0,
    duration: 0.4,
    ease: "back.out(2)"
  }, "<0.2");

  // Chorros
  tl.from(".mancha-izq img:nth-child(2)", {
    y: -80,
    scaleY: 0.5,
    duration: 1.5,
    ease: "power2.out",
    transformOrigin: "top center"
  }, "<0");

  tl.from(".mancha-dcha img:nth-child(2)", {
    y: gsap.utils.random(-50, -80),
    scaleY: 0.6,
    duration: 1.5,
    ease: "power2.out",
    transformOrigin: "top center"
  }, "<0");

  tl.from(".mancha-dcha img:nth-child(3)", {
    y: gsap.utils.random(-80, -110),
    scaleY: 0.4,
    duration: 1,
    ease: "power2.out",
    transformOrigin: "top center"
  }, "<0.5");
}