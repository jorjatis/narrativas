export function zoomInImage() {
  const zoomDuration = 90;

  const img = document.querySelector('.v-a--d-s-1 .v-a-img-c .v-a-img');

  img.style.transition=`transform ${zoomDuration}s linear`;
  img.style.transform='scale(1.5)';
}