import domChangeEls from './modules/domChangeEls';
import starsTwinkleBg from './modules/starsTwinkleBg';
import animScrollHeader from './modules/animScrollHeader';

const modules = [
  domChangeEls,
  starsTwinkleBg,
  animScrollHeader
].filter(Boolean);

export function initAll() {
  modules.forEach(fn => fn());
}

function start() {
  initAll();
}

window.addEventListener('load', start);