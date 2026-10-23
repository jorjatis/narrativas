// NOTE: Helpers
import fadeOnScroll from "./helpers/fadeOnScroll";
import removeEls from "./helpers/removeEls";

// NOTE: Modules

export function initAll() {
  document.body.classList.add("is-loaded");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-a-t");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-i");
  fadeOnScroll(".v-a--d-s-1 .v-a-img-c .scr-ind");
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
