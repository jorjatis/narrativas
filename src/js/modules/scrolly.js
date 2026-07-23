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
      if (index === currentBg || index < 0) return;

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
            immediate,
          },
        })
      );
    }

    function activateStep(step, { immediate = false } = {}) {
      if (!step) return;
      setActiveStep(step, { immediate });
      setBackground(parseInt(step.dataset.bg, 10), immediate);
    }

    function activateCurrentStep({ immediate = false } = {}) {
      const step = getActiveStepFromTriggers() || (isStickyStuck() ? steps[0] : null);
      activateStep(step, { immediate });
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

      // Modelo unificado (mobile y desktop): la 1ª cartela está activa hasta
      // que aparece la 2ª; a partir de ahí cada step se activa cuando su
      // cartela aparece por abajo (cambian fecha, título, imagen y audio).
      //
      // La activación se calcula con las posiciones REALES de las cartelas en
      // cada frame (getActiveOverlayStep), no con posiciones cacheadas por
      // ScrollTrigger, que se desfasan por el margin negativo y la carga de
      // imágenes. Así el cambio de contenido ocurre justo cuando la cartela
      // anterior ha salido y aparece la siguiente.
      const syncActiveStep = () => {
        if (!isStickyStuck()) return;
        const step = getActiveOverlayStep();
        if (step) activateStep(step);
      };

      stepTriggers.push(
        ScrollTrigger.create({
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          onUpdate: syncActiveStep,
          onRefresh: syncActiveStep,
        })
      );
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
