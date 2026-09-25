export function zoomInImage() {
  // Sin zoom en mobile (≤699px)
  if (window.matchMedia('(max-width: 699px)').matches) return;

  const zoomDuration = 90;
  const img = document.querySelector('.v-a--d-s-1 .v-a-img-c .v-a-img');

  if (!img) return;

  img.style.transition = `transform ${zoomDuration}s linear`;
  img.style.transform = 'scale(1.5)';
}
