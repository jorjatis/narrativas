// NOTE: Helpers
import removeEls from './helpers/removeEls';
import moveEls from './helpers/moveEls';
import fadeOnScroll from './helpers/fadeOnScroll';
import fadeLottieToImage from './helpers/fadeLottieToImage.js';

// NOTE: Components
import animPreHeader from './modules/animPreHeader';
import animSprayHeader from './modules/animSprayHeader';
import audioPlayer from './modules/audioPlayer';
import dvdScroller from './modules/dvdScroller';
import dvdNavSticky from './modules/dvdNavSticky';

export function initAll() {
  moveEls('.v-a--d-s-1 .v-a-s-t', '.v-d--abc', "prepend");
  removeEls('.v-a--d-s-1 .v-a-inf-c');
  fadeOnScroll('.scr-ind');
  fadeLottieToImage('2000');

  animPreHeader();
  animSprayHeader();

  // Player del teaser
  audioPlayer(document.querySelector('#teaser'));

  // Player del DVD (este es el que pasas al scroller)
  const dvdPlayer = audioPlayer(document.querySelector('.v-n-dvd'));
  dvdScroller(dvdPlayer);
  
  dvdNavSticky();
}

function start() {
  initAll();
  
  if (window.ScrollTrigger) {
    window.ScrollTrigger.refresh();
  }
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll():
window.addEventListener('load', start);
