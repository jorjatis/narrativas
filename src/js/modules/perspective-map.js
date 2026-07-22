import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DOT_IDS = ['dot_1', 'dot_2', 'dot_3'];
const DIAMOND_SIZE = 6;

const MAP_START_WIDTH = 720;
const ROTATE_END = 50;
// Escala de referencia a 720px de ancho; al inicio se compensa, al final vuelve a base
const MAP_SCALE_BASE = 2.48;
const MAP_X_BASE = -26;
const MAP_Y_MIN = 12;
const MAP_Y_MAX = 22;
const SCROLL_END = '+=750vh';
// Primer 70% del pin: animación. Último 30%: hold con todo colocado
const ANIM_PORTION = 0.7;
const MAP_SCALE_REF_H = 820;
const MAP_SCALE_SHORT_H = 560;
const STAGE_PAD = 8;
const NARROW_SHIFT_REF = 960;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getRelativePoint(clientX, clientY, ref) {
  const refRect = ref.getBoundingClientRect();

  return {
    x: clientX - refRect.left,
    y: clientY - refRect.top,
  };
}

function getDotAnchor(dotGroup) {
  const rect = getUnionRect(dotGroup);
  if (!rect) return null;

  return {
    leftX: rect.left,
    centerX: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getUnionRect(el) {
  const own = el.getBoundingClientRect();
  if (own.width > 0 || own.height > 0) return own;

  const shapes = el.querySelectorAll('path, circle, rect, polygon');
  if (!shapes.length) return null;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  shapes.forEach((shape) => {
    const r = shape.getBoundingClientRect();
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  });

  if (!Number.isFinite(left)) return null;

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function diamondPoints(cx, cy, size) {
  const half = size / 2;
  return [
    `${cx},${cy - half}`,
    `${cx + half},${cy}`,
    `${cx},${cy + half}`,
    `${cx - half},${cy}`,
  ].join(' ');
}

function initPerspectiveMap(root) {
  const stage = root.querySelector('.v-n-pm__stage') || root;
  const linesSvg = root.querySelector('.v-n-pm-lines');
  const statuesEl = root.querySelector('.v-n-pm-statues');
  const statueItems = [...root.querySelectorAll('.v-n-pm-statues-i')];
  const mapEl = root.querySelector('.v-n-pm-map');
  const mapTilt = root.querySelector('.v-n-pm-map__tilt');
  const mapImg = root.querySelector('.v-n-pm-map__img');

  let resizeObserver = null;
  let lineElements = [];
  let diamondElements = [];
  let rafId = 0;
  let scrollTween = null;
  let progress = 0;

  function getMapStartWidth() {
    const stageWidth = stage.clientWidth || window.innerWidth;
    return Math.min(MAP_START_WIDTH, Math.round(stageWidth * 0.55));
  }

  // Factor para que el zoom visual sea el de 720px aunque el contenedor sea más estrecho
  function getWidthComp() {
    return MAP_START_WIDTH / Math.max(getMapStartWidth(), 1);
  }

  // En stages más bajos, un poco más de zoom para abrir dots
  function getMapFramingT() {
    const h = stage.clientHeight || MAP_SCALE_REF_H;
    return Math.min(
      1,
      Math.max(0, (MAP_SCALE_REF_H - h) / (MAP_SCALE_REF_H - MAP_SCALE_SHORT_H)),
    );
  }

  function getAnimProgress() {
    return Math.min(1, progress / ANIM_PORTION);
  }

  // Compensación de ancho al inicio (mapa estrecho); al final scale base para no desbordar
  function getWidthFactor() {
    return lerp(getWidthComp(), 1, getAnimProgress());
  }

  function getMapScale() {
    const open = lerp(0, 0.12, getMapFramingT());
    return (MAP_SCALE_BASE + open) * getWidthFactor();
  }

  function getMapX() {
    const p = getAnimProgress();
    const stageW = stage.clientWidth || MAP_START_WIDTH;
    // En viewports estrechos, desplazar a la derecha al final para que Neptuno no se corte
    const narrow = Math.max(0, Math.min(1, (NARROW_SHIFT_REF - stageW) / 360));
    return MAP_X_BASE * getWidthFactor() + narrow * 52 * p;
  }

  function getMapY() {
    return lerp(MAP_Y_MIN, MAP_Y_MAX, getMapFramingT()) * getWidthFactor();
  }

  function applyMapFraming() {
    if (!mapTilt) return;

    const p = getAnimProgress();

    gsap.set(mapTilt, {
      rotateX: lerp(0, ROTATE_END, p),
      scale: getMapScale(),
      x: getMapX(),
      y: getMapY(),
    });
  }

  function ensureLines() {
    if (lineElements.length) return;

    DOT_IDS.forEach(() => {
      const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      diamond.setAttribute('class', 'v-n-pm-lines__diamond');
      linesSvg.appendChild(diamond);
      diamondElements.push(diamond);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'v-n-pm-lines__segment');
      linesSvg.appendChild(line);
      lineElements.push(line);
    });
  }

  function clearStatuePositions() {
    statueItems.forEach((item) => {
      item.style.top = '';
      item.style.left = '';

      const title = item.querySelector('.v-n-pm-statues-i__t');
      if (title) {
        title.style.opacity = '';
      }

      const shadow = item.querySelector('.v-n-pm-statues-i__shadow');
      if (shadow) {
        shadow.style.opacity = '';
        shadow.style.transform = '';
        shadow.style.filter = '';
      }
    });
  }

  function updatePositions() {
    if (!statuesEl) return;

    ensureLines();
    applyMapFraming();

    // Animación completa en ANIM_PORTION; el resto del scroll mantiene el estado final
    const p = getAnimProgress();
    const stageRect = stage.getBoundingClientRect();
    const statuesRect = statuesEl.getBoundingClientRect();

    // Línea + rombo: fade out completo al final
    const lineOpacity = Math.max(0, 1 - p);
    // Sombra: aparece a partir del 65% (detrás de la estatua) → perspectiva final
    const shadowT = p < 0.65 ? 0 : Math.min(1, (p - 0.65) / 0.35);
    const shadowOpacity = lerp(0, 0.2, shadowT);
    const shadowRotateX = lerp(0, -50, shadowT);
    const shadowScaleY = lerp(1, 0.45, shadowT);
    const shadowScaleX = lerp(1, 1.05, shadowT);
    const shadowTranslateX = lerp(0, 40, shadowT);
    const shadowTranslateZ = lerp(-40, -10, shadowT);
    const shadowBlur = lerp(0, 8, shadowT);

    linesSvg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);

    DOT_IDS.forEach((dotId, index) => {
      const dot = root.querySelector(`#${dotId}`);
      const line = lineElements[index];
      const diamond = diamondElements[index];
      const item = statueItems[index];

      if (!dot || !line || !diamond || !item) return;

      const anchor = getDotAnchor(dot);
      if (!anchor) return;

      const title = item.querySelector('.v-n-pm-statues-i__t');
      if (title) {
        title.style.opacity = String(1 - p);
      }

      const shadow = item.querySelector('.v-n-pm-statues-i__shadow');
      if (shadow) {
        shadow.style.opacity = String(shadowOpacity);
        shadow.style.filter = `brightness(0) blur(${shadowBlur}px)`;
        shadow.style.transform = [
          `translateX(${shadowTranslateX}%)`,
          `rotateX(${shadowRotateX}deg)`,
          `scaleY(${shadowScaleY})`,
          `scaleX(${shadowScaleX})`,
          `translateZ(${shadowTranslateZ}px)`,
        ].join(' ');
      }

      // Posición inicial: left 0. Final: centrada sobre el dot, clamp al stage
      const endLeftRaw = anchor.centerX - statuesRect.left - item.offsetWidth / 2;
      const minLeft = stageRect.left + STAGE_PAD - statuesRect.left;
      const maxLeft = stageRect.right - STAGE_PAD - item.offsetWidth - statuesRect.left;
      const endLeft = Math.min(maxLeft, Math.max(minLeft, endLeftRaw));
      const currentLeft = lerp(0, endLeft, p);
      const itemHeight = item.offsetHeight;
      const top = anchor.y - statuesRect.top - itemHeight;

      item.style.left = `${currentLeft}px`;
      item.style.top = `${top}px`;

      // Línea desde el borde izquierdo de la estatua hasta el dot (se achata y desaparece)
      const fromClientX = statuesRect.left + currentLeft;
      const from = getRelativePoint(fromClientX, anchor.y, stage);
      const to = getRelativePoint(anchor.leftX, anchor.y, stage);

      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.style.opacity = String(lineOpacity);

      diamond.setAttribute('points', diamondPoints(from.x, from.y, DIAMOND_SIZE));
      diamond.style.opacity = String(lineOpacity);
    });
  }

  function update() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updatePositions);
  }

  function killScroll() {
    if (scrollTween) {
      scrollTween.scrollTrigger?.kill();
      scrollTween.kill();
      scrollTween = null;
    }

    progress = 0;

    if (mapEl) {
      gsap.set(mapEl, { clearProps: 'width,marginLeft' });
    }

    if (mapTilt) {
      gsap.set(mapTilt, { clearProps: 'transform' });
    }
  }

  function setupScroll() {
    if (!mapEl || !mapTilt) return;

    killScroll();

    gsap.set(mapEl, {
      width: getMapStartWidth(),
      marginLeft: '50%',
    });

    gsap.set(mapTilt, {
      transformOrigin: '43% 48%',
      rotateX: 0,
      scale: getMapScale(),
      x: getMapX(),
      y: getMapY(),
      force3D: true,
    });

    scrollTween = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: SCROLL_END,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress = self.progress;
          update();
        },
        onRefresh: (self) => {
          progress = self.progress;
          // Recalcular ancho inicial en resize / orientación
          if (self.progress === 0) {
            gsap.set(mapEl, { width: getMapStartWidth() });
          }
          update();
        },
      },
      defaults: { ease: 'none' },
    });

    scrollTween.fromTo(
      mapEl,
      {
        width: () => getMapStartWidth(),
        marginLeft: '50%',
      },
      {
        width: '100%',
        marginLeft: '0%',
        duration: 1,
      },
      0,
    );

    // Hold al final: todo colocado, sigue el pin un rato más
    scrollTween.to({}, { duration: (1 - ANIM_PORTION) / ANIM_PORTION });

    update();
  }

  function bind() {
    resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(root);
    resizeObserver.observe(stage);
    resizeObserver.observe(statuesEl);

    if (mapEl) resizeObserver.observe(mapEl);
    if (mapImg) resizeObserver.observe(mapImg);

    statueItems.forEach((item) => {
      resizeObserver.observe(item);
      const img = item.querySelector('img');
      if (img && !img.complete) {
        img.addEventListener('load', update, { once: true });
      }
    });

    window.addEventListener('resize', update);
    setupScroll();
  }

  function unbind() {
    cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
    resizeObserver = null;
    window.removeEventListener('resize', update);
    killScroll();
    clearStatuePositions();

    lineElements.forEach((line) => {
      line.removeAttribute('x1');
      line.removeAttribute('y1');
      line.removeAttribute('x2');
      line.removeAttribute('y2');
      line.style.opacity = '';
    });

    diamondElements.forEach((diamond) => {
      diamond.removeAttribute('points');
      diamond.style.opacity = '';
    });
  }

  bind();

  window.addEventListener('load', () => {
    update();
    ScrollTrigger.refresh();
  });
}

export default function perspectiveMap() {
  document.querySelectorAll('[data-perspective-map]').forEach(initPerspectiveMap);
}
