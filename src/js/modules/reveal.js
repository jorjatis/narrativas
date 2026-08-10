export function initReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const items = document.querySelectorAll('[data-reveal]');

  if (header) {
    if (reduceMotion) {
      header.classList.add('is-revealed');
    } else {
      requestAnimationFrame(() => {
        header.classList.add('is-revealed');
      });
    }
  }

  if (!items.length) {
    return;
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      });
    },
    {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12,
    }
  );

  items.forEach((el, index) => {
    if (el instanceof HTMLElement) {
      el.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
    }
    observer.observe(el);
  });
}
