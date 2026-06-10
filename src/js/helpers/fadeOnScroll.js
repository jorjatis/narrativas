export default function fadeOnScroll(selector, distance = 50) {
  const el = document.querySelector(selector);
  if (!el) return;

  let isVisible = window.scrollY < distance; 

  el.classList.toggle("is-visible", isVisible);

  let ticking = false;

  const update = () => {
    const shouldBeVisible = window.scrollY < distance;

    if (isVisible !== shouldBeVisible) {
      isVisible = shouldBeVisible;
      el.classList.toggle("is-visible", isVisible);
    }

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}