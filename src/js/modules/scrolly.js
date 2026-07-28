import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function getStickyOffset(container) {
  const sticky = container.querySelector(".v-n-scrolly__sticky");
  if (!sticky) return 0;
  const top = parseFloat(getComputedStyle(sticky).top);
  return Number.isFinite(top) ? top : 0;
}

export default function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const containers = document.querySelectorAll(".v-n-scrolly");
  if (!containers.length) return;

  containers.forEach((container) => {
    const steps = [...container.querySelectorAll(".step")];
    const backgrounds = container.querySelectorAll(".bg-item");
    const sticky = container.querySelector(".v-n-scrolly__sticky");
    const overlaySteps = container.classList.contains("v-n-ss");
    const stickyOffset = overlaySteps ? getStickyOffset(container) : 0;
    // El comportamiento es el mismo en todos los anchos; solo cambia la
    // posición de la cartela (mobile centrada / desktop ≥699 a la derecha).
    const mobileMq = window.matchMedia("(max-width: 698px)");

    let currentBg = -1;
    let currentStepIndex = -1;
    let stepTriggers = [];
    let morphing = false;
    let morphPairKey = null;
    let lastMorphProgress = -1;
    let lastMorphVideoSide = -1;

    const config = {
      fadeIn: 0.8,
      fadeOut: 0.4,
      start: "top center",
      end: "bottom center",
    };

    gsap.set(backgrounds, { opacity: 0 });

    function isStickyStuck() {
      if (!overlaySteps || !sticky) return true;
      return sticky.getBoundingClientRect().top <= stickyOffset + 1;
    }

    function getStepTrigger(step) {
      if (overlaySteps) {
        return step.querySelector(".step__c") || step;
      }
      return step;
    }

    // Modelo unificado (mobile y desktop): un step está activo desde que su
    // cartela aparece por abajo hasta que aparece la del step siguiente.
    function getActiveOverlayStep() {
      const vh = window.innerHeight;
      let active = null;

      steps.forEach((step, index) => {
        const rect = getStepTrigger(step).getBoundingClientRect();
        const next = steps[index + 1];
        const nextRect = next ? getStepTrigger(next).getBoundingClientRect() : null;

        if (index === 0) {
          const nextAppeared = nextRect ? nextRect.top < vh : false;
          if (rect.bottom > 0 && !nextAppeared) active = step;
          return;
        }

        const appeared = rect.top < vh;
        const nextAppeared = nextRect ? nextRect.top < vh : false;
        if (appeared && rect.bottom > 0 && !nextAppeared) active = step;
      });

      return active;
    }

    function getActiveStepFromTriggers() {
      if (!overlaySteps) {
        const y = window.innerHeight / 2;
        let match = null;
        steps.forEach((step) => {
          const rect = getStepTrigger(step).getBoundingClientRect();
          if (rect.top <= y && rect.bottom >= y) match = step;
        });
        return match;
      }

      return getActiveOverlayStep();
    }

    function setBackground(index, immediate = false) {
      if (index < 0) return;
      // Tras un morph, hay que asentar opacidades aunque el índice coincida
      if (!morphing && index === currentBg) return;

      morphing = false;
      morphPairKey = null;
      lastMorphProgress = -1;
      lastMorphVideoSide = -1;

      const nextBg = backgrounds[index];
      const otherBgs = Array.from(backgrounds).filter((_, i) => i !== index);

      backgrounds.forEach((bg, i) => {
        // Limpia opacidades inline del morph scrubbed
        bg.style.opacity = "";
        if (i !== index) {
          bg.classList.remove("is-active");
          const video = bg.querySelector("video");
          if (video) video.pause();
        }
      });

      gsap.to(otherBgs, {
        opacity: 0,
        duration: immediate ? 0 : config.fadeOut,
        ease: "power1.out",
        overwrite: true
      });

      if (nextBg) {
        nextBg.classList.add("is-active");
        const video = nextBg.querySelector("video");
        if (video) video.play().catch(() => {});

        gsap.to(nextBg, {
          opacity: 1,
          duration: immediate ? 0 : config.fadeIn,
          ease: "power2.out",
          overwrite: true
        });
      }

      currentBg = index;
    }

    // data-bg-morph="true" (o vacío): inicia un morph multi-step.
    // data-bg-morph="1": destino explícito (también puede abarcar varios
    // steps con el mismo data-bg hasta llegar al destino).
    function hasMorphAttr(step) {
      return step.dataset.bgMorph != null && step.dataset.bgMorph !== "false";
    }

    function resolveMorph(activeStep) {
      const idx = steps.indexOf(activeStep);
      if (idx < 0) return null;

      for (let s = 0; s < steps.length; s += 1) {
        if (!hasMorphAttr(steps[s])) continue;

        const fromBg = parseInt(steps[s].dataset.bg, 10);
        if (!Number.isFinite(fromBg)) continue;

        // Tramo con el mismo data-bg a partir del step que inicia el morph
        let end = s;
        while (
          end + 1 < steps.length
          && parseInt(steps[end + 1].dataset.bg, 10) === fromBg
        ) {
          end += 1;
        }

        let toBg = parseInt(steps[s].dataset.bgMorph, 10);
        if (!Number.isFinite(toBg)) {
          if (end + 1 >= steps.length) continue;
          toBg = parseInt(steps[end + 1].dataset.bg, 10);
        }

        if (!Number.isFinite(toBg) || toBg === fromBg) continue;

        // Dentro del tramo de origen → fundido scrubbed
        if (idx >= s && idx <= end) {
          return { fromBg, toBg, startIdx: s, endIdx: end, phase: "scrub" };
        }

        // Ya en el fondo destino (o steps posteriores con ese bg)
        if (idx > end && parseInt(activeStep.dataset.bg, 10) === toBg) {
          return { fromBg, toBg, startIdx: s, endIdx: end, phase: "done" };
        }
      }

      return null;
    }

    // Métricas estables del morph (se invalidan en refresh/resize).
    // Empieza al pinear (progress 0 → opacities 1/0) y termina cuando
    // sale la última cartela del tramo con el mismo data-bg.
    const morphMetrics = new Map();

    function invalidateMorphMetrics() {
      morphMetrics.clear();
    }

    function getMorphMetrics(startIdx, endIdx) {
      const key = `${startIdx}:${endIdx}`;
      let metrics = morphMetrics.get(key);
      if (metrics) return metrics;

      const last = getStepTrigger(steps[endIdx]);
      const lastRect = last.getBoundingClientRect();
      const lastBottom = lastRect.top + window.scrollY + lastRect.height;

      // Inicio = momento en que el sticky se fija (no cuando la cartela
      // entra por abajo: con margin negativo ya estaría a medias).
      const containerTop = container.getBoundingClientRect().top + window.scrollY;
      const startScroll = containerTop - stickyOffset;
      const endScroll = lastBottom;
      const span = Math.max(1, endScroll - startScroll);

      metrics = { startScroll, endScroll, span };
      morphMetrics.set(key, metrics);
      return metrics;
    }

    function getMorphProgressForRange(startIdx, endIdx) {
      const { startScroll, span } = getMorphMetrics(startIdx, endIdx);
      return gsap.utils.clamp(0, 1, (window.scrollY - startScroll) / span);
    }

    function applyMorphBackground(fromIndex, toIndex, progress) {
      if (fromIndex < 0 || toIndex < 0) return;

      const fromBg = backgrounds[fromIndex];
      const toBg = backgrounds[toIndex];
      if (!fromBg || !toBg) return;

      // Evita writes inútiles (menos jank al scrollear)
      const rounded = Math.round(progress * 1000) / 1000;
      const pairKey = `${fromIndex}:${toIndex}`;
      if (pairKey === morphPairKey && rounded === lastMorphProgress) return;

      morphing = true;

      if (pairKey !== morphPairKey) {
        morphPairKey = pairKey;
        lastMorphVideoSide = -1;
        gsap.killTweensOf(backgrounds);

        backgrounds.forEach((bg, i) => {
          const isPair = i === fromIndex || i === toIndex;
          bg.classList.toggle("is-active", isPair);
          if (!isPair) {
            const video = bg.querySelector("video");
            if (video) video.pause();
            bg.style.opacity = "0";
          }
        });
      }

      // Escritura directa: más barata que gsap.set en cada frame
      fromBg.style.opacity = String(1 - rounded);
      toBg.style.opacity = String(rounded);
      lastMorphProgress = rounded;

      const videoSide = rounded < 0.5 ? 0 : 1;
      if (videoSide !== lastMorphVideoSide) {
        lastMorphVideoSide = videoSide;
        const fromVideo = fromBg.querySelector("video");
        const toVideo = toBg.querySelector("video");
        if (videoSide === 0) {
          if (toVideo) toVideo.pause();
          if (fromVideo) fromVideo.play().catch(() => {});
        } else {
          if (fromVideo) fromVideo.pause();
          if (toVideo) toVideo.play().catch(() => {});
        }
      }

      currentBg = rounded >= 1 ? toIndex : fromIndex;
    }

    // Aplica el fondo del step activo. Si forma parte de un morph
    // (data-bg-morph), funde poco a poco a lo largo de varios steps.
    function updateBackgrounds({ immediate = false } = {}) {
      const step = steps[currentStepIndex] || getActiveStepFromTriggers();
      if (!step) return;

      const morph = resolveMorph(step);

      if (!morph) {
        morphPairKey = null;
        lastMorphProgress = -1;
        setBackground(parseInt(step.dataset.bg, 10), immediate || morphing);
        return;
      }

      if (morph.phase === "done") {
        morphPairKey = null;
        lastMorphProgress = -1;
        setBackground(morph.toBg, immediate || morphing);
        return;
      }

      applyMorphBackground(
        morph.fromBg,
        morph.toBg,
        getMorphProgressForRange(morph.startIdx, morph.endIdx)
      );
    }

    function setActiveStep(activeStep, { immediate = false } = {}) {
      const index = steps.indexOf(activeStep);
      if (index === currentStepIndex && activeStep.classList.contains("is-active")) {
        return;
      }

      steps.forEach((step) => step.classList.remove("is-active"));
      activeStep.classList.add("is-active");
      currentStepIndex = index;

      container.dispatchEvent(
        new CustomEvent("scrolly:step", {
          bubbles: true,
          detail: {
            step: activeStep,
            index,
            bg: parseInt(activeStep.dataset.bg, 10),
            bgMorph: activeStep.dataset.bgMorph ?? null,
            immediate,
          },
        })
      );
    }

    function activateStep(step, { immediate = false } = {}) {
      if (!step) return;
      setActiveStep(step, { immediate });
      updateBackgrounds({ immediate });
    }

    function activateCurrentStep({ immediate = false } = {}) {
      const step = getActiveStepFromTriggers() || (isStickyStuck() ? steps[0] : null);
      activateStep(step, { immediate });
    }

    // Activación en modo overlay calculada con las posiciones REALES de las
    // cartelas en cada scroll (no con posiciones cacheadas por ScrollTrigger,
    // que se desfasan cuando el contenedor crece por imágenes/contenido que
    // cargan tarde). Se invoca desde un listener de scroll propio, así siempre
    // se dispara aunque el layout cambie después de inicializar.
    function syncOverlayActive() {
      if (!overlaySteps) return;
      if (!isStickyStuck()) return;
      const step = getActiveOverlayStep();
      if (step) setActiveStep(step);

      // Actualizar fondos aunque no haya cartela activa (huecos entre steps):
      // el morph debe seguir progresando y no quedarse congelado.
      if (step || currentStepIndex >= 0) {
        updateBackgrounds();
      }
    }

    function killStepTriggers() {
      stepTriggers.forEach((st) => st.kill());
      stepTriggers = [];
    }

    function createStepTriggers() {
      killStepTriggers();

      if (!overlaySteps) {
        steps.forEach((step) => {
          stepTriggers.push(
            ScrollTrigger.create({
              trigger: getStepTrigger(step),
              start: config.start,
              end: config.end,
              onToggle: (self) => {
                if (!self.isActive) return;
                activateStep(step);
              }
            })
          );
        });
        return;
      }

      // Modo overlay: la activación NO usa triggers por-step de ScrollTrigger
      // (sus posiciones se desfasan). Se gestiona con un listener de scroll
      // propio (ver más abajo) que llama a syncOverlayActive con las posiciones
      // reales de las cartelas. Aquí no hay que crear nada.
    }

    let initialized = false;

    function updateInitialState() {
      if (initialized) return;

      if (overlaySteps && !isStickyStuck()) {
        if (backgrounds[0]) {
          gsap.set(backgrounds[0], { opacity: 1 });
          backgrounds[0].classList.add("is-active");
          currentBg = 0;
        }
      } else {
        activateCurrentStep({ immediate: true });
      }

      initialized = true;
    }

    createStepTriggers();

    if (overlaySteps && sticky) {
      ScrollTrigger.create({
        trigger: sticky,
        start: `top top+=${stickyOffset}`,
        onEnter: () => activateCurrentStep(),
        onEnterBack: () => activateCurrentStep(),
      });
    }

    updateInitialState();

    // Overlay: listener de scroll propio (throttle con rAF) para activar el
    // step correcto en cada momento. Es robusto ante cambios de layout
    // posteriores (imágenes/contenido que cargan tarde y agrandan el bloque),
    // a diferencia de un onUpdate de ScrollTrigger con rango cacheado.
    if (overlaySteps) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          syncOverlayActive();
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      ScrollTrigger.addEventListener("refresh", () => {
        invalidateMorphMetrics();
        syncOverlayActive();
      });
    }

    ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      onRefresh: () => {
        invalidateMorphMetrics();
        updateInitialState();
      }
    });

    const onBreakpointChange = () => {
      invalidateMorphMetrics();
      createStepTriggers();
      ScrollTrigger.refresh();
      if (isStickyStuck()) activateCurrentStep({ immediate: true });
    };

    if (typeof mobileMq.addEventListener === "function") {
      mobileMq.addEventListener("change", onBreakpointChange);
    } else {
      mobileMq.addListener(onBreakpointChange);
    }
  });
}
