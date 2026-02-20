export default function initLinesTitle() {

  const headingTitle = document.querySelector('.v-a--d-s-1 .v-a-inf-c');
  const lineTitleLeft = document.querySelector('.lines-title.is-left');
  const lineTitleRight = document.querySelector('.lines-title.is-right');

  if (!headingTitle || !lineTitleLeft || !lineTitleRight) return;

  headingTitle.prepend(lineTitleLeft);
  headingTitle.append(lineTitleRight);

  lineTitleLeft.style.display = 'flex';
  lineTitleRight.style.display = 'flex';
}