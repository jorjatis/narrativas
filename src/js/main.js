import moduleMockup from './modules/moduleMockup';

const modules = [
  moduleMockup,
].filter(Boolean);

export function initAll() {
  modules.forEach(fn => fn());
}

function start() {
  window.scrollTo({
    top: 0,
    behavior: "auto"
  });

  initAll();
}

document.addEventListener('DOMContentLoaded', start);