import { getParty, onUserAnswersChange, themes, themeScores } from './mockData';

const NS = 'http://www.w3.org/2000/svg';
const LEVELS = 5;
const DURATION = 450;
const NARROW_QUERY = '(max-width: 698px)';

function svgEl(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function angle(index) {
  return -Math.PI / 2 + (index * 2 * Math.PI) / themes.length;
}

function parseColor(color) {
  const parts = color.match(/[\d.]+/g)?.map(Number);
  if (!parts || parts.length < 3 || parts[3] === 0) return [32, 32, 32];
  return parts.slice(0, 3);
}

function rgb(color) {
  return `rgb(${color.map((channel) => Math.round(channel)).join(', ')})`;
}

function seriesName(id) {
  if (id === 'tu') return 'Tú';
  return getParty(id)?.name ?? id;
}

function seriesColor(select, id) {
  const swatch = select.querySelector(`.v-slc__a[data-series="${id}"] .v-slc__party-color`);
  if (!swatch) return [32, 32, 32];
  return parseColor(getComputedStyle(swatch).backgroundColor);
}

export function initRadial() {
  const root = document.querySelector('.v-elec-radial');
  if (!root) return;

  const slot = root.querySelector('.v-elec-radial__chart');
  const selects = [...root.querySelectorAll('.v-slc-c > .v-slc')];
  if (!slot || selects.length !== 2) return;

  const svg = svgEl('svg', { class: 'v-elec-radial__svg', role: 'img' });
  const fills = svgEl('g', { class: 'v-elec-radial__fills' });
  const grid = svgEl('g', { class: 'v-elec-radial__grid' });
  const labels = svgEl('g', { class: 'v-elec-radial__labels' });
  const lines = svgEl('g', { class: 'v-elec-radial__lines' });
  const dots = svgEl('g', { class: 'v-elec-radial__dots' });
  svg.append(fills, grid, labels, lines, dots);
  slot.replaceChildren(svg);

  let geom = null;
  let raf = 0;
  const jobs = [null, null];

  const layers = [0, 1].map((index) => {
    const id = selects[index].dataset.series;
    return {
      values: (themeScores[id] || []).slice(),
      color: seriesColor(selects[index], id),
      fill: svgEl('polygon', { class: 'v-elec-radial__area' }),
      line: svgEl('polygon', { class: 'v-elec-radial__line' }),
      dots: themes.map(() => svgEl('circle', { class: 'v-elec-radial__dot', r: 5 })),
    };
  });

  [1, 0].forEach((index) => {
    fills.appendChild(layers[index].fill);
    lines.appendChild(layers[index].line);
    layers[index].dots.forEach((dot) => dots.appendChild(dot));
  });

  function point(index, value) {
    const a = angle(index);
    const dist = (Math.min(LEVELS, Math.max(0, value)) / LEVELS) * geom.r;
    return [geom.cx + Math.cos(a) * dist, geom.cy + Math.sin(a) * dist];
  }

  function pointsAttr(values) {
    return values.map((value, index) => point(index, value).join(',')).join(' ');
  }

  function isNarrow() {
    return window.matchMedia(NARROW_QUERY).matches;
  }

  function labelLines(theme, narrow) {
    const text = narrow && theme === 'Territorialidad' ? 'Territorio' : theme;
    return narrow ? text.split(' ') : [text];
  }

  function labelNode(lines) {
    const node = svgEl('text', { class: 'v-elec-radial__label' });
    lines.forEach((line, lineIndex) => {
      const tspan = svgEl('tspan', { x: 0, dy: lineIndex === 0 ? 0 : '1.2em' });
      tspan.textContent = line;
      node.appendChild(tspan);
    });
    return node;
  }

  function measureBox(lines) {
    const node = labelNode(lines);
    svg.appendChild(node);
    const box = node.getBBox();
    node.remove();
    return box;
  }

  function measure(theme, narrow) {
    return measureBox(labelLines(theme, narrow));
  }

  function maxRadius(width, gap, textWidths) {
    const limit = width / 2 - 2;
    let radius = limit;

    textWidths.forEach((textWidth, index) => {
      const abs = Math.abs(Math.cos(angle(index)));
      if (abs < 0.35) return;
      radius = Math.min(radius, (limit - textWidth) / abs - gap);
    });

    return Math.max(48, radius);
  }

  function drawStatic() {
    grid.replaceChildren();
    labels.replaceChildren();

    for (let level = 1; level <= LEVELS; level += 1) {
      grid.appendChild(svgEl('polygon', {
        class: 'v-elec-radial__grid',
        points: pointsAttr(themes.map(() => level)),
      }));
    }

    themes.forEach((_, index) => {
      const [x, y] = point(index, LEVELS);
      grid.appendChild(svgEl('line', {
        class: 'v-elec-radial__grid',
        x1: geom.cx,
        y1: geom.cy,
        x2: x,
        y2: y,
      }));
    });

    for (let level = 1; level <= LEVELS; level += 1) {
      const tick = svgEl('text', {
        class: 'v-elec-radial__tick',
        x: geom.cx + 8,
        y: geom.cy - (level / LEVELS) * geom.r - 8,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      });
      tick.textContent = String(level);
      labels.appendChild(tick);
    }

    themes.forEach((theme, index) => {
      const lines = labelLines(theme, geom.narrow);
      const box = measureBox(lines);
      const a = angle(index);
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      let x = geom.cx + cos * (geom.r + geom.gap);
      let y = geom.cy + sin * (geom.r + geom.gap);
      let baseline = sin > 0.35 ? 'hanging' : sin < -0.35 ? 'auto' : 'middle';

      if (geom.narrow) {
        y -= index === 0 ? 8 : 0;
        if (cos > 0.35) x += box.width / 2;
        else if (cos < -0.35) x -= box.width / 2;
        if (lines.length > 1 && sin < -0.2) y -= geom.lineStep;
      } else {
        const extra = (box.width / 2) * Math.abs(cos) + (box.height / 2) * Math.abs(sin);
        const dist = geom.r + geom.gap + extra;
        x = geom.cx + cos * dist;
        y = geom.cy + sin * dist;
        baseline = 'middle';
      }

      const label = svgEl('text', {
        class: 'v-elec-radial__label',
        x,
        y,
        'text-anchor': 'middle',
        'dominant-baseline': baseline,
      });
      lines.forEach((line, lineIndex) => {
        const tspan = svgEl('tspan', { x, dy: lineIndex === 0 ? 0 : '1.2em' });
        tspan.textContent = line;
        label.appendChild(tspan);
      });
      labels.appendChild(label);
    });
  }

  function drawSeries() {
    if (!geom) return;

    const scale = svg.getBoundingClientRect().width / geom.width || 1;
    const dotR = 5 / scale;

    layers.forEach((layer) => {
      const color = rgb(layer.color);
      const points = pointsAttr(layer.values);
      layer.fill.setAttribute('fill', color);
      layer.fill.setAttribute('points', points);
      layer.line.setAttribute('stroke', color);
      layer.line.setAttribute('points', points);
      layer.dots.forEach((dot, index) => {
        const [x, y] = point(index, layer.values[index]);
        dot.setAttribute('fill', color);
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', dotR);
      });
    });
  }

  function describe() {
    const names = selects.map((select) => seriesName(select.dataset.series));
    svg.setAttribute('aria-label', `Comparación por temática entre ${names[0]} y ${names[1]}, en una escala de 0 a 5`);
  }

  function layout(force = false) {
    const width = slot.clientWidth;
    const narrow = isNarrow();
    if (width < 40) return;
    if (!force && geom && geom.narrow === narrow && Math.abs(geom.width - width) < 0.5) return;

    const gap = width < 560 ? 12 : 20;
    const boxes = themes.map((theme) => measure(theme, narrow));
    const radius = maxRadius(width, gap, boxes.map((box) => box.width));
    const labelHeight = Math.max(...boxes.map((box) => box.height));
    const lineStep = measureBox(['Mg', 'Mg']).height - measureBox(['Mg']).height;
    const pad = 8;
    const height = Math.ceil(2 * (radius + gap + labelHeight + pad));
    geom = {
      width,
      height,
      cx: width / 2,
      cy: height / 2,
      r: radius,
      gap,
      narrow,
      lineStep,
    };

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    drawStatic();
    drawSeries();
  }

  function tick(now) {
    let running = false;

    layers.forEach((layer, index) => {
      const job = jobs[index];
      if (!job) return;

      const t = job.duration === 0 ? 1 : Math.min(1, (now - job.started) / job.duration);
      const eased = 1 - (1 - t) ** 3;
      layer.values = job.from.map((value, i) => value + (job.to[i] - value) * eased);
      layer.color = job.fromColor.map((channel, i) => channel + (job.toColor[i] - channel) * eased);

      if (t < 1) running = true;
      else jobs[index] = null;
    });

    drawSeries();
    raf = running ? requestAnimationFrame(tick) : 0;
  }

  function animate(index, id) {
    const target = themeScores[id];
    if (!target) return;

    const layer = layers[index];
    jobs[index] = {
      from: layer.values.slice(),
      to: target.slice(),
      fromColor: layer.color.slice(),
      toColor: seriesColor(selects[index], id),
      started: performance.now(),
      duration: DURATION,
    };

    if (!raf) raf = requestAnimationFrame(tick);
  }

  selects.forEach((select, index) => {
    select.addEventListener('click', (event) => {
      const option = event.target.closest('.v-slc__a');
      if (!option || !select.contains(option) || option.classList.contains('is-disabled')) return;

      const id = option.dataset.series;
      if (!id || id === select.dataset.series || !themeScores[id]) return;

      select.dataset.series = id;
      describe();
      animate(index, id);
    }, true);
  });

  onUserAnswersChange(() => {
    selects.forEach((select, index) => {
      if (select.dataset.series === 'tu') animate(index, 'tu');
    });
  });

  describe();
  layout();
  document.fonts?.ready.then(() => layout(true));
  new ResizeObserver(() => layout()).observe(slot);
  window.matchMedia(NARROW_QUERY).addEventListener('change', () => layout(true));
}
