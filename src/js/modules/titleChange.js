export default function titleChange() {
  const h1 = document.querySelector('.v-a--d-s-1 .v-a-inf-c .v-a-t');

  if (h1) {
    const text = h1.textContent;
    const parts = text.split(':');

    if (parts.length > 1) {
      const firstPart = parts[0] + ':';
      const rest = parts.slice(1).join(':').trim();

      h1.innerHTML = `<strong>${firstPart}</strong> ${rest}`;
    }
  }
}