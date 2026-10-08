// NOTE: Helpers
import fadeOnScroll from "./helpers/fadeOnScroll";
import refreshScrollTriggerOnMedia from "./helpers/refreshScrollTriggerOnMedia.js";

// NOTE: Modules
import preArticleHeader from "./modules/preArticleHeader.js";
import chronoScroll from "./modules/chronoScroll.js";
import videoAutoplayInView from "./modules/videoAutoplayInView.js";

export function initAll() {
  fadeOnScroll(".scr-ind");
  preArticleHeader();
  chronoScroll();
  videoAutoplayInView();
  refreshScrollTriggerOnMedia();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
