import { initThemeToggle } from './modules/theme-toggle';
import { initCardPreviewHover } from './modules/card-preview';

function initAll() {
  initThemeToggle();
  initCardPreviewHover();
}

document.addEventListener('DOMContentLoaded', () => {
  initAll();
});
