// NOTE: Helpers
import fadeOnScroll from "./helpers/fadeOnScroll";
import moveEls from './helpers/moveEls';
import removeEls from './helpers/removeEls';

// NOTE: Modules
import headerIntro from "./modules/headerIntro";
import chronoPipeline from "./modules/chronoPipeline";
import chronoAnimations from "./modules/chronoAnimations";
import playersComparison from "./modules/playersComparison";

export function initAll() {
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");
  removeEls(".v-a--d-s-1 .v-a-inf-c");

  fadeOnScroll(".v-n-preh .scr-ind");
  headerIntro();
  chronoPipeline();
  chronoAnimations();
  playersComparison();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
