console.log('narrativa version: 210');

(function () {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    console.warn("GSAP o ScrollTrigger no están disponibles.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  function initMoveEls() {
    const gridDoctors = document.querySelector('.grid-doctors');
    const lifelineMobile = document.querySelector('.lifeline-mobile');
    const vAth = document.querySelector('.v-ath.v-ath--t1');

    if (vAth) {
      if (gridDoctors) {
        vAth.parentNode.insertBefore(gridDoctors, vAth);
      }

      if (lifelineMobile) {
        vAth.after(lifelineMobile);
      }
    }
  }

  function initDoctorsAnim() {
    const doctorCards = document.querySelectorAll('.doctor-card');

    if (doctorCards.length > 0) {
      gsap.from(doctorCards, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".grid-doctors__g",
          start: "top 70%",
          toggleActions: "play none none none"
        }
      });
    }
  }

  function initTypewriterBusca() {
    const groups = document.querySelectorAll(".busca-w");
    if (!groups.length) return;

    groups.forEach((group) => {
      let groupSequence = Promise.resolve();
      const buscas = group.querySelectorAll(".busca");

      buscas.forEach((busca) => {
        if (busca.dataset.typewriterInit) return;
        busca.dataset.typewriterInit = "true";

        const timeEl = busca.querySelector(".busca__time");
        const textEl = busca.querySelector(".busca__txt");
        const typedContainer = busca.querySelector(".busca__typed");

        if (!timeEl || !textEl || !typedContainer) return;

        const fullTime = timeEl.dataset.text || "";
        const fullText = textEl.dataset.text || "";
        const speed = 5;

        gsap.set(busca, { opacity: 0, x: -60 });
        timeEl.textContent = "";
        typedContainer.textContent = "";

        const runTypewriter = () => {
          return new Promise((resolve) => {
            let i = 0;
            function typeTime() {
              if (i < fullTime.length) {
                timeEl.textContent += fullTime[i++];
                setTimeout(typeTime, speed);
              } else {
                i = 0;
                setTimeout(typeText, 5);
              }
            }
            function typeText() {
              if (i < fullText.length) {
                typedContainer.textContent += fullText[i++];
                setTimeout(typeText, speed);
              } else {
                resolve(); 
              }
            }
            typeTime();
          });
        };

        ScrollTrigger.create({
          trigger: busca,
          start: "top 80%",
          once: true,
          onEnter: () => {
            groupSequence = groupSequence.then(() => {
              return new Promise((resolveInner) => {
                gsap.to(busca, {
                  opacity: 1,
                  x: 0,
                  duration: 0.5,
                  ease: "power3.out",
                  onComplete: () => {
                    runTypewriter().then(resolveInner);
                  }
                });
              });
            });
          }
        });
      });
    });
  }

  function initLinesTitle() {
    const headingTitle = document.querySelector('.v-a--d-s-1');
    if (!headingTitle) return;

    const allLines = document.querySelectorAll('.lines-title');
    allLines.forEach(line => headingTitle.appendChild(line));

    /**
     * Prepara el path para la animación.
     * Usamos siempre valores positivos para máxima compatibilidad con iOS/Safari.
     */
    function preparePath(path) {
        if (!path) return;
        const length = path.getTotalLength();

        // Configuramos el estado inicial: todo el trazo oculto "fuera"
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        // Pasamos el valor al CSS
        path.style.setProperty('--path-length', length);
    }

    /**
     * Maneja la secuencia de animación: primero Izquierda, luego Derecha.
     */
    function animatePair(leftPath, rightPath) {
        if (!leftPath || !rightPath) return;

        preparePath(leftPath);
        preparePath(rightPath);

        // Iniciar primera animación
        leftPath.classList.add('drawLeft');

        // Escuchar el final de la primera para empezar la segunda
        leftPath.addEventListener('animationend', () => {
            rightPath.classList.add('drawRight');
            
            rightPath.addEventListener('animationend', () => {
                console.log("Secuencia de líneas completada.");
            }, { once: true });
            
        }, { once: true });
    }

    // Seleccionar paths de Desktop
    const desktopLeft = document.querySelector('.lines-title.is-left.is-desktop svg path');
    const desktopRight = document.querySelector('.lines-title.is-right.is-desktop svg path');

    // Seleccionar paths de Mobile
    const mobileLeft = document.querySelector('.lines-title.is-left.is-mobile svg path');
    const mobileRight = document.querySelector('.lines-title.is-right.is-mobile svg path');

    // Ejecutar animaciones si los elementos existen
    if (desktopLeft && desktopRight) {
        animatePair(desktopLeft, desktopRight);
    }

    if (mobileLeft && mobileRight) {
        animatePair(mobileLeft, mobileRight);
    }
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', initLinesTitle);

  function initClockHeading() {
    const clocks = document.querySelectorAll(".clock-heading");
    if (!clocks.length) return;

    clocks.forEach((clock) => {

      const clockFace = clock.querySelector(".clock-heading__time-clock");
      const timeTxt = clock.querySelector(".clock-heading__time-txt");

      if (!clockFace || !timeTxt) return;

      const time = timeTxt.textContent.trim();
      const [hoursRaw, minutesRaw] = time.split(":");

      let hours = parseInt(hoursRaw, 10);
      const minutes = parseInt(minutesRaw, 10);

      hours = hours % 12;

      const minuteDeg = minutes * 6;
      const hourDeg = (hours * 30) + (minutes * 0.5);

      ScrollTrigger.create({
        trigger: clock,
        start: "top 50%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(clockFace, {
            "--minute-rotate": minuteDeg + "deg",
            duration: 0.45,
            ease: "linear",
            autoRound: false
          }).to(clockFace, {
            "--hour-rotate": hourDeg + "deg",
            duration: 0.45,
            ease: "linear",
            autoRound: false
          }, 0);
        }
      });
    });
  }

  function initLifelineDesktop() {
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

    let startEl = paywall;
    const last = paywall.lastElementChild;
    const endEl = last ? last.previousElementSibling : null;

    if (!svg || !content || !startEl || !endEl) return;

    const SEGMENT_HEIGHT = 199;
    const MIN_SEGMENTS = 3;

    function build() {
      content.innerHTML = "";
      const startY = startEl.getBoundingClientRect().top + window.scrollY;
      const endY = endEl.getBoundingClientRect().top + window.scrollY;
      const totalHeight = endY - startY;

      svg.setAttribute("viewBox", `0 0 65 ${totalHeight}`);

      const markers = [
        ...document.querySelectorAll(".lowLifeline, .mediumLifeline, .highLifeline")
      ].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

      let currentY = 0;

      function addWave(type) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", PATHS[type]);
        path.setAttribute("transform", `translate(0, ${currentY})`);
        path.classList.add(`line-${type}`);
        content.appendChild(path);
        currentY += SEGMENT_HEIGHT;
      }

      function fillUntil(targetY, type) {
        while (currentY + SEGMENT_HEIGHT <= targetY) {
          addWave(type);
        }
      }

      let currentType = "low";

      markers.forEach((marker) => {
        const markerY = marker.getBoundingClientRect().top + window.scrollY - startY;

        fillUntil(markerY, currentType);

        if (marker.classList.contains("highLifeline")) {
          currentType = "high";
        } else if (marker.classList.contains("mediumLifeline")) {
          currentType = "medium";
        } else {
          currentType = "low";
        }

        for (let i = 0; i < MIN_SEGMENTS; i++) {
          if (currentY + SEGMENT_HEIGHT <= totalHeight) {
            addWave(currentType);
          }
        }
      });

      fillUntil(totalHeight, currentType);
    }

    build();
  }

  function initLifelineMobile() {
    if (window.innerWidth >= 1025) return;

    const strip = document.querySelector('.lifeline-strip');
    if (!strip) return;

    const PATHS = {
      high: `M0 19.0h39.11c.09 0 .16-.06.19-.14l4.19-13.45c.06-.2.35-.18.39.02l3.45 19.36c.14.81 1.32.77 1.4-.05l3.75-22.13c.04-.23.36-.22.4 0l3.7 26.95c.08.85 1.31.87 1.41.02L61.5 1.17c.03-.23.36-.24.4 0l4.11 23.97c.04.21.33.23.39.03l2.95-9.44c.55-1.3 2.32-1.47 3.11-.29l2.6 3.9c.04.06.1.09.17.09h41.06`,
      medium: `M0 19.0h15.33c.08 0 .16-.05.19-.13l4.96-13.07c.07-.18.32-.17.38 0l9.13 26.75c.06.18.32.18.38 0l4.69-13.43c.03-.08.1-.13.19-.13h13.51c.05 0 .1-.02.14-.06l3.65-3.7c.08-.08.21-.08.28 0l3.69 3.7s.09.06.14.06h7.07s.07-.01.11-.03l2.35-1.48c.07-.04.16-.04.22 0l1.42 1c.47.33 1.03.51 1.61.51h14.08c.08 0 .16-.05.19-.13l4.96-13.07c.07-.18.32-.17.38 0l9.13 26.75c.06.18.32.18.38 0l4.69-13.43c.03-.08.1-.13.19-.13h12.85`,
      low: `M0 19.0h50.18c.05 0 .1-.02.14-.06l3.65-3.7c.08-.08.21-.08.28 0l3.69 3.7s.09.06.14.06h7.07s.07-.01.11-.03l2.35-1.48c.07-.04.16-.04.22 0l1.42 1c.47.33 1.03.51 1.61.51h45.4`
    };

    const WIDTH = 116.27;

    strip.innerHTML = `
    <svg width="100%" height="45" preserveAspectRatio="none">
      <defs>
        <pattern id="lifelinePattern" x="0" y="0" width="${WIDTH}" height="45" patternUnits="userSpaceOnUse">
          <path id="dynamicPath" d="${PATHS.low}" fill="none" stroke="#1d1d1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </pattern>
      </defs>
      <rect width="100%" height="45" fill="url(#lifelinePattern)" />
    </svg>
  `;

    const pattern = strip.querySelector('#lifelinePattern');
    const path = strip.querySelector('#dynamicPath');

    let xPos = 0;
    const SPEED = 1.5;

    gsap.ticker.add(() => {
      xPos -= SPEED;
      pattern.setAttribute('x', xPos % WIDTH);
    });

    const markers = Array.from(document.querySelectorAll('.mediumLifeline, .highLifeline, .lowLifeline'))
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    markers.forEach(marker => {
      ScrollTrigger.create({
        trigger: marker,
        start: "top center",
        onEnter: () => updatePath(marker),
        onEnterBack: () => updatePath(marker)
      });
    });

    function updatePath(marker) {
      let type = "low";
      if (marker.classList.contains('highLifeline')) type = "high";
      else if (marker.classList.contains('mediumLifeline')) type = "medium";

      path.setAttribute('d', PATHS[type]);
    }
  }

  function initClockBox() {

    ScrollTrigger.matchMedia({
      /*
      ==========================================================
      DESKTOP
      ==========================================================
      */
      "(min-width: 1025px)": function () {
        const timerBoxes = document.querySelectorAll('.timer.is-desktop');
        if (!timerBoxes.length) return;

        timerBoxes.forEach(timerBox => {
          if (timerBox.dataset.initialized) return;
          timerBox.dataset.initialized = "true";

          const startStr = timerBox.getAttribute('data-time-start');
          const endStr = timerBox.getAttribute('data-time-spin');
          if (!startStr || !endStr) return;

          const frontFace = timerBox.querySelector('.timer-front');
          if (!frontFace) return;

          const digitHeight = 24;
          const columnsToAnimate = [];
          frontFace.innerHTML = '';

          for (let i = 0; i < startStr.length; i++) {
            const sChar = startStr[i];
            const eChar = endStr[i];

            if (sChar === ':') {
              const colon = document.createElement('div');
              colon.className = 'colon';
              colon.innerText = ':';
              frontFace.appendChild(colon);
              continue;
            }

            const wrap = document.createElement('div');
            wrap.className = 'digit-wrap';
            const strip = document.createElement('div');
            strip.className = 'digit-strip';

            if (sChar === eChar) {
              strip.innerHTML = `<div class="digit">${sChar}</div>`;
            } else {
              // Lógica de límites: 
              // Posición 0: Decenas de hora (máx 2)
              // Posición 3: Decenas de minuto (máx 5)
              let maxVal = 9;
              if (i === 0) maxVal = 2;
              if (i === 3) maxVal = 5;

              const sequence = getSpinSequence(parseInt(sChar), parseInt(eChar), maxVal);

              sequence.forEach(num => {
                const d = document.createElement('div');
                d.className = 'digit';
                d.innerText = num;
                strip.appendChild(d);
              });

              columnsToAnimate.push({
                element: strip,
                steps: sequence.length - 1
              });
            }

            wrap.appendChild(strip);
            frontFace.appendChild(wrap);
          }

          const targetColumns = columnsToAnimate.reverse();
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: timerBox,
              start: "top 70%",
              toggleActions: "play none none none",
              once: true
            }
          });

          targetColumns.forEach((col, index) => {
            tl.to(col.element, {
              y: -col.steps * digitHeight,
              duration: 1.2,
              ease: "power2.inOut"
            }, index * 0.15);
          });
        });
      },

      /*
      ==========================================================
      MOBILE
      ==========================================================
      */
      "(max-width: 1024px)": function () {
        const mobileTimer = document.querySelector('.timer.is-mobile');
        const desktopTimers = Array.from(document.querySelectorAll('.timer.is-desktop'));

        if (!mobileTimer || !desktopTimers.length) return;

        const initialTime = "00:00";
        let currentTime = initialTime;
        mobileTimer.dataset.current = initialTime;

        desktopTimers.forEach((timer, index) => {
          ScrollTrigger.create({
            trigger: timer,
            start: "top center",
            end: "bottom center",
            onEnter: () => updateMobileTimer(timer.getAttribute('data-time-spin')),
            onEnterBack: () => updateMobileTimer(timer.getAttribute('data-time-spin')),
            onLeaveBack: () => {
              if (index === 0) {
                updateMobileTimer(initialTime);
              } else {
                updateMobileTimer(desktopTimers[index - 1].getAttribute('data-time-spin'));
              }
            }
          });
        });

        function updateMobileTimer(newTime) {
          if (!newTime || newTime === currentTime) return;
          animateToTime(mobileTimer, currentTime, newTime);
          currentTime = newTime;
          mobileTimer.dataset.current = newTime;
        }
      }
    });

    /*
    ==========================================================
    FUNCIONES COMPARTIDAS
    ==========================================================
    */

    function animateToTime(timerElement, oldTime, newTime) {
      const frontFace = timerElement.querySelector('.timer-front');
      if (!frontFace) return;

      const digitHeight = 24;
      frontFace.innerHTML = '';

      for (let i = 0; i < newTime.length; i++) {
        const newChar = newTime[i];
        const oldChar = oldTime[i];

        if (newChar === ':') {
          const colon = document.createElement('div');
          colon.className = 'colon';
          colon.innerText = ':';
          frontFace.appendChild(colon);
          continue;
        }

        const wrap = document.createElement('div');
        wrap.className = 'digit-wrap';
        const strip = document.createElement('div');
        strip.className = 'digit-strip';

        let maxVal = 9;
        if (i === 0) maxVal = 2;
        if (i === 3) maxVal = 5;

        const sequence = getSpinSequence(parseInt(oldChar), parseInt(newChar), maxVal);

        sequence.forEach(num => {
          const d = document.createElement('div');
          d.className = 'digit';
          d.innerText = num;
          strip.appendChild(d);
        });

        wrap.appendChild(strip);
        frontFace.appendChild(wrap);

        gsap.to(strip, {
          y: -(sequence.length - 1) * digitHeight,
          duration: 0.8,
          ease: "power2.inOut"
        });
      }
    }

    function getSpinSequence(start, end, max) {
      let res = [start];
      let curr = start;

      // Si son iguales, no hay secuencia que generar
      if (start === end) return [start];

      while (curr !== end) {
        // El dígito aumenta y vuelve a 0 si supera su máximo (2 para horas, 5 para minutos)
        curr = (curr + 1) > max ? 0 : curr + 1;
        res.push(curr);

        // Salvaguarda para evitar bucles infinitos si los datos están mal
        if (res.length > 11) break;
      }
      return res;
    }
  }

  function initAll() {
    initMoveEls();
    initDoctorsAnim();
    initTypewriterBusca();
    initLinesTitle();
    initClockHeading();
    initLifelineDesktop();
    initLifelineMobile();
    requestAnimationFrame(() => {
      initClockBox();
    });
    ScrollTrigger.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

})();