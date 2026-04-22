// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Utils

// NOTE: Components
import imagesUnblur from './modules/imagesUnblur';

export function initAll() {
  fadeOnScroll('.scr-ind');
  imagesUnblur();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();
window.addEventListener('load', initAll);