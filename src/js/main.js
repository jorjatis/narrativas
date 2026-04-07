// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Components

export function initAll() {
  fadeOnScroll('.scr-ind');
}

function start() {
  initAll();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll():
window.addEventListener('load', start);