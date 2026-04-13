import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const container = document.querySelector(".v-n-scrolly");
  if (!container) return;

  const steps = container.querySelectorAll(".step");
  const backgrounds = container.querySelectorAll(".bg-item");

  let currentBg = -1;

  // 👉 CONFIG
  const config = {
    fadeIn: 0.8,
    fadeOut: 0.3,
    start: "top center",
    end: "bottom center",
  };

  gsap.set(backgrounds, { opacity: 0 });

  steps.forEach((step) => {
    const bgIndex = parseInt(step.dataset.bg);

    ScrollTrigger.create({
      trigger: step,
      start: config.start,
      end: config.end,

      onEnter: () => {
        setActiveStep(step);
        setBackground(bgIndex);
      },

      onEnterBack: () => {
        setActiveStep(step);
        setBackground(bgIndex);
      },
    });
  });

  function setBackground(index) {
    if (index === currentBg) return;

    const nextBg = backgrounds[index];
    const prevBg = backgrounds[currentBg];

    gsap.killTweensOf(backgrounds);

    if (prevBg) {
      prevBg.classList.remove("is-active");

      gsap.to(prevBg, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
      });

      const video = prevBg.querySelector("video");
      if (video) video.pause();
    }

    if (nextBg) {
      nextBg.classList.add("is-active");

      gsap.fromTo(
        nextBg,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        }
      );

      const video = nextBg.querySelector("video");
      if (video) video.play();
    }

    currentBg = index;
  }

  function setActiveStep(activeStep) {
    steps.forEach((step) => step.classList.remove("is-active"));
    activeStep.classList.add("is-active");
  }

  function updateInitialState() {
    let activeStep = null;

    steps.forEach((step) => {
      const rect = step.getBoundingClientRect();

      if (
        rect.top <= window.innerHeight / 2 &&
        rect.bottom >= window.innerHeight / 2
      ) {
        activeStep = step;
      }
    });

    if (activeStep) {
      setActiveStep(activeStep);
      setBackground(parseInt(activeStep.dataset.bg));
    } else {
      const first = steps[0];
      if (first) {
        setActiveStep(first);
        setBackground(parseInt(first.dataset.bg));
      }
    }
  }

  ScrollTrigger.refresh();
  updateInitialState();

  ScrollTrigger.addEventListener("refresh", updateInitialState);

  return () => {
    ScrollTrigger.getAll().forEach((st) => st.kill());
  };
}