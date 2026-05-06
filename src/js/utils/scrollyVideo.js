import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function initScrollyVideo(playbackConst = 500) {
  const container = document.querySelector(".v-n-cmp-scrolly-vid");
  const video = container?.querySelector('video');
  
  if (!video || !container) return;

  const rutaMobile = video.getAttribute('data-src-mobile');
  const rutaDesktop = video.getAttribute('data-src-desktop');
  const mediaQuery = window.matchMedia("(max-width: 699px)");

  function loadVideo() {
    const selectedSrc = mediaQuery.matches ? rutaMobile : rutaDesktop;
    if (video.dataset.current === selectedSrc) return;

    video.src = selectedSrc;
    video.dataset.current = selectedSrc;
    video.muted = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.load();
  }

  mediaQuery.addEventListener('change', loadVideo);
  loadVideo();

  const videoProxy = { time: 0 };
  let st = null; 

  const initVideoTimeline = () => {
    if (st) st.kill();
    if (!video.duration) return;

    const scrollDistance = video.duration * playbackConst;

    st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${scrollDistance}`,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        videoProxy.time = self.progress * video.duration;
        if (video.readyState >= 2 && !video.seeking) {
          video.currentTime = videoProxy.time;
        }
      },
      onRefresh: (self) => {
        if (self && video.readyState >= 2) {
          video.currentTime = video.duration * self.progress;
        }
      }
    });
  };

  if (video.readyState >= 1) {
    initVideoTimeline();
  } else {
    video.addEventListener('loadeddata', initVideoTimeline, { once: true });
  }
}