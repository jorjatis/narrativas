import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const containers = document.querySelectorAll(".v-n-scrolly");
  if (!containers.length) return;

  containers.forEach((container) => {
    const steps = container.querySelectorAll(".step");
    const backgrounds = container.querySelectorAll(".bg-item");
    const scrollButtons = container.querySelectorAll("[data-scroll-bg]");

    let currentBg = -1;

    const config = {
      fadeIn: 0.8,
      fadeOut: 0.4,
      start: "top bottom",
      end: "+=100%"
    };

    gsap.set(backgrounds, { opacity: 0 });

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

      scrollButtons.forEach((button) => {
        button.classList.toggle(
          "is-active",
          parseInt(button.dataset.scrollBg) === index
        );
      });
    }

    function setActiveStep(activeStep) {
      steps.forEach((step) => step.classList.remove("is-active"));
      activeStep.classList.add("is-active");
    }

    scrollButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const bgIndex = parseInt(button.dataset.scrollBg);
        const targetStep = container.querySelector(`.step[data-bg="${bgIndex}"]`);
        
        if (!targetStep) return;

        const y = window.scrollY + targetStep.getBoundingClientRect().top - (window.innerHeight / 2) + 5;

        window.scrollTo({
          top: y,
          behavior: "instant"
        });
      });
    });

    let initialized = false;

    function updateInitialState() {
      if (initialized) return;

      let stepToActivate = null;
      const vCenter = window.innerHeight / 2;

      steps.forEach((step) => {
        const rect = step.getBoundingClientRect();
        if (rect.top <= vCenter && rect.bottom >= vCenter) {
          stepToActivate = step;
        }
      });

      if (!stepToActivate) {
        stepToActivate = steps[0];
      }

      if (stepToActivate) {
        setActiveStep(stepToActivate);
        setBackground(parseInt(stepToActivate.dataset.bg), true);
      }

      initialized = true;
    }

    steps.forEach((step) => {
      const bgIndex = parseInt(step.dataset.bg);

      ScrollTrigger.create({
        trigger: step,
        start: config.start,
        end: config.end,
        onToggle: (self) => {
          if (self.isActive) {
            setActiveStep(step);
            setBackground(bgIndex);
          }
        }
      });
    });

    updateInitialState();

    ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      onRefresh: () => updateInitialState()
    });
  });
}