export default function dvdNavSticky() {
  const nav = document.querySelector('.v-n-dvd-nav');
  if (!nav) return;

  const MIN_WIDTH = 0;

  // NOTE: Este min-width hay que cambiarlo tambien en styles/components/_dvd-nav.scss
  const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);

  function onScroll() {
    if (!mq.matches) {
      nav.classList.remove('is-fixed');
      return;
    }

    if (window.scrollY > 300) {
      nav.classList.add('is-fixed');
    } else {
      nav.classList.remove('is-fixed');
    }
  }

  window.addEventListener('scroll', onScroll);

  mq.addEventListener('change', onScroll);
}