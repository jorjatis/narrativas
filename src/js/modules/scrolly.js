import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const container = document.querySelector(".v-n-scrolly");
  if (!container) return;

  const steps = container.querySelectorAll(".step");
  const backgrounds = container.querySelectorAll(".bg-item");

  let currentBg = -1;

  const config = {
    fadeIn: 0.8,
    fadeOut: 0.4,
    start: "top center",
    end: "bottom center",
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
  }

  function setActiveStep(activeStep) {
    steps.forEach((step) => step.classList.remove("is-active"));
    activeStep.classList.add("is-active");
  }

  function updateInitialState() {
    let stepToActivate = null;
    const vCenter = window.innerHeight / 2;
    
    steps.forEach((step) => {
      const rect = step.getBoundingClientRect();
      if (rect.top <= vCenter && rect.bottom >= vCenter) {
        stepToActivate = step;
      }
    });

    if (!stepToActivate) {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollY > maxScroll / 2) {
        stepToActivate = steps[steps.length - 1];
      } else {
        stepToActivate = steps[0];
      }
    }

    if (stepToActivate) {
      setActiveStep(stepToActivate);
      setBackground(parseInt(stepToActivate.dataset.bg), true);
    }
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

  ScrollTrigger.addEventListener("refresh", updateInitialState);

  return () => {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    ScrollTrigger.removeEventListener("refresh", updateInitialState);
  };
}