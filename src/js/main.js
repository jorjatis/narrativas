import "./vendors/gsap.min.js";
import "./vendors/ScrollTrigger.min.js";

import initLifeline from "./imports/lifeline.js";
import initLinesTitle from "./imports/lines-title.js";
import initBoxHeadingTimer from "./imports/box-heading-timer.js";

import { initAudioPlayers } from './imports/audio-player.js';
import { initVideoPlayers } from './imports/video-player.js';
import initDocPrfScroll from "./imports/doc-prf-scroll.js";


document.addEventListener("DOMContentLoaded", () => {

  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    console.warn("GSAP o ScrollTrigger no están disponibles.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  initAudioPlayers();
  initVideoPlayers();

  initLinesTitle();
  initBoxHeadingTimer();
  initLifeline();
});

window.addEventListener("load", () => {
  const { ScrollTrigger } = window;

  initDocPrfScroll();

  requestAnimationFrame(() => {
    ScrollTrigger.refresh(true);
  });
});