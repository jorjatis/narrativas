import gsap from "gsap";
import lottie from "lottie-web/build/player/lottie_light";
import animationData from "@images/diez-animacion.json";

const PIPE_OVERLAP = 8;
const BLOCK_HIDDEN = "inset(0% 0% 100% 0%)";
const BLOCK_SHOWN = "inset(0% 0% 0% 0%)";
const WORD_DURATION = 0.52;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
    animationData: structuredClone(animationData),
  });
}

// El JSON trae el 10 centrado en un lienzo cuadrado mucho más grande que el
// trazo. Reencuadramos el viewBox al contenido del último fotograma (el trazo
// se dibuja con trim paths) para que el 10 llene su caja y el pipeline pueda
// arrancar justo en su base.
function fitToContent(anim, host) {
  const svg = host.querySelector("svg");
  if (!svg) return;

  anim.goToAndStop(anim.totalFrames - 1, true);
  const box = svg.getBBox();
  anim.goToAndStop(0, true);

  if (box.width < 1 || box.height < 1) return;

  const strokes = [...svg.querySelectorAll("[stroke-width]")].map(
    (el) => Number(el.getAttribute("stroke-width")) || 0
  );
  const pad = Math.max(0, ...strokes) / 2;
  const width = box.width + pad * 2;
  const height = box.height + pad * 2;

  svg.setAttribute("viewBox", `${box.x - pad} ${box.y - pad} ${width} ${height}`);
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
  });

  return true;
}

function endState(preh, words, pipe, anim) {
  gsap.set(preh, { autoAlpha: 1 });
  gsap.set(words, { clipPath: BLOCK_SHOWN });
  gsap.set(pipe, { scaleY: 1 });
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
    if (!timeline || !ready) return false;
    return placePipe(pipe, animHost, timeline);
  };

  const growPipe = () => {
    if (!place()) return;
    grown = true;
    gsap.fromTo(
      pipe,
      { scaleY: 0 },
      {
        scaleY: 1,
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

export default function headerIntro() {
  document.querySelectorAll(".v-n-preh").forEach(setupHeader);
}
