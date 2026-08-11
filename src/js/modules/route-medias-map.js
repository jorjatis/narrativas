import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../helpers/prefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const ST_ID = 'route-medias-map';
const LABEL_OFFSET_Y = 14;
const PLACE_EDGE_PAD = 8;
/** Distancia del tip del track al borde inferior del viewport */
const TIP_OFFSET_FROM_BOTTOM = 100;
/** Proporción intrínseca del JPG/SVG del mapa (para no recortar el recorrido) */
const MAP_INTRINSIC_W = 1920;
const MAP_INTRINSIC_H = 4496;

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

/** Alto mínimo del bloque = ancho del track × ratio del mapa (empuja el contenido de abajo). */
function syncMapSectionMinHeight(root) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  if (!track) return false;

  const trackWidth = track.getBoundingClientRect().width;
  if (!trackWidth) return false;

  const next = `${Math.ceil((trackWidth * MAP_INTRINSIC_H) / MAP_INTRINSIC_W)}px`;
  if (root.style.minHeight === next) return false;
  root.style.minHeight = next;
  return true;
}

function createRouteMediasMap(root) {
  const path = root.querySelector('.v-n-route-medias__map-path');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  if (!path?.getTotalLength || !svg?.createSVGPoint) return;

  ScrollTrigger.getById(ST_ID)?.kill();
  syncMapSectionMinHeight(root);

  const pathLength = path.getTotalLength();
  if (!pathLength) return;

  const dash = {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  };

  const placeLabels = () => positionMapLabels(root, path);

  if (prefersReducedMotion()) {
    gsap.set(path, { ...dash, strokeDashoffset: 0 });
    root.classList.add('is-map-ready');
    placeLabels();
    bindMapLabelResize(root, placeLabels);
    return;
  }

  gsap.set(path, dash);

  // Suaviza el tip sin desligarlo de la línea del viewport
  const setOffset = gsap.quickTo(path, 'strokeDashoffset', {
    duration: 0.45,
    ease: 'none',
    overwrite: true,
  });

  const syncTip = () => {
    const drawn = lengthAtViewportGuide(path, svg, pathLength);
    setOffset(pathLength - drawn);
  };

  ScrollTrigger.create({
    id: ST_ID,
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: syncTip,
    onRefresh: () => {
      placeLabels();
      // En refresh aplicamos al instante (sin lerp) para no quedar desfasados
      const drawn = lengthAtViewportGuide(path, svg, pathLength);
      gsap.set(path, { strokeDashoffset: pathLength - drawn });
    },
  });

  root.classList.add('is-map-ready');
  placeLabels();
  syncTip();
  bindMapLabelResize(root, placeLabels, syncTip);

  const refresh = () => {
    placeLabels();
    ScrollTrigger.refresh();
  };

  root.querySelectorAll('img, video').forEach((media) => {
    if (media.complete) return;
    media.addEventListener('load', refresh, { once: true });
  });
}

/**
 * Longitud del path cuyo punto en pantalla cae en
 * (viewport bottom - TIP_OFFSET_FROM_BOTTOM).
 */
function lengthAtViewportGuide(path, svg, pathLength) {
  const ctm = path.getScreenCTM?.();
  if (!ctm) return 0;

  const targetY = window.innerHeight - TIP_OFFSET_FROM_BOTTOM;
  const pt = svg.createSVGPoint();

  const screenYAt = (len) => {
    const p = path.getPointAtLength(len);
    pt.x = p.x;
    pt.y = p.y;
    return pt.matrixTransform(ctm).y;
  };

  const startY = screenYAt(0);
  const endY = screenYAt(pathLength);

  if (targetY <= startY) return 0;
  if (targetY >= endY) return pathLength;

  // El path desciende en Y de forma mayormente monótona → búsqueda binaria
  let lo = 0;
  let hi = pathLength;
  for (let i = 0; i < 28; i += 1) {
    const mid = (lo + hi) / 2;
    if (screenYAt(mid) < targetY) lo = mid;
    else hi = mid;
  }

  return (lo + hi) / 2;
}

function positionMapLabels(root, path) {
  positionTitleLabel(root, path);
  positionPlaceLabels(root, path);
}

function positionTitleLabel(root, path) {
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

/**
 * Sitúa los topónimos en coords del mapa y, si se cortan por la derecha
 * del track/viewport, los voltea al otro lado del ancla.
 */
function positionPlaceLabels(root, path) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  const places = root.querySelectorAll('.v-n-route-medias__map-place');
  if (!track || !svg?.createSVGPoint || !places.length) return;

  const ctm = path.getScreenCTM?.();
  if (!ctm) return;

  const trackRect = track.getBoundingClientRect();
  const limitRight = Math.min(trackRect.right, window.innerWidth) - PLACE_EDGE_PAD;
  const limitLeft = Math.max(trackRect.left, 0) + PLACE_EDGE_PAD;
  const pt = svg.createSVGPoint();

  places.forEach((el) => {
    const x = Number(el.dataset.mapX);
    const y = Number(el.dataset.mapY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    pt.x = x;
    pt.y = y;
    const screen = pt.matrixTransform(ctm);

    el.style.left = `${screen.x - trackRect.left}px`;
    el.style.top = `${screen.y - trackRect.top}px`;

    const preferLeft = el.dataset.side === 'left';
    el.classList.toggle('is-flip', preferLeft);
    el.classList.add('is-placed');

    const rect = el.getBoundingClientRect();
    if (!el.classList.contains('is-flip') && rect.right > limitRight) {
      el.classList.add('is-flip');
    } else if (el.classList.contains('is-flip') && rect.left < limitLeft) {
      el.classList.remove('is-flip');
      const again = el.getBoundingClientRect();
      // Si ambos lados cortan, quédate en el que menos desborde
      if (again.right > limitRight) {
        const overflowRight = again.right - limitRight;
        el.classList.add('is-flip');
        const flipped = el.getBoundingClientRect();
        const overflowLeft = limitLeft - flipped.left;
        if (overflowRight <= overflowLeft) el.classList.remove('is-flip');
      }
    }
  });
}

function bindMapLabelResize(root, placeLabels, syncTip) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  if (!track) return;

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const heightChanged = syncMapSectionMinHeight(root);
      placeLabels();
      syncTip?.();
      if (heightChanged) ScrollTrigger.refresh();
    });
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
