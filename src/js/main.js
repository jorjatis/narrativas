// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';

// NOTE: Modules
import preArticleHeaderScroll from './modules/pre-article-header-scroll';
import scrolly from './modules/scrolly';
import episodesModal from './modules/episodes-modal';

export function initAll() {
  document.body.classList.add('is-loaded');

  fadeOnScroll('.scr-ind');
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");

  preArticleHeaderScroll();
  const scrollyInstances = scrolly();
  episodesModal(scrollyInstances);
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);