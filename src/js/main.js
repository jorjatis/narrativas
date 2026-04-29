// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Utils

// NOTE: Components
import preHeaderTitle from './modules/preHeaderTitle';
import zoomShip from './modules/zoom-ship';

export function initAll() {
  document.body.classList.add('is-loaded');
  
  preHeaderTitle();
  fadeOnScroll('.scr-ind');
  zoomShip();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();
window.addEventListener('load', initAll);