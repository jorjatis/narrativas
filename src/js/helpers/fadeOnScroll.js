export default function fadeOnScroll(selector, distance = 60) {
  const el = document.querySelector(selector);
  if (!el) return;

  let ticking = false;

  const update = () => {
    // Añade 'is-visible' solo si estás ARRIBA (scrollY menor que la distancia)
    el.classList.toggle(
      "is-visible",
      window.scrollY < distance
    );

    ticking = false;
  };

  // Evaluamos el estado inicial inmediatamente
  update();

  window.addEventListener("scroll", () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}