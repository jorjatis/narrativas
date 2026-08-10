import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../helpers/prefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const ST_ID = 'route-medias-map';
const LABEL_OFFSET_Y = 14;

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

  const placeLabel = () => positionMapLabel(root, path);

  if (prefersReducedMotion()) {
    gsap.set(path, { ...dash, strokeDashoffset: 0 });
    root.classList.add('is-map-ready');
    placeLabel();
    bindMapLabelResize(root, placeLabel);
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
      onRefresh: placeLabel,
    },
  });

  root.classList.add('is-map-ready');
  placeLabel();
  bindMapLabelResize(root, placeLabel);

  const refresh = () => {
    placeLabel();
    ScrollTrigger.refresh();
  };

  root.querySelectorAll('img, video').forEach((media) => {
    if (media.complete) return;
    media.addEventListener('load', refresh, { once: true });
  });
}

function positionMapLabel(root, path) {
  const label = root.querySelector('.v-n-route-medias__map-label');
  const track = root.querySelector('.v-n-route-medias__map-track');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  if (!label || !track || !svg?.createSVGPoint) return;

  const ctm = path.getScreenCTM?.();
  if (!ctm) return;

  const start = path.getPointAtLength(0);
  const pt = svg.createSVGPoint();
  pt.x = start.x;
  pt.y = start.y;
  const screen = pt.matrixTransform(ctm);
  const trackRect = track.getBoundingClientRect();

  label.style.left = `${screen.x - trackRect.left}px`;
  label.style.top = `${screen.y - trackRect.top - LABEL_OFFSET_Y}px`;
  label.classList.add('is-placed');
}

function bindMapLabelResize(root, placeLabel) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  if (!track) return;

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(placeLabel);
  };

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(schedule);
    ro.observe(track);
    ro.observe(root);
  }

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });

  if (document.fonts?.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }
}
