const PATHS = {
  high: "M0 19.0h39.11c.09 0 .16-.06.19-.14l4.19-13.45c.06-.2.35-.18.39.02l3.45 19.36c.14.81 1.32.77 1.4-.05l3.75-22.13c.04-.23.36-.22.4 0l3.7 26.95c.08.85 1.31.87 1.41.02L61.5 1.17c.03-.23.36-.24.4 0l4.11 23.97c.04.21.33.23.39.03l2.95-9.44c.55-1.3 2.32-1.47 3.11-.29l2.6 3.9c.04.06.1.09.17.09h41.06",
  medium: "M0 19.0h15.33c.08 0 .16-.05.19-.13l4.96-13.07c.07-.18.32-.17.38 0l9.13 26.75c.06.18.32.18.38 0l4.69-13.43c.03-.08.1-.13.19-.13h13.51c.05 0 .1-.02.14-.06l3.65-3.7c.08-.08.21-.08.28 0l3.69 3.7s.09.06.14.06h7.07s.07-.01.11-.03l2.35-1.48c.07-.04.16-.04.22 0l1.42 1c.47.33 1.03.51 1.61.51h14.08c.08 0 .16-.05.19-.13l4.96-13.07c.07-.18.32-.17.38 0l9.13 26.75c.06.18.32.18.38 0l4.69-13.43c.03-.08.1-.13.19-.13h12.85",
  low: "M0 19.0h50.18c.05 0 .1-.02.14-.06l3.65-3.7c.08-.08.21-.08.28 0l3.69 3.7s.09.06.14.06h7.07s.07-.01.11-.03l2.35-1.48c.07-.04.16-.04.22 0l1.42 1c.47.33 1.03.51 1.61.51h45.4"
};

const SEGMENT_WIDTH = 116.27;
const SEGMENT_HEIGHT = 45;
const SPEED = 80;
const MARKER_SELECTOR = ".lowLifeline, .mediumLifeline, .highLifeline";

export default function initLifelineMobile() {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger || window.innerWidth >= 1025) return;

  const wrapper = document.querySelector(".lifeline-strip-wrapper");
  const strip = document.querySelector(".lifeline-strip");

  if (!wrapper || !strip || strip.dataset.lifelineMobileInit) return;
  strip.dataset.lifelineMobileInit = "true";

  let currentType = "low";
  let offset = 0;

  strip.innerHTML = "";
  strip.style.transform = "translateX(0)";

  const appendSegment = (type) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${SEGMENT_WIDTH} ${SEGMENT_HEIGHT}`);
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("lifeline-strip__segment");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", PATHS[type] || PATHS.low);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#1d1d1b");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path);
    strip.appendChild(svg);
  };

  const visibleSegments = Math.ceil(wrapper.offsetWidth / SEGMENT_WIDTH) + 3;
  for (let i = 0; i < visibleSegments; i += 1) {
    appendSegment(currentType);
  }

  getMarkers().forEach((marker, index) => {
    if (index === 0) {
      ScrollTrigger.create({
        trigger: marker,
        start: "top center",
        onLeaveBack: () => {
          currentType = "low";
        }
      });
    }

    ScrollTrigger.create({
      trigger: marker,
      start: "top center",
      onEnter: () => {
        currentType = getMarkerType(marker);
      },
      onEnterBack: () => {
        currentType = getMarkerType(marker);
      }
    });
  });

  gsap.ticker.add((time, deltaTime) => {
    offset -= (SPEED * deltaTime) / 1000;
    strip.style.transform = `translateX(${offset}px)`;

    if (Math.abs(offset) < SEGMENT_WIDTH) return;

    appendSegment(currentType);
    strip.firstElementChild?.remove();
    offset += SEGMENT_WIDTH;
    strip.style.transform = `translateX(${offset}px)`;
  });
}

function getMarkers() {
  return Array.from(document.querySelectorAll(MARKER_SELECTOR)).sort(
    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
  );
}

function getMarkerType(marker) {
  if (marker.classList.contains("highLifeline")) return "high";
  if (marker.classList.contains("mediumLifeline")) return "medium";
  return "low";
}
