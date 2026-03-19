import scrollIndicatorPosition from './modules/scrollIndicatorPosition';
import scrambleInfoContainerTexts from './modules/scrambleInfoContainerTexts';

const modules = [
  scrollIndicatorPosition
  // scrambleInfoContainerTexts,
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