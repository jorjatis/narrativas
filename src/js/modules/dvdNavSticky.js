export default function dvdNavSticky() {
  const nav = document.querySelector('.v-n-dvd-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 150) {
      nav.classList.add('is-fixed');
    } else {
      nav.classList.remove('is-fixed');
    }
  });
}