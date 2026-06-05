import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

export default function papamovilFlip () {
  gsap.registerPlugin(ScrollTrigger, Flip);

  const section = document.querySelector('.v-a--d-s-1');
  if (!section) return;

  const infoMain = document.querySelector('.papamovil-inf-c');
  const car = document.querySelector('.js-main-car');
  const target = document.querySelector('.papamovil-item--06 .papamovil-fig');
  const items = gsap.utils.toArray('.papamovil-item');
  const itemTexts = gsap.utils.toArray('.papamovil-grid .papamovil-title, .papamovil-grid .papamovil-year');
  const specs = gsap.utils.toArray(['.papamovil-size', '.papamovil-line']);

  if (!car || !target) return;

  gsap.set([car, ...items, ...itemTexts, infoMain], { force3D: true });

  gsap.set(
    items.filter(item => !item.classList.contains('papamovil-item--06')),
    { opacity: 0, y: 30 }
  );

  gsap.set('.papamovil-item--06', { opacity: 0 });
  gsap.set(itemTexts, { opacity: 0, y: 15 });

  const fitState = Flip.fit(car, target, {
    scale: true,
    getVars: true
  });

  const isMobile = window.innerWidth < 699;
  const scrollEndValue = isMobile ? '+=2000' : '+=3000';

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: scrollEndValue,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  tl.to({}, { duration: 0.5 });

  tl.to(infoMain, {
    opacity: 0,
    y: -20,
    duration: 0.6,
    ease: 'power1.inOut'
  });

  tl.to(specs, {
    opacity: 0,
    duration: 0.4,
    stagger: 0.04,
    ease: 'power1.inOut'
  }, '<');

  tl.to(car, {
    ...fitState,
    duration: 1.8,
    ease: 'power2.inOut'
  }, '-=0.2');

  tl.to(items, {
    opacity: 1,
    y: 0,
    stagger: 0.08,
    duration: 1.5,
    ease: 'power1.out'
  }, '<');

  tl.to(itemTexts, {
    opacity: 1,
    y: 0,
    stagger: 0.04,
    duration: 0.8,
    ease: 'power1.out'
  }, '-=1.2');

  tl.to({}, { duration: 0.8 });
}