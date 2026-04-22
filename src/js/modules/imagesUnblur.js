import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function imagesUnblur() {
  gsap.registerPlugin(ScrollTrigger);

  const allMuralImages = document.querySelectorAll('.v-n-preh__img');
  const muralContainer = document.querySelector('.v-n-preh');
  const titleBlock = document.querySelector('.v-a-inf-c');
  const section4 = document.querySelector('.v-n-preh__sec--4');

  ScrollTrigger.matchMedia({
    "(min-width: 700px)": function () {
      gsap.to(allMuralImages, {
        filter: 'blur(0px)',
        ease: 'none',
        scrollTrigger: {
          trigger: muralContainer,
          start: 'top top',
          endTrigger: titleBlock,
          end: 'top bottom',
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    },
    "(max-width: 699px)": function () {
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
  });
}