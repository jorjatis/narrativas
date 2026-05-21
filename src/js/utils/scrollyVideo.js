import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function initScrollyVideo(playbackConst = 500) {
  const scrollyVidContainerHeight = document.querySelector(".v-n-cmp-scrolly-vid");
  const scrollyVid = document.querySelector('.v-n-scrolly-vid video');
  
  if (!scrollyVid || !scrollyVidContainerHeight) return;

  let lastPos = -1;

  const rutaMobile = scrollyVid.getAttribute('data-src-mobile');
  const rutaDesktop = scrollyVid.getAttribute('data-src-desktop');

  const mediaQuery = window.matchMedia("(max-width: 699px)");

  function loadVideo() {
    const selectedSrc = mediaQuery.matches ? rutaMobile : rutaDesktop;

    if (scrollyVid.dataset.current === selectedSrc) return;

    scrollyVid.innerHTML = `<source src="${selectedSrc}" type="video/mp4">`;
    scrollyVid.dataset.current = selectedSrc;
    scrollyVid.load();
    
    console.log("Cargando:", selectedSrc);
  }

  mediaQuery.addEventListener('change', loadVideo);

  loadVideo();

  function render() {
    const currentPos = window.pageYOffset;
    
    if (lastPos !== currentPos) {
      lastPos = currentPos;
      const frameNumber = currentPos / playbackConst;

      if (isFinite(frameNumber) && scrollyVid.readyState >= 2 && !scrollyVid.seeking) {
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

function highlights() {
  gsap.registerPlugin(ScrollTrigger);

  const items = document.querySelectorAll('.v-d-p strong');
  if (items.length === 0) return;

  items.forEach((target) => {
    gsap.to(target, {
      scrollTrigger: {
        trigger: target,
        start: "top 80%",
        end: "bottom bottom",
        toggleClass: "is-marked",
        once: true
      }
    });
  });
}