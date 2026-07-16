import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initAudioPlayer } from "./audio-player";
import { motionDuration, scrollBehavior } from "../helpers/prefersReducedMotion";

const audioProgressStore = new Map();

function measureStepScrollTopInContent(step, scroller) {
  if (!step || scroller === window) return 0;

  const stepRect = step.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();

  return Math.max(
    0,
    scroller.scrollTop +
      stepRect.top -
      scrollerRect.top -
      scroller.clientHeight / 2 +
      stepRect.height / 2
  );
}

function scrollToStep(step, scroller, behaviorOverride) {
  const behavior = behaviorOverride || scrollBehavior();

  if (scroller === window) {
    step.scrollIntoView({ behavior, block: "center" });
    return;
  }

  const targetTop = measureStepScrollTopInContent(step, scroller);

  scroller.scrollTo({
    top: targetTop,
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
  const contentSteps = [...container.querySelectorAll(".step:not(.step--end)")];
  const endStep = container.querySelector(".step--end");
  const scrollSteps = endStep ? [...contentSteps, endStep] : contentSteps;
  const backgrounds = [...container.querySelectorAll(".bg-item")];
  const replayBg = container.querySelector(".bg-item--replay");
  const replayIndex = replayBg ? backgrounds.indexOf(replayBg) : -1;
  const contentBullets = [...container.querySelectorAll(".pagination button")];
  const replayBtn = replayBg?.querySelector(".episode-replay__btn");
  const scroller = container.closest(".v-n-scrolly-scroller") || window;
  const scopeId = getScopeId(container);

  const triggers = [];
  let currentBg = -1;
  let activeStepIndex = -1;
  let activePlayer = null;
  let autoplayEnabled = false;
  let autoplayPaused = false;
  let onStepChange = null;
  let minScrollTop = 0;
  let firstStepScrollTop = null;
  let clampScrollHandler = null;
  let isProgrammaticScroll = false;

  const audioPlayers = new Map();

  contentSteps.forEach((step) => {
    const playerRoot = step.querySelector("[data-audio-player]");
    const stepIndex = Number(step.dataset.step);

    if (playerRoot) {
      const player = initAudioPlayer(playerRoot, {
        onUserPlay: () => {
          autoplayPaused = false;
          autoplayEnabled = true;

          audioPlayers.forEach((otherPlayer, otherIndex) => {
            if (otherPlayer === player) return;

            saveStepProgress(otherIndex);
            otherPlayer.pause();
          });

          activePlayer = player;
          activeStepIndex = stepIndex;

          container.dispatchEvent(
            new CustomEvent("scrolly:audio-enabled", { bubbles: true })
          );
        },
        onUserPause: () => {
          autoplayPaused = true;

          if (activePlayer === player) {
            saveStepProgress(stepIndex);
            activePlayer = null;
            activeStepIndex = -1;
          }

          container.dispatchEvent(
            new CustomEvent("scrolly:audio-paused", { bubbles: true })
          );
        }
      });

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

  function pauseAllAudioExcept(exceptPlayer = null) {
    audioPlayers.forEach((player, index) => {
      if (player === exceptPlayer) return;

      if (player.isPlaying() || player === activePlayer) {
        saveStepProgress(index);
        player.pause();
      }
    });

    if (activePlayer && activePlayer !== exceptPlayer) {
      activePlayer = null;
    }
  }

  function playStepAudio(stepIndex) {
    if (!hasAudio || !autoplayEnabled || autoplayPaused) return;

    const player = audioPlayers.get(stepIndex);

    if (!player) return;

    pauseAllAudioExcept(player);

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

  function clearBullets() {
    contentBullets.forEach((bullet) => {
      bullet.classList.remove("is-active");
      bullet.removeAttribute("aria-current");
    });
  }

  function setActiveStep(step) {
    contentSteps.forEach((s) => s.classList.remove("is-active"));
    step.classList.add("is-active");

    const index = Number(step.dataset.step);

    clearBullets();

    contentBullets.forEach((bullet, bulletIndex) => {
      const isActive = bulletIndex === index;

      bullet.classList.toggle("is-active", isActive);

      if (isActive) {
        bullet.setAttribute("aria-current", "true");
      }
    });

    if (onStepChange) {
      onStepChange(step, index);
    }
  }

  function setReplayActive() {
    contentSteps.forEach((s) => s.classList.remove("is-active"));
    clearBullets();

    const lastBullet = contentBullets[contentBullets.length - 1];

    lastBullet?.classList.add("is-active");
    lastBullet?.setAttribute("aria-current", "true");
  }

  function getFirstStepTargetScrollTop() {
    const firstStep = contentSteps[0];

    if (!firstStep) return 0;

    if (firstStepScrollTop !== null) {
      return firstStepScrollTop;
    }

    return measureStepScrollTopInContent(firstStep, scroller);
  }

  function updateMinScrollTop() {
    minScrollTop = getFirstStepTargetScrollTop();
  }

  function setScrollClampEnabled(enabled) {
    if (scroller === window || !clampScrollHandler) return;

    if (enabled) {
      scroller.addEventListener("scroll", clampScrollHandler, { passive: true });
    } else {
      scroller.removeEventListener("scroll", clampScrollHandler);
    }
  }

  function goToFirstStep() {
    scrollToStepIndex(0, { behavior: "auto" });
  }

  function scrollToStepIndex(index, { behavior } = {}) {
    const step = contentSteps[index];

    if (!step || scroller === window) return;

    setScrollClampEnabled(false);
    isProgrammaticScroll = true;

    const targetTop = measureStepScrollTopInContent(step, scroller);

    scroller.scrollTop = targetTop;
    minScrollTop = targetTop;

    if (index === 0) {
      firstStepScrollTop = targetTop;
    }

    handleStepEnter(step);

    ScrollTrigger.update();

    requestAnimationFrame(() => {
      const settledTop = measureStepScrollTopInContent(step, scroller);

      if (Math.abs(scroller.scrollTop - settledTop) > 1) {
        scroller.scrollTop = settledTop;
        minScrollTop = settledTop;

        if (index === 0) {
          firstStepScrollTop = settledTop;
        }
      }

      ScrollTrigger.refresh(true);
      ScrollTrigger.update();
      isProgrammaticScroll = false;
      setScrollClampEnabled(true);
    });
  }

  function syncMinScrollTop() {
    updateMinScrollTop();
  }

  function clampScrollTop() {
    if (scroller === window) return;

    if (scroller.scrollTop < minScrollTop) {
      scroller.scrollTop = minScrollTop;
    }
  }

  function bindScrollClamp() {
    if (scroller === window || clampScrollHandler) return;

    clampScrollHandler = () => clampScrollTop();
    scroller.addEventListener("scroll", clampScrollHandler, { passive: true });
  }

  function handleStepEnter(step) {
    if (step.classList.contains("step--end")) {
      setReplayActive();

      if (replayIndex >= 0) {
        setBackground(replayIndex);
      }

      pauseActiveAudio();
      activeStepIndex = -1;
      return;
    }

    const index = Number(step.dataset.step);

    setActiveStep(step);
    setBackground(Number(step.dataset.bg));
    playStepAudio(index);
  }

  function handleStepLeave(step) {
    if (step.classList.contains("step--end")) {
      return;
    }

    const index = Number(step.dataset.step);

    if (activeStepIndex === index) {
      saveStepProgress(index);
      pauseActiveAudio();
      activeStepIndex = -1;
    }
  }

  function activateScrollTriggers() {
    deactivateScrollTriggers();

    scrollSteps.forEach((step) => {
      const trigger = ScrollTrigger.create({
        trigger: step,
        scroller,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          if (isProgrammaticScroll) return;
          handleStepEnter(step);
        },
        onEnterBack: () => {
          if (isProgrammaticScroll) return;
          handleStepEnter(step);
        },
        onLeave: () => {
          if (isProgrammaticScroll) return;
          handleStepLeave(step);
        },
        onLeaveBack: () => {
          if (isProgrammaticScroll) return;
          handleStepLeave(step);
        }
      });

      triggers.push(trigger);
    });

    ScrollTrigger.refresh(true);
  }

  function deactivateScrollTriggers() {
    if (!triggers.length) return;

    triggers.forEach((trigger) => trigger.kill());
    triggers.length = 0;
  }

  const first = contentSteps[0];

  if (first) {
    setActiveStep(first);
    setBackground(Number(first.dataset.bg), true);
  }

  contentBullets.forEach((bullet, index) => {
    bullet.addEventListener("click", () => {
      if (contentSteps[index]) {
        scrollToStep(contentSteps[index], scroller);
      }
    });
  });

  replayBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    goToFirstStep();
  });

  bindScrollClamp();

  return {
    container,
    scopeId,

    refresh() {
      ScrollTrigger.refresh(true);
    },

    activateScrollTriggers() {
      activateScrollTriggers();
    },

    deactivateScrollTriggers() {
      deactivateScrollTriggers();
    },

    goToStep(index, { behavior } = {}) {
      if (index === 0 && scroller !== window) {
        scrollToStepIndex(0, { behavior });
        return;
      }

      const step = contentSteps[index];

      if (!step) return;

      scrollToStep(step, scroller, behavior);
    },

    resetScrollState() {
      firstStepScrollTop = null;
      minScrollTop = 0;
      activeStepIndex = -1;
      currentBg = -1;

      if (scroller !== window) {
        scroller.scrollTop = 0;
      }

      const first = contentSteps[0];

      if (first) {
        setActiveStep(first);
        setBackground(Number(first.dataset.bg), true);
      }
    },

    syncMinScrollTop() {
      syncMinScrollTop();
    },

    getMinScrollTop() {
      return minScrollTop;
    },

    enableAutoplay() {
      autoplayEnabled = true;
    },

    disableAutoplay() {
      autoplayEnabled = false;
      autoplayPaused = false;
    },

    pauseAutoplay() {
      autoplayPaused = true;
      pauseActiveAudio();
    },

    resumeAutoplay() {
      autoplayPaused = false;
    },

    isAutoplayEnabled() {
      return autoplayEnabled;
    },

    isAutoplayPaused() {
      return autoplayPaused;
    },

    destroy() {
      pauseActiveAudio();
      deactivateScrollTriggers();

      if (scroller !== window && clampScrollHandler) {
        scroller.removeEventListener("scroll", clampScrollHandler);
      }
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
