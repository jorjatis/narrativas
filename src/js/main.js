// NOTE: Helpers
import fadeOnScroll from "./helpers/fadeOnScroll";

// NOTE: Modules
import chronoPipeline from "./modules/chronoPipeline";
import chronoAnimations from "./modules/chronoAnimations";
import playersComparison from "./modules/playersComparison";

export function initAll() {
  document.body.classList.add("is-loaded");

  fadeOnScroll(".v-n-preh .scr-ind");
  chronoPipeline();
  chronoAnimations();
  playersComparison();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
