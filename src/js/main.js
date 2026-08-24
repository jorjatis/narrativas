// NOTE: Helpers
import syncNarrativeData from "./helpers/syncNarrativeData";
import fadeOnScroll from "./helpers/fadeOnScroll";

// NOTE: Modules
import preHeaderScene from "./modules/preHeaderScene";

export function initAll() {
  syncNarrativeData();

  document.body.classList.add("is-loaded");

  fadeOnScroll(".v-a--d-s-1 .v-a-img-c > .scr-ind");
  
  preHeaderScene();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
