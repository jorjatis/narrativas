import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../helpers/prefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const ST_ID = 'route-medias-map';

export default function initRouteMediasMap() {
  const root = document.querySelector('.v-n-route-medias');
  if (!root) return;

  // Esperar al pin del pre-header para no cachear start/end incorrectos
  const preh = document.querySelector('.v-n-preh');
  if (preh && !preh.classList.contains('is-ready')) {
    const obs = new MutationObserver(() => {
      if (!preh.classList.contains('is-ready')) return;
      obs.disconnect();
      createRouteMediasMap(root);
    });
    obs.observe(preh, { attributes: true, attributeFilter: ['class'] });
    return;
  }

  createRouteMediasMap(root);
}

function createRouteMediasMap(root) {
  const path = root.querySelector('.v-n-route-medias__map-path');
  if (!path?.getTotalLength) return;

  ScrollTrigger.getById(ST_ID)?.kill();

  const pathLength = path.getTotalLength();
  if (!pathLength) return;

  const dash = {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  };

  if (prefersReducedMotion()) {
    gsap.set(path, { ...dash, strokeDashoffset: 0 });
    root.classList.add('is-map-ready');
    return;
  }

  gsap.set(path, dash);

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      id: ST_ID,
      trigger: root,
      start: 'top 75%',
      end: 'bottom 25%',
      scrub: 0.45,
      invalidateOnRefresh: true,
    },
  });

  root.classList.add('is-map-ready');

  const refresh = () => ScrollTrigger.refresh();

  root.querySelectorAll('img, video').forEach((media) => {
    if (media.complete) return;
    media.addEventListener('load', refresh, { once: true });
  });
}
