export default function initLifelineMobile() {

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger) return;
  if (window.innerWidth >= 1025) return;

  const wrapper = document.querySelector('.lifeline-strip-wrapper');
  const strip = document.querySelector('.lifeline-strip');

  if (!wrapper || !strip) return;

  /*
  ============================================
  PATHS HORIZONTALES
  ============================================
  */

  const PATHS = {
    high: `M0 19.0h39.11c.09 0 .16-.06.19-.14l4.19-13.45c.06-.2.35-.18.39.02l3.45 19.36c.14.81 1.32.77 1.4-.05l3.75-22.13c.04-.23.36-.22.4 0l3.7 26.95c.08.85 1.31.87 1.41.02L61.5 1.17c.03-.23.36-.24.4 0l4.11 23.97c.04.21.33.23.39.03l2.95-9.44c.55-1.3 2.32-1.47 3.11-.29l2.6 3.9c.04.06.1.09.17.09h41.06`,
    medium: `M0 19.0h15.33c.08 0 .16-.05.19-.13l4.96-13.07c.07-.18.32-.17.38 0l9.13 26.75c.06.18.32.18.38 0l4.69-13.43c.03-.08.1-.13.19-.13h13.51c.05 0 .1-.02.14-.06l3.65-3.7c.08-.08.21-.08.28 0l3.69 3.7s.09.06.14.06h7.07s.07-.01.11-.03l2.35-1.48c.07-.04.16-.04.22 0l1.42 1c.47.33 1.03.51 1.61.51h14.08c.08 0 .16-.05.19-.13l4.96-13.07c.07-.18.32-.17.38 0l9.13 26.75c.06.18.32.18.38 0l4.69-13.43c.03-.08.1-.13.19-.13h12.85`,
    low: `M0 19.0h50.18c.05 0 .1-.02.14-.06l3.65-3.7c.08-.08.21-.08.28 0l3.69 3.7s.09.06.14.06h7.07s.07-.01.11-.03l2.35-1.48c.07-.04.16-.04.22 0l1.42 1c.47.33 1.03.51 1.61.51h45.4`
  };

  const SEGMENT_WIDTH = 116;
  const SPEED = 80;

  let currentType = "low";
  let offset = 0;

  const visibleCount =
    Math.ceil(wrapper.offsetWidth / SEGMENT_WIDTH) + 2;

  function createSegment(type) {

    const svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    svg.setAttribute("viewBox", "0 0 116.27 38.44");

    const path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    path.setAttribute("d", PATHS[type]);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#1d1d1b");
    path.setAttribute("stroke-width", "2");

    svg.appendChild(path);
    strip.appendChild(svg);
  }

  /*
  ============================================
  Inicial
  ============================================
  */

  for (let i = 0; i < visibleCount; i++) {
    createSegment("low");
  }

  /*
  ============================================
  MARKERS
  ============================================
  */

  const markers = Array.from(
    document.querySelectorAll('.mediumLifeline, .highLifeline, .lowLifeline')
  ).sort((a, b) =>
    a.getBoundingClientRect().top - b.getBoundingClientRect().top
  );

  const firstMarker = markers[0];

  // 🔥 CLAVE: si subes por encima del primero → volver a LOW
  if (firstMarker) {
    ScrollTrigger.create({
      trigger: firstMarker,
      start: "top center",
      onLeaveBack: () => {
        currentType = "low";
      }
    });
  }

  markers.forEach(marker => {

    ScrollTrigger.create({
      trigger: marker,
      start: "top center",
      onEnter: () => updateType(marker),
      onEnterBack: () => updateType(marker)
    });

  });

  function updateType(marker) {

    if (marker.classList.contains('highLifeline')) {
      currentType = "high";
    } else if (marker.classList.contains('mediumLifeline')) {
      currentType = "medium";
    } else {
      currentType = "low";
    }

  }

  /*
  ============================================
  LOOP INFINITO
  ============================================
  */

  gsap.ticker.add((time, deltaTime) => {

    const move = (SPEED * deltaTime) / 1000;
    offset -= move;

    strip.style.transform = `translateX(${offset}px)`;

    if (Math.abs(offset) >= SEGMENT_WIDTH) {
      // 1. Primero añade el nuevo para que siempre haya continuidad de nodos
      createSegment(currentType); 
      // 2. Luego quita el viejo
      strip.removeChild(strip.firstElementChild);
      // 3. Ajusta el offset
      offset += SEGMENT_WIDTH;
    }

  });

}