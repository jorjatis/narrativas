export default function initLifeline() {
  const lifeline = document.querySelector('.lifeline');
  const startEl = document.querySelector('.doc-prf');
  const items = document.querySelectorAll('.v-d-p');

  if (!lifeline || !startEl || items.length === 0) return;

  function update() {
    const container = lifeline.offsetParent;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const lastRect = items[items.length - 1].getBoundingClientRect();

    const top = startRect.top - containerRect.top;
    const bottom = lastRect.bottom - containerRect.top;

    lifeline.style.top = `${top}px`;
    lifeline.style.height = `${bottom - top}px`;
  }

  // Ejecutar una vez
  update();

  // Recalcular en resize
  window.addEventListener('resize', update);

  // // Si usas ScrollTrigger (muy importante en tu caso)
  // if (window.ScrollTrigger) {
  //   window.ScrollTrigger.addEventListener('refresh', update);
  // }
}