import scrambleInfoContainerTexts from './modules/scrambleInfoContainerTexts';

const modules = [
  scrambleInfoContainerTexts,
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

document.addEventListener('DOMContentLoaded', start);