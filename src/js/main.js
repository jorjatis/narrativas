import preHeaderScene from './modules/preHeaderScene';
import scrollIndicatorPosition from './modules/scrollIndicatorPosition';
import scrambleTitle from './modules/scrambleTitle';
import canPlayWebm from './modules/canPlayWebm';

const modules = [
  canPlayWebm,
  preHeaderScene,
  scrollIndicatorPosition,
  scrambleTitle,
].filter(Boolean);

function initAll() {
  const infoContainerEl = document.querySelector('.v-a--d-s-1 .v-a-inf-c');
  if (infoContainerEl) infoContainerEl.remove();
  
  modules.forEach(fn => fn());
}

document.addEventListener('DOMContentLoaded', initAll);