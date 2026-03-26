// NOTE: Helpers
import moveEls from './helpers/moveEls';
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Components
import dropdown from './modules/dropdown';
import accordion from './modules/accordion';

import dataRoutes from './modules/ssRoutes-data';
import ssRoutes from './modules/ssRoutes';

import dataMap from './modules/ssMap-data';
import ssMap from './modules/ssMap';

export function initAll() {
  moveEls('.v-a--d-s-1 .v-a-s-t', '.v-d--abc', "prepend");
  fadeOnScroll('.scr-ind')
  dropdown();
  accordion();
  ssRoutes(dataRoutes);
  ssMap(dataMap);
}

function start() {
  initAll();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll():
window.addEventListener('load', start);