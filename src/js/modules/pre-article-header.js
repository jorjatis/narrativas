import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../helpers/prefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

function getHeaderOffset(root) {
  const raw = getComputedStyle(root).getPropertyValue('--preh-header').trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 58;
}

export default function initPreArticleHeader() {
  const root = document.querySelector('.v-n-preh');
  if (!root) return;

  const run = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => createPreArticleHeader(root));
    });
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(run, run);
  } else {
    run();
  }
}

function createPreArticleHeader(root) {
  const stage = root.querySelector('.v-n-preh__stage');
  const scene01 = root.querySelector('.v-n-preh-scene--01');
  const scene02 = root.querySelector('.v-n-preh-scene--02');
  const scene03 = root.querySelector('.v-n-preh-scene--03');
  const pathTrack = root.querySelector('.v-a-t__path-track');
  const pathDraw = root.querySelector('.v-a-t__path-draw');
  const frames = [...root.querySelectorAll('.vid-frames')];

  if (!stage || !scene01 || !scene02 || !scene03) return;

  const headerOffset = getHeaderOffset(root);
  const pathLength = pathDraw?.getTotalLength?.() || 533;

  if (pathLength) {
    const dash = { strokeDasharray: pathLength };
    if (pathTrack) gsap.set(pathTrack, { ...dash, strokeDashoffset: 0 });
    gsap.set(pathDraw, { ...dash, strokeDashoffset: pathLength });
  }

  if (prefersReducedMotion()) {
    gsap.set(scene01, { autoAlpha: 0, yPercent: -100 });
    gsap.set(scene02, { autoAlpha: 0, yPercent: -100 });
    gsap.set(scene03, { autoAlpha: 1 });
    if (pathDraw && pathLength) gsap.set(pathDraw, { strokeDashoffset: 0 });
    gsap.set(frames, { clipPath: 'inset(0 0% 0 0)' });
    root.classList.add('is-ready');
    return;
  }

  gsap.set(scene02, { autoAlpha: 0, yPercent: 0 });
  gsap.set(scene03, { autoAlpha: 1, yPercent: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: `top ${headerOffset}px`,
      end: () => `+=${Math.round(window.innerHeight * 3)}`,
      pin: true,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Parte 1 → Parte 2
  tl.to(scene01, { yPercent: -100, duration: 1 }, 0);
  tl.to(scene02, { autoAlpha: 1, duration: 0.7 }, 0.15);

  // Parte 2: recorrido (la palabra se queda en negro)
  if (pathDraw && pathLength) {
    tl.to(pathDraw, { strokeDashoffset: 0, duration: 1.1 }, 1);
  } else {
    tl.to({}, { duration: 1.1 }, 1);
  }

  // Sale el bloque 2
  tl.to(scene02, { yPercent: -100, duration: 1 }, 2.3);

  // Hold de scroll antes de entrar al bloque 3
  tl.to({}, { duration: 0.55 }, 3.3);

  // Parte 3: tiras L→R, sin opacity
  frames.forEach((frame, index) => {
    tl.to(
      frame,
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.9,
        ease: 'power1.out',
      },
      3.85 + index * 0.2,
    );
  });

  // Hold de scroll al final del bloque 3 antes de soltar el pin
  tl.to({}, { duration: 0.7 }, 5.15);

  root.classList.add('is-ready');
}
