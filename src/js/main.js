// import domChangeEls from './modules/domChangeEls';

const modules = [
  // domChangeEls
].filter(Boolean);

export function initAll() {
  modules.forEach(fn => fn());
}

function start() {
  initAll();
}

window.addEventListener('load', start);