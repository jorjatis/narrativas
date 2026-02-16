export function initScrollZoomMorph() {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".sil-morph").forEach((block) => {

    const base = block.querySelector(".sil-morph__media .base");
    const overlay = block.querySelector(".sil-morph__media .overlay");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: "top top",
        end: "+=100%",
        scrub: true,
        pin: true
      }
    });

    // Aparece la imagen base
    tl.to(base, {
      opacity: 1,
      ease: "none"
    }, 0);

    // La silueta crece y se desvanece
    tl.to(overlay, {
      scale: 2,
      opacity: 0.4,
      transformOrigin: "center top",
      ease: "none"
    }, 0);
  });
}
