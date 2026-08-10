import { initThemeToggle } from './modules/theme-toggle';
import { initReveal } from './modules/reveal';
import { initMediaPreview } from './modules/media-preview';
import { initMonthsNav } from './modules/months-nav';

function initAll() {
  initThemeToggle();
  initReveal();
  initMediaPreview();
  initMonthsNav();
}

document.addEventListener('DOMContentLoaded', () => {
  initAll();
});
