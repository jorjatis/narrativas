const DOT_IDS = ['dot_1', 'dot_2', 'dot_3'];
const DESKTOP_MQ = '(min-width: 699px)';
const DIAMOND_SIZE = 6;

function getRelativePoint(clientX, clientY, root) {
  const rootRect = root.getBoundingClientRect();

  return {
    x: clientX - rootRect.left,
    y: clientY - rootRect.top,
  };
}

function getDotAnchor(dotGroup) {
  const svg = dotGroup.ownerSVGElement;
  if (!svg) return null;

  const bbox = dotGroup.getBBox();
  const ctm = dotGroup.getScreenCTM();
  if (!ctm) return null;

  const left = svg.createSVGPoint();
  left.x = bbox.x;
  left.y = bbox.y + bbox.height / 2;

  const center = svg.createSVGPoint();
  center.x = bbox.x + bbox.width / 2;
  center.y = bbox.y + bbox.height / 2;

  const leftScreen = left.matrixTransform(ctm);
  const centerScreen = center.matrixTransform(ctm);

  return {
    leftX: leftScreen.x,
    y: centerScreen.y,
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
  const linesSvg = root.querySelector('.v-n-pm-lines');
  const statuesEl = root.querySelector('.v-n-pm-statues');
  const statueItems = root.querySelectorAll('.v-n-pm-statues-i');
  const desktopMq = window.matchMedia(DESKTOP_MQ);
  let resizeObserver = null;
  let lineElements = [];
  let diamondElements = [];

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
    });
  }

  function update() {
    if (!desktopMq.matches || !statuesEl) return;

    ensureLines();

    const rootRect = root.getBoundingClientRect();
    const statuesRect = statuesEl.getBoundingClientRect();
    const originX = statuesRect.left;

    linesSvg.setAttribute('viewBox', `0 0 ${rootRect.width} ${rootRect.height}`);

    DOT_IDS.forEach((dotId, index) => {
      const dot = root.querySelector(`#${dotId}`);
      const line = lineElements[index];
      const diamond = diamondElements[index];
      const item = statueItems[index];

      if (!dot || !line || !diamond || !item) return;

      const anchor = getDotAnchor(dot);
      if (!anchor) return;

      const from = getRelativePoint(originX, anchor.y, root);
      const to = getRelativePoint(anchor.leftX, anchor.y, root);

      diamond.setAttribute('points', diamondPoints(from.x, from.y, DIAMOND_SIZE));

      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);

      const itemHeight = item.offsetHeight;
      const top = anchor.y - statuesRect.top - itemHeight;
      item.style.top = `${top}px`;
    });
  }

  function bind() {
    if (!desktopMq.matches) return;

    resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(root);
    resizeObserver.observe(statuesEl);

    const mapSvg = root.querySelector('.v-n-pm-map__img');
    if (mapSvg) resizeObserver.observe(mapSvg);

    statueItems.forEach((item) => {
      resizeObserver.observe(item);
      const img = item.querySelector('img');
      if (img && !img.complete) {
        img.addEventListener('load', update, { once: true });
      }
    });

    window.addEventListener('resize', update);
    update();
  }

  function unbind() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    window.removeEventListener('resize', update);
    clearStatuePositions();

    lineElements.forEach((line) => {
      line.removeAttribute('x1');
      line.removeAttribute('y1');
      line.removeAttribute('x2');
      line.removeAttribute('y2');
    });

    diamondElements.forEach((diamond) => {
      diamond.removeAttribute('points');
    });
  }

  function onBreakpointChange() {
    if (desktopMq.matches) {
      bind();
      return;
    }

    unbind();
  }

  desktopMq.addEventListener('change', onBreakpointChange);

  if (desktopMq.matches) {
    bind();
  }

  window.addEventListener('load', update);
}

export default function perspectiveMap() {
  document.querySelectorAll('[data-perspective-map]').forEach(initPerspectiveMap);
}
