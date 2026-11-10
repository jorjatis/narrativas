import { initBars } from './electionsBars';
import { initMatriz } from './electionsMatriz';
import { initRadial } from './electionsRadial';
import {
  getDistances,
  getMatrixModel,
  getMatrixReaders,
  getParty,
  onUserAnswersChange,
  parties,
  partyChosen,
  randomizeMatrixYou,
  setMatrixChosen,
  themeScores,
  themes,
} from './mockData';

function seriesName(id) {
  if (id === 'tu') return 'Tú';
  return getParty(id)?.name ?? id;
}

function matrizModel(readers) {
  const model = getMatrixModel();
  return {
    you: model.you,
    parties: parties
      .filter((party) => model.scores[party.id])
      .map((party) => ({
        id: party.id,
        name: party.name,
        colorClass: party.colorClass,
        economic: model.scores[party.id].economic,
        social: model.scores[party.id].social,
      })),
    closest: {
      name: model.closest.party.name,
      colorClass: model.closest.party.colorClass,
    },
    chosen: {
      name: model.chosen.party.name,
      economic: model.chosen.score.economic,
      social: model.chosen.score.social,
    },
    closeness: model.closeness,
    readers,
  };
}

function bindMockPanel(matriz, readers) {
  const panel = document.querySelector('.v-elec-mock-options');
  const select = panel?.querySelector('.v-elec-mock-options__select');
  if (!panel || !select || !matriz) return readers;

  parties.forEach((party) => {
    const option = document.createElement('option');
    option.value = party.id;
    option.textContent = party.name;
    option.selected = party.id === partyChosen;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    setMatrixChosen(select.value);
    matriz.update(matrizModel(readers.current));
  });

  panel.querySelector('.v-elec-mock-options__btn')?.addEventListener('click', () => {
    randomizeMatrixYou();
    matriz.update(matrizModel(readers.current));
  });

  panel.querySelector('.v-elec-mock-options__btn--block')?.addEventListener('click', () => {
    readers.current = getMatrixReaders((Math.random() * 0x7fffffff) >>> 0);
    matriz.setReaders(readers.current);
  });

  return readers;
}

export function initElectionsMock() {
  const readers = { current: getMatrixReaders() };
  const matriz = initMatriz(matrizModel(readers.current));

  initBars({
    chosenId: partyChosen,
    party: getParty,
    distances: getDistances,
    subscribe: onUserAnswersChange,
  });

  initRadial({
    themes,
    values: (id) => themeScores[id],
    name: seriesName,
    subscribe: onUserAnswersChange,
  });

  bindMockPanel(matriz, readers);
}
