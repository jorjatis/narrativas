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

  // OPTIMIZACIÓN RENDIMIENTO: Forzar aceleración por hardware en elementos que se mueven
  gsap.set([car, ...items, ...itemTexts, infoMain], { force3D: true });

  // Estados iniciales
  gsap.set(
    items.filter(item => !item.classList.contains('papamovil-item--06')),
    { opacity: 0, y: 30 } // Reducido de 40 a 30 para suavizar el esfuerzo del scroll
  );

  gsap.set('.papamovil-item--06', { opacity: 0 });
  gsap.set(itemTexts, { opacity: 0, y: 15 }); // Reducido de 20 a 15

  const fitState = Flip.fit(car, target, {
    scale: true,
    getVars: true
  });

  // DETERMINAR EL END DINÁMICO (Responsive)
  // Si la pantalla es menor de 768px usa 2000px, si no, 3000px
  const isMobile = window.innerWidth < 699;
  const scrollEndValue = isMobile ? '+=2000' : '+=3000';

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: scrollEndValue,
      scrub: 1, // Mantener en 1 ayuda a suavizar en mobile sin penalizar rendimiento
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true // Re-calcula posiciones si cambia el tamaño de pantalla
    }
  });

  // AJUSTE DE DURACIONES INTERNAS (Más fluido y directo)
  tl.to({}, { duration: 0.5 }); // Un pequeño respiro inicial más corto

  tl.to(infoMain, {
    opacity: 0,
    y: -20,
    duration: 0.6,
    ease: 'power1.inOut' // Cambiado a power1 para que no sea tan brusco el inicio/fin
  });

  tl.to(specs, {
    opacity: 0,
    duration: 0.4,
    stagger: 0.04,
    ease: 'power1.inOut'
  }, '<');

  // El coche empieza a moverse un pelín antes de que terminen de irse los textos previos
  tl.to(car, {
    ...fitState,
    duration: 1.8,
    ease: 'power2.inOut' // Las animaciones de posición lucen mejor con algo de aceleración
  }, '-=0.2');

  tl.to(items, {
    opacity: 1,
    y: 0,
    stagger: 0.08, // Stagger más rápido para que no se acumulen demasiados elementos renderizándose a la vez
    duration: 1.5,
    ease: 'power1.out'
  }, '<');

  tl.to(itemTexts, {
    opacity: 1,
    y: 0,
    stagger: 0.04,
    duration: 0.8,
    ease: 'power1.out'
  }, '-=1.2'); // Entran escalonados mientras los items se asientan

  tl.to({}, { duration: 0.8 }); // Respiro final antes de des-pinear
}