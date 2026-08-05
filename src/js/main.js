// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import removeElements from './helpers/removeEls';

// NOTE: Modules
import initSonidosPlayer from './modules/sonidos-player';
import initVideoSubtitles from './modules/video-subtitles';
import initPreArticleHeader from './modules/pre-article-header';



export function initAll() {
  document.body.classList.add('is-loaded');

  removeElements('.v-a--d-s-1 > .v-a-inf-c');
  fadeOnScroll(".v-a--d-s-1 .v-a-img-c > .scr-ind");
  initSonidosPlayer();
  initVideoSubtitles();
  // Después de módulos que miden layout, para no mezclar lecturas + pin/ST
  initPreArticleHeader();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);
