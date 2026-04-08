// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Components
import parallaxPreHeader from './modules/parallaxPreHeader';

export function initAll() {
  fadeOnScroll('.scr-ind');

  parallaxPreHeader();
}

function start() {
  initAll();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll():
window.addEventListener('load', start);