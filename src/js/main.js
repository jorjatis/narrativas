// NOTE: Helpers

// NOTE: Utils
import initScrollyVideo from './utils/scrollyVideo';

// NOTE: Components

export function initAll() {
  initScrollyVideo({
    container: "scrolly-video",
    src: "https://scrollyvideo.js.org/goldengate.mp4"
  });
}

function start() {
  initAll();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// start();
window.addEventListener('load', start);