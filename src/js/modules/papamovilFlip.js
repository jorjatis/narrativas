import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

export default function papamovilFlip () {
  gsap.registerPlugin(ScrollTrigger, Flip);

  const section = document.querySelector('.v-a--d-s-1');

  if (!section) return;

  const infoMain = document.querySelector('.papamovil-inf-c');

  const car = document.querySelector('.js-main-car');

  const target = document.querySelector(
    '.papamovil-item--06 .papamovil-fig'
  );

  const items = gsap.utils.toArray('.papamovil-item');

  const itemTexts = gsap.utils.toArray(
    '.papamovil-grid .papamovil-title, .papamovil-grid .papamovil-year'
  );

  const specs = gsap.utils.toArray([
    '.papamovil-size',
    '.papamovil-line'
  ]);

  if (!car || !target) return;

  // ---------------------------------------------------
  // ESTADO INICIAL
  // ---------------------------------------------------

  gsap.set(
    items.filter(item => !item.classList.contains('papamovil-item--06')),
    {
      opacity: 0,
      y: 40
    }
  );

  gsap.set('.papamovil-item--06', {
    opacity: 0
  });

  gsap.set(itemTexts, {
    opacity: 0,
    y: 20
  });

  // ---------------------------------------------------
  // FLIP CALC
  // ---------------------------------------------------

  const fitState = Flip.fit(
    car,
    target,
    {
      scale: true,
      getVars: true
    }
  );

  // ---------------------------------------------------
  // TIMELINE
  // ---------------------------------------------------

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=4000',
      scrub: 1,
      pin: true,
      anticipatePin: 1
    }
  });

  // respiración inicial
  tl.to({}, {
    duration: 1
  });

  // fade hero info
  tl.to(infoMain, {
    opacity: 0,
    y: -30,
    duration: 0.8,
    ease: 'none'
  });

  tl.to(specs, {
    opacity: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: 'none'
  }, '<');

  // items
  tl.to(items, {
    opacity: 1,
    y: 0,
    stagger: 0.12,
    duration: 2,
    ease: 'none'
  }, '-=0.2');

  // textos
  tl.to(itemTexts, {
    opacity: 1,
    y: 0,
    stagger: 0.06,
    duration: 1,
    ease: 'none'
  }, '<');

  // coche
  tl.to(car, {
    ...fitState,
    duration: 2,
    ease: 'none'
  }, '<');

  // pausa final
  tl.to({}, {
    duration: 1.5
  });
}