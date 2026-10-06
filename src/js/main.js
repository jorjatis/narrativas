// NOTE: Helpers

// NOTE: Modules
import preArticleHeader from "./modules/preArticleHeader.js";

export function initAll() {
  preArticleHeader();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
