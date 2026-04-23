import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function imagesUnblur() {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
  });

  const allMuralImages = document.querySelectorAll('.v-n-preh__img');
  const muralContainer = document.querySelector('.v-n-preh');
  const titleBlock = document.querySelector('.v-a--d-s-1 .v-a-inf-c');
  const section4 = document.querySelector('.v-n-preh__sec--4');

  if (!muralContainer || allMuralImages.length === 0 || !titleBlock || !section4) return;

  let scrollY = 0;

  ScrollTrigger.addEventListener("refreshInit", () => {
    scrollY = window.scrollY;
  });

  ScrollTrigger.addEventListener("refresh", () => {
    window.scrollTo(0, scrollY);
  });

  const createAnimation = (endTrigger, end) => {
    if (!endTrigger) return;

    return gsap.to(allMuralImages, {
      filter: 'blur(0px)',
      ease: 'none',
      scrollTrigger: {
        trigger: muralContainer,
        start: 'top top',
        endTrigger,
        end,
        scrub: true,
        invalidateOnRefresh: true
      }
    });
  };

  ScrollTrigger.matchMedia({
    "(min-width: 700px)": () => createAnimation(titleBlock, 'top bottom'),
    "(max-width: 699px)": () => createAnimation(section4, 'center center')
  });

  ScrollTrigger.matchMediaRefresh();
}