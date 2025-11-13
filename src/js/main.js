// main.js
import { moveSubtitle, moveFlipCountdown, selectorNavActive, scrollToTopOnReload } from './dom-utils';
import { initFlipCountdown } from './flip-countdown.js';
import { gridGallery } from './grid-gallery.js';

document.addEventListener('DOMContentLoaded', () => {

  // ------ Cosas globales ------
  moveSubtitle();
  moveFlipCountdown();
  selectorNavActive();
  initFlipCountdown();
  scrollToTopOnReload();

  // ------ Galerías ------
  document.querySelectorAll('.grid-gallery').forEach(gallery => {
    gridGallery(gallery);
  });
});
