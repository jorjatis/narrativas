// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Modules
import papaViewer from './modules/papa-viewer';

// NOTE: Utils
export function initAll() {
  fadeOnScroll('.scr-ind');

  papaViewer();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();
window.addEventListener('load', initAll);