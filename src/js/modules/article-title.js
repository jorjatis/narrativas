export default function articleTitle() {
  const title = document.querySelector('.v-a--d-s-1 .v-a-t');
  if (!title || title.dataset.formatted === 'true') return;

  const words = title.textContent.trim().split(/\s+/);
  // Esperado: "Las mil vidas de la Cibeles"
  if (words.length < 6) return;

  const [las, mil, vidas, de, la, ...rest] = words;
  const cibeles = rest.join(' ');

  title.innerHTML = `
    <span class="v-a-t__las">${las}</span>
    <span class="v-a-t__mil">${mil} ${vidas}</span>
    <span class="v-a-t__bottom">
      <span class="v-a-t__stack">
        <span class="v-a-t__de">${de}</span>
        <span class="v-a-t__la">${la}</span>
      </span>
      <span class="v-a-t__cibeles">${cibeles}</span>
    </span>
  `.trim();

  title.dataset.formatted = 'true';
}
