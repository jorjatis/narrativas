import fadeOnScroll from './modules/fadeOnScroll';
import domChangeEls from './modules/domChangeEls';
import starsTwinkleBg from './modules/starsTwinkleBg';
import animScrollHeader from './modules/animScrollHeader';

export function initAll() {
  fadeOnScroll('.scr-ind');
  domChangeEls();
  starsTwinkleBg();
  animScrollHeader();
}

function start() {
  initAll();
}

window.addEventListener('load', start);