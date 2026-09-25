// NOTE: Helpers
import fadeOnScroll from "./helpers/fadeOnScroll";
import moveEls from "./helpers/moveEls";
import removeEls from "./helpers/removeEls";

// NOTE: Modules
import { zoomInImage } from "./modules/zoomInImage";

export function initAll() {
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-i");

  document.body.classList.add("is-loaded");
  document.querySelector('.v-a--d-s-1 .v-a-inf-c .v-a-t').innerHTML = '<span>Los últimos</span><span class="v-a-t__loc">Mongolia</span><span>hombres libres</span>';

  moveEls(".v-d--abc .scr-ind", ".v-a--d-s-1 .v-a-img-c", "prepend");

  moveEls(".v-n-suh--first", ".v-d--abc .v-a-s-t", "before");

  fadeOnScroll(".v-a--d-s-1 .v-a-img-c .scr-ind");

  zoomInImage();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
