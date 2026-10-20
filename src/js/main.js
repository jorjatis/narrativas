// NOTE: Helpers
import removeEls from "./helpers/removeEls";
import fadeOnScroll from "./helpers/fadeOnScroll";

// NOTE: Modules
import replaceHamburgerIcon from "./modules/replaceHamburgerIcon";

export function initAll() {
  document.body.classList.add("is-loaded");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-a-t");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-i");
  replaceHamburgerIcon();

  fadeOnScroll(".v-a--d-s-1 .v-a-img-c .scr-ind");
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
