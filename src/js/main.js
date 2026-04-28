// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Utils

// NOTE: Components
import imagesUnblur from './modules/imagesUnblur';
import titleChange from './modules/titleChange';

export function initAll() {
  fadeOnScroll('.scr-ind');
  titleChange();
  imagesUnblur();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();
window.addEventListener('load', initAll);