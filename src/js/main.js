// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';

// NOTE: Modules
import scrolly from './modules/scrolly';

export function initAll() {
  // document.body.classList.add('is-loaded');

  fadeOnScroll(".v-a-img-c > .scr-ind");
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);