import initMoveEls from "./imports/moveEls.js";
import initGridDoctors from "./imports/grid-doctors.js";
import initLifelineDesktop from "./imports/lifeline-desktop.js";
import initLifelineMobile from "./imports/lifeline-mobile.js";
import initLinesTitle from "./imports/lines-title.js";
import initClockBox from "./imports/timer.js";
import { initVideoPlayers } from "./imports/video-player.js";
import initDocPrfScroll from "./imports/doc-prf-scroll.js";
import initTypewriterBusca from "./imports/busca.js";
import initClockHeading from "./imports/clock-heading.js";

const VERSION = "220";
const { gsap, ScrollTrigger } = window;

console.log(`narrativa version: ${VERSION}`);

if (!gsap || !ScrollTrigger) {
  console.warn("GSAP o ScrollTrigger no estan disponibles.");
} else {
  gsap.registerPlugin(ScrollTrigger);

  const initAll = () => {
    initMoveEls();
    initVideoPlayers();
    initGridDoctors();
    initLinesTitle();
    initClockHeading();
    initTypewriterBusca();
    initDocPrfScroll();

    requestAnimationFrame(() => {
      initClockBox();
      initLifelineDesktop();
      initLifelineMobile();
      ScrollTrigger.refresh(true);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll, { once: true });
  } else {
    initAll();
  }
}
