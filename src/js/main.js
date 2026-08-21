// NOTE: Helpers
import syncNarrativeData from "./helpers/syncNarrativeData";

// NOTE: Modules
import initPreheaderScroll from "./modules/preheader-scroll";

export function initAll() {
  syncNarrativeData();
  
  initPreheaderScroll();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
