export default function fadeOnScroll(selector, distance = 60) {
  const el = document.querySelector(selector);
  if (!el) return;

  let ticking = false;

  const update = () => {
    el.classList.toggle(
      "is-transparent",
      window.scrollY >= distance
    );

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}