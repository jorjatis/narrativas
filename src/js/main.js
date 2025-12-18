document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------
  // Mover elementos
  // --------------------------------
  // Mover subtitle debajo del title
  const title = document.querySelector('.voc-title');
  const subtitle = document.querySelector('.voc-subtitle');

  if (title && subtitle) {
    title.insertAdjacentElement('afterend', subtitle);
  }

  // --------------------------------
  // Cambiar titulo para la animación
  // --------------------------------
  if (title) {
    title.innerHTML = `
      <div class="text-fixed">La batalla contra</div>
      <div class="text-anim">
        <div class="word word--1">los demonios</div>
        <div class="word word--2">las dudas</div>
        <div class="word word--3">el dolor</div>
        <div class="word word--4">el miedo</div>
      </div>
    `;
  }
});