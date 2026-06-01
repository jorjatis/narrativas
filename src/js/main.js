// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';
import removeEls from './helpers/removeEls';

// NOTE: Utils

// NOTE: Modules
import papamovilFlip from './modules/papamovilFlip';

export function initAll() {
  document.body.classList.add("is-loaded");
  
  fadeOnScroll('.scr-ind');
  moveEls('.v-a--d-s-1 .v-a-inf-c .v-a-s-t', '.v-d--abc .v-ath__w--2', 'before');
  removeEls('.v-a--d-s-1 .v-a-inf-c > .v-i');

  papamovilFlip();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();

window.addEventListener('load',  initAll);