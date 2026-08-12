import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PAYWALL_SELECTOR = 'ev-engagement[group-name="paywall-abc"][redirect="false"]';
const MAIN_SELECTOR = 'main.v-w-c, main.v-d-c';
const PREH_ROOT = '.v-n-preh';

function getPaywallMain() {
  return document.querySelector(MAIN_SELECTOR);
}

function hasPaywallMainStyles(main = getPaywallMain()) {
  if (!main) return false;

  const { height, overflowY, overflow, position } = main.style;
  const clipped = overflowY === 'clip' || overflow === 'clip';

  return Boolean(height) && clipped && position === 'relative';
}

export function hasArticlePaywall() {
  if (document.querySelector(PAYWALL_SELECTOR)) return true;
  return hasPaywallMainStyles();
}

function applyPrehPaywall() {
  const root = document.querySelector(PREH_ROOT);
  if (!root || root.classList.contains('is-paywall')) return;

  root.classList.add('is-paywall');

  const scene01 = root.querySelector('.v-n-preh-scene--01');
  const scene02 = root.querySelector('.v-n-preh-scene--02');
  const scene03 = root.querySelector('.v-n-preh-scene--03');
  const pathDraw = root.querySelector('.v-a-t__path-draw');

  if (scene03) {
    scene03.style.display = 'none';
    scene03.setAttribute('aria-hidden', 'true');
  }

  // Si la cabecera ya animó, cortamos el pin largo y nos quedamos en scene--02
  if (!root.classList.contains('is-ready')) return;

  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger === root) st.kill();
  });

  if (scene01) gsap.set(scene01, { autoAlpha: 0, yPercent: -100 });
  if (scene02) gsap.set(scene02, { autoAlpha: 1, yPercent: 0 });
  if (pathDraw) gsap.set(pathDraw, { strokeDashoffset: 0 });

  ScrollTrigger.refresh();
}

export default function initHasPaywall() {
  if (hasArticlePaywall()) {
    applyPrehPaywall();
    return;
  }

  const scope = document.body;
  const main = getPaywallMain();

  const check = () => {
    if (!hasArticlePaywall()) return;
    applyPrehPaywall();
    observer.disconnect();
  };

  const observer = new MutationObserver(check);
  observer.observe(scope, { childList: true, subtree: true });

  if (main) {
    observer.observe(main, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  }
}
