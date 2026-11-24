import { restore } from './selectPartyColor';

function paintColor(el, colorClass) {
  if (el.dataset.partyColor) el.classList.remove(el.dataset.partyColor);
  el.classList.remove('is-default');
  el.classList.add(colorClass);
  el.dataset.partyColor = colorClass;
}

function applyParty(root, party, distances) {
  const items = root.querySelectorAll('.v-elec-bars__item');

  items.forEach((item, index) => {
    if (distances[index] == null) return;
    item.style.setProperty('--distance', distances[index]);
    // Coinciden lector y partido: el «Tú» se aparta un poco (ver .is-same en _elections-bars.scss)
    item.classList.toggle('is-same', distances[index] === 0);

    const dot = item.querySelector('.v-elec-bars__dot--party');
    const name = item.querySelector('.v-elec-bars__name--party');
    if (dot) paintColor(dot, party.colorClass);
    if (name) {
      name.textContent = party.name;
      name.classList.toggle('is-on-top', distances[index] === 0);
    }
  });
}

export function initBars(source) {
  const root = document.querySelector('.v-elec-bars');
  if (!root || !source) return;

  const select = root.querySelector('.v-slc');
  const initial = source.party(source.chosenId);
  const initialDistances = initial && source.distances(initial.id);
  if (!select || !initial || !initialDistances?.length) return;

  let current = initial;
  applyParty(root, current, initialDistances);

  const initialOption = select.querySelector(`.v-slc__a[data-party="${CSS.escape(initial.id)}"]`);
  if (initialOption) restore(select, initialOption);
  else {
    const label = select.querySelector('.v-slc__name') ?? select.querySelector('.v-slc__t');
    if (label) label.textContent = initial.name;
  }

  select.addEventListener('click', (event) => {
    const option = event.target.closest('.v-slc__a');
    if (!option || !select.contains(option)) return;

    const party = source.party(option.dataset.party);
    const distances = party && source.distances(party.id);
    if (!party || !distances?.length) return;

    current = party;
    applyParty(root, current, distances);
  }, true);

  source.subscribe?.(() => applyParty(root, current, source.distances(current.id)));
}
