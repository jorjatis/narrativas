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
/** Muestras para localizar el punto del path más cercano a cada label */
const PATH_SAMPLE_STEPS = 240;

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

  const dots = buildMapDots(root, path, pathLength);
  const places = buildMapPlaces(root, path, pathLength);

  const placeLabels = () => {
    positionMapLabels(root, path);
    positionMapDots(root, path, dots);
  };

  const revealAlongPath = (drawn) => {
    syncPathRevealVisibility(dots, drawn, pathLength);
    syncPathRevealVisibility(places, drawn, pathLength);
  };

  if (prefersReducedMotion()) {
    gsap.set(path, { ...dash, strokeDashoffset: 0 });
    root.classList.add('is-map-ready');
    placeLabels();
    revealAlongPath(pathLength);
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
    revealAlongPath(drawn);
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
      revealAlongPath(drawn);
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
 * Sitúa los topónimos en coords del mapa y elige lado (is-flip) para que
 * no se corten por los bordes del track/viewport. Si el ancla está muy al
 * borde, empuja el label para que quepa entero.
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
    const anchorLeft = screen.x - trackRect.left;

    el.style.left = `${anchorLeft}px`;
    el.style.top = `${screen.y - trackRect.top}px`;

    const preferLeft = el.dataset.side === 'left';
    el.classList.toggle('is-flip', preferLeft);
    el.classList.add('is-placed');

    let rect = el.getBoundingClientRect();

    // Desborde derecha → texto a la izquierda del punto
    if (!el.classList.contains('is-flip') && rect.right > limitRight) {
      el.classList.add('is-flip');
      rect = el.getBoundingClientRect();
    }

    // Desborde izquierda → texto a la derecha del punto
    if (el.classList.contains('is-flip') && rect.left < limitLeft) {
      el.classList.remove('is-flip');
      rect = el.getBoundingClientRect();
      // Si ambos lados cortan, quédate en el que menos desborde
      if (rect.right > limitRight) {
        const overflowRight = rect.right - limitRight;
        el.classList.add('is-flip');
        const flipped = el.getBoundingClientRect();
        const overflowLeft = limitLeft - flipped.left;
        if (overflowRight <= overflowLeft) el.classList.remove('is-flip');
        rect = el.getBoundingClientRect();
      }
    }

    // Ancla pegada al borde: empuja para que el label quepa entero
    // (p. ej. Cáceres en mobile, cortado por la izquierda)
    if (rect.left < limitLeft) {
      el.style.left = `${anchorLeft + (limitLeft - rect.left)}px`;
    } else if (rect.right > limitRight) {
      el.style.left = `${anchorLeft - (rect.right - limitRight)}px`;
    }
  });
}

/**
 * Precomputa longitud a lo largo del path para cada punto (inicio + labels).
 * Los dots de lugar se anclan al punto del path más cercano a su (x,y),
 * así quedan encima de la línea a la misma altura que el topónimo.
 */
function buildMapDots(root, path, pathLength) {
  const nodes = [...root.querySelectorAll('.v-n-route-medias__map-dot')];
  return nodes.map((el) => {
    if (el.hasAttribute('data-path-start')) {
      return { el, length: 0 };
    }
    if (el.hasAttribute('data-path-end')) {
      return { el, length: pathLength };
    }

    return { el, length: lengthFromMapCoords(el, path, pathLength) };
  });
}

/** Topónimos con la longitud del path a la que deben hacer fade-in. */
function buildMapPlaces(root, path, pathLength) {
  const nodes = [...root.querySelectorAll('.v-n-route-medias__map-place')];
  return nodes.map((el) => ({
    el,
    length: lengthFromMapCoords(el, path, pathLength),
  }));
}

function lengthFromMapCoords(el, path, pathLength) {
  const x = Number(el.dataset.mapX);
  const y = Number(el.dataset.mapY);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return Number.POSITIVE_INFINITY;
  }
  return closestLengthOnPath(path, pathLength, x, y);
}

/** Longitud del path más cercana a un punto del viewBox (muestreo + refinamiento). */
function closestLengthOnPath(path, pathLength, x, y) {
  let bestLen = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i <= PATH_SAMPLE_STEPS; i += 1) {
    const len = (i / PATH_SAMPLE_STEPS) * pathLength;
    const p = path.getPointAtLength(len);
    const dist = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      bestLen = len;
    }
  }

  const step = pathLength / PATH_SAMPLE_STEPS;
  let lo = Math.max(0, bestLen - step);
  let hi = Math.min(pathLength, bestLen + step);

  for (let i = 0; i < 24; i += 1) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    const p1 = path.getPointAtLength(m1);
    const p2 = path.getPointAtLength(m2);
    const d1 = (p1.x - x) ** 2 + (p1.y - y) ** 2;
    const d2 = (p2.x - x) ** 2 + (p2.y - y) ** 2;
    if (d1 < d2) hi = m2;
    else lo = m1;
  }

  return (lo + hi) / 2;
}

function positionMapDots(root, path, dots) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  if (!track || !svg?.createSVGPoint || !dots.length) return;

  const ctm = path.getScreenCTM?.();
  if (!ctm) return;

  const trackRect = track.getBoundingClientRect();
  const pt = svg.createSVGPoint();

  dots.forEach(({ el, length }) => {
    if (!Number.isFinite(length)) return;

    const p = path.getPointAtLength(length);
    pt.x = p.x;
    pt.y = p.y;
    const screen = pt.matrixTransform(ctm);

    el.style.left = `${screen.x - trackRect.left}px`;
    el.style.top = `${screen.y - trackRect.top}px`;
    el.classList.add('is-placed');
  });
}

function syncPathRevealVisibility(items, drawn, pathLength) {
  // Un pequeño margen para que el tip ya haya “pintado” el punto
  const revealPad = Math.max(2, pathLength * 0.0005);

  items.forEach(({ el, length }) => {
    if (!Number.isFinite(length)) {
      el.classList.remove('is-visible');
      return;
    }
    el.classList.toggle('is-visible', drawn + revealPad >= length);
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
