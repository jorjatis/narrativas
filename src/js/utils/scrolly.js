import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const containers = document.querySelectorAll(".v-n-scrolly");
  if (!containers.length) return;

  const mm = gsap.matchMedia();

  containers.forEach((container) => {
    const backgrounds = container.querySelectorAll(".bg-item");
    const scrollButtons = container.querySelectorAll("[data-scroll-bg]");

    let currentBg = -1;
    let currentState = -1;

    const config = {
      fadeIn: 0.6,
      fadeOut: 0.4,
      start: "top bottom",
      end: "+=100%"
    };

    gsap.set(backgrounds, { opacity: 0 });

    // Controla la opacidad del contenedor y activa los estados internos
    function setVisualState(bgIndex, stateIndex, immediate = false) {
      const isMobile = window.innerWidth <= 510;
      
      // A. CONTROL DEL CONTENEDOR PADRE (.bg-item)
      backgrounds.forEach((bg, i) => {
        const isTargetBg = (i === bgIndex);

        if (isTargetBg && bgIndex !== currentBg) {
          bg.classList.add("is-active");
          const video = bg.querySelector("video");
          if (video) video.play().catch(() => {});

          gsap.to(bg, {
            opacity: 1,
            duration: immediate ? 0 : config.fadeIn,
            ease: "power2.out",
            overwrite: "auto"
          });
        } else if (!isTargetBg) {
          bg.classList.remove("is-active");
          const video = bg.querySelector("video");
          if (video) video.pause();

          gsap.to(bg, {
            opacity: 0,
            duration: immediate ? 0 : config.fadeOut,
            ease: "power1.out",
            overwrite: "auto"
          });
        }

        // B. CONTROL DE LOS ESTADOS INTERNOS (ai2html)
        const children = bg.children; // [0: uno/tres, 1: dos/cuatro]
        if (children.length >= 2) {
          if (isTargetBg) {
            // Si es desktop, forzamos siempre el primer hijo (estado uno o tres)
            const activeChildIndex = isMobile ? (stateIndex - 1) : 0;
            
            children[0].classList.toggle("is-state-active", activeChildIndex === 0);
            children[1].classList.toggle("is-state-active", activeChildIndex === 1);
          } else {
            children[0].classList.remove("is-state-active");
            children[1].classList.remove("is-state-active");
          }
        }
      });

      currentBg = bgIndex;
      currentState = stateIndex;

      // Actualizar botones activos (Exterior / Interior)
      scrollButtons.forEach((button) => {
        button.classList.toggle(
          "is-active",
          parseInt(button.dataset.scrollBg) === bgIndex
        );
      });
    }

    function setActiveStep(visibleSteps, activeStep) {
      visibleSteps.forEach((step) => step.classList.remove("is-active"));
      activeStep.classList.add("is-active");
    }

    // --- CONFIGURACIÓN RESPONSIVE MEDIANTE GSAP ---
    
    // Escritorio (> 510px): Solo escucha los pasos comunes
    mm.add("(min-width: 511px)", () => {
      const steps = container.querySelectorAll(".step:not(.is-mobile-only)");
      setupTriggers(steps, false);
    });

    // Móvil (<= 510px): Escucha los 4 pasos
    mm.add("(max-width: 510px)", () => {
      const steps = container.querySelectorAll(".step");
      setupTriggers(steps, true);
    });

    function setupTriggers(visibleSteps, isMobile) {
      visibleSteps.forEach((step) => {
        const bgIndex = parseInt(step.dataset.bg);
        const stateIndex = parseInt(step.dataset.state);

        ScrollTrigger.create({
          trigger: step,
          start: config.start,
          end: config.end,
          onToggle: (self) => {
            if (self.isActive) {
              setActiveStep(visibleSteps, step);
              setVisualState(bgIndex, stateIndex);
            }
          }
        });
      });

      // Calcular e inicializar el estado actual al cargar/redimensionar
      let stepToActivate = null;
      const vCenter = window.innerHeight / 2;

      visibleSteps.forEach((step) => {
        const rect = step.getBoundingClientRect();
        if (rect.top <= vCenter && rect.bottom >= vCenter) {
          stepToActivate = step;
        }
      });

      if (!stepToActivate) stepToActivate = visibleSteps[0];

      if (stepToActivate) {
        setActiveStep(visibleSteps, stepToActivate);
        setVisualState(
          parseInt(stepToActivate.dataset.bg),
          parseInt(stepToActivate.dataset.state),
          true
        );
      }
    }

    // Comportamiento de los botones superiores al hacer click
    scrollButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const bgIndex = parseInt(button.dataset.scrollBg);
        const isMobile = window.innerWidth <= 510;

        // En móvil va al estado 1 de ese bloque, en desktop busca el paso activo que no sea móvil
        const selector = isMobile
          ? `.step[data-bg="${bgIndex}"][data-state="1"]`
          : `.step[data-bg="${bgIndex}"]:not(.is-mobile-only)`;

        const targetStep = container.querySelector(selector);
        if (!targetStep) return;

        const y = window.scrollY + targetStep.getBoundingClientRect().top - window.innerHeight;
        window.scrollTo({ top: y, behavior: "instant" });
      });
    });
  });
}