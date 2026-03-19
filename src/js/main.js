import animScrollHeader from './modules/animScrollHeader';
import nave3d from './modules/nave3d';

const modules = [
  animScrollHeader,
  nave3d,
].filter(Boolean);

export function initAll() {
  modules.forEach(fn => fn());
}

function start() {
  window.scrollTo({
    top: 0,
    behavior: "auto"
  });

  initAll();
}

window.addEventListener('load', start);