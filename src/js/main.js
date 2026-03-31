// NOTE: Helpers
import removeEls from './helpers/removeEls';
import moveEls from './helpers/moveEls';
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Components
import animSprayHeader from './modules/animSprayHeader';
import dvdNavSticky from './modules/dvdNavSticky';

// import blScroll from './modules/blScroll';

export function initAll() {
  moveEls('.v-a--d-s-1 .v-a-s-t', '.v-d--abc', "prepend");
  removeEls('.v-a--d-s-1 .v-a-inf-c');
  fadeOnScroll('.scr-ind');

  animSprayHeader();
  dvdNavSticky();

  // blScroll();
}

function start() {
  initAll();
  ScrollTrigger.refresh();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll():
window.addEventListener('load', start);