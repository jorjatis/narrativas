import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function imagesUnblur() {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
  });

  const allMuralImages = document.querySelectorAll('.v-n-preh__img');
  const muralContainer = document.querySelector('.v-n-preh');
  const section4 = document.querySelector('.v-n-preh__sec--4');

  if (!muralContainer || allMuralImages.length === 0 || !section4) return;

  let scrollY = 0;

  ScrollTrigger.addEventListener("refreshInit", () => {
    scrollY = window.scrollY;
  });

  ScrollTrigger.addEventListener("refresh", () => {
    window.scrollTo(0, scrollY);
  });

  gsap.to(allMuralImages, {
    filter: 'blur(0px)',
    ease: 'none',
    scrollTrigger: {
      trigger: muralContainer,
      start: 'top top',
      endTrigger: section4,
      end: 'center center',
      scrub: true,
      invalidateOnRefresh: true
    }
  });
}