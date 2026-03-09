import { initThemeToggle } from './modules/theme-toggle';
import { initCardPreviewHover } from './modules/card-preview';
import { initTagSearch } from './modules/tag-search';

function initAll() {
  initThemeToggle();
  initCardPreviewHover();
  initTagSearch();
}

document.addEventListener('DOMContentLoaded', () => {
  initAll();
});
