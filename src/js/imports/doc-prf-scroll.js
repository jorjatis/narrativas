export default function initDocPrfScroll() {

  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) return;

  gsap.utils.toArray(".doc-prf").forEach((block) => {

    const media = block.querySelector(".doc-prf__media");
    const info = block.querySelector(".doc-prf__txt");

    if (!media) return;

    gsap.set(media, { y: 0 });

    gsap.to(media, {
      y: -192,
      ease: "none",
      scrollTrigger: {
        trigger: block,
        start: "top 60%",
        end: "+=300",
        scrub: 1,
        invalidateOnRefresh: true,
        markers: true
      }
    });

    if (info) {
      gsap.to(info, {
        opacity: 0.1,
        scrollTrigger: {
          trigger: block,
          start: "top 60%",
          end: "+=300",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }
  });
}