const PATHS = {
  high: "M32.56,0v61.05c0,3.65,2.37,6.87,5.85,7.95l12.3,3.84c1.65.51,1.5,2.89-.2,3.19l-27.87,4.97c-1.38.25-1.31,2.26.09,2.4l34.42,5.83c.99.17.97,1.6-.03,1.74l-42.65,5.86c-1.45.13-1.48,2.24-.04,2.41l40.5,4.93c1.88.23,1.95,2.94.08,3.26l-28.3,4.85c-1.35.23-1.48,2.12-.17,2.53l12.34,3.86c2.23.94,2.51,3.98.5,5.32l-3.12,2.07c-2.32,1.54-3.72,4.15-3.72,6.94v66",
  medium: "M32.56,0v23.16c0,1.99,1.23,3.77,3.09,4.48l7.97,3.03c4.19,1.59,4.09,7.56-.15,9.01l-21.93,7.49c-4.31,1.47-4.33,7.55-.03,9.05l7.85,2.74c1.92.67,3.21,2.48,3.21,4.52v18.1c0,1.28.51,2.51,1.42,3.41l1.82,1.79c1.89,1.87,1.9,4.92.02,6.8l-1.85,1.84c-.9.9-1.41,2.12-1.41,3.39v8.98c0,.9.26,1.79.74,2.55l.27.43c1.03,1.64.98,3.73-.14,5.31h0c-.57.81-.87,1.77-.87,2.76v21.02c0,1.99,1.23,3.77,3.09,4.48l7.97,3.03c4.19,1.59,4.09,7.56-.15,9.01l-21.93,7.49c-4.31,1.47-4.33,7.55-.03,9.05l7.85,2.74c1.92.67,3.21,2.48,3.21,4.52v18.83",
  low: "M32.56,0v84.03c0,1.28.51,2.51,1.42,3.41l1.82,1.79c1.89,1.87,1.9,4.92.02,6.8l-1.85,1.84c-.9.9-1.41,2.12-1.41,3.39v8.98c0,.9.26,1.79.74,2.55l.27.43c1.03,1.64.98,3.73-.14,5.31h0c-.57.81-.87,1.77-.87,2.76v77.71"
};

const SEGMENT_HEIGHT = 199;
const MIN_MARKER_SEGMENTS = 3;
const MARKER_SELECTOR = ".lowLifeline, .mediumLifeline, .highLifeline";

export default function initLifelineDesktop() {
  const { ScrollTrigger } = window;

  if (!ScrollTrigger || window.innerWidth < 1025) return;

  const lifeline = document.querySelector(".lifeline-desktop");
  const paywall = document.querySelector(".v-d > .paywall");
  const svg = lifeline?.querySelector(".lifeline-svg");
  const content = svg?.querySelector(".lifeline-content");
  const endEl = paywall?.lastElementChild?.previousElementSibling;

  if (!lifeline || !paywall || !svg || !content || !endEl) return;

  const build = () => {
    content.innerHTML = "";

    const startY = getPageTop(paywall);
    const endY = getPageTop(endEl);
    const totalHeight = Math.max(endY - startY, SEGMENT_HEIGHT);
    const markers = getMarkers();
    let currentY = 0;
    let currentType = "low";

    svg.setAttribute("viewBox", `0 0 65 ${totalHeight}`);

    const addWave = (type) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", PATHS[type] || PATHS.low);
      path.setAttribute("transform", `translate(0, ${currentY})`);
      path.classList.add(`line-${type}`);
      content.appendChild(path);
      currentY += SEGMENT_HEIGHT;
    };

    const fillUntil = (targetY, type) => {
      while (currentY + SEGMENT_HEIGHT <= targetY) {
        addWave(type);
      }
    };

    markers.forEach((marker) => {
      const markerY = getPageTop(marker) - startY;

      fillUntil(markerY, currentType);
      currentType = getMarkerType(marker);

      for (let i = 0; i < MIN_MARKER_SEGMENTS && currentY + SEGMENT_HEIGHT <= totalHeight; i += 1) {
        addWave(currentType);
      }
    });

    fillUntil(totalHeight, currentType);
  };

  build();

  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      ScrollTrigger.refresh();
    }, 150);
  });
}

function getMarkers() {
  return Array.from(document.querySelectorAll(MARKER_SELECTOR)).sort(
    (a, b) => getPageTop(a) - getPageTop(b)
  );
}

function getMarkerType(marker) {
  if (marker.classList.contains("highLifeline")) return "high";
  if (marker.classList.contains("mediumLifeline")) return "medium";
  return "low";
}

function getPageTop(element) {
  return element.getBoundingClientRect().top + window.scrollY;
}
