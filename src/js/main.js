// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';

// NOTE: Utils
import overflowable from './utils/overflowable';
import descriptionOverflow from './utils/descriptionOverflow';

// NOTE: Modules
import papaViewer from './modules/papa-viewer';

export function initAll() {
  fadeOnScroll('.scr-ind');
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");

  papaViewer();

  overflowable();

  descriptionOverflow();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);