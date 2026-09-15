// NOTE: Helpers
import fadeOnScroll from "./helpers/fadeOnScroll";

// NOTE: Modules
import playersComparison from "./modules/playersComparison";

export function initAll() {
  document.body.classList.add("is-loaded");

  fadeOnScroll(".v-n-preh .scr-ind");
  playersComparison();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
