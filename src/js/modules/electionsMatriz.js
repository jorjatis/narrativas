import gsap from 'gsap';
import { parties, getMatrixModel, getMatrixReaders, partyChosen, randomizeMatrixYou, setMatrixChosen } from './mockData';

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

function markerBlocks(result) {
  const boxes = [];
  parties.forEach((party) => {
    const score = result.scores[party.id];
    if (!score) return;
    const point = toPoint(score);
    boxes.push({ x: point.x - 3.2, y: point.y - 3.2, w: 6.4, h: 6.4 });
    boxes.push(nameBox(point, LABEL_PLACE[party.id] || 'below'));
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

  if (color) {
    color.classList.remove('is-default');
    parties.forEach((party) => color.classList.remove(party.colorClass));
    color.classList.add(result.closest.party.colorClass);
  }
  if (name) name.textContent = result.closest.party.name;
  if (chosen) chosen.textContent = result.chosen.party.name;
  if (percent) percent.textContent = `${result.closeness}%`;
}

export function initMatriz() {
  const root = document.querySelector('.v-elec-matriz');
  const plot = root?.querySelector('.v-elec-matriz__plot');
  const input = root?.querySelector('.v-elec-matriz__input');
  if (!root || !plot || !input || root.dataset.ready === 'true') return;

  const result = getMatrixModel();
  if (!result.you || !result.chosen || !result.closest) return;
  root.dataset.ready = 'true';
  paintHeader(root, result);

  let readers = getMatrixReaders();
  let anchor = pickCallout(readers, markerBlocks(result));
  const view = {
    you: toPoint(result.you),
    chosen: toPoint(result.chosen.score),
  };
  const maxForce = Math.max(...readers.map((dot) => dot.force));
  const chosenPoint = view.chosen;
  const youPoint = view.you;

  const placed = parties
    .filter((party) => result.scores[party.id])
    .map((party) => {
      const point = toPoint(result.scores[party.id]);
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
    'aria-label': `Matriz económica y social. El partido más cercano es ${result.closest.party.name}. Elegiste ${result.chosen.party.name} y la cercanía es del ${result.closeness}%.`,
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

  function rebuildReaders() {
    gsap.killTweensOf(readerDots);
    gsap.killTweensOf(callout);
    readers = getMatrixReaders((Math.random() * 0x7fffffff) >>> 0);
    const max = Math.max(...readers.map((dot) => dot.force), 1);
    readerLayer.replaceChildren();
    readerDots = readers.map((reader) => {
      const dot = paintReaderDot(reader, max);
      readerLayer.appendChild(dot);
      return dot;
    });
    anchor = pickCallout(readers, markerBlocks(getMatrixModel()));
    anchorDot = readerDots[readers.indexOf(anchor)];
    layout();
    const visible = input.checked && state.revealed;
    gsap.set(readerDots, {
      autoAlpha: (index, el) => (visible ? +el.dataset.opacity : 0),
    });
    gsap.set(callout, { autoAlpha: visible ? 1 : 0 });
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
    dot.dataset.x = point.x;
    dot.dataset.y = point.y;
    partyLayer.appendChild(dot);
    partyDots.push(dot);

    const label = svgEl('text', { class: 'v-elec-matriz__label' });
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
  youLabel.textContent = 'TÚ';
  labelLayer.appendChild(youLabel);

  svg.append(grid, readerLayer, link, partyLayer, you, labelLayer, callout);
  plot.appendChild(svg);

  const state = { revealed: false, reduce: false };

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

    svg.querySelectorAll('.v-elec-matriz__label').forEach((label) => {
      const pos = labelPoint(+label.dataset.x, +label.dataset.y, label.dataset.place, partyR, unit);
      label.setAttribute('x', pos.x);
      label.setAttribute('y', pos.y);
      label.setAttribute('text-anchor', pos.anchor);
      label.setAttribute('dominant-baseline', pos.baseline);
      label.setAttribute('font-size', labelSize);
      if (!label.classList.contains('v-elec-matriz__label--you')) return;
      const shift = youLabelShift(label.getBBox(), view.you, view.chosen);
      if (shift) label.setAttribute('x', pos.x + shift);
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
    calloutLine.setAttribute('x1', ax);
    calloutLine.setAttribute('x2', ax);
    calloutLine.setAttribute('y1', textY + 2.5 / unit);
    calloutLine.setAttribute('y2', ay - ar - 1.5 / unit);
  }

  function fadeReaders(on, intro) {
    const duration = state.reduce ? 0 : (intro ? 0.28 : 0.25);
    gsap.killTweensOf(readerDots);
    gsap.killTweensOf(callout);
    gsap.to(readerDots, {
      autoAlpha: (index, el) => (on ? +el.dataset.opacity : 0),
      duration,
      ease: 'power1.out',
      stagger: intro && on && !state.reduce ? { each: 0.004, from: 'center' } : 0,
      overwrite: true,
    });
    gsap.to(callout, {
      autoAlpha: on ? 1 : 0,
      duration,
      delay: intro && on && !state.reduce ? 0.12 : 0,
      ease: 'power1.out',
      overwrite: true,
    });
  }

  function showFinal() {
    gsap.set(partyDots, {
      autoAlpha: 1,
      attr: {
        cx: (index, el) => +el.dataset.x,
        cy: (index, el) => +el.dataset.y,
      },
    });
    gsap.set(partyLabels, { autoAlpha: 1 });
    gsap.set(you, { autoAlpha: 1, attr: { cx: view.you.x, cy: view.you.y } });
    gsap.set(youLabel, { autoAlpha: 1 });
    gsap.set(link, {
      autoAlpha: 1,
      attr: { x1: view.chosen.x, y1: view.chosen.y, x2: view.you.x, y2: view.you.y },
    });
    state.revealed = true;
    fadeReaders(input.checked, false);
  }

  layout();
  gsap.set(partyDots, { autoAlpha: 1, attr: { cx: CENTER, cy: CENTER } });
  gsap.set(partyLabels, { autoAlpha: 0 });
  gsap.set(you, { autoAlpha: 0, attr: { cx: chosenPoint.x, cy: chosenPoint.y } });
  gsap.set(youLabel, { autoAlpha: 0 });
  gsap.set(link, {
    autoAlpha: 0,
    attr: { x1: chosenPoint.x, y1: chosenPoint.y, x2: chosenPoint.x, y2: chosenPoint.y },
  });
  gsap.set(readerDots, { autoAlpha: 0 });
  gsap.set(callout, { autoAlpha: 0 });

  let intro = null;
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: reduce)', () => {
    state.reduce = true;
    showFinal();
  });
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    state.reduce = false;
    intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
    const tl = intro;

    tl.to(partyDots, {
      attr: {
        cx: (index, el) => +el.dataset.x,
        cy: (index, el) => +el.dataset.y,
      },
      duration: 0.42,
      ease: 'power3.out',
      stagger: 0.01,
    });
    tl.to(partyLabels, {
      autoAlpha: 1,
      duration: 0.18,
      stagger: { amount: 0.06 },
      ease: 'power1.out',
    });
    tl.addLabel('you');
    tl.add(() => {
      gsap.set(link, {
        autoAlpha: 1,
        attr: { x1: view.chosen.x, y1: view.chosen.y, x2: view.chosen.x, y2: view.chosen.y },
      });
    }, 'you');
    tl.to(you, { autoAlpha: 1, duration: 0.1, ease: 'power1.out' }, 'you');
    tl.to(you, {
      attr: { cx: () => view.you.x, cy: () => view.you.y },
      duration: 0.42,
      ease: 'power2.inOut',
    }, 'you');
    tl.to(link, {
      attr: { x2: () => view.you.x, y2: () => view.you.y },
      duration: 0.42,
      ease: 'power2.inOut',
    }, 'you');
    tl.to(youLabel, { autoAlpha: 1, duration: 0.15, ease: 'power1.out' });
    tl.add(() => {
      state.revealed = true;
      fadeReaders(input.checked, true);
    });
  });

  input.addEventListener('change', () => {
    if (!state.revealed) return;
    fadeReaders(input.checked, false);
  });

  const select = root.querySelector('.v-elec-matriz__mock-select');
  const randomBtn = root.querySelector('.v-elec-matriz__mock-btn');

  function describe(next) {
    svg.setAttribute('aria-label', `Matriz económica y social. El partido más cercano es ${next.closest.party.name}. Elegiste ${next.chosen.party.name} y la cercanía es del ${next.closeness}%.`);
  }

  function syncModel(next) {
    intro?.kill();
    state.revealed = true;
    view.you = toPoint(next.you);
    view.chosen = toPoint(next.chosen.score);
    youLabel.dataset.x = view.you.x;
    youLabel.dataset.y = view.you.y;
    anchor = pickCallout(readers, markerBlocks(next));
    anchorDot = readerDots[readers.indexOf(anchor)];
    paintHeader(root, next);
    describe(next);
    layout();

    gsap.killTweensOf([you, link, youLabel, ...partyDots, ...partyLabels]);
    gsap.set(partyDots, {
      autoAlpha: 1,
      attr: { cx: (index, el) => +el.dataset.x, cy: (index, el) => +el.dataset.y },
    });
    gsap.set(partyLabels, { autoAlpha: 1 });
    gsap.set(youLabel, { autoAlpha: 1 });

    const duration = state.reduce ? 0 : 0.35;
    gsap.to(you, {
      autoAlpha: 1,
      attr: { cx: view.you.x, cy: view.you.y },
      duration,
      ease: 'power2.out',
      overwrite: true,
    });
    gsap.to(link, {
      autoAlpha: 1,
      attr: { x1: view.chosen.x, y1: view.chosen.y, x2: view.you.x, y2: view.you.y },
      duration,
      ease: 'power2.out',
      overwrite: true,
    });
  }

  if (select) {
    parties.forEach((party) => {
      const option = document.createElement('option');
      option.value = party.id;
      option.textContent = party.name;
      option.selected = party.id === partyChosen;
      select.appendChild(option);
    });
    select.addEventListener('change', () => {
      setMatrixChosen(select.value);
      syncModel(getMatrixModel());
    });
  }

  randomBtn?.addEventListener('click', () => {
    randomizeMatrixYou();
    syncModel(getMatrixModel());
  });

  root.querySelector('.v-elec-matriz__mock-btn--block')?.addEventListener('click', rebuildReaders);

  new ResizeObserver(() => layout()).observe(plot);
}
