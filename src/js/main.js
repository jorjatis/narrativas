// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import removeElements from './helpers/removeEls';

// NOTE: Modules
import initSonidosPlayer from './modules/sonidos-player';


export function initAll() {
  document.body.classList.add('is-loaded');

  removeElements('.v-a--d-s-1 > .v-a-inf-c');
  fadeOnScroll(".v-a--d-s-1 .v-a-img-c > .scr-ind");
  initSonidosPlayer();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);