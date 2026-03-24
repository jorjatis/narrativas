export default function domChangeEls() {
  function deleteChevronHeader() {
    const el = document.querySelector('.v-a--d-s-1 .v-a-inf-c .v-i');

    if (!el) return;

    el.remove();
  }

  function moveSubtitle() {
    const el = document.querySelector('.v-a--d-s-1 .v-a-inf-c .v-a-s-t');
    const target = document.querySelector('.v-d--abc');

    if (!el || !target) return;

    target.prepend(el);
  }

  deleteChevronHeader();
  moveSubtitle();
}