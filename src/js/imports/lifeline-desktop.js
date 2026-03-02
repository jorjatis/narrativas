export default function initLifeline() {

  const PATHS = {
    high: `M32.56,0v61.05c0,3.65,2.37,6.87,5.85,7.95l12.3,3.84c1.65.51,1.5,2.89-.2,3.19l-27.87,4.97c-1.38.25-1.31,2.26.09,2.4l34.42,5.83c.99.17.97,1.6-.03,1.74l-42.65,5.86c-1.45.13-1.48,2.24-.04,2.41l40.5,4.93c1.88.23,1.95,2.94.08,3.26l-28.3,4.85c-1.35.23-1.48,2.12-.17,2.53l12.34,3.86c2.23.94,2.51,3.98.5,5.32l-3.12,2.07c-2.32,1.54-3.72,4.15-3.72,6.94v66`,
    medium: `M32.56,0v23.16c0,1.99,1.23,3.77,3.09,4.48l7.97,3.03c4.19,1.59,4.09,7.56-.15,9.01l-21.93,7.49c-4.31,1.47-4.33,7.55-.03,9.05l7.85,2.74c1.92.67,3.21,2.48,3.21,4.52v18.1c0,1.28.51,2.51,1.42,3.41l1.82,1.79c1.89,1.87,1.9,4.92.02,6.8l-1.85,1.84c-.9.9-1.41,2.12-1.41,3.39v8.98c0,.9.26,1.79.74,2.55l.27.43c1.03,1.64.98,3.73-.14,5.31h0c-.57.81-.87,1.77-.87,2.76v21.02c0,1.99,1.23,3.77,3.09,4.48l7.97,3.03c4.19,1.59,4.09,7.56-.15,9.01l-21.93,7.49c-4.31,1.47-4.33,7.55-.03,9.05l7.85,2.74c1.92.67,3.21,2.48,3.21,4.52v18.83`,
    low: `M32.56,0v84.03c0,1.28.51,2.51,1.42,3.41l1.82,1.79c1.89,1.87,1.9,4.92.02,6.8l-1.85,1.84c-.9.9-1.41,2.12-1.41,3.39v8.98c0,.9.26,1.79.74,2.55l.27.43c1.03,1.64.98,3.73-.14,5.31h0c-.57.81-.87,1.77-.87,2.76v77.71`
  };

  const lifeline = document.querySelector(".lifeline-desktop");
  if (!lifeline) return;

  const svg = lifeline.querySelector(".lifeline-svg");
  const content = svg.querySelector(".lifeline-content");
  const paywall = document.querySelector(".v-d > .paywall");
  if (!paywall) return;

  // Buscar el .v-d-p inmediatamente anterior
  let startEl = paywall.previousElementSibling;

  while (startEl && !startEl.classList.contains("v-d-p")) {
    startEl = startEl.previousElementSibling;
  }

  const endEl = document.querySelector(".v-cmp-crd");

  if (!svg || !content || !startEl || !endEl) return;

  const SEGMENT_HEIGHT = 199;

  function build() {

    // Limpiar
    content.innerHTML = "";
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    const startY = startEl.getBoundingClientRect().top + window.scrollY;
    const endY = endEl.getBoundingClientRect().top + window.scrollY;
    const totalHeight = endY - startY;

    svg.setAttribute("viewBox", `0 0 65 ${totalHeight}`);

    const markers = [
      ...document.querySelectorAll(".mediumLifeline, .highLifeline")
    ].sort((a, b) =>
      a.getBoundingClientRect().top - b.getBoundingClientRect().top
    );

    let currentY = 0;

    function addWave(type) {

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );

      path.setAttribute("d", PATHS[type]);
      path.setAttribute("transform", `translate(0, ${currentY})`);
      path.classList.add(`line-${type}`);

      content.appendChild(path);

      currentY += SEGMENT_HEIGHT;
    }

    function fillLowUntil(targetY) {
      while (currentY + SEGMENT_HEIGHT <= targetY) {
        addWave("low");
      }
    }

    markers.forEach(marker => {

      const markerY =
        marker.getBoundingClientRect().top + window.scrollY - startY;

      fillLowUntil(markerY);

      const lines = parseInt(marker.dataset.lines || 1, 10);
      const type = marker.classList.contains("highLifeline")
        ? "high"
        : "medium";

      for (let i = 0; i < lines; i++) {
        addWave(type);
      }

    });

    fillLowUntil(totalHeight);

    animateSegments();
  }

  function animateSegments() {

    const paths = Array.from(svg.querySelectorAll("path"));

    // Calcular longitud total
    const lengths = paths.map(p => p.getTotalLength());
    const totalLength = lengths.reduce((a, b) => a + b, 0);

    // Inicializar todos ocultos
    paths.forEach((path, i) => {
      path.style.strokeDasharray = lengths[i];
      path.style.strokeDashoffset = lengths[i];
    });

    // Objeto proxy para animar progreso global
    const progressObj = { value: 0 };

    gsap.to(progressObj, {
      value: totalLength,
      ease: "none",
      scrollTrigger: {
        trigger: startEl,
        start: "top center",
        endTrigger: endEl,
        end: "bottom bottom",
        scrub: 0.5
      },
      onUpdate: () => {
        let remaining = progressObj.value;

        paths.forEach((path, i) => {
          const segLength = lengths[i];

          if (remaining <= 0) {
            path.style.strokeDashoffset = segLength;
          }
          else if (remaining >= segLength) {
            path.style.strokeDashoffset = 0;
          }
          else {
            path.style.strokeDashoffset = segLength - remaining;
          }

          remaining -= segLength;
        });
      }
    });
  }

  build();

  window.addEventListener("resize", () => {
    build();
    ScrollTrigger.refresh();
  });

}