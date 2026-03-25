export default function dropdown(selector = '.v-n-drp') {
  const dropdowns = document.querySelectorAll(selector);

  dropdowns.forEach(drop => {
    const trigger = drop.querySelector('.v-n-drp__trg');
    const options = drop.querySelectorAll('.v-n-drp__opts button');

    // Toggle
    trigger.addEventListener('click', e => {
      e.stopPropagation();

      const isOpen = drop.classList.contains('is-open');

      closeAll(dropdowns);

      if (!isOpen) {
        drop.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    // Selección
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const text = opt.textContent;

        // actualizar label
        trigger.childNodes[0].nodeValue = text + ' ';

        // active state
        drop.querySelectorAll('li').forEach(li => {
          li.classList.remove('is-active');
        });

        opt.parentElement.classList.add('is-active');

        // cerrar
        drop.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // click fuera
  document.addEventListener('click', () => {
    closeAll(dropdowns);
  });

  function closeAll(dropdowns) {
    dropdowns.forEach(d => {
      d.classList.remove('is-open');
      const trg = d.querySelector('.v-n-drp__trg');
      trg.setAttribute('aria-expanded', 'false');
    });
  }
}