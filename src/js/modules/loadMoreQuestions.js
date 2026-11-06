export function loadMoreQuestions() {
  const root = document.querySelector('.v-elec-bars');
  if (!root) return;

  const list = root.querySelector('.v-elec-bars__list');
  const more = root.querySelector('.v-elec-bars__more');
  if (!list || !more) return;

  more.addEventListener('click', () => {
    list.classList.add('is-open');
    more.hidden = true;
  });
}
