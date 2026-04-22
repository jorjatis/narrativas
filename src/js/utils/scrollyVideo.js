import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function initScrollyVideo(playbackConst = 500) {
  const scrollyVidContainerHeight = document.querySelector(".v-n-cmp-scrolly-vid");
  const scrollyVid = document.querySelector('.v-n-scrolly-vid video');
  
  if (!scrollyVid || !scrollyVidContainerHeight) return;

  let lastPos = -1;

  // 1. Extraemos las rutas de los data-attributes (evita el parpadeo)
  const rutaMobile = scrollyVid.getAttribute('data-src-mobile');
  const rutaDesktop = scrollyVid.getAttribute('data-src-desktop');

  const mediaQuery = window.matchMedia("(max-width: 699px)");

  // 2. Función para asignar el video
  function loadVideo() {
    const selectedSrc = mediaQuery.matches ? rutaMobile : rutaDesktop;

    // Solo actualizamos si la fuente es distinta (evita recargas innecesarias en resize)
    if (scrollyVid.dataset.current === selectedSrc) return;

    scrollyVid.innerHTML = `<source src="${selectedSrc}" type="video/mp4">`;
    scrollyVid.dataset.current = selectedSrc; // Guardamos estado actual
    scrollyVid.load();
    
    console.log("Cargando:", selectedSrc);
  }

  // 3. Listener de cambio de resolución
  mediaQuery.addEventListener('change', loadVideo);

  // Ejecución inicial inmediata
  loadVideo();

  // 4. Lógica de Scroll (Optimizada con Math.min/max)
  function render() {
    const currentPos = window.pageYOffset;
    
    if (lastPos !== currentPos) {
      lastPos = currentPos;
      const frameNumber = currentPos / playbackConst;

      if (isFinite(frameNumber) && scrollyVid.readyState >= 2 && !scrollyVid.seeking) {
        // Encapsulamos el tiempo entre 0 y la duración del video
        scrollyVid.currentTime = Math.min(Math.max(frameNumber, 0), scrollyVid.duration);
      }
    }
    window.requestAnimationFrame(render);
  }

  scrollyVid.addEventListener('loadedmetadata', function () {
    scrollyVidContainerHeight.style.height = Math.floor(scrollyVid.duration * playbackConst) + window.innerHeight + "px";

    ScrollTrigger.refresh();
  });

  window.requestAnimationFrame(render);
}