export function initScrollZoomMorph() {
  gsap.utils.toArray(".sil-morph").forEach((block) => {
    const base = block.querySelector(".base");
    const overlay = block.querySelector(".overlay");

    if (!base || !overlay) return;

    gsap.set(base, { opacity: 0 });
    gsap.set(overlay, { scale: 1, opacity: 1, transformOrigin: "center top" });

    gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: "top top",
        end: "+=120%",
        scrub: true,
        pin: true,
        anticipatePin: 1,
        pinSpacing: false
      }
    })
      .to(base, { opacity: 1, ease: "none" }, 0)
      .to(overlay, {
        scale: 2,
        opacity: 0.4,
        ease: "none"
      }, 0);
  });
}
