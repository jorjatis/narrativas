// NOTE: Helpers

// NOTE: Modules
import { initElectionsMock } from './modules/electionsMock';
import { initElectionsShare } from './modules/electionsShare';
import { loadMoreQuestions } from './modules/loadMoreQuestions';
import { selectPartyColor } from './modules/selectPartyColor';
import { selectRivals } from './modules/selectRivals';

export function initAll() {
  initElectionsMock();
  initElectionsShare();
  loadMoreQuestions();
  selectPartyColor();
  selectRivals();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
