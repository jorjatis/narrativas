// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';

// NOTE: Modules
import scrolly from './modules/scrolly';
import scrollStoryHeader from './modules/scroll-story-header';
import scrollStory from './modules/scroll-story';
import perspectiveMap from './modules/perspective-map';
import pruebasPerspective from './modules/pruebas-perspective';
import cibeles3D from './cibeles-3D';

export function initAll() {
  // document.body.classList.add('is-loaded');

  fadeOnScroll(".v-a-img-c > .scr-ind");
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");
  scrollStory();
  scrolly();
  scrollStoryHeader();
  perspectiveMap();
  pruebasPerspective();
  cibeles3D();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);