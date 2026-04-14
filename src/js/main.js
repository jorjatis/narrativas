// NOTE: Helpers
import removeEls from './helpers/removeEls';
import fadeOnScroll from './helpers/fadeOnScroll';
import loadLottie from './helpers/loadLottie';
import observeInView from './helpers/observeInView';

// NOTE: Components
import parallaxPreHeader from './modules/parallaxPreHeader';
import animateMapamundiPlato from './modules/animateMapamundiPlato';
import scrolly from './modules/scrolly';
import animateFidelAtril from './modules/animateFidelAtril';

export function initAll() {
  removeEls('.v-a--d-s-1 > .v-a-inf-c');
  fadeOnScroll('.scr-ind');

  // parallaxPreHeader();
  // animateFidelAtril();
  // animateMapamundiPlato();
  scrolly();

  // // Efecto blur in en textos
  // observeInView({
  //   target: '.v-n-preh-txt p.blur-y-in',
  //   threshold: 0.4,
  //   once: true,
  //   onEnter: (entry) => {
  //     entry.target.classList.add('is-visible');
  //   }
  // });

  // // Efecto blur in en info-container
  // observeInView({
  //   target: '.v-a--d-s-1 .v-a-img-c .v-a-inf-c.blur-y-in',
  //   threshold: 0.5,
  //   once: true,
  //   onEnter: (entry) => {
  //     entry.target.classList.add('is-visible');
  //   }
  // });

  // // Lottie grafiti
  // const anim = loadLottie({
  //   container: '#lottie-grafiti',
  //   path: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/19/cubacontracuba/lotties/1-cabecera-gota-grafiti.json',
  //   loop: false,
  //   autoplay: false
  // });

  // observeInView({
  //   target: '#lottie-grafiti',
  //   threshold: 0.5,
  //   once: true,
  //   onEnter: () => {
  //     anim?.play();
  //   }
  // });
}

function start() {
  document.body.classList.add("is-loaded");
  initAll();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll():
window.addEventListener('load', start);