import menuDvd from './modules/menuDvd';

const modules = [
  menuDvd
].filter(Boolean);

export function initAll() {
  modules.forEach(fn => fn());
}

function start() {
  initAll();
}

window.addEventListener('load', start);