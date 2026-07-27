export default function articleTitle() {
  const title = document.querySelector('.v-a--d-s-1 .v-a-t');
  if (!title) return;

  title.innerHTML = `
    <span class="v-a-t__las">Las</span>
    <span class="v-a-t__mil">mil vidas</span>
    <span class="v-a-t__bottom">
      <span class="v-a-t__stack">
        <span class="v-a-t__de">de</span>
        <span class="v-a-t__la">la</span>
      </span>
      <span class="v-a-t__cibeles">Cibeles</span>
    </span>
  `;
}
