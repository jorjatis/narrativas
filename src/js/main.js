import preHeaderScene from './modules/preHeaderScene';
import scrollIndicatorPosition from './modules/scrollIndicatorPosition';
import scrambleInfoContainerTexts from './modules/scrambleInfoContainerTexts';

const modules = [
  preHeaderScene,
  scrollIndicatorPosition
  // scrambleInfoContainerTexts,
].filter(Boolean);

function initAll() {
  modules.forEach(fn => fn());
}

document.addEventListener('DOMContentLoaded', initAll);