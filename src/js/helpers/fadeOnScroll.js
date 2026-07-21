export default function fadeOnScroll(selector, threshold = 50) {
  const indicators = document.querySelectorAll(selector);
  if (!indicators.length) return;

  const update = () => {
    const visible = window.scrollY < threshold;

    indicators.forEach((el) => {
      el.classList.toggle("is-visible", visible);
      el.setAttribute("aria-hidden", String(!visible));
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}
