/**
 * En mobile (≤699px), al reproducir un vídeo de route-medias lo abre
 * en un overlay a ancho de pantalla (evita overflow/isolation del bloque).
 */
const MQ_MOBILE = '(max-width: 699px)';

export default function initRouteMediasVideoModal() {
  const root = document.querySelector('.v-n-route-medias');
  if (!root) return;

  const shells = [...root.querySelectorAll('.video-player')];
  if (!shells.length) return;

  const mq = window.matchMedia(MQ_MOBILE);
  let active = null;

  const close = ({ pause = true } = {}) => {
    if (!active) return;

    const { shell, placeholder, overlay, video } = active;

    if (pause && video && !video.paused) {
      try {
        video.pause();
      } catch (_) {
        /* ignore */
      }
    }

    if (placeholder?.parentNode) {
      placeholder.parentNode.insertBefore(shell, placeholder);
      placeholder.remove();
    }

    overlay?.remove();
    document.body.classList.remove('is-route-video-modal');
    active = null;

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  };

  const open = (shell, video) => {
    if (active?.shell === shell) return;
    if (active) close({ pause: true });

    const placeholder = document.createElement('div');
    placeholder.className = 'v-n-route-medias__video-ph';
    placeholder.setAttribute('aria-hidden', 'true');
    const height = shell.getBoundingClientRect().height;
    if (height) placeholder.style.height = `${Math.round(height)}px`;

    shell.parentNode.insertBefore(placeholder, shell);

    const overlay = document.createElement('div');
    overlay.className = 'v-n-route-medias-video-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Reproductor de vídeo');

    const panel = document.createElement('div');
    panel.className = 'v-n-route-medias-video-modal__panel';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'v-n-route-medias-video-modal__close';
    closeBtn.setAttribute('aria-label', 'Cerrar vídeo');
    closeBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M2.5 2.5l9 9M11.5 2.5l-9 9"/></svg>';

    panel.appendChild(shell);
    overlay.appendChild(closeBtn);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.body.classList.add('is-route-video-modal');

    // Recalcula fluid + reanuda si el move cortó la reproducción
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      if (video?.paused) {
        const playPromise = video.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      }
    });

    closeBtn.addEventListener('click', () => close({ pause: true }));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close({ pause: true });
    });

    active = { shell, placeholder, overlay, video };
    closeBtn.focus({ preventScroll: true });
  };

  shells.forEach((shell) => {
    shell.addEventListener(
      'play',
      (event) => {
        const video = event.target;
        if (!(video instanceof HTMLVideoElement)) return;
        if (!mq.matches) return;
        open(shell, video);
      },
      true,
    );
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && active) close({ pause: true });
  });

  const onMqChange = () => {
    if (!mq.matches && active) close({ pause: false });
  };

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onMqChange);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onMqChange);
  }
}
