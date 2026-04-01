// NOTE: Helpers
import removeEls from './helpers/removeEls';
import moveEls from './helpers/moveEls';
import fadeOnScroll from './helpers/fadeOnScroll';
import fadeLottieToImage from './helpers/fadeLottieToImage.js';

// NOTE: Components
import animSprayHeader from './modules/animSprayHeader';
import audioPlayer from './modules/audioPlayer';
import dvdScroller from './modules/dvdScroller';
import dvdNavSticky from './modules/dvdNavSticky';

export function initAll() {
  moveEls('.v-a--d-s-1 .v-a-s-t', '.v-d--abc', "prepend");
  removeEls('.v-a--d-s-1 .v-a-inf-c');
  fadeOnScroll('.scr-ind');
  fadeLottieToImage('#anim1', '#finalImg', 7000);

  animSprayHeader();

  const playerApi = audioPlayer();
  dvdScroller(playerApi);
  
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
