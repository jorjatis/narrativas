// NOTE: Helpers
import moveEls from './helpers/moveEls';

// NOTE: Components
import dropdown from './modules/dropdown';
import accordion from './modules/accordion';
import data from './modules/ssRoutes-data.js';
import ssRoutes from './modules/ssRoutes';

export function initAll() {
  moveEls('.v-a--d-s-1 .v-a-s-t', '.v-d--abc', "prepend");
  dropdown();
  accordion();

  ssRoutes(data);
}

function start() {
  initAll();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll():
window.addEventListener('load', start);