function fadeOnScroll(selector, threshold = 50) {
  const indicators = document.querySelectorAll(selector);
  if (!indicators.length) return;

  const update = () => {
    const visible = window.scrollY < threshold;

    indicators.forEach((el) => {
      el.classList.toggle("is-visible", visible);
      el.setAttribute("aria-hidden", String(!visible));
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function moveEls(el, target, position = "prepend") {
  const element = document.querySelector(el);
  const targetEl = document.querySelector(target);

  if (!element || !targetEl) return;

  if (position === "prepend" && targetEl.firstElementChild === element) return;
  if (position === "append" && targetEl.lastElementChild === element) return;

  const actions = {
    prepend: () => targetEl.prepend(element),
    append: () => targetEl.append(element),
    before: () => targetEl.before(element),
    after: () => targetEl.after(element),
  };

  if (!actions[position]) {
    console.warn(`Posición no válida: ${position}`);
    return;
  }

  actions[position]();
}

function removeEls(target, { all = true, delay = 0 } = {}) {
  let elements = [];

  if (typeof target === 'string') {
    elements = all
      ? document.querySelectorAll(target)
      : [document.querySelector(target)];
  } else if (target instanceof HTMLElement) {
    elements = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    elements = target;
  }

  elements.forEach(el => {
    if (!el) return;

    const remove = () => el.remove();

    if (delay > 0) {
      setTimeout(remove, delay);
    } else {
      remove();
    }
  });
}

// Animation data add

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const PIPE_OVERLAP = 22;
const BLOCK_HIDDEN = "inset(0% 0% 100% 0%)";
const BLOCK_SHOWN = "inset(0% 0% 0% 0%)";
const WORD_DURATION = 0.52;

function readPipeStart(timeline) {
  const path = timeline.querySelector(".chrono-pipeline__path");
  const d = path?.getAttribute("d") || "";
  const match = d.match(/M\s+(-?[\d.]+)\s+(-?[\d.]+)/);
  if (!match) return null;

  return {
    x: Number(match[1]),
    y: Number(match[2]),
    width: Number(path.getAttribute("stroke-width")) || 24,
  };
}

function mountLottie(host) {
  return lottie.loadAnimation({
    container: host,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/el10-intro.json",
  });
}

function fitToContent(anim, host) {
  const svg = host.querySelector("svg");
  if (!svg) return;

  const width = Number(svg.getAttribute("width")) || anim.animationData?.w;
  const height = Number(svg.getAttribute("height")) || anim.animationData?.h;
  if (!width || !height) return;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  host.style.aspectRatio = `${width} / ${height}`;
}

function placePipe(pipe, host, timeline) {
  const start = readPipeStart(timeline);
  if (!start) return false;

  const hostBox = host.getBoundingClientRect();
  if (hostBox.height < 2) return false;

  const originBox = pipe.parentElement.getBoundingClientRect();
  const timelineBox = timeline.getBoundingClientRect();
  const top = hostBox.bottom - PIPE_OVERLAP;
  const height = timelineBox.top + start.y - top;

  if (height < 1) return false;

  gsap.set(pipe, {
    width: start.width,
    height,
    left: timelineBox.left + start.x - start.width / 2 - originBox.left,
    top: top - originBox.top,
    "--pipe-shadow": `${start.width * 1.7}px`,
  });

  return true;
}

function placePipeStub(pipe, host) {
  const hostBox = host.getBoundingClientRect();
  if (hostBox.height < 2) return false;

  const originBox = pipe.parentElement.getBoundingClientRect();
  const width = window.matchMedia("(min-width: 1140px)").matches ? 42 : 24;
  const height = Math.round(Math.min(200, Math.max(110, hostBox.height * 0.42)));
  const top = hostBox.bottom - PIPE_OVERLAP;

  gsap.set(pipe, {
    width,
    height,
    left: hostBox.left + hostBox.width / 2 - width / 2 - originBox.left,
    top: top - originBox.top,
    "--pipe-shadow": `${width * 1.7}px`,
  });

  return true;
}

function endState(preh, words, pipe, anim) {
  gsap.set(preh, { autoAlpha: 1 });
  gsap.set(words, { clipPath: BLOCK_SHOWN });
  gsap.set(pipe, { clipPath: BLOCK_SHOWN });
  anim?.goToAndStop(anim.totalFrames - 1, true);
}

function buildIntro(preh, words, pipe, anim, growPipe) {
  const frame = { value: 0 };
  const lastFrame = Math.max(anim.totalFrames - 1, 0);
  const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

  tl.to(preh, { autoAlpha: 1, duration: 0.7, ease: "power1.out" })
    .to(words[0], { clipPath: BLOCK_SHOWN, duration: WORD_DURATION, ease: "power2.out" }, "-=0.2")
    .to(
      frame,
      {
        value: lastFrame,
        duration: lastFrame / (anim.frameRate || 25),
        ease: "none",
        onUpdate: () => anim.goToAndStop(frame.value, true),
      },
      ">-0.05"
    )
    .add(() => growPipe(), ">")
    .to(words[1], { clipPath: BLOCK_SHOWN, duration: WORD_DURATION, ease: "power2.out" }, ">")
    .to(words[2], { clipPath: BLOCK_SHOWN, duration: 0.6, ease: "power2.out" }, ">-0.18");

  return tl;
}

function setupHeader(preh) {
  const animHost = preh.querySelector(".v-n-preh-shirt__anim");
  const pipe = preh.querySelector(".v-n-preh__pipe");
  const words = [...preh.querySelectorAll(".v-n-preh__txt")];
  const timeline = document.querySelector(".v-n-chrono-timeline");

  if (!animHost || !pipe || words.length < 3) return;

  const anim = mountLottie(animHost);
  let ready = false;
  let grown = false;

  const place = () => {
    if (!ready) return false;
    if (timeline) return placePipe(pipe, animHost, timeline);
    return placePipeStub(pipe, animHost);
  };

  const growPipe = () => {
    if (!place()) return;
    grown = true;
    gsap.fromTo(
      pipe,
      { clipPath: BLOCK_HIDDEN },
      {
        clipPath: BLOCK_SHOWN,
        duration: gsap.utils.clamp(1.1, 2.4, pipe.offsetHeight / 760),
        ease: "power1.inOut",
      }
    );
  };

  anim.addEventListener("DOMLoaded", () => {
    fitToContent(anim, animHost);
    ready = true;

    if (prefersReducedMotion() || preh.getBoundingClientRect().bottom < 0) {
      place();
      endState(preh, words, pipe, anim);
      grown = true;
      return;
    }

    buildIntro(preh, words, pipe, anim, growPipe);
  });

  const refresh = () => {
    if (!grown) return;
    place();
  };

  timeline?.addEventListener("chrono-pipeline:drawn", refresh);
  window.addEventListener("resize", refresh);
}

function headerIntro() {
  document.querySelectorAll(".v-n-preh").forEach(setupHeader);
}

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

function chronoPipeline() {
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

gsap.registerPlugin(ScrollTrigger);

let scrollLock = 0;
let scrollAnchor = 0;

ScrollTrigger.addEventListener("refreshInit", () => {
  if (scrollLock === 0) {
    scrollAnchor = window.scrollY || document.documentElement.scrollTop || 0;
  }
  scrollLock += 1;
});

ScrollTrigger.addEventListener("refresh", () => {
  scrollLock = Math.max(0, scrollLock - 1);
  if (scrollLock > 0 || scrollAnchor < 2) return;

  const restore = () => {
    const current = window.scrollY || document.documentElement.scrollTop || 0;
    if (current + 2 >= scrollAnchor) return;
    window.scrollTo(0, scrollAnchor);
    ScrollTrigger.update();
  };

  restore();
  requestAnimationFrame(restore);
});

const DRAW_LEAD = 40;
const HORIZ_SCROLL_MIN = 100;
const HORIZ_SCROLL_MAX = 230;
const HORIZ_SCROLL_RATIO = 0.5;
const CATCHUP_RATIO = 0.65;
const LAG_SOFT = 260;
const DRAW_SMOOTH = 95;
const DESKTOP_MQ = "(min-width: 1140px)";
const drawCache = new WeakMap();

function wrapYearLabels(root) {
  root.querySelectorAll(".player-year").forEach((year) => {
    if (year.querySelector(".player-year__label")) return;

    const label = document.createElement("span");
    label.className = "player-year__label";
    const text = document.createElement("span");
    text.className = "player-year__text";

    [...year.childNodes].forEach((node) => {
      if (node.nodeType === 1 && node.classList.contains("player-year-cup")) return;
      text.appendChild(node);
    });

    label.appendChild(text);
    year.appendChild(label);
  });
}

function buildSegments(points) {
  const segments = [];
  const lengthAt = [0];
  let total = 0;
  let lag = 0;

  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const dy = b.y - a.y;
    const len = Math.hypot(b.x - a.x, dy);

    total += len;
    lengthAt[i] = total;
    if (len < 0.01) continue;

    const from = total - len;

    if (Math.abs(dy) < 1) {
      const base = gsap.utils.clamp(
        HORIZ_SCROLL_MIN,
        HORIZ_SCROLL_MAX,
        len * HORIZ_SCROLL_RATIO
      );
      const cost = base * (1 - 0.35 * Math.min(1, lag / LAG_SOFT));
      segments.push({ start: a.y + lag, cost, len, from });
      lag += cost;
      continue;
    }

    const catchLen = Math.min(len, lag / CATCHUP_RATIO);

    if (catchLen > 0.01) {
      segments.push({
        start: a.y + lag,
        cost: catchLen * (1 - CATCHUP_RATIO),
        len: catchLen,
        from,
      });
      lag -= catchLen * CATCHUP_RATIO;
    }

    const restLen = len - catchLen;
    if (restLen > 0.01) {
      segments.push({
        start: a.y + catchLen + lag,
        cost: restLen,
        len: restLen,
        from: from + catchLen,
      });
    }
  }

  return { segments, lengthAt, total };
}

function targetLength(cache, drawY) {
  const { segments } = cache;
  let length = 0;

  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    if (drawY <= seg.start) return seg.from;

    const progress = seg.cost > 0 ? (drawY - seg.start) / seg.cost : 1;
    if (progress < 1) return seg.from + seg.len * progress;

    length = seg.from + seg.len;
  }

  return length;
}

function revealClip(svg) {
  const rect = svg.querySelector(".chrono-pipeline__draw-clip");
  if (!rect) return;
  const h = svg.viewBox.baseVal.height || svg.getBoundingClientRect().height;
  rect.setAttribute("height", String(h + 160));
}

function paintDraw(cache) {
  const { path, maskPath, total, lengthAt } = cache;
  const visible = gsap.utils.clamp(0, total, cache.state.len);
  const hidden = total - visible;

  path.style.strokeDasharray = String(total);
  path.style.strokeDashoffset = String(hidden);

  if (maskPath) {
    maskPath.setAttribute("stroke-dasharray", String(total));
    maskPath.setAttribute("stroke-dashoffset", String(hidden));
  }

  const delay = Math.max(18, cache.strokeWidth * 0.6);

  cache.shadows.forEach((group) => {
    const index = Number(group.dataset.i);
    if (!Number.isFinite(index)) return;

    const ready = visible >= (lengthAt[index] || 0) + delay;
    if (ready === (group.dataset.on === "1")) return;

    group.dataset.on = ready ? "1" : "0";
    gsap.killTweensOf(group);
    gsap.to(group, {
      attr: { opacity: ready ? 0.3 : 0 },
      duration: ready ? 0.34 : 0.18,
      ease: ready ? "power1.out" : "power1.in",
    });
  });
}

function followDraw(cache) {
  cache.tick = (time, delta) => {
    const diff = cache.target - cache.state.len;

    if (Math.abs(diff) < 0.25) {
      if (cache.state.len === cache.target) return;
      cache.state.len = cache.target;
      paintDraw(cache);
      return;
    }

    cache.state.len += diff * (1 - Math.exp(-delta / DRAW_SMOOTH));
    paintDraw(cache);
  };

  gsap.ticker.add(cache.tick);
}

function updateDraw(timeline) {
  const cache = drawCache.get(timeline);
  if (!cache) return;

  const { svg, path } = cache;
  const box = svg.getBoundingClientRect();
  if (box.height < 2) return;

  if (prefersReducedMotion()) {
    path.style.strokeDasharray = "none";
    path.style.strokeDashoffset = "0";
    revealClip(svg);
    cache.shadows.forEach((group) => group.setAttribute("opacity", "0.3"));
    return;
  }

  const viewH = svg.viewBox.baseVal.height || box.height;
  const scaleY = viewH / box.height;
  const drawY = (window.innerHeight - DRAW_LEAD - box.top) * scaleY;

  revealClip(svg);
  cache.target = targetLength(cache, drawY);

  if (cache.settled) return;

  cache.settled = true;
  cache.state.len = cache.target;
  paintDraw(cache);
  followDraw(cache);
}

function setupPipeDraw(timeline) {
  const id = "chrono-draw";
  const prev = ScrollTrigger.getById(id);
  if (prev && prev.trigger === timeline) {
    updateDraw(timeline);
    prev.refresh();
    return;
  }

  prev?.kill();
  if (timeline._chronoDrawScroll) {
    window.removeEventListener("scroll", timeline._chronoDrawScroll);
  }

  updateDraw(timeline);

  const onScroll = () => updateDraw(timeline);
  timeline._chronoDrawScroll = onScroll;
  window.addEventListener("scroll", onScroll, { passive: true });

  ScrollTrigger.create({
    id,
    trigger: timeline,
    start: "top bottom",
    end: "bottom top",
    onUpdate: onScroll,
    onRefresh: onScroll,
    onEnter: onScroll,
    onEnterBack: onScroll,
  });
}

function revealChronoBoxes(timeline, isDesktop, reduceMotion) {
  const boxes = [...timeline.querySelectorAll(".chrono-box")];
  if (!boxes.length) return;

  if (reduceMotion) {
    gsap.set(boxes, { autoAlpha: 1, x: 0, y: 0 });
    return;
  }

  boxes.forEach((box) => {
    const fromRight = isDesktop && box.closest(".v-n-chrono-timeline__item--06");

    gsap.fromTo(
      box,
      {
        autoAlpha: 0,
        x: fromRight ? 48 : 0,
        y: fromRight ? 0 : 28,
      },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto",
        scrollTrigger: {
          trigger: box,
          start: "top 86%",
          once: true,
        },
      }
    );
  });
}

function burstConfetti(cup) {
  const host = cup.closest(".player-year") || cup.parentElement;
  if (!host) return;

  const hostBox = host.getBoundingClientRect();
  const cupBox = cup.getBoundingClientRect();
  const originX = cupBox.left - hostBox.left + cupBox.width / 2;
  const originY = cupBox.top - hostBox.top + 2;
  const count = gsap.utils.random(2, 3, 1);

  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement("span");
    bit.className = "player-year-cup__confetti";
    bit.setAttribute("aria-hidden", "true");
    host.appendChild(bit);

    const dir = count === 2 ? (i === 0 ? -1 : 1) : i - 1;
    const size = gsap.utils.random(2, 3.4);

    gsap.set(bit, {
      left: originX,
      top: originY,
      xPercent: -50,
      width: size,
      height: size * gsap.utils.random(1, 1.6),
      rotation: gsap.utils.random(-22, 22),
    });

    gsap
      .timeline({ onComplete: () => bit.remove() })
      .to(bit, {
        x: dir * gsap.utils.random(10, 20),
        y: gsap.utils.random(-22, -34),
        rotation: `+=${dir * gsap.utils.random(70, 140)}`,
        duration: 0.32,
        ease: "power2.out",
      })
      .to(
        bit,
        {
          y: "+=28",
          x: `+=${dir * 4}`,
          opacity: 0,
          rotation: `+=${dir * 40}`,
          duration: 0.38,
          ease: "power1.in",
        },
        "-=0.06"
      );
  }
}

function playCup(cup) {
  const svg = cup.querySelector("svg") || cup;
  const tl = gsap.timeline();

  cup.style.overflow = "hidden";

  tl.fromTo(
    svg,
    { yPercent: 110 },
    { yPercent: 0, duration: 0.3, ease: "power2.out" }
  )
    .add(() => {
      cup.style.overflow = "visible";
      burstConfetti(cup);
    }, 0.14)
    .to(
      svg,
      {
        keyframes: [
          { y: -11, rotation: -8, duration: 0.13, ease: "power2.out" },
          { y: 3, rotation: 5, duration: 0.1, ease: "power1.inOut" },
          { y: -2, rotation: -2, duration: 0.08, ease: "power1.inOut" },
          { y: 0, rotation: 0, duration: 0.18, ease: "power2.out" },
        ],
      },
      0.14
    );

  return tl;
}

function revealPlayerBox(box, isDesktop, reduceMotion) {
  const years = [...box.querySelectorAll(".player-year__text")];
  const cups = [...box.querySelectorAll(".player-year-cup")];
  const player = box.querySelector(".player");
  const yearsWrap = box.querySelector(".player-years");

  if (reduceMotion) {
    gsap.set(years, { xPercent: 0 });
    gsap.set(cups.map((cup) => cup.querySelector("svg") || cup), { yPercent: 0, y: 0, rotation: 0 });
    cups.forEach((cup) => {
      cup.style.overflow = "visible";
    });
    if (yearsWrap) gsap.set(yearsWrap, { autoAlpha: 1 });
    if (player) gsap.set(player, { autoAlpha: 1, x: 0 });
    return;
  }

  if (yearsWrap) gsap.set(yearsWrap, { autoAlpha: 0 });
  gsap.set(years, { xPercent: -105 });
  if (player) gsap.set(player, { autoAlpha: 0, x: -28 });
  cups.forEach((cup) => {
    const svg = cup.querySelector("svg") || cup;
    cup.style.overflow = "hidden";
    gsap.set(svg, { yPercent: 110 });
  });

  const stagger = isDesktop ? 0.14 : 0.07;
  const yearDuration = 0.55;

  ScrollTrigger.create({
    trigger: box,
    start: "top 82%",
    once: true,
    onEnter: () => {
      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

      if (yearsWrap) {
        tl.to(yearsWrap, { autoAlpha: 1, duration: 0.2, ease: "power1.out" });
      }

      if (years.length) {
        tl.to(years, {
          xPercent: 0,
          duration: yearDuration,
          ease: "power3.out",
          stagger,
        });
      }

      cups.forEach((cup) => {
        tl.add(playCup(cup), years.length ? ">-0.12" : 0);
      });

      if (player) {
        tl.to(
          player,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          years.length || cups.length ? ">-0.15" : 0
        );
      }
    },
  });
}

function setupTimeline(timeline) {
  wrapYearLabels(timeline);

  timeline.addEventListener("chrono-pipeline:drawn", (event) => {
    const prev = drawCache.get(timeline);
    if (prev?.tick) gsap.ticker.remove(prev.tick);

    const svg = timeline.querySelector("svg.chrono-pipeline");
    const path = svg?.querySelector(".chrono-pipeline__path");
    if (!svg || !path) return;

    const points = event.detail?.points || [];
    const { segments, lengthAt } = buildSegments(points);
    const cache = {
      svg,
      path,
      maskPath: svg.querySelector(".chrono-pipeline__mask-path"),
      shadows: [...svg.querySelectorAll(".chrono-pipeline__shadow")],
      strokeWidth: event.detail?.strokeWidth || 24,
      total: path.getTotalLength(),
      segments,
      lengthAt,
      state: { len: 0 },
      target: 0,
      tick: null,
      settled: false,
    };

    drawCache.set(timeline, cache);

    if (prefersReducedMotion()) {
      updateDraw(timeline);
      return;
    }

    setupPipeDraw(timeline);
  });

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: DESKTOP_MQ,
      isMobile: "(max-width: 1139px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { isDesktop, reduceMotion } = context.conditions;

      revealChronoBoxes(timeline, isDesktop, reduceMotion);
      timeline.querySelectorAll(".player-box").forEach((box) => {
        revealPlayerBox(box, isDesktop, reduceMotion);
      });

      if (!reduceMotion) setupPipeDraw(timeline);

      return () => {
        ScrollTrigger.getById("chrono-draw")?.kill();
        if (timeline._chronoDrawScroll) {
          window.removeEventListener("scroll", timeline._chronoDrawScroll);
          timeline._chronoDrawScroll = null;
        }
        const cache = drawCache.get(timeline);
        if (cache?.tick) {
          gsap.ticker.remove(cache.tick);
          cache.tick = null;
        }
      };
    }
  );
}

function chronoAnimations() {
  const timelines = document.querySelectorAll(".v-n-chrono-timeline");
  if (!timelines.length) return;

  timelines.forEach(setupTimeline);
}

function observeInView({
  target,
  threshold = 0,
  rootMargin = "0px",
  once = true,
  onEnter = () => {},
  onLeave = () => {}
} = {}) {
  let elements = [];

  if (typeof target === "string") {
    elements = document.querySelectorAll(target);
  } else if (target instanceof HTMLElement) {
    elements = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    elements = target;
  }

  if (!elements.length) {
    console.warn(`[observeInView] Elemento(s) no encontrado(s): ${target}`);
    return null;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          onEnter(entry);

          if (once) {
            obs.unobserve(entry.target);
          }
        } else {
          onLeave(entry);
        }
      });
    },
    {
      threshold: [threshold],
      rootMargin
    }
  );

  elements.forEach((el) => observer.observe(el));

  return observer;
}

const IMG =
  "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images";

const img = (file) => `${IMG}/${file}`;

const STAT_PAD = {
  matches: 0.15,
  minutes: 0.28,
  goals: 0.2,
  goalsPer90: 0.35,
  goalsAfter80: 0.18,
  teamGoalsOnPitch: 0.25,
};

const PLAYERS = [
  {
    id: "messi",
    name: "Lionel Messi",
    image: img("player-lionel-messi.webp"),
    mirrorImage: img("player-lionel-messi-flip.webp"),
    mirrorImage2: img("player-lionel-messi-flip-2.webp"),
    mouth: img("player-lionel-messi-mouth.webp"),
    mouth2: img("player-lionel-messi-mouth-2.webp"),
    position: "Delantero / Mediocentro ofensivo",
    titles: "Copa América (2), Finalissima y Mundial",
    pitchZones: img("campo-lionel-messi.webp"),
    stats: {
      matches: 31,
      minutes: 2932,
      goals: 20,
      goalsPer90: 0.61,
      goalsAfter80: 25,
      teamGoalsOnPitch: 56,
    },
  },
  {
    id: "riquelme",
    name: "Juan Román Riquelme",
    image: img("player-juan-roman-riquelme.webp"),
    position: "Mediapunta",
    titles: "Oro JJOO 2008",
    pitchZones: img("campo-juan-roman-riquelme.webp"),
    stats: {
      matches: 5,
      minutes: 449,
      goals: 0,
      goalsPer90: 0,
      goalsAfter80: 0,
      teamGoalsOnPitch: 10,
    },
  },
  {
    id: "rojas",
    name: "Alfredo Rojas",
    image: img("player-alfredo-rojas.webp"),
    position: "Delantero Centro",
    titles: "0",
    pitchZones: img("campo-alfredo-rojas.webp"),
    stats: {
      matches: 1,
      minutes: 90,
      goals: 0,
      goalsPer90: 0,
      goalsAfter80: 0,
      teamGoalsOnPitch: 1,
    },
  },
  {
    id: "sanfilippo",
    name: "José Sanfilippo",
    image: img("player-jose-sanfilippo.webp"),
    position: "Delantero Centro",
    titles: "0",
    pitchZones: img("campo-jose-sanfilippo.webp"),
    stats: {
      matches: 2,
      minutes: 180,
      goals: 1,
      goalsPer90: 0.5,
      goalsAfter80: 100,
      teamGoalsOnPitch: 2,
    },
  },
  {
    id: "rattin",
    name: "Antonio Rattín",
    image: img("player-antonio-rattin.webp"),
    position: "Pivote / Centrocampista",
    titles: "0",
    pitchZones: img("campo-antonio-rattin.webp"),
    stats: {
      matches: 4,
      minutes: 304,
      goals: 0,
      goalsPer90: 0,
      goalsAfter80: 0,
      teamGoalsOnPitch: 4,
    },
  },
  {
    id: "heredia",
    name: "Ramón Heredia",
    image: img("player-ramon-heredia.webp"),
    position: "Defensa y Centrocampista",
    titles: "0",
    pitchZones: img("campo-ramon-heredia.webp"),
    stats: {
      matches: 6,
      minutes: 540,
      goals: 1,
      goalsPer90: 0.17,
      goalsAfter80: 0,
      teamGoalsOnPitch: 9,
    },
  },
  {
    id: "kempes",
    name: "Mario Alberto Kempes",
    image: img("player-mario-alberto-kempes.webp"),
    position: "Delantero Centro",
    titles: "Mundial",
    pitchZones: img("campo-mario-alberto-kempes.webp"),
    stats: {
      matches: 7,
      minutes: 660,
      goals: 6,
      goalsPer90: 0.82,
      goalsAfter80: 16.67,
      teamGoalsOnPitch: 15,
    },
  },
  {
    id: "maradona",
    name: "Diego Armando Maradona",
    image: img("player-diego-armando-maradona.webp"),
    position: "Mediapunta / Delantero",
    titles: "Mundial",
    pitchZones: img("campo-diego-armando-maradona.webp"),
    stats: {
      matches: 21,
      minutes: 1936,
      goals: 8,
      goalsPer90: 0.37,
      goalsAfter80: 0,
      teamGoalsOnPitch: 31,
    },
  },
  {
    id: "ortega",
    name: "Ariel Ortega",
    image: img("player-ariel-ortega.webp"),
    position: "Mediapunta / Delantero",
    titles: "0",
    pitchZones: img("campo-ariel-ortega.webp"),
    stats: {
      matches: 8,
      minutes: 707,
      goals: 2,
      goalsPer90: 0.41,
      goalsAfter80: 0,
      teamGoalsOnPitch: 12,
    },
  },
];

const DEFAULTS = { left: "messi", right: "riquelme" };

function getPlayer(id) {
  return PLAYERS.find((player) => player.id === id);
}

function getStatValue(player, key) {
  return Number(player?.stats?.[key]) || 0;
}

const STAT_SCALE = Object.fromEntries(
  Object.keys(STAT_PAD).map((key) => {
    const max = PLAYERS.reduce((current, player) => {
      const value = getStatValue(player, key);
      return value > current ? value : current;
    }, 0);

    return [key, Math.max(max * (1 + STAT_PAD[key]), 1)];
  })
);

function formatStat(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return String(value ?? "");

  if (!Number.isInteger(number)) {
    return number.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return number.toLocaleString("es-AR");
}

function setImage(imgEl, src, alt = "") {
  if (!imgEl) return;

  imgEl.alt = alt;

  if (src) {
    imgEl.src = src;
    imgEl.width = imgEl.width || 320;
    imgEl.height = imgEl.height || 320;
    imgEl.decoding = "async";
    imgEl.hidden = false;
  } else {
    imgEl.removeAttribute("src");
    imgEl.hidden = true;
  }
}

function debounce(fn, wait = 150) {
  let timer = 0;

  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

function playersComparison() {
  const root = document.querySelector(".v-n-players-comparison");
  if (!root || PLAYERS.length < 2) return;

  const ui = {
    left: cacheSide(root, "left"),
    right: cacheSide(root, "right"),
  };

  if (!ui.left.player || !ui.right.player) return;

  const selected = {
    left: getPlayer(DEFAULTS.left) ? DEFAULTS.left : PLAYERS[0].id,
    right: getPlayer(DEFAULTS.right) ? DEFAULTS.right : PLAYERS[1].id,
  };
  let messiTalkSide = null;
  let statsDrawn = false;

  populateSelects();
  syncSelectState();
  bindSelectAria();
  renderPlayer("left");
  renderPlayer("right");
  renderStats();
  bindSelects();

  window.addEventListener(
    "resize",
    debounce(() => {
      syncPositionHeights();
      requestAnimationFrame(() => renderStats());
    })
  );

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      renderStats();
      syncPositionHeights();
    });
  }

  observeInView({
    target: root,
    threshold: 0.5,
    once: true,
    onEnter: () => renderStats(undefined, true),
  });

  function cacheSide(scope, side) {
    const select = scope.querySelector(`.v-slc[data-side="${side}"]`);

    return {
      select,
      button: select?.querySelector(".v-slc__h"),
      list: select?.querySelector(".v-slc__u"),
      label: select?.querySelector(".v-slc__t"),
      player: scope.querySelector(`.player-${side}`),
    };
  }

  function populateSelects() {
    ["left", "right"].forEach((side) => {
      const { list } = ui[side];
      if (!list) return;

      list.innerHTML = PLAYERS.map(
        (player) => `
          <li class="v-slc__l" role="option">
            <button class="v-slc__a" type="button" data-player-id="${player.id}">${player.name}</button>
          </li>
        `
      ).join("");
    });
  }

  function syncSelectExpanded(side) {
    const { select, button } = ui[side];
    if (!select || !button) return;

    const open =
      select.classList.contains("is-open") ||
      select.classList.contains("v-slc--o") ||
      select.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function bindSelectAria() {
    ["left", "right"].forEach((side) => {
      const { select, button } = ui[side];
      if (!select || !button) return;

      syncSelectExpanded(side);
      button.addEventListener("click", () => {
        requestAnimationFrame(() => syncSelectExpanded(side));
      });
      new MutationObserver(() => syncSelectExpanded(side)).observe(select, {
        attributes: true,
        attributeFilter: ["class", "aria-expanded"],
      });
    });
  }

  function syncSelectState() {
    ["left", "right"].forEach((side) => {
      const other = side === "left" ? "right" : "left";

      ui[side].list?.querySelectorAll("[data-player-id]").forEach((button) => {
        const id = button.dataset.playerId;
        const isSelected = id === selected[side];
        const isTaken = id === selected[other];
        const canMirror = id === "messi";

        button.classList.toggle("is-selected", isSelected);
        button.classList.toggle("is-taken", isTaken && !canMirror);
        button.disabled = isSelected || (isTaken && !canMirror);
        button.setAttribute("aria-selected", isSelected ? "true" : "false");
      });
    });
  }

  function bindSelects() {
    ["left", "right"].forEach((side) => {
      const { list, label } = ui[side];
      if (!list) return;

      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-player-id]");
        if (!button || button.disabled) return;

        const id = button.dataset.playerId;
        const other = side === "left" ? "right" : "left";
        const mirroringMessi = id === "messi" && id === selected[other];

        if (id === selected[side] || (id === selected[other] && !mirroringMessi)) return;

        const enteringMessiDuel = id === "messi" && selected[other] === "messi";

        selected[side] = id;
        if (label) label.textContent = getPlayer(id).name;

        if (enteringMessiDuel) {
          messiTalkSide = other;
        } else if (!(selected.left === "messi" && selected.right === "messi")) {
          messiTalkSide = null;
        }

        syncSelectState();
        renderPlayer("left");
        renderPlayer("right");
        renderStats(side, true);
      });
    });
  }

  function isMessiDuel() {
    return selected.left === "messi" && selected.right === "messi";
  }

  function renderPlayer(side) {
    const player = getPlayer(selected[side]);
    const el = ui[side].player;
    const position = el.querySelector(".player-position__value");
    const duel = isMessiDuel();
    const talking = duel && side === messiTalkSide;
    const talkImage = side === "left" ? player.mirrorImage : player.mirrorImage2;
    const talkMouth = side === "left" ? player.mouth : player.mouth2;
    let image = player.image;

    if (duel && side === "left" && player.mirrorImage) {
      image = player.mirrorImage;
    } else if (talking && talkImage) {
      image = talkImage;
    }

    setImage(el.querySelector(".player-photo"), image, player.name);
    setImage(el.querySelector(".player-pitch"), player.pitchZones, `Posición de ${player.name}`);

    const mouth = el.querySelector(".player-mouth");
    const bubble = el.querySelector(".player-bubble");
    const fillMouth =
      (duel && side === "left" && player.mouth) || (talking && talkMouth);

    if (mouth) {
      const isTalking = talking && talkMouth;
      const wasTalking = mouth.classList.contains("is-talking");

      if (fillMouth) {
        mouth.src = side === "left" ? player.mouth : talkMouth;
        mouth.hidden = false;
      } else {
        mouth.hidden = true;
      }

      if (isTalking && !wasTalking) {
        mouth.classList.remove("is-talking");
        void mouth.offsetWidth;

        if (bubble) {
          bubble.hidden = false;
          bubble.classList.remove("is-in");
          void bubble.offsetWidth;
          bubble.classList.add("is-in");
        }

        mouth.classList.add("is-talking");

        const hideBubble = (event) => {
          if (event && !String(event.animationName).startsWith("messi-talk")) return;
          if (bubble) {
            bubble.hidden = true;
            bubble.classList.remove("is-in");
          }
          mouth.classList.remove("is-talking");
        };

        if (prefersReducedMotion()) {
          window.setTimeout(hideBubble, 3000);
        } else {
          mouth.addEventListener("animationend", hideBubble, { once: true });
        }
      } else if (!isTalking) {
        mouth.classList.remove("is-talking");
        if (bubble) {
          bubble.hidden = true;
          bubble.classList.remove("is-in");
        }
      }
    } else if (bubble) {
      bubble.hidden = true;
    }

    if (position) position.textContent = player.position || "";
    root.classList.toggle("is-messi-duel", duel);
    root.classList.toggle("is-messi-duel-left", duel && messiTalkSide === "left");
    root.classList.toggle("is-messi-duel-right", duel && messiTalkSide === "right");
    syncPositionHeights();
  }

  function syncPositionHeights() {
    const values = [...root.querySelectorAll(".player-position__value")];

    values.forEach((el) => {
      el.style.minHeight = "";
    });

    const max = values.reduce((height, el) => Math.max(height, el.offsetHeight), 0);

    values.forEach((el) => {
      el.style.minHeight = max ? `${max}px` : "";
    });
  }

  function renderStats(side, animate = false) {
    const left = getPlayer(selected.left);
    const right = getPlayer(selected.right);

    const titlesRow = root.querySelector('.stat-row[data-stat="titles"]');
    if (titlesRow) {
      if (!side || side === "left") {
        const leftText = titlesRow.querySelector(".stat-row__text--left");
        if (leftText) leftText.textContent = left.titles || "";
      }
      if (!side || side === "right") {
        const rightText = titlesRow.querySelector(".stat-row__text--right");
        if (rightText) rightText.textContent = right.titles || "";
      }
    }

    root.querySelectorAll(".stat-row--bar").forEach((row) => {
      const key = row.dataset.stat;
      const max = STAT_SCALE[key] || 1;

      if (!side || side === "left") {
        setBar(row.querySelector(".stat-bar--left"), getStatValue(left, key), max, animate);
      }

      if (!side || side === "right") {
        setBar(row.querySelector(".stat-bar--right"), getStatValue(right, key), max, animate);
      }
    });
  }

  function setBar(bar, value, max, animate) {
    if (!bar) return;

    const fill = bar.querySelector(".stat-bar__fill");
    const valueEl = bar.querySelector(".stat-bar__value");
    const percent = (value / max) * 100;
    const scale = percent / 100;
    const isZero = value === 0;

    if (valueEl) valueEl.textContent = formatStat(value);
    if (!fill) return;

    bar.classList.toggle("is-zero", isZero);
    bar.style.setProperty("--bar", String(scale));

    if (!statsDrawn && !animate) {
      bar.style.setProperty("--tip", "0");
      fill.style.transform = "scaleX(0)";
      bar.classList.remove("is-on", "is-done");
      requestAnimationFrame(() => placeValue(bar, scale, isZero));
      return;
    }

    if (animate) statsDrawn = true;

    const reduced = prefersReducedMotion();
    bar.classList.add("is-on");
    bar.style.setProperty("--tip", String(scale));
    fill.style.transform = `scaleX(${scale})`;

    if (isZero || reduced) {
      bar.classList.add("is-done");
    } else if (animate && !bar.classList.contains("is-done")) {
      fill.addEventListener(
        "transitionend",
        (event) => {
          if (event.propertyName !== "transform") return;
          bar.classList.add("is-done");
        },
        { once: true }
      );
    }

    requestAnimationFrame(() => placeValue(bar, scale, isZero));
  }

  function placeValue(bar, scale, isZero) {
    const valueEl = bar.querySelector(".stat-bar__value");
    if (!valueEl || !bar.offsetWidth) return;

    const fillWidth = bar.offsetWidth * scale;
    bar.classList.toggle("is-outside", !isZero && fillWidth < valueEl.offsetWidth + 40);
  }
}

const VOTES_API =
  "https://script.google.com/macros/s/AKfycbwN8IGCHX_t6jcmbKvWvJf14eMJ364vxTe9Rg_2yDG1nwzOo04d9iGzunf7l0mck0Ntxw/exec";

function syncShares(root) {
  const items = [...root.querySelectorAll(".v-n-dnd-player__drag-item")];
  const max = Math.max(0, ...items.map((item) => Number(item.dataset.votes) || 0));

  items.forEach((item) => {
    const votes = Number(item.dataset.votes) || 0;

    item.dataset.share = String(max ? Math.round((votes / max) * 100) : 0);
  });
}

function applyPlayers(root, players) {
  if (!Array.isArray(players)) return;

  const byId = new Map(players.map((player) => [String(player.id), player]));

  root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
    const row = byId.get(item.dataset.id);

    if (!row) return;

    item.dataset.votes = String(Number(row.votes) || 0);
  });

  syncShares(root);
}

async function requestVotes(action, id) {
  const url = new URL(VOTES_API);

  url.searchParams.set("action", action);
  if (id) url.searchParams.set("id", id);

  const response = await fetch(url.toString());

  if (!response.ok) throw new Error(`Votes API ${response.status}`);

  return response.json();
}

function loadVotes(root) {
  return requestVotes("get")
    .then((data) => applyPlayers(root, data && data.players))
    .catch(() => {
      root.dataset.votesError = "1";
    });
}

function castVote(root, id) {
  if (!id) return Promise.resolve(false);

  return requestVotes("vote", id)
    .then((data) => {
      applyPlayers(root, data && data.players);
      root.dataset.votesError = "0";
      return true;
    })
    .catch(() => {
      root.dataset.votesError = "1";
      return false;
    });
}

const VIEWBOX = { w: 703, h: 669 };

const VERTICES = {
  "01": [351.415, 0.617188],
  "02": [702.243, 255.509],
  "03": [568.239, 667.932],
  "04": [134.592, 667.932],
  "05": [0.58725, 255.509],
};

function vertexOnBox(svgRect, boxRect, vertex) {
  return {
    x: svgRect.left - boxRect.left + (vertex[0] / VIEWBOX.w) * svgRect.width,
    y: svgRect.top - boxRect.top + (vertex[1] / VIEWBOX.h) * svgRect.height,
  };
}

function vertexKey(item) {
  return item.dataset.vertex || "";
}

function anchorFaces(root) {
  const box = root.querySelector(".v-n-dnd-player__c");
  const svg = root.querySelector(".v-n-dnd-player__pentagon--01 svg");

  if (!box || !svg) return;

  const boxRect = box.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();

  if (!svgRect.width || !svgRect.height) return;

  const placed = [];

  root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
    const key = vertexKey(item);
    const vertex = VERTICES[key];
    const img = item.querySelector(".v-n-dnd-player__img");

    if (!vertex || !img) return;

    const point = vertexOnBox(svgRect, boxRect, vertex);
    const imgRect = img.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const circle = imgRect.width;

    placed.push({
      item,
      left: point.x - (imgRect.left + circle / 2 - itemRect.left),
      top: point.y - (imgRect.bottom - circle / 2 - itemRect.top),
    });
  });

  placed.forEach(({ item, left, top }) => {
    item.style.left = `${left}px`;
    item.style.top = `${top}px`;
    item.style.right = "auto";
    item.style.bottom = "auto";
    item.style.transform = "none";
    item.classList.add("is-anchored");
  });
}

const LIFT = 1.07;

const itemState = new WeakMap();
const rootScroll = new WeakMap();

function stateOf(item) {
  let s = itemState.get(item);

  if (!s) {
    s = { ghost: null, token: 0 };
    itemState.set(item, s);
  }

  return s;
}

function facePoint(figure) {
  const rect = figure.getBoundingClientRect();
  const size = rect.width;

  return {
    size,
    x: rect.left + size / 2,
    y: rect.bottom - size / 2,
  };
}

function circleAt(x, y, diameter) {
  return {
    left: x - diameter / 2,
    top: y - diameter / 2,
    width: diameter,
    height: diameter,
  };
}

function ghostCircle(ghost, size) {
  const scale = Number(gsap.getProperty(ghost, "scale")) || 1;

  return circleAt(Number(gsap.getProperty(ghost, "x")), Number(gsap.getProperty(ghost, "y")), size * scale);
}

function circlesTouch(a, b) {
  const ar = Math.min(a.width, a.height) / 2;
  const br = Math.min(b.width, b.height) / 2;
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;

  return Math.hypot(ax - bx, ay - by) <= ar + br + 8;
}

function bindDrag(root) {
  const box = root.querySelector(".v-n-dnd-player__c");
  const dropZone = root.querySelector(".v-n-dnd-player__drop-zone");

  if (!box || !dropZone) {
    return {
      syncPlaced() {},
      isClearing() {
        return false;
      },
    };
  }

  const reduced = prefersReducedMotion();
  const items = [...root.querySelectorAll(".v-n-dnd-player__drag-item")];
  let session = null;
  let occupant = null;
  let blockScroll = null;
  let outroPlayed = false;
  let replaying = false;

  function setItemsTabindex(enabled) {
    items.forEach((item) => {
      item.setAttribute("tabindex", enabled ? "0" : "-1");
    });
  }

  items.forEach((item) => {
    item.querySelectorAll("img").forEach((img) => {
      img.draggable = false;
    });
    item.addEventListener("contextmenu", (event) => event.preventDefault());
    item.addEventListener("pointerdown", (event) => beginDrag(event, item, false), { passive: false });
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      voteByKeyboard(item);
    });
  });

  const again = root.querySelector(".v-n-dnd-player__again");

  if (again) again.addEventListener("click", replay);

  function lockScroll() {
    if (blockScroll) return;

    blockScroll = (event) => event.preventDefault();
    document.addEventListener("touchmove", blockScroll, { passive: false, capture: true });
  }

  function unlockScroll() {
    if (!blockScroll) return;

    document.removeEventListener("touchmove", blockScroll, { capture: true });
    blockScroll = null;
  }

  function setGhostSize(ghost, size) {
    ghost.style.width = `${size}px`;
    ghost.style.height = `${size}px`;
  }

  function stickFixed(ghost) {
    const rect = ghost.getBoundingClientRect();

    document.body.appendChild(ghost);
    gsap.set(ghost, {
      position: "fixed",
      left: 0,
      top: 0,
      xPercent: -50,
      yPercent: -50,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  function parkInBox(ghost, known) {
    const rect = known ? null : ghost.getBoundingClientRect();
    const boxRect = known ? known.boxRect : box.getBoundingClientRect();
    const x = known ? known.x - boxRect.left : rect.left + rect.width / 2 - boxRect.left;
    const y = known ? known.y - boxRect.top : rect.top + rect.height / 2 - boxRect.top;

    ghost.style.position = "absolute";
    ghost.style.left = "0px";
    ghost.style.top = "0px";
    box.appendChild(ghost);
    gsap.set(ghost, {
      position: "absolute",
      left: 0,
      top: 0,
      xPercent: -50,
      yPercent: -50,
      x,
      y,
    });
  }

  function pinGhost(ghost, figure, known) {
    const boxRect = known ? null : box.getBoundingClientRect();
    const dropRect = known ? null : dropZone.getBoundingClientRect();
    const size = known ? known.size : (figure.getBoundingClientRect().width || ghost.getBoundingClientRect().width);
    const x = known ? known.x : dropRect.left + dropRect.width / 2 - boxRect.left;
    const y = known ? known.y : dropRect.top + dropRect.height / 2 - boxRect.top;

    box.appendChild(ghost);
    setGhostSize(ghost, size);
    ghost.style.pointerEvents = "";
    ghost.classList.add("is-placed");
    ghost.classList.remove("is-dragging");
    gsap.set(ghost, {
      position: "absolute",
      left: 0,
      top: 0,
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      x,
      y,
    });
  }

  function createGhost(item, figure) {
    const ghost = document.createElement("div");
    const face = figure.cloneNode(true);

    ghost.className = "v-n-dnd-player__ghost";
    ghost.setAttribute("aria-hidden", "true");
    face.classList.remove("is-lifted");
    face.querySelectorAll("img").forEach((img) => {
      img.draggable = false;
      img.alt = "";
    });
    ghost.append(face);

    ghost.addEventListener("pointerdown", (event) => {
      if (event.button > 0) return;
      event.preventDefault();
      event.stopPropagation();
      beginDrag(event, item, true);
    }, { passive: false });
    ghost.addEventListener("contextmenu", (event) => event.preventDefault());

    stateOf(item).ghost = ghost;
    return ghost;
  }

  function sendHome(item) {
    const state = stateOf(item);
    const ghost = state.ghost;
    const figure = item.querySelector(".v-n-dnd-player__img");

    if (!ghost || !figure) return;
    if (occupant && occupant.item === item) occupant = null;

    state.token += 1;
    const token = state.token;
    const home = facePoint(figure);
    const boxRect = box.getBoundingClientRect();
    const homeX = home.x - boxRect.left;
    const homeY = home.y - boxRect.top;

    gsap.killTweensOf(ghost);
    parkInBox(ghost);
    setGhostSize(ghost, home.size);
    ghost.style.pointerEvents = "none";
    ghost.classList.remove("is-placed", "is-dragging");
    item.classList.remove("is-placed");

    gsap.to(ghost, {
      x: homeX,
      y: homeY,
      scale: 1,
      duration: reduced ? 0.01 : 0.42,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => {
        if (stateOf(item).token !== token) return;

        ghost.remove();
        stateOf(item).ghost = null;
        item.classList.remove("is-lifted", "is-placed");
        figure.classList.remove("is-lifted");
      },
    });
  }

  function voteByKeyboard(item) {
    if (session || outroPlayed) return;

    const figure = item.querySelector(".v-n-dnd-player__img");
    const origin = figure && facePoint(figure);

    if (!origin || !origin.size) return;

    if (occupant && occupant.item !== item) sendHome(occupant.item);

    const state = stateOf(item);

    state.token += 1;

    let ghost = state.ghost;

    if (!ghost) {
      ghost = createGhost(item, figure);
    } else {
      gsap.killTweensOf(ghost);
    }

    const boxRect = box.getBoundingClientRect();
    const dropRect = dropZone.getBoundingClientRect();
    const dropX = dropRect.left + dropRect.width / 2 - boxRect.left;
    const dropY = dropRect.top + dropRect.height / 2 - boxRect.top;

    figure.classList.add("is-lifted");
    item.classList.add("is-lifted", "is-placed");
    item.classList.remove("is-dragging");
    ghost.classList.remove("is-dragging");
    root.classList.add("is-selected");
    root.classList.remove("is-dragging", "is-over");

    pinGhost(ghost, figure, { size: origin.size, x: dropX, y: dropY });
    occupant = { item, ghost, pinned: true };
    playOutro();
  }

  function formatVotes(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function buildRanking() {
    const list = root.querySelector(".v-n-dnd-player__ranking-list");

    if (!list) return [];
    if (list.childElementCount) return [...list.children];

    const players = items
      .map((item) => {
        const img = item.querySelector("img");

        return {
          name: (img && img.alt) || "",
          src: (img && img.getAttribute("src")) || "",
          votes: Number(item.dataset.votes) || 0,
          share: Number(item.dataset.share) || 0,
        };
      })
      .sort((a, b) => b.share - a.share || b.votes - a.votes);

    players.forEach((player) => {
      const row = document.createElement("li");
      const face = document.createElement("figure");
      const photo = document.createElement("img");
      const body = document.createElement("div");
      const name = document.createElement("p");
      const meta = document.createElement("div");
      const votes = document.createElement("span");
      const bar = document.createElement("span");

      row.className = "v-n-dnd-player__row";
      row.style.setProperty("--bar", `${player.share}%`);
      face.className = "v-n-dnd-player__row-face";
      photo.src = player.src;
      photo.alt = "";
      body.className = "v-n-dnd-player__row-body";
      name.className = "v-n-dnd-player__row-name";
      name.textContent = player.name;
      meta.className = "v-n-dnd-player__row-meta";
      votes.className = "v-n-dnd-player__row-votes";
      votes.textContent = formatVotes(player.votes);
      bar.className = "v-n-dnd-player__row-bar";
      bar.append(document.createElement("i"));
      face.append(photo);
      meta.append(votes, bar);
      body.append(name, meta);
      row.append(face, body);
      list.append(row);
    });

    return [...list.children];
  }

  function centerDelta(from, to) {
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      scale: to.width ? from.width / to.width : 1,
    };
  }

  function restoreFlag(flag) {
    if (!flag) return;

    flag.removeAttribute("style");
    dropZone.prepend(flag);
  }

  function scrollResultIntoView() {
    const heading = root.previousElementSibling;
    const target = heading && heading.classList.contains("v-n-suh") ? heading : root;
    const header = document.querySelector("header.v-h");
    let offset = 0;

    if (header) {
      const pos = getComputedStyle(header).position;
      if (pos === "fixed" || pos === "sticky") offset = header.getBoundingClientRect().height;
    }

    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
    const from = window.scrollY;

    if (Math.abs(from - top) < 2) return;

    if (reduced) {
      window.scrollTo(0, top);
      return;
    }

    const prev = rootScroll.get(root);

    if (prev) gsap.killTweensOf(prev);

    const state = { y: from };

    rootScroll.set(root, state);

    gsap.to(state, {
      y: top,
      duration: 0.38,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => window.scrollTo(0, state.y),
    });
  }

  function playResult() {
    if (!occupant) return;

    const ghost = occupant.ghost;
    const flag = dropZone.querySelector(".v-n-dnd-player__flag");
    const num = dropZone.querySelector(".v-n-dnd-player__num");
    const fromGhost = ghost.getBoundingClientRect();
    const fromNum = num.getBoundingClientRect();
    const hero = root.querySelector(".v-n-dnd-player__hero");
    const vote = root.querySelector(".v-n-dnd-player__vote");
    const voteName = root.querySelector(".v-n-dnd-player__vote-name");
    const chosen = occupant.item.querySelector("img");

    if (!hero || !vote || !num) return;
    if (voteName) voteName.textContent = (chosen && chosen.alt) || "";

    if (flag) {
      gsap.killTweensOf(flag);
      flag.style.visibility = "hidden";
    }

    ghost.style.pointerEvents = "none";
    root.classList.add("is-finished");
    hero.append(ghost, num);
    gsap.set(ghost, { clearProps: "all" });
    gsap.set(num, { clearProps: "all" });

    const placed = ghost.getBoundingClientRect();
    const shift = (fromGhost.top + fromGhost.height / 2) - (placed.top + placed.height / 2);

    if (shift > 1) box.style.paddingTop = `${shift}px`;

    const ghostMove = centerDelta(fromGhost, ghost.getBoundingClientRect());
    const numMove = centerDelta(fromNum, num.getBoundingClientRect());
    const face = ghost.querySelector(".v-n-dnd-player__img");
    const ranking = root.querySelector(".v-n-dnd-player__ranking");
    const laurelL = root.querySelector(".v-n-dnd-player__laurel--l");
    const laurelR = root.querySelector(".v-n-dnd-player__laurel--r");
    const laurelSvg = root.querySelectorAll(".v-n-dnd-player__laurel svg");
    const rows = buildRanking();
    const rowNames = root.querySelectorAll(".v-n-dnd-player__row-name");
    const rowVotes = root.querySelectorAll(".v-n-dnd-player__row-votes");
    const rowBars = root.querySelectorAll(".v-n-dnd-player__row-bar i");
    const rowTops = rows.map((row) => row.getBoundingClientRect().top);
    const firstTop = rowTops[0] || 0;
    const time = (value) => (reduced ? 0.01 : value);

    if (rows.length) gsap.set(rows, { y: (index) => firstTop - rowTops[index] });

    gsap.set(ghost, {
      transformOrigin: "50% 50%",
      x: ghostMove.x,
      y: ghostMove.y,
      scale: ghostMove.scale,
    });
    gsap.set(num, {
      transformOrigin: "50% 50%",
      x: numMove.x,
      y: numMove.y,
      scale: numMove.scale,
    });
    if (ranking) gsap.set(ranking, { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

    tl.to(ghost, {
      x: 0,
      y: 0,
      scale: 1,
      duration: time(0.7),
      ease: "power3.inOut",
    }, 0);
    tl.to(num, {
      x: 0,
      y: 0,
      scale: 1,
      duration: time(0.75),
      ease: "power3.inOut",
    }, 0);
    tl.to(box, {
      paddingTop: 0,
      duration: time(0.9),
      ease: "power2.inOut",
    }, 0.35);

    if (face) {
      tl.to(face, {
        "--face-bg": "#88E0FF",
        "--face-scale": 1.12,
        duration: time(0.6),
        ease: "power2.out",
      }, 0.12);
    }

    tl.from(vote, { y: 28, autoAlpha: 0, duration: time(0.5), ease: "power3.out" }, 0.28);
    tl.fromTo(laurelSvg, {
      clipPath: "inset(0% 0% 100% 0%)",
    }, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: time(1.05),
      ease: "power2.inOut",
      stagger: 0.08,
    }, 0.62);
    tl.from(laurelL, { x: 16, duration: time(1.05), ease: "power2.out" }, 0.62);
    tl.from(laurelR, { x: -16, duration: time(1.05), ease: "power2.out" }, 0.62);

    if (ranking) {
      tl.to(ranking, { autoAlpha: 1, duration: time(0.35), ease: "power1.out" }, 1.45);
    }

    tl.to(rows, {
      y: 0,
      duration: time(0.7),
      ease: "power3.out",
      stagger: 0.07,
    }, 1.5);
    tl.from(rowNames, {
      x: -36,
      autoAlpha: 0,
      duration: time(0.45),
      ease: "power2.out",
      stagger: 0.07,
    }, 1.62);
    tl.from(rowVotes, {
      autoAlpha: 0,
      duration: time(0.35),
      stagger: 0.07,
    }, 1.76);
    tl.from(rowBars, {
      scaleX: 0,
      duration: time(0.55),
      ease: "power2.out",
      stagger: 0.08,
    }, 1.86);

    requestAnimationFrame(() => scrollResultIntoView());
  }

  function killKnownTweens() {
    const result = root.querySelector(".v-n-dnd-player__result");
    const bg = root.querySelector(".v-n-dnd-player__bg");
    const flag = root.querySelector(".v-n-dnd-player__flag") || document.querySelector("body > .v-n-dnd-player__flag");
    const num = root.querySelector(".v-n-dnd-player__num");
    const laurelSvg = root.querySelectorAll(".v-n-dnd-player__laurel svg");
    const rows = root.querySelectorAll(".v-n-dnd-player__row");
    const scroll = rootScroll.get(root);

    if (result) gsap.killTweensOf(result);
    if (bg) gsap.killTweensOf(bg);
    if (flag) gsap.killTweensOf(flag);
    if (num) gsap.killTweensOf(num);
    if (scroll) gsap.killTweensOf(scroll);
    gsap.killTweensOf(items);
    gsap.killTweensOf(laurelSvg);
    gsap.killTweensOf(rows);

    items.forEach((item) => {
      const figure = item.querySelector(".v-n-dnd-player__img");
      const ghost = stateOf(item).ghost;

      if (figure) gsap.killTweensOf(figure);
      if (ghost) gsap.killTweensOf(ghost);
    });

    if (occupant && occupant.ghost) gsap.killTweensOf(occupant.ghost);
  }

  function replay() {
    if (!outroPlayed || replaying) return;

    replaying = true;

    const result = root.querySelector(".v-n-dnd-player__result");

    killKnownTweens();
    if (again) again.disabled = true;

    gsap.to(result, {
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.45,
      ease: "power1.out",
      overwrite: true,
      onComplete: revealBoard,
    });
  }

  function revealBoard() {
    const result = root.querySelector(".v-n-dnd-player__result");
    const num = root.querySelector(".v-n-dnd-player__num");
    const flag = root.querySelector(".v-n-dnd-player__flag") || document.querySelector("body > .v-n-dnd-player__flag");
    const bg = root.querySelector(".v-n-dnd-player__bg");
    const list = root.querySelector(".v-n-dnd-player__ranking-list");

    if (occupant && occupant.ghost) {
      occupant.ghost.remove();
      stateOf(occupant.item).ghost = null;
    }

    occupant = null;

    items.forEach((item) => {
      const figure = item.querySelector(".v-n-dnd-player__img");
      const state = stateOf(item);

      item.classList.remove("is-lifted", "is-placed");
      item.style.zIndex = "";
      state.ghost = null;
      state.token += 1;

      if (!figure) return;

      figure.classList.remove("is-lifted");
      gsap.set(figure, { clearProps: "all" });
    });

    if (bg) gsap.set(bg, { clearProps: "all" });
    if (num) {
      dropZone.appendChild(num);
      gsap.set(num, { clearProps: "all" });
    }

    restoreFlag(flag);
    if (list) list.replaceChildren();
    box.style.paddingTop = "";
    box.style.marginTop = "";
    box.style.marginBottom = "";
    box.style.minHeight = "";
    box.style.overflowAnchor = "";

    const incoming = root.querySelectorAll(".v-n-dnd-player__lead, .v-n-dnd-player__drag-item, .v-n-dnd-player__bg, .v-n-dnd-player__drop-zone");

    gsap.set(incoming, { autoAlpha: 0 });
    root.classList.remove("is-finished", "is-selected", "is-dragging", "is-over");
    if (result) gsap.set(result, { clearProps: "all" });
    gsap.set(root.querySelectorAll(".v-n-dnd-player__vote, .v-n-dnd-player__laurel, .v-n-dnd-player__laurel svg, .v-n-dnd-player__ranking"), { clearProps: "all" });
    setItemsTabindex(true);
    requestAnimationFrame(() => {
      anchorFaces(root);
      requestAnimationFrame(() => {
        box.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "center",
        });
      });
    });

    gsap.to(incoming, {
      autoAlpha: 1,
      duration: reduced ? 0.01 : 0.5,
      ease: "power1.out",
      overwrite: true,
      onComplete: () => {
        gsap.set(incoming, { clearProps: "opacity,visibility" });
        root.classList.remove("is-clearing");
        outroPlayed = false;
        replaying = false;
        if (again) again.disabled = false;
      },
    });
  }

  function playOutro() {
    if (outroPlayed) return;

    outroPlayed = true;
    setItemsTabindex(false);
    root.classList.add("is-clearing");

    if (occupant && occupant.item) {
      const voted = occupant.item;
      const id = voted.dataset.id;
      const previous = Number(voted.dataset.votes) || 0;

      voted.dataset.votes = String(previous + 1);
      syncShares(root);
      castVote(root, id).then((ok) => {
        if (!ok) {
          voted.dataset.votes = String(previous);
          syncShares(root);
        }
      });
    }

    const names = root.querySelectorAll(".v-n-dnd-player__name, .v-n-dnd-player__lead");
    const bg = root.querySelector(".v-n-dnd-player__bg");
    const circles = items
      .map((item) => item.querySelector(".v-n-dnd-player__img"))
      .filter(Boolean);

    if (occupant) occupant.ghost.style.pointerEvents = "none";

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: playResult,
    });

    tl.to(names, {
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.35,
      ease: "power1.out",
    }, 0);

    tl.to(circles, {
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.35,
      ease: "power1.out",
    }, 0);

    tl.to(bg, {
      scale: 0,
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.9,
      ease: "power2.in",
      transformOrigin: "50% 50%",
    }, 0.08);
  }

  function beginDrag(event, item, fromGhost) {
    if (session || outroPlayed || event.button > 0) return;

    const figure = item.querySelector(".v-n-dnd-player__img");
    const origin = figure && facePoint(figure);

    if (!origin || !origin.size) return;

    const boxRect = box.getBoundingClientRect();
    const zoneRect = dropZone.getBoundingClientRect();

    event.preventDefault();

    if (occupant && occupant.item !== item) sendHome(occupant.item);

    root.classList.remove("is-selected");

    const state = stateOf(item);

    state.token += 1;
    const token = state.token;
    let ghost = state.ghost;

    if (!ghost) {
      ghost = createGhost(item, figure);
      setGhostSize(ghost, origin.size);
      document.body.appendChild(ghost);
      gsap.set(ghost, {
        position: "fixed",
        left: 0,
        top: 0,
        xPercent: -50,
        yPercent: -50,
        x: origin.x,
        y: origin.y,
        scale: 1,
      });
    } else {
      gsap.killTweensOf(ghost);
      stickFixed(ghost);
      setGhostSize(ghost, origin.size);
    }

    figure.classList.add("is-lifted");
    item.classList.add("is-lifted");
    item.classList.remove("is-placed");
    ghost.classList.add("is-dragging");
    ghost.classList.remove("is-placed");
    ghost.style.pointerEvents = fromGhost ? "auto" : "none";
    root.classList.add("is-dragging");
    document.documentElement.classList.add("is-dnd-grabbing");
    lockScroll();

    const handle = fromGhost ? ghost : item;

    try {
      handle.setPointerCapture(event.pointerId);
    } catch (error) {
    }

    const setX = gsap.quickSetter(ghost, "x", "px");
    const setY = gsap.quickSetter(ghost, "y", "px");

    session = {
      item,
      ghost,
      figure,
      token,
      pointerId: event.pointerId,
      moved: false,
      setX,
      setY,
      size: origin.size,
      boxRect,
      zoneRect,
      dropX: zoneRect.left + zoneRect.width / 2 - boxRect.left,
      dropY: zoneRect.top + zoneRect.height / 2 - boxRect.top,
    };

    const overZone = () => circlesTouch(ghostCircle(ghost, origin.size), zoneRect);

    gsap.to(ghost, {
      x: event.clientX,
      y: event.clientY,
      scale: LIFT,
      duration: reduced ? 0.01 : 0.16,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        if (!session || session.ghost !== ghost) return;
        root.classList.toggle("is-over", overZone());
      },
    });

    const onMove = (ev) => {
      if (!session || ev.pointerId !== session.pointerId) return;

      ev.preventDefault();

      if (!session.moved) {
        session.moved = true;
        gsap.killTweensOf(ghost);
        gsap.set(ghost, { scale: LIFT });
        session.setX = gsap.quickSetter(ghost, "x", "px");
        session.setY = gsap.quickSetter(ghost, "y", "px");
      }

      session.setX(ev.clientX);
      session.setY(ev.clientY);
      root.classList.toggle("is-over", circlesTouch(circleAt(ev.clientX, ev.clientY, origin.size * LIFT), zoneRect));
    };

    const onUp = (ev) => {
      if (ev && ev.pointerId != null && session && ev.pointerId !== session.pointerId) return;
      endDrag(ev);
    };

    session.onMove = onMove;
    session.onUp = onUp;
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function endDrag(event) {
    if (!session) return;

    const current = session;
    session = null;

    window.removeEventListener("pointermove", current.onMove);
    window.removeEventListener("pointerup", current.onUp);
    window.removeEventListener("pointercancel", current.onUp);
    unlockScroll();
    root.classList.remove("is-dragging", "is-over");
    document.documentElement.classList.remove("is-dnd-grabbing");

    const { item, ghost, figure, token } = current;

    gsap.killTweensOf(ghost);

    if (current.moved && event && Number.isFinite(event.clientX)) {
      gsap.set(ghost, { x: event.clientX, y: event.clientY, scale: LIFT });
    }

    ghost.classList.remove("is-dragging");

    const centerX = Number(gsap.getProperty(ghost, "x"));
    const centerY = Number(gsap.getProperty(ghost, "y"));
    const over = circlesTouch(ghostCircle(ghost, current.size), current.zoneRect);

    if (!over) {
      sendHome(item);
      return;
    }

    if (occupant && occupant.item !== item) sendHome(occupant.item);

    root.classList.add("is-selected");
    parkInBox(ghost, { x: centerX, y: centerY, boxRect: current.boxRect });
    occupant = { item, ghost, pinned: false };

    gsap.to(ghost, {
      x: current.dropX,
      y: current.dropY,
      scale: 1,
      duration: reduced ? 0.01 : 0.48,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => {
        if (stateOf(item).token !== token || !occupant || occupant.ghost !== ghost) return;

        pinGhost(ghost, figure, { size: current.size, x: current.dropX, y: current.dropY });
        item.classList.add("is-placed");
        occupant.pinned = true;
        playOutro();
      },
    });
  }

  return {
    syncPlaced() {
      if (outroPlayed || !occupant || !occupant.pinned || session) return;
      pinGhost(occupant.ghost, occupant.item.querySelector(".v-n-dnd-player__img"));
    },
    isClearing() {
      return outroPlayed;
    },
  };
}

function dndPlayer() {
  const roots = document.querySelectorAll(".v-n-dnd-player");
  if (!roots.length) return;

  roots.forEach((root) => {
    loadVotes(root);
    const drag = bindDrag(root);
    const place = () => {
      if (drag.isClearing()) return;
      anchorFaces(root);
      drag.syncPlaced();
    };
    const observer = new ResizeObserver(place);
    const box = root.querySelector(".v-n-dnd-player__c");
    if (box) observer.observe(box);
    root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
      observer.observe(item);
    });
    place();
  });
}

function initAll() {
  dndPlayer();
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");
  removeEls(".v-a--d-s-1 .v-a-inf-c");

  fadeOnScroll(".v-n-preh .scr-ind");
  headerIntro();
  chronoPipeline();
  chronoAnimations();
  playersComparison();
}

initAll();