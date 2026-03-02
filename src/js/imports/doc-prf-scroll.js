export default function initDocPrfScroll() {

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  gsap.utils.toArray(".doc-prf").forEach((block) => {

    const media = block.querySelector(".doc-prf__media");
    const name  = block.querySelector(".clock-heading__name");

    if (!media || !name) return;

    const getOffset = () => {
      const mediaRect = media.getBoundingClientRect();
      const nameRect  = name.getBoundingClientRect();
      return mediaRect.top - nameRect.bottom;
    };

    let offset = 0;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: "top 15%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
        onRefresh: () => {
          offset = getOffset();
        }
      }
    });

    tl.to(media, {
      y: () => -offset,
      duration: 0.8,
      ease: "power2.out"
    }, 0);

    tl.to(block, {
      marginBottom: () => -offset,
      duration: 0.8,
      ease: "power2.out"
    }, 0);

  });

  ScrollTrigger.refresh();
}