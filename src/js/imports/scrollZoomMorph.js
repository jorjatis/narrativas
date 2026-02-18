export function initScrollZoomMorph() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  gsap.utils.toArray(".sil-morph").forEach((block) => {
    const base = block.querySelector(".base");
    const overlay = block.querySelector(".overlay");

    if (!base || !overlay) return;

    let scale = 2;
    let opacity = 0.4;
    let origin = "center top";

    if (block.classList.contains("sil-morph--01")) {
      scale = 0.6;
      opacity = 0;
      origin = "55% 58%";
    }

    if (block.classList.contains("sil-morph--02")) {
      scale = 2.1;
      opacity = 0;
      origin = "51% 18%";
    }

    if (block.classList.contains("sil-morph--03")) {
      scale = 2;
      opacity = 0;
      origin = "69% 2%";
    }

    // Estados iniciales seguros
    gsap.set(base, { opacity: 0 });
    gsap.set(overlay, {
      scale: 1,
      opacity: 1,
      transformOrigin: origin,
      force3D: true
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: "center center",
        end: "+=100%",
        scrub: true,
        pin: true,
        pinSpacing: true,
        pinReparent: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    })
    .to(base, { opacity: 1, ease: "none" }, 0)
    .to(overlay, {
      scale: scale,
      opacity: opacity,
      transformOrigin: origin,
      ease: "none"
    }, 0);
  });
}
