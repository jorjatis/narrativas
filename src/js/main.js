// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Modules
import eclipseScroll from './modules/eclipse-scroll';


export function initAll() {
  document.body.classList.add('is-loaded');

  fadeOnScroll(".v-a--d-s-1 .v-a-img-c > .scr-ind");
  eclipseScroll();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);