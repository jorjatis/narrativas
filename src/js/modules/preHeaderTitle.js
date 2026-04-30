export default function preHeaderTitle() {
  const title = document.querySelector('.v-a-p-t__p');

  title.innerHTML = title.textContent.replace(
    ' de ',
    ' <span>de</span> '
  );
}