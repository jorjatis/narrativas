export default function preHeaderTitle() {
  const h1 = document.querySelector('.v-a-t');

  h1.innerHTML = h1.textContent.replace(
    ' de ',
    ' <span>de</span> '
  );
}