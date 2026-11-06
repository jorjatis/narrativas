function optionValue(option) {
  return option.textContent.replace(/\s+/g, ' ').trim();
}

function labelValue(select) {
  const label = select.querySelector('.v-slc__t');
  return label ? label.textContent.replace(/\s+/g, ' ').trim() : '';
}

function syncDisabled(selects) {
  const values = selects.map(labelValue);

  selects.forEach((select, index) => {
    const rivalValue = values[1 - index];
    select.querySelectorAll('.v-slc__a').forEach((option) => {
      const disabled = rivalValue !== '' && optionValue(option) === rivalValue;
      option.classList.toggle('is-disabled', disabled);
      option.toggleAttribute('aria-disabled', disabled);
    });
  });
}

function bindPair(container) {
  const selects = [...container.querySelectorAll(':scope > .v-slc')];
  if (selects.length !== 2) return;

  syncDisabled(selects);

  selects.forEach((select) => {
    select.addEventListener('click', (event) => {
      const option = event.target.closest('.v-slc__a');
      if (!option || !select.contains(option)) return;

      if (option.classList.contains('is-disabled')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      requestAnimationFrame(() => syncDisabled(selects));
    }, true);
  });
}

export function selectRivals() {
  document.querySelectorAll('.v-slc-c').forEach(bindPair);
}
