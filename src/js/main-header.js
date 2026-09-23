/* main-header.js — solo cabecera (noticia cerrada / teaser).
   Requiere: gsap, lottie y window.EL10_INTRO_ANIMATION. */
(function () {
'use strict';

if (typeof gsap === "undefined") {
  console.error("[main-header] gsap no está cargado");
  return;
}
if (typeof lottie === "undefined") {
  console.error("[main-header] lottie no está cargado");
  return;
}

// --- prefersReducedMotion ---
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// --- fadeOnScroll ---
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

// --- moveEls ---
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

// --- removeEls ---
/**
 * removeElements
 * ----------------------------------------
 * Elimina uno o varios elementos del DOM
 *
 * Uso básico:
 *
 * removeElements('.mi-clase');
 * removeElements('#mi-id');
 * removeElements(elemento);
 * removeElements([el1, el2]);
 *
 * Opciones:
 *
 * @param {string|HTMLElement|NodeList|Array} target
 *  Selector, elemento o lista de elementos
 *
 * @param {boolean} all (default: true)
 *  Si es selector:
 *   - true → elimina todos los matches
 *   - false → solo el primero
 *
 * @param {number} delay (default: 0)
 *  Delay en ms antes de eliminar
 *
 * ----------------------------------------
 */

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

// --- headerIntro ---

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
    animationData: structuredClone(window.EL10_INTRO_ANIMATION),
  });
}

// El JSON nuevo ya viene recortado al 10. Mantenemos el lienzo nativo para
// no abrir un hueco bajo el trazo (el recorte por bbox + stroke lo agrandaba).
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
    // El 10 proyecta su sombra sobre el arranque del tubo. La atamos al ancho
    // del trazo para que caiga igual en cualquier breakpoint.
    "--pipe-shadow": `${start.width * 1.7}px`,
  });

  return true;
}

// Sin cronología (noticia cerrada): un tramo corto centrado bajo el 10.
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
    // Se revela con clip-path, no con scaleY, para que la sombra del arranque
    // salga ya a tamaño real en el primer fotograma en lugar de estirarse.
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

function initAll() {
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");
  removeEls(".v-a--d-s-1 .v-a-inf-c");
  fadeOnScroll(".v-n-preh .scr-ind");
  headerIntro();
}

initAll();
})();
