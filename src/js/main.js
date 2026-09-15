// NOTE: Helpers
import fadeOnScroll from "./helpers/fadeOnScroll";

// NOTE: Modules

export function initAll() {
  document.body.classList.add("is-loaded");

  fadeOnScroll(".v-n-preh .scr-ind");
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
