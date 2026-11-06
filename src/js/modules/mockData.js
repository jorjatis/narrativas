const partyChosen = 'pp';

const parties = [
  { id: 'pp', name: 'PP', colorClass: 'is-pp' },
  { id: 'psoe', name: 'PSOE', colorClass: 'is-psoe' },
  { id: 'vox', name: 'VOX', colorClass: 'is-vox' },
  { id: 'frente-amplio', name: 'F. Amplio', colorClass: 'is-frente-amplio' },
  { id: 'erc', name: 'ERC', colorClass: 'is-erc' },
  { id: 'eh-bildu', name: 'EH Bildu', colorClass: 'is-eh-bildu' },
  { id: 'junts', name: 'Junts', colorClass: 'is-junts' },
  { id: 'pnv', name: 'PNV', colorClass: 'is-pnv' },
  { id: 'podemos', name: 'Podemos', colorClass: 'is-podemos' },
  { id: 'cc', name: 'CC', colorClass: 'is-cc' },
  { id: 'adelante', name: 'Adelante', colorClass: 'is-adelante' },
  { id: 'bng', name: 'BNG', colorClass: 'is-bng' },
  { id: 'compromis', name: 'Compromís', colorClass: 'is-compromis' },
  { id: 'salf', name: 'SALF', colorClass: 'is-salf' },
];

function getParty(id) {
  return parties.find((party) => party.id === id);
}

const userAnswers = [
  4, 3, 2, 3, 4, 2, 3, 4, 3, 3, 4, 4, 5, 2, 3, 4, 3, 2, 2, 4, 3, 3, 2, 3
];

const partyAnswers = {
  pp: [
    4, 4, 3, 4, 2, 4, 4, 2, 2, 4, 2, 4, 4, 2, 2, 4, 1, 3, 3, 2, 2, 2, 1, 3
  ],
  psoe: [
    5, 2, 1, 3, 5, 1, 2, 5, 4, 2, 5, 2, 5, 4, 4, 3, 4, 1, 1, 5, 4, 5, 4, 5
  ],
  vox: [
    1, 5, 5, 2, 1, 5, 5, 1, 1, 5, 1, 5, 3, 1, 1, 5, 1, 4, 5, 1, 1, 1, 1, 1
  ],
};

export function distance(userScore, partyScore) {
  return Math.round(Math.abs(userScore - partyScore) / 4 * 100);
}

export function getDistances(partyId) {
  const answers = partyAnswers[partyId];
  if (!answers) return [];

  return userAnswers.map((userScore, index) => distance(userScore, answers[index]));
}

function setColorClass(el, colorClass) {
  el.classList.remove('is-default');
  parties.forEach((party) => el.classList.remove(`is-${party.id}`));
  el.classList.add(colorClass);
}

function applyParty(root, party) {
  const distances = getDistances(party.id);
  const items = root.querySelectorAll('.v-elec-bars__item');

  items.forEach((item, index) => {
    if (distances[index] == null) return;
    item.style.setProperty('--dist', distances[index]);

    const dot = item.querySelector('.v-elec-bars__dot--party');
    const name = item.querySelector('.v-elec-bars__name--party');
    if (dot) setColorClass(dot, party.colorClass);
    if (name) {
      name.textContent = party.name;
      name.classList.toggle('is-on-top', distances[index] === 0);
    }
  });
}

function setSelectLabel(select, party) {
  const label = select.querySelector('.v-slc__t');
  if (!label) return;

  const dot = document.createElement('span');
  dot.className = `v-slc__party-color ${party.colorClass}`;
  label.replaceChildren(dot, document.createTextNode(party.name));
}

export function initMockDataBars() {
  const root = document.querySelector('.v-elec-bars');
  if (!root) return;

  const select = root.querySelector('.v-slc');
  const initial = getParty(partyChosen);
  if (!select || !initial || !partyAnswers[initial.id]) return;

  applyParty(root, initial);
  setSelectLabel(select, initial);

  select.addEventListener('click', (event) => {
    const option = event.target.closest('.v-slc__a');
    if (!option || !select.contains(option)) return;

    const party = getParty(option.dataset.party);
    if (!party || !partyAnswers[party.id]) return;

    applyParty(root, party);
    requestAnimationFrame(() => setSelectLabel(select, party));
  }, true);
}
