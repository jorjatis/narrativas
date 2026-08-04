import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../helpers/prefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

function watchLayout(section, onChange) {
  const root =
    section.closest('.paywall, .v-w-c, #cmv_interscroller, article') ||
    section.parentElement ||
    document.body;

  const schedule = gsap.delayedCall(0.25, onChange).pause();
  const request = () => schedule.restart(true);
  const ro = new ResizeObserver(request);
  const seen = new WeakSet();

  const observeAds = () => {
    root
      .querySelectorAll('.v-adv, [id^="google_ads_iframe"], [data-voc-vam-position]')
      .forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        ro.observe(el);
      });
  };

  observeAds();

  const mo = new MutationObserver(() => {
    observeAds();
    request();
  });
  mo.observe(root, { childList: true, subtree: true });

  return () => {
    schedule.kill();
    ro.disconnect();
    mo.disconnect();
  };
}

function syncStepMargins(steps) {
  steps.forEach((step) => {
    const card = step.querySelector('.step__c');
    if (!card) return;
    step.style.marginBottom = `${card.offsetHeight}px`;
  });
}

function watchStepMargins(steps, onChange) {
  const schedule = gsap.delayedCall(0.15, () => {
    syncStepMargins(steps);
    onChange?.();
  }).pause();
  const request = () => schedule.restart(true);

  syncStepMargins(steps);

  const ro = new ResizeObserver(request);
  steps.forEach((step) => {
    const card = step.querySelector('.step__c');
    if (card) ro.observe(card);
    ro.observe(step);
  });

  window.addEventListener('resize', request);

  return () => {
    schedule.kill();
    ro.disconnect();
    window.removeEventListener('resize', request);
  };
}

function setupFrames(section, framesWrap, headerOffset) {
  const images = [...framesWrap.querySelectorAll('.v-n-ecl-scr__frame')];
  if (images.length < 2) return null;

  const stage = section.querySelector('.v-n-ecl-scr__stage');
  const canvas = document.createElement('canvas');
  canvas.className = 'v-n-ecl-scr__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: false });
  framesWrap.appendChild(canvas);
  framesWrap.classList.add('is-canvas-ready');

  let current = -1;
  let dpr = 1;

  const resize = () => {
    const ref = images.find((img) => img.naturalWidth) || images[0];
    const nw = ref.naturalWidth || 1;
    const nh = ref.naturalHeight || 1;
    const maxW = framesWrap.clientWidth || nw;
    const maxH = stage?.clientHeight || window.innerHeight - headerOffset;
    const fit = Math.min(maxW / nw, maxH / nh);
    const w = nw * fit;
    const h = nh * fit;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (current >= 0) show(current, true);
  };

  const show = (index, force = false) => {
    if (!force && index === current) return;
    const img = images[index];
    if (!img?.naturalWidth) return;

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.drawImage(img, 0, 0, w, h);
    current = index;
  };

  resize();
  show(0, true);

  Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          })
    )
  ).then(() => {
    resize();
    show(Math.max(current, 0), true);
    ScrollTrigger.refresh();
  });

  return {
    show,
    resize,
    destroy() {
      canvas.remove();
      framesWrap.classList.remove('is-canvas-ready');
    },
  };
}

export default function eclipseScroll() {
  const section = document.querySelector('.v-n-ecl-scr');
  if (!section) return;

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: '(min-width: 699px)',
      isMobile: '(max-width: 698px)',
    },
    (context) => {
      const { isDesktop } = context.conditions;
      const headerOffset = isDesktop ? 60 : 52;
      const framesWrap = section.querySelector(
        isDesktop ? '.v-n-ecl-scr__frames--d' : '.v-n-ecl-scr__frames--m'
      );
      if (!framesWrap) return;

      const framesApi = setupFrames(section, framesWrap, headerOffset);
      if (!framesApi) return;

      if (prefersReducedMotion()) {
        return () => framesApi.destroy();
      }

      const steps = [...section.querySelectorAll('.step')];
      const triggers = [];

      const stopStepMargins = watchStepMargins(steps, () => {
        framesApi.resize();
        ScrollTrigger.refresh();
      });

      steps.forEach((step) => {
        const frameStart = Number(step.dataset.frameStart);
        const frameEnd = Number(step.dataset.frameEnd);
        if (!Number.isFinite(frameStart) || !Number.isFinite(frameEnd)) return;

        const span = frameEnd - frameStart;

        triggers.push(
          ScrollTrigger.create({
            id: `eclipse-scroll-step-${frameStart}`,
            trigger: step,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
            onToggle: (self) => {
              step.classList.toggle('is-active', self.isActive);
            },
            onUpdate: (self) => {
              const frame =
                span <= 0
                  ? frameStart
                  : Math.round(frameStart + self.progress * span);
              framesApi.show(frame);
            },
            onRefresh: framesApi.resize,
          })
        );
      });

      const stopWatch = watchLayout(section, () => {
        syncStepMargins(steps);
        framesApi.resize();
        ScrollTrigger.refresh();
      });

      return () => {
        stopStepMargins();
        stopWatch();
        triggers.forEach((st) => st.kill());
        framesApi.destroy();
      };
    }
  );
}
