import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initAudioPlayer } from "./audio-player";
import { motionDuration, scrollBehavior } from "../helpers/prefersReducedMotion";

const audioProgressStore = new Map();

function scrollToStep(step, scroller) {
  const behavior = scrollBehavior();

  if (scroller === window) {
    step.scrollIntoView({ behavior, block: "center" });
    return;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const stepRect = step.getBoundingClientRect();
  const offset =
    stepRect.top -
    scrollerRect.top -
    scroller.clientHeight / 2 +
    stepRect.height / 2;

  scroller.scrollTo({
    top: scroller.scrollTop + offset,
    behavior
  });
}

function getScopeId(container) {
  if (container.dataset.scrollyId) {
    return container.dataset.scrollyId;
  }

  const modal = container.closest(".episodes-modal");

  if (modal?.dataset.episode) {
    return `episode-${modal.dataset.episode}`;
  }

  return `scrolly-${Math.random().toString(36).slice(2, 9)}`;
}

function initScrollyContainer(container) {
  const steps = [...container.querySelectorAll(".step")];
  const backgrounds = [...container.querySelectorAll(".bg-item")];
  const bullets = [...container.querySelectorAll(".pagination button")];
  const scroller = container.closest(".v-n-scrolly-scroller") || window;
  const scopeId = getScopeId(container);

  const triggers = [];
  let currentBg = -1;
  let activeStepIndex = -1;
  let activePlayer = null;
  let onStepChange = null;

  const audioPlayers = new Map();

  steps.forEach((step) => {
    const playerRoot = step.querySelector("[data-audio-player]");

    if (playerRoot) {
      const player = initAudioPlayer(playerRoot);
      const stepIndex = Number(step.dataset.step);

      if (player) {
        audioPlayers.set(stepIndex, player);
      }
    }
  });

  const hasAudio = audioPlayers.size > 0;

  gsap.set(backgrounds, { opacity: 0 });

  function progressKey(stepIndex) {
    return `${scopeId}-${stepIndex}`;
  }

  function saveStepProgress(stepIndex) {
    const player = audioPlayers.get(stepIndex);

    if (!player) return;

    audioProgressStore.set(progressKey(stepIndex), player.getCurrentTime());
  }

  function pauseActiveAudio() {
    if (activePlayer) {
      saveStepProgress(activeStepIndex);
      activePlayer.pause();
      activePlayer = null;
    }
  }

  function playStepAudio(stepIndex) {
    if (!hasAudio) return;

    const player = audioPlayers.get(stepIndex);

    if (!player) return;

    if (activePlayer && activePlayer !== player) {
      pauseActiveAudio();
    }

    const savedTime = audioProgressStore.get(progressKey(stepIndex)) || 0;

    player.setCurrentTime(savedTime);
    player.play();
    activePlayer = player;
    activeStepIndex = stepIndex;
  }

  function setBackground(index, immediate = false) {
    if (currentBg === index) return;

    backgrounds.forEach((bg, i) => {
      bg.classList.toggle("is-active", i === index);

      gsap.to(bg, {
        opacity: i === index ? 1 : 0,
        duration: immediate ? 0 : motionDuration(0.5),
        overwrite: true
      });
    });

    currentBg = index;
  }

  function setActiveStep(step) {
    steps.forEach((s) => s.classList.remove("is-active"));
    step.classList.add("is-active");

    const index = Number(step.dataset.step);

    bullets.forEach((bullet, bulletIndex) => {
      const isActive = bulletIndex === index;

      bullet.classList.toggle("is-active", isActive);

      if (isActive) {
        bullet.setAttribute("aria-current", "true");
      } else {
        bullet.removeAttribute("aria-current");
      }
    });

    if (onStepChange) {
      onStepChange(step, index);
    }
  }

  function handleStepEnter(step) {
    const index = Number(step.dataset.step);

    setActiveStep(step);
    setBackground(Number(step.dataset.bg));
    playStepAudio(index);
  }

  function handleStepLeave(step) {
    const index = Number(step.dataset.step);

    if (activeStepIndex === index) {
      saveStepProgress(index);
      pauseActiveAudio();
      activeStepIndex = -1;
    }
  }

  steps.forEach((step) => {
    const trigger = ScrollTrigger.create({
      trigger: step,
      scroller,
      start: "top center",
      end: "bottom center",
      onEnter: () => handleStepEnter(step),
      onEnterBack: () => handleStepEnter(step),
      onLeave: () => handleStepLeave(step),
      onLeaveBack: () => handleStepLeave(step)
    });

    triggers.push(trigger);
  });

  const first = steps[0];

  if (first) {
    setActiveStep(first);
    setBackground(Number(first.dataset.bg), true);
  }

  if (bullets.length) {
    bullets.forEach((bullet, index) => {
      bullet.addEventListener("click", () => {
        if (steps[index]) {
          scrollToStep(steps[index], scroller);
        }
      });
    });
  }

  return {
    container,
    scopeId,

    refresh() {
      ScrollTrigger.refresh();
    },

    destroy() {
      pauseActiveAudio();
      triggers.forEach((trigger) => trigger.kill());
    },

    resetAudio() {
      pauseActiveAudio();

      audioPlayers.forEach((_, stepIndex) => {
        audioProgressStore.delete(progressKey(stepIndex));
      });

      audioPlayers.forEach((player) => {
        player.setCurrentTime(0);
        player.pause();
      });

      activeStepIndex = -1;
    },

    setOnStepChange(fn) {
      onStepChange = fn;
    }
  };
}

export default function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const containers = document.querySelectorAll(".v-n-scrolly");
  const instances = new Map();

  if (!containers.length) return instances;

  containers.forEach((container) => {
    const instance = initScrollyContainer(container);
    instances.set(instance.scopeId, instance);
  });

  return instances;
}

export function getScrollyInstance(instances, episodeId) {
  return instances.get(`episode-${episodeId}`);
}
