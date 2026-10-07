// NOTE: Helpers

// NOTE: Modules
import preArticleHeader from "./modules/preArticleHeader.js";
import chronoScroll from "./modules/chronoScroll.js";

export function initAll() {
  preArticleHeader();
  chronoScroll();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
