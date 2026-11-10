import { getDistances, getParty, onUserAnswersChange, parties, partyChosen } from './mockData';

function setColorClass(el, colorClass) {
  el.classList.remove('is-default');
  parties.forEach((party) => el.classList.remove(party.colorClass));
  el.classList.add(colorClass);
}

function applyParty(root, party) {
  const distances = getDistances(party.id);
  const items = root.querySelectorAll('.v-elec-bars__item');

  items.forEach((item, index) => {
    if (distances[index] == null) return;
    item.style.setProperty('--distance', distances[index]);

    const dot = item.querySelector('.v-elec-bars__dot--party');
    const name = item.querySelector('.v-elec-bars__name--party');
    if (dot) setColorClass(dot, party.colorClass);
    if (name) {
      name.textContent = party.name;
      name.classList.toggle('is-on-top', distances[index] === 0);
    }
  });
}

export function initBars() {
  const root = document.querySelector('.v-elec-bars');
  if (!root) return;

  const select = root.querySelector('.v-slc');
  const initial = getParty(partyChosen);
  if (!select || !initial || !getDistances(initial.id).length) return;

  let current = initial;
  applyParty(root, current);

  const label = select.querySelector('.v-slc__t');
  if (label) label.textContent = initial.name;

  select.addEventListener('click', (event) => {
    const option = event.target.closest('.v-slc__a');
    if (!option || !select.contains(option)) return;

    const party = getParty(option.dataset.party);
    if (!party || !getDistances(party.id).length) return;

    current = party;
    applyParty(root, current);
  }, true);

  onUserAnswersChange(() => applyParty(root, current));
}
