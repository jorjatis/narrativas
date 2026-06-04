export default function fadeOnScroll(selector, distance = 60) {
  const el = document.querySelector(selector);
  if (!el) return;

  let ticking = false;

  const update = () => {
    el.classList.toggle(
      "is-visible",
      window.scrollY < distance
    );

    ticking = false;
  };

  update();

  window.addEventListener("scroll", () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}