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
  themeScores,
  themes,
} from './mockData';

function partyOption(attribute, party) {
  const item = document.createElement('li');
  item.className = 'v-slc__l';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'v-slc__a';
  button.dataset[attribute] = party.id;
  const swatch = document.createElement('span');
  swatch.className = `v-slc__party-color ${party.colorClass}`;
  button.append(swatch, document.createTextNode(party.name));
  item.append(button);
  return item;
}

function fillPartySelect(select, attribute, extra = []) {
  const list = select?.querySelector('.v-slc__u');
  if (!list) return;
  list.replaceChildren(...[...extra, ...parties].map((party) => partyOption(attribute, party)));
}

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

function bindAnswers(matriz, readers) {
  if (!matriz) return readers;

  onUserAnswersChange(() => {
    matriz.update(matrizModel(readers.current));
  });

  return readers;
}

export function initElectionsMock() {
  const you = { id: 'tu', name: 'Tú', colorClass: 'is-default' };
  document.querySelectorAll('.v-elec-radial .v-slc').forEach((select) => {
    fillPartySelect(select, 'series', [you]);
  });
  document.querySelectorAll('.v-elec-bars .v-slc').forEach((select) => {
    fillPartySelect(select, 'party');
  });

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

  bindAnswers(matriz, readers);
}
