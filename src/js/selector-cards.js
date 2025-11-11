// selector-cards.js
import { gsap } from './vendors/gsap/gsap.min.js';
import { ScrollTrigger } from './vendors/gsap/ScrollTrigger.min.js';

export function selectorCardsAnim() {
  gsap.registerPlugin(ScrollTrigger);

  const cards = gsap.utils.toArray('.sel-cards .card');

  if (!cards.length) return; // si no hay tarjetas, salir

  const animSettings = [
    { y: -40, x: 8, rotate: -15 }, // tarjeta 1
    { y: -105, x: 4, rotate: -8  }, // tarjeta 2
    { y: -160, x: 0, rotate: -2  }, // tarjeta 3
    { y: -140, x: 2, rotate: 8  }, // tarjeta 4
    { y: -90, x: 0, rotate: -1  }, // tarjeta 5
    { y: -30, x: -10, rotate: 10  }  // tarjeta 6
  ];

  // Efecto arco
  gsap.to(cards, {
    scrollTrigger: {
      trigger: '.sel-cards',
      start: 'top 70%',
      end: 'bottom 80%',
      scrub: true
    },
    y: (i) => animSettings[i]?.y ?? 0,
    x: (i) => animSettings[i]?.x ?? 0,
    rotate: (i) => animSettings[i]?.rotate ?? 0,
    ease: 'none',
  });
}