// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Utils
import overflowable from './utils/overflowable';
import descriptionOverflow from './utils/descriptionOverflow';

// NOTE: Modules
import papaViewer from './modules/papa-viewer';

export function initAll() {
  fadeOnScroll('.scr-ind');

  papaViewer();

  overflowable();

  descriptionOverflow();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();

window.addEventListener(
  'load',
  initAll
);