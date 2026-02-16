export function initHorizontalScroll() {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".v-scr-hzn").forEach((section) => {
    const track = section.querySelector(".v-scr-hzn__track");
    if (!track) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=200%",
        scrub: true,
        pin: true,
        pinSpacing: true
      }
    });

    // Animación horizontal real
    tl.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: "none"
    });
  });
}
