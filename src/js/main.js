// NOTE: Helpers

// NOTE: Utils

// NOTE: Modules
import initTuOnceIdeal from './modules/tu-once-ideal.js';

export function initAll() {
  initTuOnceIdeal();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);