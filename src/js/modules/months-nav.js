export function initMonthsNav() {
  const nav = document.querySelector('[data-months-nav]');
  const sections = document.querySelectorAll('[data-month-section]');
  const links = nav ? nav.querySelectorAll('[data-month-link]') : [];
  const list = nav ? nav.querySelector('.months-nav__list') : null;

  if (!nav || !sections.length || !links.length) {
    return;
  }

  const linkById = new Map();
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const id = href.startsWith('#') ? href.slice(1) : href;
    if (id) {
      linkById.set(id, link);
    }
  });

  let activeId = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollLinkIntoNav = (link) => {
    if (!list || !link) {
      return;
    }

    const listRect = list.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const offset = linkRect.left - listRect.left - (listRect.width - linkRect.width) / 2;

    list.scrollTo({
      left: list.scrollLeft + offset,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const setActive = (id, { scrollNav = true } = {}) => {
    if (id === activeId) {
      return;
    }

    activeId = id;

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
        if (scrollNav) {
          scrollLinkIntoNav(link);
        }
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if ('IntersectionObserver' in window) {
    const visibility = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.intersectionRatio);
        });

        let bestId = null;
        let bestRatio = 0;

        visibility.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestId && bestRatio > 0) {
          setActive(bestId);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else if (sections[0]) {
    setActive(sections[0].id);
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) {
        return;
      }

      const target = document.getElementById(href.slice(1));
      if (!target) {
        return;
      }

      event.preventDefault();
      link.blur();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
      setActive(target.id, { scrollNav: false });
      scrollLinkIntoNav(link);
    });
  });
}
