export default function accordion() {
  document.querySelectorAll('.v-n-acc').forEach(accordion => {
    const isSingle = accordion.dataset.accordion === 'single';

    // 1. DELEGACIÓN DEL CLIC
    accordion.addEventListener('click', e => {
      // Buscamos si el clic provino de un trigger
      const trigger = e.target.closest('.v-n-acc__trg');
      if (!trigger) return;

      // Obtenemos los triggers "frescos" del DOM actual
      const currentTriggers = accordion.querySelectorAll('.v-n-acc__trg');
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const expanded = trigger.getAttribute('aria-expanded') === 'true';

      panel._animId = (panel._animId || 0) + 1;
      const currentAnim = panel._animId;

      const stopAnimation = el => {
        el.style.transition = 'none';
        el.offsetHeight; // reflow
        el.style.transition = '';
      };

      // Cerrar los otros paneles si es 'single'
      if (isSingle && !expanded) {
        currentTriggers.forEach(t => {
          if (t !== trigger && t.getAttribute('aria-expanded') === 'true') {
            const p = document.getElementById(t.getAttribute('aria-controls'));
            if (p) {
              p._animId = (p._animId || 0) + 1;
              stopAnimation(p);
              t.setAttribute('aria-expanded', 'false');
              p.style.maxHeight = p.scrollHeight + 'px';
              p.offsetHeight; // reflow
              p.style.maxHeight = '0px';
            }
          }
        });
      }

      trigger.setAttribute('aria-expanded', String(!expanded));
      stopAnimation(panel);

      // Abrir o cerrar el panel actual
      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.addEventListener(
          'transitionend',
          () => {
            if (panel._animId !== currentAnim) return;
            panel.style.maxHeight = 'none';
          },
          { once: true }
        );
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.offsetHeight; // reflow
        panel.style.maxHeight = '0px';
      }
    });

    // 2. DELEGACIÓN DEL TECLADO (ACCESIBILIDAD)
    accordion.addEventListener('keydown', e => {
      const trigger = e.target.closest('.v-n-acc__trg');
      if (!trigger) return;

      // Obtenemos un array fresco de triggers para calcular índices
      const currentTriggers = Array.from(accordion.querySelectorAll('.v-n-acc__trg'));
      const index = currentTriggers.indexOf(trigger);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentTriggers[index + 1]?.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentTriggers[index - 1]?.focus();
      }
      if (e.key === 'Home') {
        e.preventDefault();
        currentTriggers[0]?.focus();
      }
      if (e.key === 'End') {
        e.preventDefault();
        currentTriggers[currentTriggers.length - 1]?.focus();
      }
    });
  });
}