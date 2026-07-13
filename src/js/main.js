// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';

// NOTE: Modules
import scrolly from './modules/scrolly';
import episodesModal from './modules/episodes-modal';

export function initAll() {
  fadeOnScroll('.scr-ind');
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");

  scrolly();
  episodesModal();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);