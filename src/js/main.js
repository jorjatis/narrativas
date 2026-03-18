// import { ScrollTrigger } from './vendors/gsap.min.js'; // Si lo necesito

import moduleMockup from './modules/moduleMockup';

const modules = [
  moduleMockup,
].filter(Boolean);

export function initAll() {
  modules.forEach(fn => fn());

  if (ScrollTrigger) {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }
}

function start() {
  window.scrollTo({
    top: 0,
    behavior: "auto"
  });

  initAll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}