export default function accordion() {
  document.querySelectorAll('.v-n-acc').forEach(accordion => {
    const isSingle = accordion.dataset.accordion === 'single';
    const triggers = accordion.querySelectorAll('.v-n-acc__trg');

    accordion.addEventListener('click', e => {
      const trigger = e.target.closest('.v-n-acc__trg');
      if (!trigger) return;

      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const expanded = trigger.getAttribute('aria-expanded') === 'true';

      panel._animId = (panel._animId || 0) + 1;
      const currentAnim = panel._animId;

      const stopAnimation = el => {
        el.style.transition = 'none';
        el.offsetHeight;
        el.style.transition = '';
      };

      if (isSingle && !expanded) {
        triggers.forEach(t => {
          if (t !== trigger) {
            const p = document.getElementById(t.getAttribute('aria-controls'));

            p._animId = (p._animId || 0) + 1;

            stopAnimation(p);

            t.setAttribute('aria-expanded', 'false');

            p.style.maxHeight = p.scrollHeight + 'px';
            p.offsetHeight;
            p.style.maxHeight = '0px';
          }
        });
      }

      trigger.setAttribute('aria-expanded', String(!expanded));

      stopAnimation(panel);

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
        panel.offsetHeight;
        panel.style.maxHeight = '0px';
      }
    });

    triggers.forEach(trigger => {
      trigger.addEventListener('keydown', e => {
        const index = [...triggers].indexOf(trigger);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          triggers[index + 1]?.focus();
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          triggers[index - 1]?.focus();
        }

        if (e.key === 'Home') {
          e.preventDefault();
          triggers[0].focus();
        }

        if (e.key === 'End') {
          e.preventDefault();
          triggers[triggers.length - 1].focus();
        }
      });
    });
  });
}