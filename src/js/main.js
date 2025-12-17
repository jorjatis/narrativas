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

});