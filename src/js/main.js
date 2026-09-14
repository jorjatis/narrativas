// NOTE: Helpers
import syncNarrativeData from "./helpers/syncNarrativeData";
import fadeOnScroll from "./helpers/fadeOnScroll";

// NOTE: Modules
import preHeaderScene from "./modules/preHeaderScene";

export function initAll() {
  syncNarrativeData();

  document.body.classList.add("is-loaded");

  fadeOnScroll(".v-n-preh .scr-ind");
  
  preHeaderScene();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
