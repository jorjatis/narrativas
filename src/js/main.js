// main.js
import { moveSubtitle, moveFlipCountdown, selectorNavActive } from './dom-utils';
import { initFlipCountdown } from './flip-countdown.js';
import { selectorCardsAnim } from './selector-cards';
import { gridGallery } from './grid-gallery.js';

document.addEventListener('DOMContentLoaded', () => {
  // Animaciones y efectos globales
  moveSubtitle();
  moveFlipCountdown();
  selectorNavActive();
  initFlipCountdown();
  selectorCardsAnim();

  // Iniciar todas las galerías
  document.querySelectorAll('.grid-gallery').forEach(gallery => {
    gridGallery(gallery);
  });
});