// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import removeElements from './helpers/removeEls';

// NOTE: Modules
import initAudioPlayer from './modules/audio-player';
import initVideoSubtitles from './modules/video-subtitles';
import initPreArticleHeader from './modules/pre-article-header';
import initRouteMediasMap from './modules/route-medias-map';
import initRouteMediasVideoModal from './modules/route-medias-video-modal';

export function initAll() {
  document.body.classList.add('is-loaded');

  removeElements('.v-a--d-s-1 > .v-a-inf-c');
  fadeOnScroll(".v-a--d-s-1 .v-a-img-c > .scr-ind");
  initAudioPlayer();
  initVideoSubtitles();
  initPreArticleHeader();
  initRouteMediasMap();
  initRouteMediasVideoModal();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);
