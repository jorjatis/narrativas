const EASES = {
  'power1.out': (t) => 1 - (1 - t) ** 2,
  'power2.out': (t) => 1 - (1 - t) ** 3,
  'power2.inOut': (t) => (t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2),
  'power3.out': (t) => 1 - (1 - t) ** 4,
};

const running = new Map();

function motionTargets(targets) {
  if (!targets) return [];
  return (Array.isArray(targets) ? targets : [targets]).filter(Boolean);
}

function stopNode(node) {
  running.get(node)?.forEach((stop) => stop());
  running.delete(node);
}

function killMotion(targets) {
  motionTargets(targets).forEach(stopNode);
}

function trackMotion(node, stop) {
  let jobs = running.get(node);
  if (!jobs) {
    jobs = new Set();
    running.set(node, jobs);
  }
  jobs.add(stop);
  return () => {
    jobs.delete(stop);
    if (!jobs.size) running.delete(node);
  };
}

function opacityOf(node) {
  const value = parseFloat(node.style.opacity);
  return Number.isFinite(value) ? value : 1;
}

function opacityTo(node, value) {
  node.style.opacity = String(value);
  node.style.visibility = value <= 0.001 ? 'hidden' : 'visible';
}

function motionValue(raw, index, node) {
  return typeof raw === 'function' ? raw(index, node) : raw;
}

function staggerMs(index, count, stagger) {
  if (!stagger || count < 2) return 0;
  if (typeof stagger === 'number') return stagger * index * 1000;
  const each = stagger.each ?? (stagger.amount || 0) / (count - 1);
  const order = stagger.from === 'center' ? Math.abs(index - (count - 1) / 2) : index;
  return each * order * 1000;
}

function setMotion(targets, vars) {
  const items = motionTargets(targets);
  killMotion(items);
  items.forEach((node, index) => {
    if (vars.autoAlpha != null) opacityTo(node, motionValue(vars.autoAlpha, index, node));
    if (!vars.attr) return;
    Object.entries(vars.attr).forEach(([key, raw]) => {
      node.setAttribute(key, motionValue(raw, index, node));
    });
  });
}

function tweenMotion(targets, vars) {
  const items = motionTargets(targets);
  if (!items.length) {
    vars.onComplete?.();
    return;
  }

  const duration = (vars.duration ?? 0) * 1000;
  const delay = (vars.delay ?? 0) * 1000;
  const ease = EASES[vars.ease] || ((t) => t);
  let pending = items.length;

  const finish = () => {
    pending -= 1;
    if (!pending) vars.onComplete?.();
  };

  items.forEach((node, index) => {
    const wait = delay + staggerMs(index, items.length, vars.stagger);
    const fromOpacity = opacityOf(node);
    const toOpacity = vars.autoAlpha == null ? null : motionValue(vars.autoAlpha, index, node);
    const fromAttr = {};
    const toAttr = {};
    if (vars.attr) {
      Object.entries(vars.attr).forEach(([key, raw]) => {
        fromAttr[key] = parseFloat(node.getAttribute(key)) || 0;
        toAttr[key] = motionValue(raw, index, node);
      });
    }

    const paint = (t) => {
      if (toOpacity != null) opacityTo(node, fromOpacity + (toOpacity - fromOpacity) * t);
      Object.keys(toAttr).forEach((key) => {
        node.setAttribute(key, fromAttr[key] + (toAttr[key] - fromAttr[key]) * t);
      });
    };

    if (duration <= 0 && wait <= 0) {
      paint(1);
      finish();
      return;
    }

    let startedAt = 0;
    let frame = 0;
    let stopped = false;
    const untrack = trackMotion(node, () => {
      stopped = true;
      cancelAnimationFrame(frame);
    });

    const tick = (now) => {
      if (stopped) return;
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt - wait;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = duration <= 0 ? 1 : Math.min(1, elapsed / duration);
      paint(ease(t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      untrack();
      finish();
    };
    frame = requestAnimationFrame(tick);
  });
}

const NS = 'http://www.w3.org/2000/svg';
const CELLS = 6;
const CENTER = 50;

const LABEL_PLACE = {
  salf: 'below',
  vox: 'below',
  pp: 'below',
  cc: 'below',
  junts: 'below',
  psoe: 'below',
  pnv: 'below',
  'eh-bildu': 'left',
  erc: 'left',
  compromis: 'above',
  bng: 'right',
  adelante: 'below',
  'frente-amplio': 'right',
  podemos: 'below',
};

function svgEl(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

function toPoint(score) {
  return { x: score.economic, y: 100 - score.social };
}

function labelPoint(x, y, place, radius, unit) {
  const gap = radius + 5 / unit;
  if (place === 'above') return { x, y: y - gap, anchor: 'middle', baseline: 'auto' };
  if (place === 'left') return { x: x - gap, y, anchor: 'end', baseline: 'central' };
  if (place === 'right') return { x: x + gap, y, anchor: 'start', baseline: 'central' };
  return { x, y: y + gap, anchor: 'middle', baseline: 'hanging' };
}

function youLabelShift(box, you, chosen) {
  const dx = chosen.x - you.x;
  const dy = chosen.y - you.y;
  if (Math.abs(dy) < 0.15) return 0;

  let minX = Infinity;
  let maxX = -Infinity;
  let seen = false;
  for (let step = 0; step <= 10; step += 1) {
    const y = box.y + (box.height * step) / 10;
    const t = (y - you.y) / dy;
    if (t < 0 || t > 1) continue;
    const x = you.x + t * dx;
    seen = true;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  }
  if (!seen || maxX < box.x - 0.15 || minX > box.x + box.width + 0.15) return 0;

  const gap = 0.35;
  const toRight = (maxX + gap) - box.x;
  const toLeft = (minX - gap - box.width) - box.x;
  return Math.abs(toRight) <= Math.abs(toLeft) ? toRight : toLeft;
}

/** Desplaza en horizontal un texto del SVG para que quede entero dentro del gráfico (0..100). */
function encajarEnGrafico(el) {
  const box = el.getBBox();
  if (!box.width) return;
  const x = +el.getAttribute('x');
  if (box.x < 0) el.setAttribute('x', x - box.x);
  else if (box.x + box.width > 100) el.setAttribute('x', x - (box.x + box.width - 100));
}

function calloutBox(x, y) {
  return { x: x - 8, y: y - 12, w: 16, h: 8 };
}

function boxesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pickCallout(readers, blocks) {
  const zone = readers.filter((dot) => {
    const point = toPoint(dot);
    return point.x >= 16 && point.x <= 36 && point.y >= 8 && point.y <= 32;
  });
  const pool = zone.length ? zone : readers;

  const clear = pool.filter((dot) => {
    const point = toPoint(dot);
    const box = calloutBox(point.x, point.y);
    const coversReader = readers.some((other) => {
      if (other === dot) return false;
      const otherPoint = toPoint(other);
      return otherPoint.x > box.x && otherPoint.x < box.x + box.w
        && otherPoint.y > box.y && otherPoint.y < box.y + box.h;
    });
    return !coversReader && !blocks.some((block) => boxesOverlap(box, block));
  });
  const candidates = clear.length ? clear : pool;

  return candidates.reduce((best, dot) => {
    const point = toPoint(dot);
    const score = point.y * 4 + Math.abs(point.x - 22);
    return score < best.score ? { dot, score } : best;
  }, { dot: candidates[0], score: Infinity }).dot;
}

function nameBox(point, place) {
  const w = 12;
  const h = 4.5;
  if (place === 'left') return { x: point.x - w - 3, y: point.y - h / 2, w, h };
  if (place === 'right') return { x: point.x + 3, y: point.y - h / 2, w, h };
  if (place === 'above') return { x: point.x - w / 2, y: point.y - h - 3, w, h };
  return { x: point.x - w / 2, y: point.y + 3, w, h };
}

/** Solo llevan nombre fijo el partido elegido en el test y el más cercano; el resto, en tooltip. */
function labelShown(id, result) {
  return id === result.chosen?.id || id === result.closest?.id;
}

function paintColor(el, colorClass) {
  if (el.dataset.partyColor) el.classList.remove(el.dataset.partyColor);
  el.classList.remove('is-default');
  el.classList.add(colorClass);
  el.dataset.partyColor = colorClass;
}

function markerBlocks(result) {
  const boxes = [];
  result.parties.forEach((party) => {
    const point = toPoint(party);
    boxes.push({ x: point.x - 3.2, y: point.y - 3.2, w: 6.4, h: 6.4 });
    if (labelShown(party.id, result)) boxes.push(nameBox(point, LABEL_PLACE[party.id] || 'below'));
  });
  const you = toPoint(result.you);
  boxes.push({ x: you.x - 3.2, y: you.y - 3.2, w: 6.4, h: 6.4 });
  boxes.push(nameBox(you, 'below'));
  return boxes;
}

function paintHeader(root, result) {
  const color = root.querySelector('.v-elec-res__party-color');
  const name = root.querySelector('.v-elec-res__party-name');
  const chosen = root.querySelector('.v-elec-res__party-chosen');
  const percent = root.querySelector('.v-elec-res__party-percent');

  if (color) paintColor(color, result.closest.colorClass);
  if (name) name.textContent = result.closest.name;
  if (chosen) chosen.textContent = result.chosen.name;
  if (percent) percent.textContent = `${result.closeness}%`;
}

export function initMatriz(model) {
  const root = document.querySelector('.v-elec-matriz');
  const plot = root?.querySelector('.v-elec-matriz__plot');
  const input = root?.querySelector('.v-elec-matriz__input');
  if (!root || !plot || !input || !model?.you || !model.chosen || !model.closest || root.dataset.ready === 'true') return;

  let result = model;
  root.dataset.ready = 'true';
  root.classList.toggle('is-no-you', Boolean(model.sinUsuario)); // IP bloqueada sin resultado previo
  paintHeader(root, result);

  let readers = model.readers || [];
  let anchor = pickCallout(readers, markerBlocks(result));
  const view = {
    you: toPoint(result.you),
    chosen: toPoint(result.chosen),
  };
  const maxForce = Math.max(...readers.map((dot) => dot.force));
  const chosenPoint = view.chosen;
  const youPoint = view.you;

  const placed = result.parties
    .map((party) => {
      const point = toPoint(party);
      return {
        party,
        point,
        dist: Math.hypot(point.x - CENTER, point.y - CENTER),
      };
    })
    .sort((a, b) => a.dist - b.dist);

  const svg = svgEl('svg', {
    class: 'v-elec-matriz__svg',
    viewBox: '0 0 100 100',
    role: 'img',
    focusable: 'false',
    'aria-label': `Matriz económica y social. El partido más cercano es ${result.closest.name}. Elegiste ${result.chosen.name} y la cercanía es del ${result.closeness}%.`,
  });
  const grid = svgEl('g', { class: 'v-elec-matriz__grids' });
  const readerLayer = svgEl('g', { class: 'v-elec-matriz__readers' });
  const link = svgEl('line', {
    class: 'v-elec-matriz__link',
    x1: chosenPoint.x,
    y1: chosenPoint.y,
    x2: chosenPoint.x,
    y2: chosenPoint.y,
  });
  const partyLayer = svgEl('g', { class: 'v-elec-matriz__parties' });
  const you = svgEl('circle', {
    class: 'v-elec-matriz__you',
    cx: chosenPoint.x,
    cy: chosenPoint.y,
    r: 1.6,
  });
  const labelLayer = svgEl('g', { class: 'v-elec-matriz__labels' });
  const callout = svgEl('g', { class: 'v-elec-matriz__callout' });
  const calloutLine = svgEl('line', { class: 'v-elec-matriz__callout-line' });
  const calloutText = svgEl('text', { class: 'v-elec-matriz__callout-text' });
  calloutText.textContent = 'Otros lectores';
  callout.append(calloutLine, calloutText);

  for (let i = 0; i <= CELLS; i += 1) {
    if (i === CELLS / 2) continue;
    const at = (i / CELLS) * 100;
    grid.append(
      svgEl('line', { class: 'v-elec-matriz__grid', x1: at, y1: 0, x2: at, y2: 100 }),
      svgEl('line', { class: 'v-elec-matriz__grid', x1: 0, y1: at, x2: 100, y2: at }),
    );
  }
  grid.append(
    svgEl('line', { class: 'v-elec-matriz__grid v-elec-matriz__grid--cross', x1: 50, y1: 0, x2: 50, y2: 100 }),
    svgEl('line', { class: 'v-elec-matriz__grid v-elec-matriz__grid--cross', x1: 0, y1: 50, x2: 100, y2: 50 }),
  );

  let readerDots = readers.map((reader) => {
    const point = toPoint(reader);
    const ratio = reader.force / maxForce;
    const dot = svgEl('circle', {
      class: 'v-elec-matriz__reader',
      cx: point.x,
      cy: point.y,
      r: 0.8,
    });
    dot.dataset.x = point.x;
    dot.dataset.y = point.y;
    dot.dataset.opacity = (0.16 + ratio * 0.68).toFixed(3);
    dot.dataset.ratio = ratio.toFixed(3);
    readerLayer.appendChild(dot);
    return dot;
  });
  let anchorDot = readerDots[readers.indexOf(anchor)];

  function paintReaderDot(reader, max) {
    const point = toPoint(reader);
    const ratio = reader.force / max;
    const dot = svgEl('circle', {
      class: 'v-elec-matriz__reader',
      cx: point.x,
      cy: point.y,
      r: 0.8,
    });
    dot.dataset.x = point.x;
    dot.dataset.y = point.y;
    dot.dataset.opacity = (0.16 + ratio * 0.68).toFixed(3);
    dot.dataset.ratio = ratio.toFixed(3);
    return dot;
  }

  function setReaders(next) {
    killMotion(readerDots);
    killMotion(callout);
    readers = next;
    const max = Math.max(...readers.map((dot) => dot.force), 1);
    readerLayer.replaceChildren();
    readerDots = readers.map((reader) => {
      const dot = paintReaderDot(reader, max);
      readerLayer.appendChild(dot);
      return dot;
    });
    anchor = pickCallout(readers, markerBlocks(result));
    anchorDot = readerDots[readers.indexOf(anchor)];
    layout();
    const visible = input.checked && state.revealed;
    setMotion(readerDots, {
      autoAlpha: (index, el) => (visible ? +el.dataset.opacity : 0),
    });
    setMotion(callout, { autoAlpha: visible ? 1 : 0 });
  }

  const partyDots = [];
  const partyLabels = [];
  placed.forEach(({ party, point }) => {
    const dot = svgEl('circle', {
      class: `v-elec-matriz__party ${party.colorClass}`,
      cx: CENTER,
      cy: CENTER,
      r: 1.6,
    });
    dot.dataset.id = party.id;
    dot.dataset.x = point.x;
    dot.dataset.y = point.y;
    partyLayer.appendChild(dot);
    partyDots.push(dot);

    const label = svgEl('text', { class: 'v-elec-matriz__label' });
    label.dataset.id = party.id;
    label.dataset.x = point.x;
    label.dataset.y = point.y;
    label.dataset.place = LABEL_PLACE[party.id] || 'below';
    label.textContent = party.name;
    labelLayer.appendChild(label);
    partyLabels.push(label);
  });

  const youLabel = svgEl('text', { class: 'v-elec-matriz__label v-elec-matriz__label--you' });
  youLabel.dataset.x = youPoint.x;
  youLabel.dataset.y = youPoint.y;
  youLabel.dataset.place = 'below';
  youLabel.textContent = 'Tú';
  labelLayer.appendChild(youLabel);

  svg.append(grid, readerLayer, link, partyLayer, you, labelLayer, callout);
  plot.appendChild(svg);

  const tooltip = document.createElement('div');
  tooltip.className = 'v-elec-matriz__tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  plot.appendChild(tooltip);

  function syncLabels() {
    partyLabels.forEach((label) => {
      label.classList.toggle('is-muted', !labelShown(label.dataset.id, result));
    });
    hideTooltip();
  }

  let tipDot = null;

  function hideTooltip() {
    tipDot?.classList.remove('is-active');
    tipDot = null;
    tooltip.hidden = true;
    svg.classList.remove('is-pointing');
  }

  function showTooltip(dot) {
    if (dot === tipDot) return;
    tipDot?.classList.remove('is-active');
    tipDot = dot;
    dot.classList.add('is-active');
    svg.classList.add('is-pointing');
    const party = result.parties.find((item) => item.id === dot.dataset.id);
    tooltip.textContent = party?.name || '';
    tooltip.hidden = false;

    const width = plot.clientWidth;
    const unit = width / 100;
    const r = +dot.getAttribute('r') * unit;
    const x = +dot.dataset.x * unit;
    const y = +dot.dataset.y * unit;
    const half = tooltip.offsetWidth / 2;
    const left = Math.min(width - half, Math.max(half, x));
    const below = y - r - 8 - tooltip.offsetHeight < 0;
    tooltip.classList.toggle('is-below', below);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${below ? y + r + 8 : y - r - 8}px`;
  }

  /** Partido sin nombre fijo más próximo al puntero (en px), dentro del radio de alcance. */
  function dotAt(event, reach) {
    if (!state.revealed) return null;
    const box = svg.getBoundingClientRect();
    const unit = box.width / 100;
    const px = event.clientX - box.left;
    const py = event.clientY - box.top;
    let best = null;
    let bestDist = Infinity;
    partyDots.forEach((dot) => {
      if (labelShown(dot.dataset.id, result)) return;
      const d = Math.hypot(+dot.dataset.x * unit - px, +dot.dataset.y * unit - py);
      const limit = Math.max(reach, +dot.getAttribute('r') * unit + 2);
      if (d <= limit && d < bestDist) {
        best = dot;
        bestDist = d;
      }
    });
    return best;
  }

  svg.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const dot = dotAt(event, 4);
    if (dot) showTooltip(dot);
    else hideTooltip();
  });
  svg.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') hideTooltip();
  });
  svg.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    const dot = dotAt(event, 16);
    if (dot) showTooltip(dot);
    else hideTooltip();
  });
  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' && !svg.contains(event.target)) hideTooltip();
  });
  window.addEventListener('scroll', () => {
    if (tipDot && !tipDot.matches(':hover')) hideTooltip();
  }, { passive: true });

  const state = { revealed: false, reduce: false };
  syncLabels();

  function layout() {
    const width = plot.clientWidth;
    if (width < 40) return;

    const unit = width / 100;
    const narrow = width < 480;
    const partyR = (narrow ? 6.5 : 8) / unit;
    const readerR = (narrow ? 3.2 : 4) / unit;
    const labelSize = (narrow ? 11 : 13) / unit;

    partyDots.forEach((dot) => dot.setAttribute('r', partyR));
    you.setAttribute('r', partyR);
    readerDots.forEach((dot) => {
      const ratio = +dot.dataset.ratio;
      dot.setAttribute('r', readerR * (0.82 + ratio * 0.36));
    });
    hideTooltip();

    svg.querySelectorAll('.v-elec-matriz__label').forEach((label) => {
      const pos = labelPoint(+label.dataset.x, +label.dataset.y, label.dataset.place, partyR, unit);
      label.setAttribute('x', pos.x);
      label.setAttribute('y', pos.y);
      label.setAttribute('text-anchor', pos.anchor);
      label.setAttribute('dominant-baseline', pos.baseline);
      label.setAttribute('font-size', labelSize);
      if (label.classList.contains('v-elec-matriz__label--you')) {
        const shift = youLabelShift(label.getBBox(), view.you, view.chosen);
        if (shift) label.setAttribute('x', pos.x + shift);
      }
      encajarEnGrafico(label); // los partidos en los bordes (p. ej. x = ±2) no sacan su nombre fuera
    });

    if (!anchorDot) return;
    const ax = +anchorDot.dataset.x;
    const ay = +anchorDot.dataset.y;
    const ar = +anchorDot.getAttribute('r');
    const textY = ay - ar - 18 / unit;
    calloutText.setAttribute('text-anchor', 'middle');
    calloutText.setAttribute('x', ax);
    calloutText.setAttribute('y', textY);
    calloutText.setAttribute('font-size', (narrow ? 11 : 12) / unit);
    encajarEnGrafico(calloutText);
    calloutLine.setAttribute('x1', ax);
    calloutLine.setAttribute('x2', ax);
    calloutLine.setAttribute('y1', textY + 2.5 / unit);
    calloutLine.setAttribute('y2', ay - ar - 1.5 / unit);
  }

  function fadeReaders(on, introFade) {
    const duration = state.reduce ? 0 : (introFade ? 0.28 : 0.25);
    killMotion(readerDots);
    killMotion(callout);
    tweenMotion(readerDots, {
      autoAlpha: (index, el) => (on ? +el.dataset.opacity : 0),
      duration,
      ease: 'power1.out',
      stagger: introFade && on && !state.reduce ? { each: 0.004, from: 'center' } : 0,
    });
    tweenMotion(callout, {
      autoAlpha: on ? 1 : 0,
      duration,
      delay: introFade && on && !state.reduce ? 0.12 : 0,
      ease: 'power1.out',
    });
  }

  function showFinal() {
    setMotion(partyDots, {
      autoAlpha: 1,
      attr: {
        cx: (index, el) => +el.dataset.x,
        cy: (index, el) => +el.dataset.y,
      },
    });
    setMotion(partyLabels, { autoAlpha: 1 });
    setMotion(you, { autoAlpha: 1, attr: { cx: view.you.x, cy: view.you.y } });
    setMotion(youLabel, { autoAlpha: 1 });
    setMotion(link, {
      autoAlpha: 1,
      attr: { x1: view.chosen.x, y1: view.chosen.y, x2: view.you.x, y2: view.you.y },
    });
    state.revealed = true;
    fadeReaders(input.checked, false);
  }

  let introToken = 0;

  function playIntro() {
    const token = ++introToken;
    const dotsEnd = 0.42 + 0.01 * Math.max(0, partyDots.length - 1);
    const labelsEnd = dotsEnd + 0.24;
    const youEnd = labelsEnd + 0.42;

    tweenMotion(partyDots, {
      attr: {
        cx: (index, el) => +el.dataset.x,
        cy: (index, el) => +el.dataset.y,
      },
      duration: 0.42,
      ease: 'power3.out',
      stagger: 0.01,
    });
    tweenMotion(partyLabels, {
      autoAlpha: 1,
      duration: 0.18,
      delay: dotsEnd,
      stagger: { amount: 0.06 },
      ease: 'power1.out',
    });
    tweenMotion(link, {
      autoAlpha: 1,
      duration: 0,
      delay: labelsEnd,
      attr: { x1: view.chosen.x, y1: view.chosen.y },
    });
    tweenMotion(you, {
      autoAlpha: 1,
      duration: 0.1,
      delay: labelsEnd,
      ease: 'power1.out',
    });
    tweenMotion(you, {
      attr: { cx: () => view.you.x, cy: () => view.you.y },
      duration: 0.42,
      delay: labelsEnd,
      ease: 'power2.inOut',
    });
    tweenMotion(link, {
      attr: { x2: () => view.you.x, y2: () => view.you.y },
      duration: 0.42,
      delay: labelsEnd,
      ease: 'power2.inOut',
    });
    tweenMotion(youLabel, {
      autoAlpha: 1,
      duration: 0.15,
      delay: youEnd,
      ease: 'power1.out',
      onComplete() {
        if (token !== introToken) return;
        state.revealed = true;
        fadeReaders(input.checked, true);
      },
    });
  }

  function stopIntro() {
    introToken += 1;
    killMotion([you, link, youLabel, ...partyDots, ...partyLabels]);
  }

  layout();
  setMotion(partyDots, { autoAlpha: 1, attr: { cx: CENTER, cy: CENTER } });
  setMotion(partyLabels, { autoAlpha: 0 });
  setMotion(you, { autoAlpha: 0, attr: { cx: chosenPoint.x, cy: chosenPoint.y } });
  setMotion(youLabel, { autoAlpha: 0 });
  setMotion(link, {
    autoAlpha: 0,
    attr: { x1: chosenPoint.x, y1: chosenPoint.y, x2: chosenPoint.x, y2: chosenPoint.y },
  });
  setMotion(readerDots, { autoAlpha: 0 });
  setMotion(callout, { autoAlpha: 0 });

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotion() {
    state.reduce = reduceQuery.matches;
    if (state.reduce) {
      stopIntro();
      showFinal();
      return;
    }
    if (!state.revealed) playIntro();
  }
  applyMotion();
  reduceQuery.addEventListener('change', applyMotion);

  input.addEventListener('change', () => {
    if (!state.revealed) return;
    fadeReaders(input.checked, false);
  });

  function describe(next) {
    svg.setAttribute('aria-label', `Matriz económica y social. El partido más cercano es ${next.closest.name}. Elegiste ${next.chosen.name} y la cercanía es del ${next.closeness}%.`);
  }

  function update(next) {
    result = next;
    root.classList.toggle('is-no-you', Boolean(next.sinUsuario));
    stopIntro();
    state.revealed = true;
    view.you = toPoint(next.you);
    view.chosen = toPoint(next.chosen);
    next.parties.forEach((party) => {
      const point = toPoint(party);
      const dot = partyDots.find((el) => el.dataset.id === party.id);
      const label = partyLabels.find((el) => el.dataset.id === party.id);
      if (dot) {
        dot.dataset.x = point.x;
        dot.dataset.y = point.y;
      }
      if (label) {
        label.dataset.x = point.x;
        label.dataset.y = point.y;
      }
    });
    youLabel.dataset.x = view.you.x;
    youLabel.dataset.y = view.you.y;
    syncLabels();
    anchor = pickCallout(readers, markerBlocks(next));
    anchorDot = readerDots[readers.indexOf(anchor)];
    paintHeader(root, next);
    describe(next);
    layout();

    killMotion([you, link, youLabel, ...partyDots, ...partyLabels]);
    setMotion(partyDots, {
      autoAlpha: 1,
      attr: { cx: (index, el) => +el.dataset.x, cy: (index, el) => +el.dataset.y },
    });
    setMotion(partyLabels, { autoAlpha: 1 });
    setMotion(youLabel, { autoAlpha: 1 });
    // stopIntro() corta el onComplete que mostraba a los demás lectores: se muestran aquí
    fadeReaders(input.checked, false);

    const duration = state.reduce ? 0 : 0.35;
    tweenMotion(you, {
      autoAlpha: 1,
      attr: { cx: view.you.x, cy: view.you.y },
      duration,
      ease: 'power2.out',
    });
    tweenMotion(link, {
      autoAlpha: 1,
      attr: { x1: view.chosen.x, y1: view.chosen.y, x2: view.you.x, y2: view.you.y },
      duration,
      ease: 'power2.out',
    });
  }

  new ResizeObserver(() => layout()).observe(plot);

  return { update, setReaders };
}
