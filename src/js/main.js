import domChangeEls from './modules/domChangeEls';
import blScroll from './modules/blScroll';

const modules = [
  domChangeEls,
  blScroll,
].filter(Boolean);

export function initAll() {
  modules.forEach(fn => fn());
}

function start() {
  initAll();
}

window.addEventListener('load', start);