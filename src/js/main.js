import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Utils
export function initAll() {
  fadeOnScroll('.scr-ind');

  ScrollTrigger.refresh();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();
window.addEventListener('load', initAll);