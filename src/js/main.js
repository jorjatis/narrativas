// NOTE: Helpers

// NOTE: Modules
import { initMockDataBars } from './modules/mockData';
import { loadMoreQuestions } from './modules/loadMoreQuestions';

export function initAll() {
  initMockDataBars();
  loadMoreQuestions();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
