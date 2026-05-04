// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';

// NOTE: Utils

// NOTE: Components
import preHeaderTitle from './modules/preHeaderTitle';
import zoomShip from './modules/zoom-ship';

export function initAll() {
  document.body.classList.add('is-loaded');
  
  moveEls('.v-a--d-s-1 .v-a-inf-c .v-a-s-t', '.v-d--1 .v-ath')
  preHeaderTitle();
  fadeOnScroll('.scr-ind');
  zoomShip();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();
window.addEventListener('load', initAll);