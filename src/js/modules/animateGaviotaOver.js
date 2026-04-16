import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function animateGaviotaOver() {
  gsap.registerPlugin(ScrollTrigger);

  const gaviota = document.querySelector(".gaviota-over");
  const gaviotaShadow = document.querySelector(".gaviota-shadow-over");
  const wrapper = document.querySelector(".gaviota-over-c");
  const section = document.querySelector(".v-n-mth--17");
  const c1 = section?.querySelector(".v-n-mth__c--1");
  const c2 = section?.querySelector(".v-n-mth__c--2");

  if (!gaviota || !gaviotaShadow || !wrapper || !section || !c1 || !c2) return;

  const getValues = () => {
    const gaviotaWidth = wrapper.offsetWidth;
    const gaviotaHeight = wrapper.offsetHeight;

    return {
      distanceX: gaviotaWidth,
      distanceY: gaviotaHeight,
    };
  };

  const { distanceX, distanceY } = getValues();

  gsap.fromTo(
    [gaviota, gaviotaShadow],
    {
      x: wrapper.getBoundingClientRect().width,
      y: distanceY,
    },
    {
      x: -distanceX,
      y: -wrapper.getBoundingClientRect().height,
      ease: "none",
      scrollTrigger: {
        trigger: c1,
        start: "top top",
        endTrigger: c2,
        end: "bottom bottom",
        scrub: true,
        pin: wrapper,
        pinSpacing: false,
        invalidateOnRefresh: true,
      },
    }
  );
}