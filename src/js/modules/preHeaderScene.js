import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function preHeaderScene() {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const section = document.querySelector(".n-preh__top");

    if (!section) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 60%",
        toggleActions: "play none none none"
      }
    });

    // 1. SHAPE BOX (relleno desde abajo)
    tl.fromTo(
      section.querySelector(".shape-box__c"),
      { scaleY: 0, transformOrigin: "bottom" },
      { scaleY: 1, duration: .8, ease: "none" }
    );

    // 2. SHAPE BG (reveal)
    tl.fromTo(
      section.querySelector(".shape-bg"),
      { 
        clipPath: "inset(100% 0 0 0)",
        WebkitClipPath: "inset(100% 0 0 0)"
      },
      { 
        clipPath: "inset(0% 0 0 0)",
        WebkitClipPath: "inset(0% 0 0 0)",
        duration: 1.2,
        ease: "power3.out"
      }
    );

    // 3. NUBES (pop + stagger)
    tl.fromTo(
      section.querySelectorAll(".cloud"),
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.7)"
      },
      "-=0.6"
    );

    // 4. TEXTO (fade)
    tl.fromTo(
      section.querySelector(".n-preh__t"),
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      },
      "-=0.4"
    );

    // 5. VIDEO (slideUp + fade)
    tl.fromTo(
      section.querySelector(".n-preh__vid"),
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      },
      "-=0.6"
    );

  });

  return () => ctx.revert();
}