export default function fadeOnScroll(element, distance = 60) {
  const el = document.querySelector(selector);
  if (!el) return;

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        el.classList.toggle(
          "is-transparent",
          window.scrollY >= distance
        );

        ticking = false;
      });

      ticking = true;
    }
  });
}