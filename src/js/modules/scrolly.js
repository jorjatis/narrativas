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
      const nextBg = backgrounds[index];
      const otherBgs = Array.from(backgrounds).filter((_, i) => i !== index);

      backgrounds.forEach((bg, i) => {
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

    // Progreso 0→1 mientras la cartela cruza el viewport
    // (0 = entra por abajo, 1 = sale por arriba).
    function getMorphProgress(step) {
      const card = getStepTrigger(step);
      const rect = card.getBoundingClientRect();
      const vh = window.innerHeight;
      const travel = vh + rect.height;
      if (travel <= 0) return 0;
      return gsap.utils.clamp(0, 1, 1 - rect.bottom / travel);
    }

    function applyMorphBackground(fromIndex, toIndex, progress) {
      if (fromIndex < 0 || toIndex < 0) return;

      const fromBg = backgrounds[fromIndex];
      const toBg = backgrounds[toIndex];
      if (!fromBg || !toBg) return;

      morphing = true;

      backgrounds.forEach((bg, i) => {
        const isPair = i === fromIndex || i === toIndex;
        bg.classList.toggle("is-active", isPair);

        if (!isPair) {
          const video = bg.querySelector("video");
          if (video) video.pause();
          gsap.set(bg, { opacity: 0, overwrite: true });
        }
      });

      // Fundido cruzado scrubbed al scroll (sin duración)
      gsap.set(fromBg, { opacity: 1 - progress, overwrite: true });
      gsap.set(toBg, { opacity: progress, overwrite: true });

      const fromVideo = fromBg.querySelector("video");
      const toVideo = toBg.querySelector("video");
      if (progress < 0.5) {
        if (toVideo) toVideo.pause();
        if (fromVideo) fromVideo.play().catch(() => {});
      } else {
        if (fromVideo) fromVideo.pause();
        if (toVideo) toVideo.play().catch(() => {});
      }

      currentBg = progress >= 1 ? toIndex : fromIndex;
    }

    // Aplica el fondo del step activo: si tiene data-bg-morph, funde
    // data-bg → data-bg-morph según el progreso de la cartela.
    function updateBackgrounds({ immediate = false } = {}) {
      const step = steps[currentStepIndex] || getActiveStepFromTriggers();
      if (!step) return;

      const fromIndex = parseInt(step.dataset.bg, 10);
      const morphRaw = step.dataset.bgMorph;
      const toIndex = morphRaw != null ? parseInt(morphRaw, 10) : NaN;

      if (!Number.isFinite(toIndex) || toIndex === fromIndex) {
        setBackground(fromIndex, immediate || morphing);
        return;
      }

      applyMorphBackground(fromIndex, toIndex, getMorphProgress(step));
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
            bgMorph: activeStep.dataset.bgMorph != null
              ? parseInt(activeStep.dataset.bgMorph, 10)
              : null,
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
      if (!step) return;
      setActiveStep(step);
      // Siempre actualizar fondos: el morph necesita el progreso en cada frame
      updateBackgrounds();
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
      ScrollTrigger.addEventListener("refresh", syncOverlayActive);
    }

    ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      onRefresh: () => updateInitialState()
    });

    const onBreakpointChange = () => {
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
