import { initThemeToggle } from './modules/theme-toggle';

function initAll() {
  initThemeToggle();
}

document.addEventListener('DOMContentLoaded', () => {
  initAll();
});
