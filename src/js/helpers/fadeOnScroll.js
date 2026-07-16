function getScrollY() {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

function getPageScrollIndicators(selector) {
  return [...document.querySelectorAll(selector)].filter(
    (el) => !el.closest(".episodes-modal")
  );
}

export default function fadeOnScroll(selector, distance = 50) {
  let ticking = false;

  const sync = () => {
    const shouldBeVisible = getScrollY() < distance;

    getPageScrollIndicators(selector).forEach((el) => {
      el.classList.toggle("is-visible", shouldBeVisible);
      el.setAttribute("aria-hidden", String(!shouldBeVisible));
    });
  };

  sync();

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        sync();
        ticking = false;
      });
    },
    { passive: true }
  );
}
