function optionValue(option) {
  return option.textContent.replace(/\s+/g, ' ').trim();
}

function setActive(select, option) {
  select.querySelectorAll('.v-slc__a').forEach((item) => {
    item.classList.toggle('is-active', item === option);
  });
}

function nameNode(text) {
  const name = document.createElement('span');
  name.className = 'v-slc__name';
  name.textContent = text;
  return name;
}

/** Pinta en la cabecera del desplegable el color y el nombre (con elipsis) de la opción elegida. */
export function restore(select, option) {
  const label = select.querySelector('.v-slc__t');
  if (!label || !option) return;

  setActive(select, option);

  const text = optionValue(option);
  const color = option.querySelector('.v-slc__party-color');
  if (!color) {
    label.replaceChildren(nameNode(text));
    return;
  }

  label.replaceChildren(color.cloneNode(true), nameNode(text));
}

function sync(select) {
  const label = select.querySelector('.v-slc__t');
  if (!label) return;

  const value = label.textContent.replace(/\s+/g, ' ').trim();
  const option = [...select.querySelectorAll('.v-slc__a')].find((item) => optionValue(item) === value);
  if (option) restore(select, option);
}

export function selectPartyColor() {
  document.querySelectorAll('.v-slc').forEach((select) => {
    if (!select.querySelector('.v-slc__a .v-slc__party-color')) return;

    sync(select);

    select.addEventListener('click', (event) => {
      const option = event.target.closest('.v-slc__a');
      if (!option || !select.contains(option) || option.classList.contains('is-disabled')) return;

      requestAnimationFrame(() => restore(select, option));
    }, true);
  });
}
