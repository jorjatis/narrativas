function fadeOnScroll(selector, distance = 50) {
  const el = document.querySelector(selector);
  if (!el) return;

  let isVisible = window.scrollY < distance; 

  el.classList.toggle("is-visible", isVisible);

  let ticking = false;

  const update = () => {
    const shouldBeVisible = window.scrollY < distance;

    if (isVisible !== shouldBeVisible) {
      isVisible = shouldBeVisible;
      el.classList.toggle("is-visible", isVisible);
    }

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}

function moveEls(el, target, position = "prepend") {
  const element = document.querySelector(el);
  const targetEl = document.querySelector(target);

  if (!element || !targetEl) return;

  if (position === "prepend" && targetEl.firstElementChild === element) return;
  if (position === "append" && targetEl.lastElementChild === element) return;

  const actions = {
    prepend: () => targetEl.prepend(element),
    append: () => targetEl.append(element),
    before: () => targetEl.before(element),
    after: () => targetEl.after(element),
  };

  if (!actions[position]) {
    console.warn(`Posición no válida: ${position}`);
    return;
  }

  actions[position]();
}

const PAYWALL_SELECTOR = 'ev-engagement[group-name="paywall-abc"][redirect="false"]';
const ARTICLE_SCOPE = ".v-d-w";

function hasArticlePaywall() {
  const article = document.querySelector(ARTICLE_SCOPE);
  return Boolean(article?.querySelector(PAYWALL_SELECTOR));
}

function onArticlePaywallChange(callback) {
  if (hasArticlePaywall()) {
    callback(true);
    return () => {};
  }

  const scope = document.querySelector(ARTICLE_SCOPE) ?? document.body;
  const observer = new MutationObserver(() => {
    if (hasArticlePaywall()) {
      callback(true);
      observer.disconnect();
    }
  });

  observer.observe(scope, { childList: true, subtree: true });

  return () => observer.disconnect();
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function motionDuration(defaultDuration) {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

function scrollBehavior() {
  return prefersReducedMotion() ? "auto" : "smooth";
}

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  scroll: {
    speed: 0.33,
    scrub: 0.5
  },
  text: {
    enterScale: 0.15,
    exitScale: 50,
    exitXPercent: 0,
    transformOrigin: "50% 50%"
  },
  timing: {
    text1Hold: 1.4,
    textEnter: 1.8,
    textHold: 1,
    textExit: 3
  },
  images: {
    fromScale: 0,
    duration: 2.4,
    stagger: 0.5,
    mobileDuration: 0.7,
    mobileOffsetY: 20,
    infoStartFactor: 0.35
  },
  infoDuration: 0.6,
  endHold: 2.5,
  paywallEndHold: 0
};

const MOBILE_MAX_WIDTH = 699;
const { transformOrigin } = CONFIG.text;

function isMobileLayout() {
  return window.innerWidth <= MOBILE_MAX_WIDTH;
}

function measureCenterOffsets(figures, container) {
  const containerRect = container.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerCenterY = containerRect.top + containerRect.height / 2;
  const figureRects = figures.map((figure) => figure.getBoundingClientRect());

  return figureRects.map((rect) => ({
    x: containerCenterX - (rect.left + rect.width / 2),
    y: containerCenterY - (rect.top + rect.height / 2)
  }));
}

function waitForImages(figures) {
  const imgs = figures.flatMap((figure) => [...figure.querySelectorAll("img")]);

  return Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        })
    )
  );
}

function collectTextPanels(root) {
  const panels = [...root.querySelectorAll(".intro-text")];
  const text1El = panels.find((el) => el.classList.contains("intro-text--1"));
  const secondary = panels
    .filter((el) => el !== text1El)
    .map((el) => ({ el, zoom: el.querySelector(".intro-text__zoom") }))
    .filter((panel) => panel.zoom);

  return {
    text1El,
    text1Zoom: text1El?.querySelector(".intro-text__zoom"),
    secondary
  };
}

function setEpisodeButtonsFocusable(buttons, focusable) {
  buttons.forEach((button) => {
    if (focusable) {
      button.removeAttribute("tabindex");
    } else {
      button.setAttribute("tabindex", "-1");
    }
  });
}

function addTextExit(timeline, zoomEl, exitStart) {
  const { exitScale, exitXPercent } = CONFIG.text;
  const { textExit } = CONFIG.timing;

  timeline.to(
    zoomEl,
    {
      scale: exitScale,
      xPercent: exitXPercent,
      autoAlpha: 0,
      duration: textExit,
      ease: "power1.in",
      transformOrigin
    },
    exitStart
  );
}

function addTextEnter(timeline, zoomEl, start) {
  const { enterScale } = CONFIG.text;
  const { textEnter } = CONFIG.timing;

  timeline.fromTo(
    zoomEl,
    {
      scale: enterScale,
      autoAlpha: 0,
      immediateRender: false,
      transformOrigin
    },
    {
      scale: 1,
      autoAlpha: 1,
      duration: textEnter,
      ease: "power2.out",
      transformOrigin
    },
    start
  );
}

function hidePaywalledContent(root, imgContainer) {
  root.classList.add("v-a-preh--paywall");
  imgContainer?.setAttribute("hidden", "");
}

function isPaywallText3(el, skipImages) {
  return skipImages && el.classList.contains("intro-text--3");
}

function buildTimeline(elements, getOffsets, { skipImages = false } = {}) {
  const { root, stage, text1El, text1Zoom, secondary, imgContainer, figures, episodeButtons } = elements;
  const { text1Hold, textEnter, textHold, textExit } = CONFIG.timing;
  const { fromScale, duration: imgDuration, stagger } = CONFIG.images;

  const secondaryZooms = secondary.map((panel) => panel.zoom);
  let imagesStartTime = 0;

  gsap.set(secondary.map((panel) => panel.el), { autoAlpha: 0, zIndex: 1 });
  gsap.set(imgContainer, { zIndex: 1, pointerEvents: "none" });

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => "+=" + Math.round(window.innerHeight * timeline.duration() * CONFIG.scroll.speed),
      pin: stage,
      scrub: CONFIG.scroll.scrub,
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const shouldImages = !skipImages && self.progress * timeline.duration() >= imagesStartTime;
        root.classList.toggle("intro-images-active", shouldImages);
        setEpisodeButtonsFocusable(episodeButtons, shouldImages);
      },
      onLeave() {
        root.classList.add("intro-scroll-complete");
        gsap.set(figures, { clearProps: "transform,willChange", autoAlpha: 1 });
        gsap.set([text1Zoom, ...secondaryZooms], { clearProps: "transform,filter" });
      },
      onEnterBack() {
        root.classList.remove("intro-scroll-complete");
      }
    }
  });

  let t = 0;

  timeline
    .set(text1El, { zIndex: 3 }, 0)
    .set(text1Zoom, { scale: 1, autoAlpha: 1, transformOrigin }, 0);

  t += text1Hold;
  addTextExit(timeline, text1Zoom, t);
  const text1Gone = t + textExit;
  timeline.set(text1El, { zIndex: 1 }, text1Gone);
  t = text1Gone;

  secondary.forEach(({ el, zoom }) => {
    const paywallText3 = isPaywallText3(el, skipImages);

    timeline.set(el, { autoAlpha: 1, zIndex: 3 }, t);
    addTextEnter(timeline, zoom, t);

    if (paywallText3) {
      t += textEnter;
      return;
    }

    const exitStart = t + textEnter + textHold;
    addTextExit(timeline, zoom, exitStart);
    const gone = exitStart + textExit;
    timeline.set(el, { autoAlpha: 0, zIndex: 1 }, gone);
    t = gone;
  });

  imagesStartTime = t;

  if (skipImages) {
    if (CONFIG.paywallEndHold > 0) {
      timeline.to({}, { duration: CONFIG.paywallEndHold }, t);
    }

    return timeline;
  }

  timeline.set(imgContainer, { zIndex: 4, pointerEvents: "auto" }, imagesStartTime);

  if (isMobileLayout()) {
    const { mobileDuration, mobileOffsetY, stagger: mobileStagger } = CONFIG.images;

    timeline
      .set(
        figures,
        {
          autoAlpha: 0,
          y: mobileOffsetY,
          clearProps: "x,scale"
        },
        0
      )
      .to(
        figures,
        {
          autoAlpha: 1,
          y: 0,
          duration: mobileDuration,
          stagger: mobileStagger,
          ease: "power2.out"
        },
        imagesStartTime
      );
  } else {
    timeline
      .set(
        figures,
        {
          x: (index) => getOffsets()[index]?.x ?? 0,
          y: (index) => getOffsets()[index]?.y ?? 0,
          scale: fromScale,
          autoAlpha: 0,
          transformOrigin: "center center",
          force3D: true
        },
        0
      )
      .to(
        figures,
        {
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: imgDuration,
          stagger,
          ease: "power1.out",
          force3D: true
        },
        imagesStartTime
      );
  }

  const activeImgDuration = isMobileLayout() ? CONFIG.images.mobileDuration : imgDuration;
  const infos = [...root.querySelectorAll(".intro-img-info")];

  infos.forEach((info) => {
    const figure = info.closest(".intro-img");
    const index = figure ? figures.indexOf(figure) : -1;
    const at = index >= 0
      ? imagesStartTime + index * stagger
      : imagesStartTime + activeImgDuration * CONFIG.images.infoStartFactor;

    timeline.fromTo(
      info,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: CONFIG.infoDuration, ease: "power1.out" },
      at
    );
  });

  const imagesEnd = imagesStartTime + activeImgDuration + stagger * Math.max(0, figures.length - 1);
  t = imagesEnd;

  timeline.to({}, { duration: CONFIG.endHold }, t);

  return timeline;
}

function preArticleHeaderScroll() {
  const root = document.querySelector(".v-a-preh");
  if (!root) return null;

  const stage = root.querySelector(".intro-stage");
  const imgContainer = root.querySelector(".intro-img-c");
  const figures = [...root.querySelectorAll(".intro-img")];
  const episodeButtons = [...root.querySelectorAll(".open-modal")];
  const infos = [...root.querySelectorAll(".intro-img-info")];
  const { text1El, text1Zoom, secondary } = collectTextPanels(root);
  let skipImages = hasArticlePaywall();

  if (!stage || !text1El || !text1Zoom || !imgContainer || !figures.length) {
    return null;
  }

  if (skipImages) {
    hidePaywalledContent(root, imgContainer);
  }

  if (prefersReducedMotion()) {
    root.classList.add("intro-scroll-complete");

    if (!skipImages) {
      root.classList.add("intro-images-active");
      gsap.set(figures, { autoAlpha: 1, clearProps: "transform" });
      gsap.set(infos, { autoAlpha: 1 });
      setEpisodeButtonsFocusable(episodeButtons, true);
    } else {
      const text3 = root.querySelector(".intro-text--3");
      const text3Zoom = text3?.querySelector(".intro-text__zoom");

      if (text3 && text3Zoom) {
        gsap.set(text3, { autoAlpha: 1, zIndex: 3 });
        gsap.set(text3Zoom, { scale: 1, autoAlpha: 1, transformOrigin });
      }
    }

    return null;
  }

  setEpisodeButtonsFocusable(episodeButtons, false);

  if (isMobileLayout()) {
    gsap.set(figures, { autoAlpha: 0, y: CONFIG.images.mobileOffsetY });
  } else {
    gsap.set(figures, { autoAlpha: 0, scale: 0 });
  }
  gsap.set(infos, { autoAlpha: 0 });

  const elements = { root, stage, text1El, text1Zoom, secondary, imgContainer, figures, episodeButtons };
  let timeline = null;
  let resizeTimer = null;

  const createTimeline = () => {
    if (!skipImages) {
      gsap.set(figures, { clearProps: "transform" });
    }

    const getOffsets = isMobileLayout()
      ? () => []
      : () => measureCenterOffsets(figures, imgContainer);

    timeline?.scrollTrigger?.kill();
    timeline?.kill();
    timeline = buildTimeline(elements, getOffsets, { skipImages });
    ScrollTrigger.refresh();
  };

  const startTimeline = () => {
    requestAnimationFrame(createTimeline);
  };

  if (skipImages) {
    startTimeline();
  } else {
    waitForImages(figures).then(startTimeline);
  }

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createTimeline, 250);
  };

  window.addEventListener("resize", onResize, { passive: true });

  const stopPaywallWatch = onArticlePaywallChange(() => {
    if (skipImages) return;

    skipImages = true;
    hidePaywalledContent(root, imgContainer);
    createTimeline();
  });

  return {
    kill() {
      stopPaywallWatch();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
    }
  };
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateSliderAria(progressWrap, progress, audio) {
  if (!progressWrap || !progress) return;

  const value = Number(progress.value) || 0;

  progressWrap.setAttribute("aria-valuenow", String(Math.round(value)));
  progressWrap.setAttribute(
    "aria-valuetext",
    audio?.duration ? formatTime(audio.currentTime) : "00:00"
  );
}

function initAudioPlayer(root, { onUserPlay, onUserPause } = {}) {
  const playBtn = root.querySelector(".v-ply__b--1");
  const muteBtn = root.querySelector(".v-ply__b--2");
  const progress = root.querySelector("progress");
  const progressWrap = root.querySelector(".v-ply__v");
  const currentEl = root.querySelector(".v-ply__p-length");
  const durationEl = root.querySelector(".v-ply__p-duration");
  const audio = root.querySelector("audio");

  if (!audio) return null;

  let isDragging = false;

  function updateProgress() {
    if (!progress || !audio.duration) return;

    progress.value = (audio.currentTime / audio.duration) * 100;
    progress.max = 100;

    if (currentEl) {
      currentEl.textContent = formatTime(audio.currentTime);
    }

    updateSliderAria(progressWrap, progress, audio);
  }

  function updateDuration() {
    if (!durationEl || !audio.duration) return;

    durationEl.textContent = formatTime(audio.duration);
    updateSliderAria(progressWrap, progress, audio);
  }

  function setPlaying(playing) {
    root.classList.toggle("is-playing", playing);

    if (playBtn) {
      playBtn.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
    }
  }

  function play() {
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function pause() {
    audio.pause();
    setPlaying(false);
  }

  function seek(ratio) {
    if (!audio.duration) return;

    const clamped = Math.max(0, Math.min(1, ratio));
    audio.currentTime = clamped * audio.duration;
    updateProgress();
  }

  function seekFromEvent(event) {
    if (!progressWrap || !audio.duration) return;

    const rect = progressWrap.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;

    seek(ratio);
  }

  function toggleMute() {
    audio.muted = !audio.muted;
    muteBtn?.classList.toggle("is-active", !audio.muted);
    muteBtn?.setAttribute("aria-label", audio.muted ? "Activar sonido" : "Silenciar");
  }

  function onPlayBtnClick() {
    if (audio.paused) {
      onUserPlay?.();
      play();
    } else {
      onUserPause?.();
      pause();
    }
  }

  function onPointerDown(event) {
    isDragging = true;
    seekFromEvent(event);
    progressWrap?.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!isDragging) return;

    seekFromEvent(event);
  }

  function onPointerUp(event) {
    if (!isDragging) return;

    isDragging = false;
    progressWrap?.releasePointerCapture(event.pointerId);
  }

  function onProgressKeyDown(event) {
    if (!audio.duration) return;

    const step = event.key === "PageUp" || event.key === "PageDown" ? 0.1 : 0.05;
    let ratio = audio.currentTime / audio.duration;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        ratio += step;
        event.preventDefault();
        break;
      case "ArrowLeft":
      case "ArrowDown":
        ratio -= step;
        event.preventDefault();
        break;
      case "Home":
        ratio = 0;
        event.preventDefault();
        break;
      case "End":
        ratio = 1;
        event.preventDefault();
        break;
      default:
        return;
    }

    seek(ratio);
  }

  playBtn?.addEventListener("click", onPlayBtnClick);
  muteBtn?.addEventListener("click", toggleMute);
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateDuration);
  audio.addEventListener("ended", () => setPlaying(false));

  progressWrap?.addEventListener("pointerdown", onPointerDown);
  progressWrap?.addEventListener("pointermove", onPointerMove);
  progressWrap?.addEventListener("pointerup", onPointerUp);
  progressWrap?.addEventListener("pointercancel", onPointerUp);
  progressWrap?.addEventListener("keydown", onProgressKeyDown);

  if (muteBtn) {
    muteBtn.classList.add("is-active");
    muteBtn.setAttribute("aria-label", "Silenciar");
  }

  updateSliderAria(progressWrap, progress, audio);

  return {
    audio,
    play,
    pause,
    seek,
    toggleMute,
    getCurrentTime: () => audio.currentTime,
    setCurrentTime: (time) => {
      audio.currentTime = time;
      updateProgress();
    },
    isPlaying: () => !audio.paused,
    destroy() {
      pause();
      playBtn?.removeEventListener("click", onPlayBtnClick);
      muteBtn?.removeEventListener("click", toggleMute);
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", () => setPlaying(false));
      progressWrap?.removeEventListener("pointerdown", onPointerDown);
      progressWrap?.removeEventListener("pointermove", onPointerMove);
      progressWrap?.removeEventListener("pointerup", onPointerUp);
      progressWrap?.removeEventListener("pointercancel", onPointerUp);
      progressWrap?.removeEventListener("keydown", onProgressKeyDown);
    }
  };
}

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

    if (playerRoot) {
      const player = initAudioPlayer(playerRoot, {
        onUserPlay: () => {
          autoplayPaused = false;
          autoplayEnabled = true;
          container.dispatchEvent(
            new CustomEvent("scrolly:audio-enabled", { bubbles: true })
          );
        },
        onUserPause: () => {
          autoplayPaused = true;
          container.dispatchEvent(
            new CustomEvent("scrolly:audio-paused", { bubbles: true })
          );
        }
      });
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
    if (!hasAudio || !autoplayEnabled || autoplayPaused) return;

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

function scrolly() {
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

function getScrollyInstance(instances, episodeId) {
  return instances.get(`episode-${episodeId}`);
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

function episodesModal(scrollyInstances) {
  const overlay = document.querySelector(".episodes-modal-overlay");
  const modals = [...document.querySelectorAll(".episodes-modal")];
  const openButtons = [...document.querySelectorAll(".open-modal")];
  const main = document.querySelector("main");
  const pageScrInd = document.querySelector(".v-a-preh .scr-ind");

  if (!overlay || !modals.length) return;

  function portalModalLayer() {
    if (overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }

    modals.forEach((modal) => {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
    });
  }

  portalModalLayer();

  gsap.registerPlugin(ScrollTrigger);

  let currentEpisodeId = null;
  let isSwitching = false;
  let triggerElement = null;
  let focusTrapHandler = null;
  let audioAutoplayEnabled = false;
  let audioAutoplayPaused = false;
  let scrollIndicatorHandler = null;
  let scrollIndicatorScroller = null;
  let scrollIndicatorEl = null;
  let scrollIndicatorOrigin = 0;

  const SCROLL_IND_THRESHOLD = 50;

  function enableAutoplayOnAllInstances() {
    audioAutoplayEnabled = true;
    audioAutoplayPaused = false;

    if (scrollyInstances) {
      scrollyInstances.forEach((instance) => {
        instance.enableAutoplay();
        instance.resumeAutoplay();
      });
    }
  }

  function disableAutoplayOnAllInstances() {
    audioAutoplayEnabled = false;
    audioAutoplayPaused = false;

    if (scrollyInstances) {
      scrollyInstances.forEach((instance) => instance.disableAutoplay());
    }
  }

  function deactivateAllScrollTriggers() {
    if (scrollyInstances) {
      scrollyInstances.forEach((instance) => instance.deactivateScrollTriggers());
    }
  }

  function pauseAutoplayOnAllInstances() {
    audioAutoplayPaused = true;

    if (scrollyInstances) {
      scrollyInstances.forEach((instance) => instance.pauseAutoplay());
    }
  }

  function updateScrollIndicatorVisibility() {
    if (!scrollIndicatorEl || !scrollIndicatorScroller) return;

    const hasScrolled =
      scrollIndicatorScroller.scrollTop >
      scrollIndicatorOrigin + SCROLL_IND_THRESHOLD;

    scrollIndicatorEl.classList.toggle("is-visible", !hasScrolled);
    scrollIndicatorEl.setAttribute("aria-hidden", String(hasScrolled));
  }

  function bindScrollIndicator(modal) {
    releaseScrollIndicator();

    scrollIndicatorScroller = modal.querySelector(".episodes-modal__scroll");
    scrollIndicatorEl = modal.querySelector(".scr-ind");

    if (!scrollIndicatorEl || !scrollIndicatorScroller) return;

    const instance = getScrollyInstance(
      scrollyInstances,
      modal.dataset.episode
    );

    scrollIndicatorOrigin =
      instance?.getMinScrollTop() ?? scrollIndicatorScroller.scrollTop;

    scrollIndicatorHandler = () => updateScrollIndicatorVisibility();
    scrollIndicatorScroller.addEventListener("scroll", scrollIndicatorHandler, {
      passive: true
    });

    updateScrollIndicatorVisibility();
  }

  function releaseScrollIndicator() {
    if (scrollIndicatorScroller && scrollIndicatorHandler) {
      scrollIndicatorScroller.removeEventListener("scroll", scrollIndicatorHandler);
    }

    if (scrollIndicatorEl) {
      scrollIndicatorEl.classList.remove("is-visible");
      scrollIndicatorEl.setAttribute("aria-hidden", "true");
    }

    scrollIndicatorScroller = null;
    scrollIndicatorHandler = null;
    scrollIndicatorEl = null;
    scrollIndicatorOrigin = 0;

    if (pageScrInd) {
      pageScrInd.classList.toggle("is-visible", window.scrollY < SCROLL_IND_THRESHOLD);
    }
  }

  function prepareModalView(modal) {
    const instance = getScrollyInstance(scrollyInstances, modal.dataset.episode);

    pageScrInd?.classList.remove("is-visible");
    deactivateAllScrollTriggers();

    requestAnimationFrame(() => {
      instance?.activateScrollTriggers();
      ScrollTrigger.refresh(true);
      instance?.goToStep(0, { behavior: "auto" });

      if (audioAutoplayEnabled) {
        instance?.enableAutoplay();

        if (audioAutoplayPaused) {
          instance?.pauseAutoplay();
        }
      }

      requestAnimationFrame(() => {
        instance?.syncMinScrollTop();
        ScrollTrigger.refresh(true);
        bindScrollIndicator(modal);
      });
    });
  }

  function getModalById(id) {
    return modals.find((modal) => modal.dataset.episode === String(id));
  }

  function getFocusableElements(container) {
    return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
      (element) => element.getClientRects().length > 0
    );
  }

  function trapFocus(modal) {
    releaseFocusTrap();

    focusTrapHandler = (event) => {
      if (event.key !== "Tab" || !overlay.classList.contains("is-open")) return;

      const focusable = getFocusableElements(modal);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", focusTrapHandler);
  }

  function releaseFocusTrap() {
    if (focusTrapHandler) {
      document.removeEventListener("keydown", focusTrapHandler);
      focusTrapHandler = null;
    }
  }

  function setBackgroundInert(inert) {
    if (!main) return;

    if (inert) {
      main.setAttribute("inert", "");
      main.setAttribute("aria-hidden", "true");
    } else {
      main.removeAttribute("inert");
      main.removeAttribute("aria-hidden");
    }
  }

  function resetModal(modal) {
    const episodeId = modal.dataset.episode;

    if (scrollyInstances) {
      const instance = getScrollyInstance(scrollyInstances, episodeId);
      instance?.resetScrollState();
      instance?.resetAudio();
    }
  }

  function activateModal(modal, animate = true) {
    modals.forEach((m) => {
      m.classList.remove("is-active");
      m.setAttribute("aria-hidden", "true");
    });

    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");

    const duration = animate ? motionDuration(0.3) : 0;

    if (animate && duration > 0) {
      gsap.fromTo(
        modal,
        { opacity: 0 },
        { opacity: 1, duration, ease: "power1.out" }
      );
    } else {
      gsap.set(modal, { opacity: 1 });
    }

    currentEpisodeId = modal.dataset.episode;
    ScrollTrigger.refresh();
  }

  function openEpisode(id) {
    const modal = getModalById(id);

    if (!modal) return;

    modals.forEach((m) => resetModal(m));

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-overflow");
    setBackgroundInert(true);

    activateModal(modal, false);
    ScrollTrigger.refresh();
    prepareModalView(modal);

    const closeBtn = modal.querySelector(".modal-close");
    closeBtn?.focus();
    trapFocus(modal);
  }

  function switchEpisode(id) {
    if (isSwitching || String(id) === currentEpisodeId) return;

    const nextModal = getModalById(id);
    const currentModal = getModalById(currentEpisodeId);

    if (!nextModal) return;

    isSwitching = true;

    const onComplete = () => {
      if (currentModal) {
        resetModal(currentModal);
        currentModal.classList.remove("is-active");
        currentModal.setAttribute("aria-hidden", "true");
        gsap.set(currentModal, { opacity: 0 });
      }

      resetModal(nextModal);
      activateModal(nextModal, true);
      prepareModalView(nextModal);
      trapFocus(nextModal);
      isSwitching = false;
    };

    const duration = motionDuration(0.3);

    if (currentModal && duration > 0) {
      gsap.to(currentModal, {
        opacity: 0,
        duration,
        ease: "power1.in",
        onComplete
      });
    } else {
      if (currentModal) {
        gsap.set(currentModal, { opacity: 0 });
      }
      onComplete();
    }
  }

  function clearTriggerInteractionState() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!(triggerElement instanceof HTMLElement)) return;

    triggerElement.blur();

    const introImg = triggerElement.closest(".intro-img");

    if (!(introImg instanceof HTMLElement)) return;

    introImg.style.pointerEvents = "none";

    requestAnimationFrame(() => {
      introImg.style.pointerEvents = "";
    });
  }

  function closeAll() {
    if (currentEpisodeId) {
      const currentModal = getModalById(currentEpisodeId);

      if (currentModal) {
        resetModal(currentModal);
      }
    }

    modals.forEach((modal) => {
      modal.classList.remove("is-active");
      modal.setAttribute("aria-hidden", "true");
      gsap.set(modal, { opacity: 0 });
    });

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-overflow");
    setBackgroundInert(false);
    releaseFocusTrap();
    releaseScrollIndicator();
    disableAutoplayOnAllInstances();
    deactivateAllScrollTriggers();
    clearTriggerInteractionState();

    triggerElement?.focus();
    triggerElement = null;
    currentEpisodeId = null;
    ScrollTrigger.refresh();
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const episodeId = button.dataset.episode;

      if (episodeId) {
        triggerElement = button;
        openEpisode(episodeId);
      }
    });
  });

  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".modal-close");
    const prevBtn = modal.querySelector(".episode-btn--prev");
    const nextBtn = modal.querySelector(".episode-btn--next");
    const episodeId = Number(modal.dataset.episode);

    closeBtn?.addEventListener("click", closeAll);

    prevBtn?.addEventListener("click", () => {
      if (!prevBtn.disabled) {
        switchEpisode(episodeId - 1);
      }
    });

    nextBtn?.addEventListener("click", () => {
      if (!nextBtn.disabled) {
        switchEpisode(episodeId + 1);
      }
    });
  });

  overlay.addEventListener("click", closeAll);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeAll();
    }
  });

  document.addEventListener("scrolly:audio-enabled", enableAutoplayOnAllInstances);
  document.addEventListener("scrolly:audio-paused", pauseAutoplayOnAllInstances);
}

function initAll() {
  document.body.classList.add('is-loaded');

  fadeOnScroll('.scr-ind');
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");

  preArticleHeaderScroll();
  const scrollyInstances = scrolly();
  episodesModal(scrollyInstances);
}

initAll();