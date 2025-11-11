// main.js
import { moveSubtitle, moveFlipCountdown, selectorNavActive } from './dom-utils';
import { initFlipCountdown } from './flip-countdown';
import { selectorCardsAnim } from './selector-cards';

document.addEventListener('DOMContentLoaded', () => {
  moveSubtitle();
  moveFlipCountdown();
  selectorNavActive();
  initFlipCountdown();
  selectorCardsAnim();
});