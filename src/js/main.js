// NOTE: Helpers

// NOTE: Modules
import { initBars } from './modules/electionsBars';
import { initMatriz } from './modules/electionsMatriz';
import { initRadial } from './modules/electionsRadial';
import { loadMoreQuestions } from './modules/loadMoreQuestions';
import { selectPartyColor } from './modules/selectPartyColor';
import { selectRivals } from './modules/selectRivals';

export function initAll() {
  initMatriz();
  initBars();
  initRadial();
  loadMoreQuestions();
  selectPartyColor();
  selectRivals();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
