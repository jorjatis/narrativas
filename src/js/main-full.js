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

function articleTitle() {
  const title = document.querySelector('.v-a--d-s-1 .v-a-t');
  if (!title) return;

  title.innerHTML = `
    <span class="v-a-t__las">Las</span>
    <span class="v-a-t__mil">mil vidas</span>
    <span class="v-a-t__bottom">
      <span class="v-a-t__stack">
        <span class="v-a-t__de">de</span>
        <span class="v-a-t__la">la</span>
      </span>
      <span class="v-a-t__cibeles">Cibeles</span>
    </span>
  `;
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

function parseDate(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function initScrollStory(root) {
  const dateEl = root.querySelector('.v-n-ss-h__d');
  const titleEl = root.querySelector('.v-n-ss-h__t');
  const muteBtn = root.querySelector('.v-n-ss__mute');
  const audios = [...root.querySelectorAll('.v-n-ss__audio')];
  const reduced = prefersReducedMotion();

  let currentDate = parseDate(dateEl?.textContent) ?? 0;
  let currentTitle = titleEl?.innerHTML ?? '';
  let currentAudioId = null;
  let dateTween = null;
  let titleTween = null;
  let unlocked = false;
  let shouldPlay = false;
  let userMuted = false;
  let activeAudio = null;

  const dateProxy = { value: currentDate };

  function getStickyOffset() {
    const stickyEl = root.querySelector('.v-n-scrolly__sticky') || root;
    const top = parseFloat(getComputedStyle(stickyEl).top);
    if (Number.isFinite(top)) return top;
    return window.matchMedia('(min-width: 699px)').matches ? 60 : 52;
  }

  function getAudioById(id) {
    return audios.find((audio) => audio.dataset.audio === String(id)) || null;
  }

  function setMuteUI(muted) {
    if (!muteBtn) return;
    muteBtn.classList.toggle('is-muted', muted);
    muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    muteBtn.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar');
  }

  function pauseAll(except = null) {
    audios.forEach((audio) => {
      if (audio === except) return;
      audio.pause();
    });
  }

  function tryPlay(audio) {
    if (!audio || !shouldPlay || userMuted) return Promise.resolve(false);
    if (!root.classList.contains('is-pinned')) return Promise.resolve(false);

    audio.muted = false;
    const playPromise = audio.play();
    if (!playPromise || typeof playPromise.then !== 'function') {
      unlocked = true;
      return Promise.resolve(true);
    }

    return playPromise
      .then(() => {
        unlocked = true;
        return true;
      })
      .catch(() => false);
  }

  function setAudio(id, { force = false } = {}) {
    if (!audios.length) return;
    if (!force && String(id) === String(currentAudioId)) return;

    const next = getAudioById(id);
    if (!next) return;

    const prev = activeAudio;
    currentAudioId = String(id);
    activeAudio = next;

    if (prev && prev !== next) {
      prev.pause();
      prev.currentTime = 0;
    }

    pauseAll(next);

    if (shouldPlay && !userMuted) {
      tryPlay(next);
    } else {
      next.pause();
    }
  }

  function animateDate(nextDate, immediate = false) {
    if (!dateEl || nextDate == null || nextDate === currentDate) return;

    dateTween?.kill();

    if (immediate || reduced) {
      currentDate = nextDate;
      dateProxy.value = nextDate;
      dateEl.textContent = String(nextDate);
      return;
    }

    dateTween = gsap.to(dateProxy, {
      value: nextDate,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        dateEl.textContent = String(Math.round(dateProxy.value));
      },
      onComplete: () => {
        currentDate = nextDate;
        dateEl.textContent = String(nextDate);
      },
    });
  }

  function animateTitle(nextTitle, immediate = false) {
    if (!titleEl || nextTitle == null || nextTitle === currentTitle) return;

    titleTween?.kill();
    titleEl.style.transition = 'none';

    if (immediate || reduced) {
      titleEl.innerHTML = nextTitle;
      gsap.set(titleEl, { opacity: 1, y: 0 });
      currentTitle = nextTitle;
      return;
    }

    titleTween = gsap.timeline({
      onComplete: () => {
        currentTitle = nextTitle;
      },
    });

    titleTween
      .to(titleEl, {
        opacity: 0,
        y: -8,
        duration: 0.25,
        ease: 'power1.out',
      })
      .add(() => {
        titleEl.innerHTML = nextTitle;
      })
      .fromTo(
        titleEl,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        },
      );
  }

  function applyStep(step, { immediate = false } = {}) {
    if (!step) return;

    if (step.dataset.date != null) {
      animateDate(parseDate(step.dataset.date), immediate);
    }

    if (step.dataset.title != null) {
      animateTitle(step.dataset.title, immediate);
    }

    if (step.dataset.audio != null) {
      setAudio(step.dataset.audio, { force: immediate });
    }
  }

  function onStep(event) {
    applyStep(event.detail?.step, { immediate: Boolean(event.detail?.immediate) });
  }

  function ensureActiveAudio() {
    if (activeAudio) return activeAudio;

    const activeStep = root.querySelector('.step.is-active') || root.querySelector('.step');
    const id = activeStep?.dataset.audio ?? currentAudioId ?? '0';
    const next = getAudioById(id) || audios[0];
    if (!next) return null;

    currentAudioId = next.dataset.audio;
    activeAudio = next;
    return activeAudio;
  }

  function primeAudio(audio) {
    if (!audio) return Promise.resolve(false);
    const wasMuted = audio.muted;
    audio.muted = true;
    const p = audio.play();
    const restore = () => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = wasMuted;
    };
    if (!p || typeof p.then !== 'function') {
      restore();
      return Promise.resolve(true);
    }
    return p
      .then(() => {
        restore();
        return true;
      })
      .catch(() => {
        audio.muted = wasMuted;
        return false;
      });
  }

  function unlockAndPlay() {
    unlocked = true;
    ensureActiveAudio();

    audios.forEach((audio) => {
      if (audio === activeAudio && shouldPlay && !userMuted) {
        tryPlay(audio);
      } else {
        primeAudio(audio);
      }
    });
  }

  function onMuteClick(event) {
    event?.stopPropagation();
    unlocked = true;
    ensureActiveAudio();

    const autoplayBlocked = shouldPlay && !userMuted && activeAudio?.paused;
    if (autoplayBlocked) {
      setMuteUI(false);
      tryPlay(activeAudio);
      return;
    }

    userMuted = !userMuted;
    setMuteUI(userMuted);

    if (userMuted) {
      activeAudio?.pause();
      return;
    }

    if (shouldPlay) {
      tryPlay(activeAudio);
    }
  }

  const sticky = root.querySelector('.v-n-scrolly__sticky') || root;
  root.classList.add('is-unpinned');
  sticky.classList.add('is-unpinned');

  function isStickyPinned() {
    const offset = getStickyOffset();
    const rect = sticky.getBoundingClientRect();
    return rect.top <= offset + 1 && rect.bottom > offset + 1;
  }

  function playPinnedAudio() {
    ensureActiveAudio();
    if (activeAudio && !userMuted) tryPlay(activeAudio);
  }

  function setPinnedState(pinned) {
    if (pinned === shouldPlay
      && root.classList.contains('is-pinned') === pinned) {
      return;
    }

    shouldPlay = pinned;
    root.classList.toggle('is-pinned', pinned);
    root.classList.toggle('is-unpinned', !pinned);
    sticky.classList.toggle('is-pinned', pinned);
    sticky.classList.toggle('is-unpinned', !pinned);

    if (pinned) {
      playPinnedAudio();
      return;
    }

    pauseAll();
  }

  let pinTicking = false;
  function syncPinnedState() {
    setPinnedState(isStickyPinned());
  }
  function onPinScroll() {
    if (pinTicking) return;
    pinTicking = true;
    requestAnimationFrame(() => {
      pinTicking = false;
      syncPinnedState();
    });
  }
  window.addEventListener('scroll', onPinScroll, { passive: true });
  ScrollTrigger.addEventListener('refresh', syncPinnedState);

  const unlockEvents = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'];

  function audioIsAudible() {
    return !!activeAudio && !activeAudio.paused && !activeAudio.muted;
  }
  function removeUnlockListeners() {
    unlockEvents.forEach((evt) => window.removeEventListener(evt, onUserGesture));
  }
  function onUserGesture(event) {
    if (muteBtn && event.target instanceof Node && muteBtn.contains(event.target)) {
      return;
    }

    if (audioIsAudible()) {
      removeUnlockListeners();
      return;
    }

    if (!unlocked) {
      unlockAndPlay();
    } else if (shouldPlay && !userMuted) {
      ensureActiveAudio();
      tryPlay(activeAudio);
    }

    if (audioIsAudible()) removeUnlockListeners();
  }
  unlockEvents.forEach((evt) => window.addEventListener(evt, onUserGesture, { passive: true }));

  muteBtn?.addEventListener('click', onMuteClick);
  root.addEventListener('scrolly:step', onStep);
  setMuteUI(false);

  const activeStep = root.querySelector('.step.is-active');
  if (activeStep) applyStep(activeStep, { immediate: true });

  setPinnedState(isStickyPinned());
}

function scrollStory() {
  document.querySelectorAll('[data-scroll-story]').forEach(initScrollStory);
}

function getStickyOffset(container) {
  const sticky = container.querySelector(".v-n-scrolly__sticky");
  if (!sticky) return 0;
  const top = parseFloat(getComputedStyle(sticky).top);
  return Number.isFinite(top) ? top : 0;
}

function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const containers = document.querySelectorAll(".v-n-scrolly");
  if (!containers.length) return;

  containers.forEach((container) => {
    const steps = [...container.querySelectorAll(".step")];
    const backgrounds = container.querySelectorAll(".bg-item");
    const sticky = container.querySelector(".v-n-scrolly__sticky");
    const overlaySteps = container.classList.contains("v-n-ss");
    const stickyOffset = overlaySteps ? getStickyOffset(container) : 0;
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

    function syncOverlayActive() {
      if (!overlaySteps) return;
      if (!isStickyStuck()) return;
      const step = getActiveOverlayStep();
      if (step) activateStep(step);
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

function getTriggerLineFromRootMargin(rootMargin) {
  const parts = String(rootMargin).trim().split(/\s+/);
  const bottom = parts[2] || "0px";
  const match = bottom.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (!match) return null;

  const value = Number(match[1]);
  return `${100 + value}vh`;
}

function observeInView({
  target,
  threshold = 0,
  rootMargin = "0px",
  once = true,
  markers = false,
  onEnter = () => {},
  onLeave = () => {}
} = {}) {
  let elements = [];

  if (typeof target === "string") {
    elements = document.querySelectorAll(target);
  } else if (target instanceof HTMLElement) {
    elements = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    elements = target;
  }

  if (!elements.length) {
    console.warn(`[observeInView] Elemento(s) no encontrado(s): ${target}`);
    return null;
  }

  if (markers) {
    const triggerTop = getTriggerLineFromRootMargin(rootMargin);

    if (triggerTop) {
      const marker = document.createElement("div");
      marker.style.position = "fixed";
      marker.style.left = "0";
      marker.style.right = "0";
      marker.style.top = triggerTop;
      marker.style.borderTop = "2px dashed red";
      marker.style.zIndex = "9999";
      marker.style.pointerEvents = "none";
      marker.innerHTML = `<span style="
        position:absolute;
        right:10px;
        top:-10px;
        font-size:12px;
        background:red;
        color:white;
        padding:2px 6px;
      ">trigger ${triggerTop}</span>`;
      document.body.appendChild(marker);
    } else {
      console.warn(
        "[observeInView] markers solo dibuja línea con rootMargin bottom en % (ej. 0px 0px -40% 0px). threshold es % del elemento, no del viewport."
      );
    }
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          if (markers) console.log("[observeInView] ENTER", entry);

          onEnter(entry);

          if (once) {
            obs.unobserve(entry.target);
          }
        } else {
          if (markers) console.log("[observeInView] LEAVE", entry);

          onLeave(entry);
        }
      });
    },
    {
      threshold: [threshold],
      rootMargin
    }
  );

  elements.forEach((el) => observer.observe(el));

  return observer;
}

function scrollStoryHeader() {
  const headers = document.querySelectorAll(".v-n-ss-h.has-animation");
  if (!headers.length) return;

  if (prefersReducedMotion()) {
    headers.forEach((header) => header.classList.remove("has-animation"));
    return;
  }

  observeInView({
    target: headers,
    threshold: 0,
    rootMargin: "0px 0px -40% 0px",
    once: true,
    onEnter: ({ target }) => {
      target.classList.remove("has-animation");
    }
  });
}

function getTextLines(textElement) {
  const tspans = [...textElement.querySelectorAll('tspan')];
  if (!tspans.length) return [textElement.textContent.trim()];

  const lines = new Map();
  tspans.forEach((tspan) => {
    const y = tspan.getAttribute('y') || '0';
    lines.set(y, `${lines.get(y) || ''}${tspan.textContent}`);
  });

  return [...lines.values()]
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

// Fallback prod: el <object> cross-origin deja contentDocument en null.
// Coordenadas = centro del rect de cada label en el SVG (viewBox 4000²).
const FALLBACK_MAP_LABELS = [
  { lines: ['PALACIO DE', 'BUENAVISTA'], left: 42.367, top: 20.728 },
  { lines: ['CALLE DE', 'ALCALÁ'], left: 62.575, top: 29.829, alcala: true },
  { lines: ['PUERTA DE', 'ALCALÁ'], left: 82.118, top: 26.028 },
  { lines: ['PARQUE DE', 'EL RETIRO'], left: 88.625, top: 60.558 },
  { lines: ['PASEO DEL', 'PRADO'], left: 48.337, top: 43.2 },
  { lines: ['PLAZA DE', 'LA LEALTAD'], left: 53.782, top: 58.372 },
  { lines: ['MUSEO', 'THYSSEN-', 'BORNEMISZA'], left: 37.272, top: 61.187 },
  { lines: ['MUSEO', 'DEL PRADO'], left: 57.581, top: 76.45 },
];

function appendLabel(labelsLayer, { lines, left, top, alcala = false }) {
  const label = document.createElement('span');
  const labelText = lines.join(' ');

  label.className = 'v-n-pm__map-label';
  if (alcala || /calle\s*de\s*alcal/i.test(labelText)) {
    label.classList.add('v-n-pm__map-label--alcala');
  }
  label.style.left = typeof left === 'number' ? `${left}%` : left;
  label.style.top = typeof top === 'number' ? `${top}%` : top;

  lines.forEach((line, index, textLines) => {
    label.append(document.createTextNode(line));
    if (index < textLines.length - 1) label.append(document.createElement('br'));
  });

  labelsLayer.append(label);
  return label;
}

function ensureWebpMapImage(mapContent) {
  const visibleMap = mapContent.querySelector('img.v-n-pm__map');
  if (!visibleMap?.src) return;

  // Si Methode aún sirve el .svg, los textos rojos del SVG se ven debajo de los labels HTML.
  if (/\.svg(\?|#|$)/i.test(visibleMap.src)) {
    visibleMap.src = visibleMap.src.replace(/\.svg(?=(\?|#|$))/i, '.webp');
  }
}

function createFallbackMapLabels(mapContent) {
  ensureWebpMapImage(mapContent);

  const labelsLayer = document.createElement('div');
  labelsLayer.className = 'v-n-pm__map-labels';
  labelsLayer.setAttribute('aria-hidden', 'true');

  const labels = FALLBACK_MAP_LABELS.map((item) => appendLabel(labelsLayer, item));
  mapContent.append(labelsLayer);
  return labels;
}

function createMapLabelsFromSvg(mapObject, mapContent) {
  const svgDocument = mapObject.contentDocument;
  const svg = svgDocument?.documentElement;
  const textGroup = svgDocument?.querySelector('#texto');
  const textElements = [...(textGroup?.querySelectorAll('text') || [])];
  const visibleMap = mapContent.querySelector('img.v-n-pm__map');

  if (!svg || !textGroup || !textElements.length) return [];

  ensureWebpMapImage(mapContent);
  if (visibleMap && !/\.webp(\?|#|$)/i.test(visibleMap.src)) {
    const embeddedMap = svgDocument?.querySelector('#mapa image');
    const embeddedMapSource = embeddedMap?.getAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
    ) || embeddedMap?.getAttribute('href');
    if (embeddedMapSource) visibleMap.src = embeddedMapSource;
  }

  const labelsLayer = document.createElement('div');
  labelsLayer.className = 'v-n-pm__map-labels';
  labelsLayer.setAttribute('aria-hidden', 'true');

  const viewBox = svg.viewBox.baseVal;
  const labels = textElements.map((textElement) => {
    const box = textElement.getBBox();
    const point = svg.createSVGPoint();
    point.x = box.x + box.width / 2;
    point.y = box.y + box.height / 2;
    const localMatrix = textElement.transform.baseVal.consolidate()?.matrix;
    const position = localMatrix ? point.matrixTransform(localMatrix) : point;
    const lines = getTextLines(textElement);

    return appendLabel(labelsLayer, {
      lines,
      left: ((position.x - viewBox.x) / viewBox.width) * 100,
      top: ((position.y - viewBox.y) / viewBox.height) * 100,
    });
  });

  textGroup.style.opacity = '0';
  mapContent.append(labelsLayer);
  return labels;
}

function createMapLabels(mapObject, mapContent) {
  mapContent.querySelector('.v-n-pm__map-labels')?.remove();

  if (mapObject?.contentDocument?.documentElement) {
    const fromSvg = createMapLabelsFromSvg(mapObject, mapContent);
    if (fromSvg.length) return fromSvg;
  }

  return createFallbackMapLabels(mapContent);
}

function setupPerspectiveMap(root) {
  if (root.dataset.pmReady === 'true') return;
  root.dataset.pmReady = 'true';

  const stage = root.querySelector('.v-n-pm__stage');
  const plane = root.querySelector('.v-n-pm__plane');
  const mapContent = root.querySelector('.v-n-pm__content');
  const index = root.querySelector('.v-n-pm__index');
  const indexItems = gsap.utils.toArray('.v-n-pm__index-item', root);
  const indexImages = gsap.utils.toArray('.v-n-pm__index-item img', root);
  const indexTitles = gsap.utils.toArray('.v-n-pm__index-item span', root);
  const mapObject = root.querySelector('.v-n-pm__map-data');
  const billboards = gsap.utils.toArray('.v-n-pm__billboard', root);
  const billboardImages = billboards.map((billboard) => billboard.querySelector('img'));
  const shadows = gsap.utils.toArray('.v-n-pm__shadow', root);
  const anchors = gsap.utils.toArray('.v-n-pm__dot', root);
  const connectors = gsap.utils.toArray('[data-pm-connector]', root);
  const diamonds = gsap.utils.toArray('[data-pm-diamond]', root);
  const connectorGraphics = [...connectors, ...diamonds];
  const labels = createMapLabels(mapObject, mapContent);

  if (
    !stage
    || !plane
    || !mapContent
    || !index
    || !billboards.length
    || anchors.length !== 3
  ) return;

  const connectorsSvg = root.querySelector('.v-n-pm__connectors');
  let connectorsFrame = 0;
  let connectorsNeeded = true;

  function fitIndexInsideSafeArea() {
    root.style.removeProperty('--pm-statue-max-height');

    const anchorCenters = anchors.map((anchor) => {
      const rect = anchor.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    const titleHeight = Math.max(...indexTitles.map((title) => title.offsetHeight), 0);
    const minimumGap = Math.min(
      anchorCenters[1] - anchorCenters[0],
      anchorCenters[2] - anchorCenters[1],
    );
    const safeImageHeight = Math.max(40, Math.min(135, minimumGap - titleHeight - 18));

    root.style.setProperty('--pm-statue-max-height', `${safeImageHeight}px`);
  }

  function alignIndexToAnchors() {
    const stageRect = stage.getBoundingClientRect();
    const tops = anchors.map((anchor) => {
      const rect = anchor.getBoundingClientRect();
      return rect.top + rect.height / 2 - stageRect.top;
    });

    indexItems.forEach((item, itemIndex) => {
      item.style.top = `${tops[itemIndex]}px`;
    });
  }

  function getArrivalScales() {
    return billboardImages.map((billboardImage, itemIndex) => {
      const indexRect = indexImages[itemIndex].getBoundingClientRect();
      const billboardRect = billboardImage.getBoundingClientRect();
      const currentScale = Number(gsap.getProperty(billboards[itemIndex], 'scale')) || 1;
      const naturalHeight = billboardRect.height / currentScale;

      if (!naturalHeight) return 1;

      return Math.max(0.35, Math.min(1.35, indexRect.height / naturalHeight));
    });
  }

  function getImageTravelDeltas() {
    const imageRects = indexImages.map((image) => image.getBoundingClientRect());
    const anchorRects = anchors.map((anchor) => anchor.getBoundingClientRect());

    return imageRects.map((imageRect, itemIndex) => {
      const anchorRect = anchorRects[itemIndex];
      return {
        x: (
          anchorRect.left
          + anchorRect.width / 2
          - imageRect.left
          - imageRect.width / 2
        ),
        y: anchorRect.top + anchorRect.height / 2 - imageRect.bottom,
      };
    });
  }

  function updateConnectorsNow() {
    if (!connectorsSvg || !connectorsNeeded) return;

    const stageRect = stage.getBoundingClientRect();
    const isDesktop = window.matchMedia('(min-width: 699px)').matches;
    const referenceImageRect = indexImages[0]?.getBoundingClientRect();
    if (!referenceImageRect) return;

    const sharedStartX = (
      referenceImageRect.left
      - stageRect.left
      - Math.min(28, stageRect.width * 0.025)
    );

    connectorsSvg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);

    connectors.forEach((connector, connectorIndex) => {
      const image = indexImages[connectorIndex];
      const anchor = anchors[connectorIndex];
      const diamond = diamonds[connectorIndex];
      if (!image || !anchor || !diamond) return;

      const imageRect = image.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      let lineStartX;
      let lineStartY;
      if (isDesktop) {
        lineStartX = sharedStartX;
        lineStartY = imageRect.bottom - stageRect.top;
      } else {
        const verticalGap = Math.min(16, Math.max(10, imageRect.height * 0.14));
        if (connectorIndex === 0) {
          lineStartX = imageRect.left + imageRect.width / 2 - stageRect.left;
          lineStartY = imageRect.bottom - stageRect.top + verticalGap;
        } else {
          lineStartX = imageRect.left + imageRect.width / 2 - stageRect.left;
          lineStartY = imageRect.top - stageRect.top - verticalGap;
        }
      }
      const lineEndX = anchorRect.left + anchorRect.width / 2 - stageRect.left;
      const lineEndY = anchorRect.top + anchorRect.height / 2 - stageRect.top;
      const diamondHalfSize = 3;

      connector.setAttribute('x1', lineStartX);
      connector.setAttribute('y1', lineStartY);
      connector.setAttribute('x2', lineEndX);
      connector.setAttribute('y2', lineEndY);
      diamond.setAttribute(
        'points',
        [
          `${lineStartX},${lineStartY - diamondHalfSize}`,
          `${lineStartX + diamondHalfSize},${lineStartY}`,
          `${lineStartX},${lineStartY + diamondHalfSize}`,
          `${lineStartX - diamondHalfSize},${lineStartY}`,
        ].join(' '),
      );
    });
  }

  function updateConnectors() {
    if (connectorsFrame) return;

    connectorsFrame = requestAnimationFrame(() => {
      connectorsFrame = 0;
      updateConnectorsNow();
    });
  }

  const media = gsap.matchMedia();

  media.add(
    {
      isDesktop: '(min-width: 699px)',
      isMobile: '(max-width: 698px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { isDesktop, reduceMotion } = context.conditions;
      if (reduceMotion) return undefined;

      const desktop = Boolean(isDesktop);
      const tilt = desktop ? 58 : 32;

      gsap.set(plane, {
        rotationX: 0,
        xPercent: desktop ? -38 : -50,
        yPercent: -50,
        scale: 1,
        force3D: true,
      });
      gsap.set(indexImages, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        scale: 1,
        transformOrigin: '50% 100%',
      });
      gsap.set(indexTitles, { autoAlpha: 1 });
      gsap.set(billboards, {
        autoAlpha: 0,
        xPercent: -50,
        rotationX: 0,
        y: 0,
        z: 0,
        scale: 1,
        transformOrigin: '50% 100%',
        force3D: true,
      });
      gsap.set(shadows, {
        autoAlpha: 0,
        xPercent: -50,
        x: 0,
        y: 0,
        z: 1,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        skewX: 0,
        scaleX: 1,
        scaleY: 0.18,
        transformOrigin: '50% 100%',
        force3D: true,
      });
      gsap.set(labels, {
        rotationX: 0,
        z: 0,
        force3D: true,
      });
      gsap.set(connectorGraphics, { autoAlpha: 1 });

      if (desktop) {
        fitIndexInsideSafeArea();
        alignIndexToAnchors();
        labels.forEach((label) => {
          if (!label.classList.contains('v-n-pm__map-label--alcala')) return;
          if (label.dataset.pmLeft) {
            label.style.left = label.dataset.pmLeft;
            label.style.top = label.dataset.pmTop;
          }
        });
      } else {
        root.style.removeProperty('--pm-statue-max-height');
        indexItems.forEach((item) => {
          item.style.top = '';
        });
        labels.forEach((label) => {
          if (!label.classList.contains('v-n-pm__map-label--alcala')) return;
          if (!label.dataset.pmLeft) {
            label.dataset.pmLeft = label.style.left;
            label.dataset.pmTop = label.style.top;
          }
          label.style.left = `${parseFloat(label.dataset.pmLeft) + 8}%`;
          label.style.top = `${parseFloat(label.dataset.pmTop) - 3.5}%`;
        });
      }

      let arrivalScales = getArrivalScales();
      let grownScales = arrivalScales.map((scale) => scale * (desktop ? 1.38 : 1.18));
      gsap.set(billboards, {
        scale: (itemIndex) => arrivalScales[itemIndex],
      });
      gsap.set(shadows, {
        scaleX: (itemIndex) => arrivalScales[itemIndex],
        scaleY: (itemIndex) => arrivalScales[itemIndex] * 0.18,
      });

      connectorsNeeded = true;
      updateConnectors();

      let travelDeltas = null;
      const getTravelDelta = (itemIndex, axis) => {
        if (!travelDeltas) travelDeltas = getImageTravelDeltas();
        return travelDeltas[itemIndex][axis];
      };

      const refreshScales = () => {
        arrivalScales = getArrivalScales();
        grownScales = arrivalScales.map((scale) => scale * (desktop ? 1.38 : 1.18));
      };

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          connectorsNeeded = timeline.time() < 0.45;
          if (connectorsNeeded) updateConnectors();
        },
        scrollTrigger: {
          trigger: root,
          pin: true,
          pinSpacing: true,
          start: desktop ? 'top top' : 'top top+=52',
          end: desktop ? '+=300%' : '+=240%',
          scrub: true,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onRefreshInit: () => {
            if (desktop) {
              fitIndexInsideSafeArea();
              alignIndexToAnchors();
            }
            travelDeltas = null;
          },
          onRefresh: (self) => {
            refreshScales();
            if (self.progress < 0.35) {
              gsap.set(billboards, {
                scale: (itemIndex) => arrivalScales[itemIndex],
                rotationX: 0,
              });
            }
            connectorsNeeded = self.progress < 0.45;
            updateConnectors();
          },
        },
      });

      timeline
        .set(indexImages, { autoAlpha: 1, x: 0, y: 0 }, 0)
        .set(indexTitles, { autoAlpha: 1 }, 0)
        .set(billboards, {
          autoAlpha: 0,
          rotationX: 0,
          scale: (itemIndex) => arrivalScales[itemIndex],
        }, 0)
        .set(shadows, {
          autoAlpha: 0,
          x: 0,
          skewX: 0,
          scaleX: (itemIndex) => arrivalScales[itemIndex],
          scaleY: (itemIndex) => arrivalScales[itemIndex] * 0.18,
        }, 0)
        .set(connectorGraphics, { autoAlpha: 1 }, 0)
        .set(plane, {
          rotationX: 0,
          xPercent: desktop ? -38 : -50,
          yPercent: -50,
          scale: 1,
        }, 0)
        .to(indexTitles, { autoAlpha: 0, duration: 0.2 }, 0.05)
        .to(
          indexImages,
          {
            x: (itemIndex) => getTravelDelta(itemIndex, 'x'),
            y: (itemIndex) => getTravelDelta(itemIndex, 'y'),
            duration: 0.34,
          },
          0.03,
        )
        .to(connectorGraphics, { autoAlpha: 0, duration: 0.12 }, 0.26)
        .set(indexImages, { autoAlpha: 0 }, 0.34)
        .set(
          billboards,
          {
            autoAlpha: 1,
            rotationX: 0,
            scale: (itemIndex) => arrivalScales[itemIndex],
          },
          0.35,
        )
        .to(
          plane,
          {
            rotationX: tilt,
            xPercent: desktop ? -54 : -50,
            yPercent: desktop ? -68 : -50,
            scale: desktop ? 1.08 : 1.06,
            duration: 0.58,
          },
          0.35,
        )
        .to(
          billboards,
          {
            rotationX: -tilt,
            z: 0,
            scale: (itemIndex) => grownScales[itemIndex],
            stagger: 0.04,
            duration: 0.4,
          },
          0.35,
        )
        .to(
          labels,
          {
            rotationX: -tilt,
            z: desktop ? 8 : 4,
            stagger: 0.012,
            duration: 0.28,
          },
          0.42,
        )
        .to(
          shadows,
          {
            autoAlpha: 0.55,
            x: desktop ? 14 : 8,
            skewX: desktop ? -18 : -14,
            scaleX: (itemIndex) => grownScales[itemIndex] * 1.02,
            scaleY: (itemIndex) => grownScales[itemIndex] * (desktop ? 0.2 : 0.16),
            stagger: 0.04,
            duration: 0.3,
          },
          0.38,
        )
        .to({}, { duration: 0.18 });

      return () => {
        if (connectorsFrame) {
          cancelAnimationFrame(connectorsFrame);
          connectorsFrame = 0;
        }
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
  );

  const resizeObserver = new ResizeObserver(() => {
    connectorsNeeded = true;
    updateConnectors();
    ScrollTrigger.refresh();
  });
  resizeObserver.observe(stage);
  resizeObserver.observe(plane);
  updateConnectors();
}

function whenImagesReady(images) {
  return Promise.all(
    images.map(
      (image) => (
        image.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })
      ),
    ),
  );
}

function initPerspectiveMap(root) {
  const mapObject = root.querySelector('.v-n-pm__map-data');

  const boot = () => {
    setupPerspectiveMap(root);
    const images = gsap.utils.toArray('img', root);
    whenImagesReady(images).then(() => ScrollTrigger.refresh());
  };

  // Localhost / same-origin: esperar al <object> para labels precisos del SVG.
  // Prod cross-origin (contentDocument null): fallback estático + img webp.
  if (mapObject?.contentDocument?.documentElement) {
    boot();
    return;
  }

  if (mapObject) {
    const onObjectReady = () => {
      if (root.dataset.pmReady === 'true') return;
      boot();
    };

    mapObject.addEventListener('load', onObjectReady, { once: true });

    window.setTimeout(() => {
      if (root.dataset.pmReady === 'true') return;
      boot();
    }, 400);
    return;
  }

  boot();
}

function perspectiveMap() {
  document.querySelectorAll('[data-perspective-map]').forEach(initPerspectiveMap);
}

function initAll() {
  document.body.classList.add('is-loaded');
  
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");
  articleTitle();
  scrollStory();
  scrolly();
  scrollStoryHeader();
  perspectiveMap();
}

initAll();