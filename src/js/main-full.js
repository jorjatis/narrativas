import initMoveEls from "./imports/moveEls.js";

import initLifelineDesktop from "./imports/lifeline-desktop.js";
import initLifelineMobile from "./imports/lifeline-mobile.js";
import initLinesTitle from "./imports/lines-title.js";
import initClockBox from "./imports/timer.js";

// import { initAudioPlayers } from './imports/audio-player.js';
import { initVideoPlayers } from './imports/video-player.js';
import initDocPrfScroll from "./imports/doc-prf-scroll.js";
import initTypewriterBusca from "./imports/busca.js";
import initClockHeading from "./imports/clock-heading.js";

/* =====================================================
    INIT
===================================================== */
const { gsap, ScrollTrigger } = window;

if (!gsap || !ScrollTrigger) {
  console.warn("GSAP o ScrollTrigger no están disponibles.");
  return;
}

gsap.registerPlugin(ScrollTrigger);

function initAll() {
  initMoveEls();
  initVideoPlayers();
  initLinesTitle();
  requestAnimationFrame(() => {
    initClockBox();
  });
  initLifelineDesktop();
  initLifelineMobile();
  initTypewriterBusca();
  initClockHeading();
  initDocPrfScroll();

  requestAnimationFrame(() => {
    ScrollTrigger.refresh(true);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}