import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';

// NOTE: Utils
import initScrollyVideo from './utils/scrollyVideo';

// NOTE: Components
import highlights from './modules/highlights';

// NOTE: Envuelve el contenido del subtítulo en un span para la animacion del fondo amarillo
const prepareSubtitles = () => {
  const heading = document.querySelector('.v-a--d-s-1 .v-a-inf-c .v-a-s-t');
  if (heading && !heading.querySelector('span')) {
    heading.innerHTML = `<span>${heading.innerHTML}</span>`;
  }
};

// NOTE: Ajusta el margen superior del video basado en la altura del contenedor de info
const adjustVideoMargin = () => {
  const infoContainer = document.querySelector('.v-a--d-s-1 .v-a-inf-c');
  const scrollyVid = document.querySelector('.v-n-cmp-scrolly-vid');

  if (infoContainer && scrollyVid) {
    requestAnimationFrame(() => {
      scrollyVid.style.marginTop = `-${infoContainer.offsetHeight}px`;
      ScrollTrigger.refresh();
    });
  }
};

// NOTE: Inicializa observadores y eventos de redimensionamiento
const initObservers = () => {
  const infoContainer = document.querySelector('.v-a--d-s-1 .v-a-inf-c');
  if (!infoContainer) return;

  const resizeObserver = new ResizeObserver(adjustVideoMargin);
  resizeObserver.observe(infoContainer);
  
  // También ajustamos al cargar imágenes o fuentes
  window.addEventListener('load', adjustVideoMargin);
};

export function initAll() {
  fadeOnScroll('.scr-ind');
  initScrollyVideo(100);

  prepareSubtitles();
  moveEls('.v-a--d-s-1 > .v-a-inf-c', '.v-a--d-s-1 > .v-a-img-c', 'prepend');
  
  initObservers();
  adjustVideoMargin();

  document.body.classList.add('is-loaded');
  
  highlights();

  ScrollTrigger.refresh();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// initAll();
window.addEventListener('load', initAll);