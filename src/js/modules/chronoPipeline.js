const SVG_NS = "http://www.w3.org/2000/svg";
const X_SNAP = 4;
const FADE_LENGTH = 50;
const TIP_FADE = 96;

function cssNumber(el, prop, fallback) {
  const raw = getComputedStyle(el).getPropertyValue(prop).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function relRect(el, origin) {
  const r = el.getBoundingClientRect();
  return {
    left: r.left - origin.left,
    top: r.top - origin.top,
    right: r.right - origin.left,
    bottom: r.bottom - origin.top,
    width: r.width,
    height: r.height,
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function sameX(a, b) {
  return Math.abs(a - b) < X_SNAP;
}

function pointsToPath(points) {
  if (points.length < 2) return "";

  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const point = points[i];

    if (sameX(point.x, prev.x)) d += ` V ${round(point.y)}`;
    else if (Math.abs(point.y - prev.y) < X_SNAP) d += ` H ${round(point.x)}`;
    else d += ` L ${round(point.x)} ${round(point.y)}`;
  }

  return d;
}

function pushPoint(points, x, y) {
  const last = points[points.length - 1];
  if (last && sameX(last.x, x) && Math.abs(last.y - y) < 0.5) return;
  points.push({ x, y });
}

function canJog(item) {
  if (item.dataset.pipe !== "jog") return false;

  const years = item.querySelector(".player-years");
  if (!years) return false;

  return getComputedStyle(years).flexDirection === "row";
}

function isVisibleItem(item) {
  const style = getComputedStyle(item);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return item.getBoundingClientRect().height > 1;
}

function getStartPoint(timeline, origin, fallback) {
  const marker = timeline.querySelector("[data-pipe-start]");

  if (marker && getComputedStyle(marker).display !== "none") {
    const r = relRect(marker, origin);
    return {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
    };
  }

  return { ...fallback };
}

function getLaneX(item, { origin, gutterX, strokeWidth, currentX }) {
  if (item.dataset.pipeAlign === "center") {
    const box = item.querySelector(".chrono-box");
    if (box) {
      const boxR = relRect(box, origin);
      const itemR = relRect(item, origin);
      const centered = boxR.left - itemR.left > strokeWidth;
      if (centered) return boxR.left + boxR.width / 2;
    }
  }

  if (item.dataset.pipe === "lane") return gutterX;

  return currentX;
}

function getJogExitX(item, origin, gutterX, isLastJog) {
  if (!isLastJog) return gutterX;

  const years = [...item.querySelectorAll(".player-year")];
  if (years.length >= 2) {
    const r = relRect(years[1], origin);
    return r.left + r.width / 2;
  }

  return gutterX;
}

function addJog(points, item, { origin, gutterX, strokeWidth, currentX, isLastJog }) {
  const years = item.querySelector(".player-years");
  const year = years.querySelector(".player-year") || years;
  const player = item.querySelector(".player");
  const itemR = relRect(item, origin);
  const yearsR = relRect(years, origin);
  const yearR = relRect(year, origin);
  const playerR = player ? relRect(player, origin) : yearR;

  const rightX = yearsR.right - strokeWidth / 2;
  const joinY = yearR.bottom + strokeWidth;
  const minLeg = strokeWidth * 4;
  let bottomY = Math.max(joinY + minLeg, playerR.bottom);
  if (bottomY > itemR.bottom) bottomY = itemR.bottom;
  if (bottomY <= joinY + X_SNAP) bottomY = itemR.bottom;

  const exitX = getJogExitX(item, origin, gutterX, isLastJog);

  pushPoint(points, currentX, joinY);
  pushPoint(points, rightX, joinY);
  pushPoint(points, rightX, bottomY);
  pushPoint(points, exitX, bottomY);
  pushPoint(points, exitX, itemR.bottom);

  return exitX;
}

function buildFlourishPoints(item, origin, currentX, strokeWidth, timelineWidth) {
  const r = relRect(item, origin);
  const inset = strokeWidth / 2;
  const yJog = r.top + Math.min(Math.max(r.height * 0.45, 80), 130);
  const travel = Math.min(305, Math.max(timelineWidth - currentX - inset - 8, 0));

  return [
    { x: currentX, y: yJog },
    { x: currentX + travel, y: yJog },
    { x: currentX + travel, y: r.bottom - inset },
  ];
}

function cssAngleGradient(id, deg) {
  const lg = document.createElementNS(SVG_NS, "linearGradient");
  const rad = (deg * Math.PI) / 180;
  const vx = Math.sin(rad);
  const vy = -Math.cos(rad);

  lg.setAttribute("id", id);
  lg.setAttribute("gradientUnits", "objectBoundingBox");
  lg.setAttribute("x1", String(0.5 - vx / 2));
  lg.setAttribute("y1", String(0.5 - vy / 2));
  lg.setAttribute("x2", String(0.5 + vx / 2));
  lg.setAttribute("y2", String(0.5 + vy / 2));

  const stopA = document.createElementNS(SVG_NS, "stop");
  stopA.setAttribute("offset", "10%");
  stopA.setAttribute("stop-color", "#88E0FF");

  const stopB = document.createElementNS(SVG_NS, "stop");
  stopB.setAttribute("offset", "100%");
  stopB.setAttribute("stop-color", "#4E7383");

  lg.append(stopA, stopB);
  return lg;
}

function shadowVariant(dx1, dy1, dx2, dy2) {
  if (dy1 === 1 && dx2 === 1) return { rotate: 0, grad: 280 };
  if (dx1 === 1 && dy2 === 1) return { rotate: 0, grad: 350 };
  if (dy1 === 1 && dx2 === -1) return { rotate: -90, grad: 280 };
  if (dx1 === -1 && dy2 === 1) return { rotate: 90, grad: 280 };
  if (dx1 === 1 && dy2 === -1) return { rotate: 90, grad: 280 };
  if (dx1 === -1 && dy2 === -1) return { rotate: -90, grad: 280 };
  if (dy1 === -1 && dx2 === 1) return { rotate: -90, grad: 280 };
  if (dy1 === -1 && dx2 === -1) return { rotate: 0, grad: 350 };
  return { rotate: 0, grad: 280 };
}

function cornerShadows(points) {
  const corners = [];

  for (let i = 1; i < points.length - 1; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    const dx1 = Math.sign(b.x - a.x);
    const dy1 = Math.sign(b.y - a.y);
    const dx2 = Math.sign(c.x - b.x);
    const dy2 = Math.sign(c.y - b.y);

    if (dx1 * dy2 - dy1 * dx2 === 0) continue;

    corners.push({
      i,
      x: b.x,
      y: b.y,
      ...shadowVariant(dx1, dy1, dx2, dy2),
    });
  }

  return corners;
}

function ensureSvg(timeline) {
  let svg = timeline.querySelector("svg.chrono-pipeline");

  if (!svg) {
    svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("chrono-pipeline");
    svg.setAttribute("aria-hidden", "true");
    timeline.prepend(svg);
  }

  return svg;
}

function drawTimeline(timeline) {
  const origin = timeline.getBoundingClientRect();
  const width = timeline.clientWidth;
  const height = timeline.clientHeight;

  if (width < 2 || height < 2) return;

  const strokeWidth = cssNumber(timeline, "--chrono-pipe-w", 24);
  const gutter = cssNumber(timeline, "--chrono-pipe-gutter", 18);
  const gutterX = gutter + strokeWidth / 2;
  const color = getComputedStyle(timeline).getPropertyValue("--chrono-pipe-color").trim() || "#88e0ff";

  const items = [...timeline.querySelectorAll(".v-n-chrono-timeline__item")].filter(isVisibleItem);
  if (!items.length) return;

  const firstTargetX = getLaneX(items[0], {
    origin,
    gutterX,
    strokeWidth,
    currentX: gutterX,
  });

  const start = getStartPoint(timeline, origin, {
    x: firstTargetX,
    y: 0,
  });

  const points = [{ x: start.x, y: start.y }];
  let currentX = start.x;
  let flourishStartIndex = -1;

  items.forEach((item, index) => {
    const type = item.dataset.pipe || "lane";
    const itemRect = relRect(item, origin);

    if (type === "flourish") {
      flourishStartIndex = points.length - 1;
      buildFlourishPoints(item, origin, currentX, strokeWidth, width).forEach((point) => {
        pushPoint(points, point.x, point.y);
        currentX = point.x;
      });
      return;
    }

    if (type === "jog" && canJog(item)) {
      const next = items[index + 1];
      const isLastJog = next && next.dataset.pipe === "flourish";
      currentX = addJog(points, item, {
        origin,
        gutterX,
        strokeWidth,
        currentX,
        isLastJog,
      });
      return;
    }

    const targetX = getLaneX(item, { origin, gutterX, strokeWidth, currentX });
    const bottomY = itemRect.bottom;

    if (!sameX(targetX, currentX)) {
      const joinY = itemRect.top + strokeWidth / 2;
      pushPoint(points, currentX, joinY);
      pushPoint(points, targetX, joinY);
      currentX = targetX;
    }

    pushPoint(points, currentX, bottomY);
  });

  const svg = ensureSvg(timeline);
  svg.setAttribute("viewBox", `0 0 ${round(width)} ${round(height)}`);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.replaceChildren();

  const uid = `chrono-pipeline-${Math.round(origin.top + origin.left)}`;
  const fadeId = `${uid}-fade`;
  const maskId = `${uid}-pipe-mask`;
  const last = points[points.length - 1];
  const fadeCorner = points[points.length - 2] || last;
  const fadeLen = Math.hypot(last.x - fadeCorner.x, last.y - fadeCorner.y);
  const hasFlourish = flourishStartIndex >= 0;
  const verticalEnd = Math.abs(last.y - fadeCorner.y) >= Math.abs(last.x - fadeCorner.x);
  const useFade = fadeLen >= FADE_LENGTH * 0.4 && (hasFlourish || verticalEnd);
  const pathD = pointsToPath(points);

  const fadeNx = fadeLen ? (last.x - fadeCorner.x) / fadeLen : 0;
  const fadeNy = fadeLen ? (last.y - fadeCorner.y) / fadeLen : 0;
  const tip = hasFlourish ? 0 : Math.min(TIP_FADE, fadeLen);
  const fadeDelay = hasFlourish && useFade ? strokeWidth : 0;
  const fadeStartX = hasFlourish ? fadeCorner.x + fadeNx * fadeDelay : last.x - fadeNx * tip;
  const fadeStartY = hasFlourish ? fadeCorner.y + fadeNy * fadeDelay : last.y - fadeNy * tip;

  const defs = document.createElementNS(SVG_NS, "defs");
  const gradient = document.createElementNS(SVG_NS, "linearGradient");
  gradient.setAttribute("id", fadeId);
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  gradient.setAttribute("x1", String(round(fadeStartX)));
  gradient.setAttribute("y1", String(round(fadeStartY)));
  gradient.setAttribute("x2", String(round(last.x)));
  gradient.setAttribute("y2", String(round(last.y)));

  const stopA = document.createElementNS(SVG_NS, "stop");
  stopA.setAttribute("offset", "0%");
  stopA.setAttribute("stop-color", color);

  const stopB = document.createElementNS(SVG_NS, "stop");
  stopB.setAttribute("offset", "100%");
  stopB.setAttribute("stop-color", color);
  stopB.setAttribute("stop-opacity", "0");

  gradient.append(stopA, stopB);
  defs.append(gradient);
  defs.append(cssAngleGradient(`${uid}-sh-280`, 280));
  defs.append(cssAngleGradient(`${uid}-sh-350`, 350));

  const mask = document.createElementNS(SVG_NS, "mask");
  mask.setAttribute("id", maskId);
  mask.setAttribute("maskUnits", "userSpaceOnUse");

  const maskPath = document.createElementNS(SVG_NS, "path");
  maskPath.classList.add("chrono-pipeline__mask-path");
  maskPath.setAttribute("d", pathD);
  maskPath.setAttribute("fill", "none");
  maskPath.setAttribute("stroke", "#fff");
  maskPath.setAttribute("stroke-width", String(strokeWidth));
  maskPath.setAttribute("stroke-linejoin", "miter");
  maskPath.setAttribute("stroke-miterlimit", "8");
  maskPath.setAttribute("stroke-linecap", "butt");
  mask.append(maskPath);
  defs.append(mask);

  const strokeAttrs = {
    fill: "none",
    "stroke-width": String(strokeWidth),
    "stroke-linejoin": "miter",
    "stroke-miterlimit": "8",
    "stroke-linecap": "butt",
  };

  const main = document.createElementNS(SVG_NS, "path");
  main.classList.add("chrono-pipeline__path");
  main.setAttribute("d", pathD);
  main.setAttribute("stroke", useFade ? `url(#${fadeId})` : color);
  Object.entries(strokeAttrs).forEach(([key, value]) => main.setAttribute(key, value));

  const clipId = `${uid}-draw`;
  const clip = document.createElementNS(SVG_NS, "clipPath");
  clip.setAttribute("id", clipId);
  clip.setAttribute("clipPathUnits", "userSpaceOnUse");

  const clipRect = document.createElementNS(SVG_NS, "rect");
  clipRect.classList.add("chrono-pipeline__draw-clip");
  clipRect.setAttribute("x", "-80");
  clipRect.setAttribute("y", "-80");
  clipRect.setAttribute("width", String(width + 160));
  clipRect.setAttribute("height", "0");
  clip.append(clipRect);
  defs.append(clip);

  const drawn = document.createElementNS(SVG_NS, "g");
  drawn.classList.add("chrono-pipeline__drawn");
  drawn.setAttribute("clip-path", `url(#${clipId})`);

  drawn.append(main);

  const size = strokeWidth;
  const shadows = document.createElementNS(SVG_NS, "g");
  shadows.setAttribute("mask", `url(#${maskId})`);

  cornerShadows(points).forEach((corner) => {
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("chrono-pipeline__shadow");
    group.dataset.i = String(corner.i);
    group.dataset.y = String(round(corner.y));
    group.setAttribute("opacity", "0");
    group.setAttribute(
      "transform",
      `translate(${round(corner.x)} ${round(corner.y)}) rotate(${corner.rotate}) translate(${round(-size / 2)} ${round(-size / 2)})`
    );

    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", `0,${size} ${size},0 ${size},${size}`);
    poly.setAttribute("fill", `url(#${uid}-sh-${corner.grad})`);
    group.append(poly);
    shadows.append(group);
  });

  drawn.append(shadows);
  svg.append(defs, drawn);

  timeline.dispatchEvent(
    new CustomEvent("chrono-pipeline:drawn", {
      detail: { points, strokeWidth },
    })
  );
}

function whenImagesReady(root) {
  const imgs = [...root.querySelectorAll("img")];
  return Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return img.decode?.().catch(() => {}) ||
        new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
    })
  );
}

export default function chronoPipeline() {
  const timelines = document.querySelectorAll(".v-n-chrono-timeline");
  if (!timelines.length) return;

  timelines.forEach((timeline) => {
    let frame = 0;

    const draw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => drawTimeline(timeline));
    };

    draw();
    whenImagesReady(timeline).then(draw);

    const ro = new ResizeObserver(draw);
    ro.observe(timeline);
    [...timeline.querySelectorAll(".v-n-chrono-timeline__item")].forEach((item) => {
      ro.observe(item);
    });

    window.addEventListener("resize", draw);
  });
}
