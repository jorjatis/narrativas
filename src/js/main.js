// NOTE: Helpers
import moveEls from './helpers/moveEls';
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Components

export function initAll() {

}

function start() {
  initAll();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll():
window.addEventListener('load', start);