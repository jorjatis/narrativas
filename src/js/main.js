import { initThemeToggle } from './modules/theme-toggle';
import { initI18n } from './modules/i18n';
import { initReveal } from './modules/reveal';
import { initMediaPreview } from './modules/media-preview';
import { initMonthsNav } from './modules/months-nav';

function initAll() {
  initThemeToggle();
  initI18n();
  initReveal();
  initMediaPreview();
  initMonthsNav();
}

document.addEventListener('DOMContentLoaded', () => {
  initAll();
});
