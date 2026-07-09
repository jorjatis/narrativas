export const DEFAULT_EVENTS = [
  {
    id: '4',
    description: 'Se estrena Aquí no hay quien viva.',
    image: { src: '/assets/images/aquinohayquienviva.webp', alt: 'Aquí no hay quien viva' },
    marker: { src: '/assets/images/icon-aqui.webp', alt: 'Aquí no hay quien viva' },
    correctTime: 2003,
  },
  {
    id: '8',
    description: 'Llega el primer iPhone.',
    image: { src: '/assets/images/primeriphone.jpg', alt: 'Primer iPhone' },
    marker: { src: '/assets/images/icon-iphone.webp', alt: 'Primer iPhone' },
    correctTime: 2007,
  },
  {
    id: '2',
    description: 'Primera edición de Operación Triunfo.',
    image: { src: '/assets/images/operaciontriunfo.jpg', alt: 'Operación Triunfo' },
    marker: { src: '/assets/images/icon-ot.webp', alt: 'Operación Triunfo' },
    correctTime: 2001,
  },
  {
    id: '11',
    description: 'España gana el Mundial de fútbol.',
    image: { src: '/assets/images/mundial2010.jpg', alt: 'España gana el Mundial de fútbol' },
    marker: { src: '/assets/images/icon-mundial.webp', alt: 'España gana el Mundial de fútbol' },
    correctTime: 2010,
  },
  {
    id: '6',
    description: 'Se lanza YouTube.',
    image: { src: '/assets/images/youtube.jpg', alt: 'YouTube' },
    marker: { src: '/assets/images/icon-yt.webp', alt: 'YouTube' },
    correctTime: 2005,
  },
  {
    id: '1',
    description: 'Boom de Los Sims.',
    image: { src: '/assets/images/lossims.jpg', alt: 'Los Sims' },
    marker: { src: '/assets/images/icon-lossims.webp', alt: 'Los Sims' },
    correctTime: 2000,
  },
  {
    id: '9',
    description: 'Se estrena Física o Química.',
    image: { src: '/assets/images/fisicaoquimica.jpg', alt: 'Física o Química' },
    marker: { src: '/assets/images/icon-foq.webp', alt: 'Física o Química' },
    correctTime: 2008,
  },
  {
    id: '5',
    description: 'Nace Tuenti.',
    image: { src: '/assets/images/tuenti2.jpg', alt: 'Tuenti' },
    marker: { src: '/assets/images/icon-tuenti.webp', alt: 'Tuenti' },
    correctTime: 2004,
  },
  {
    id: '10',
    description: 'Boom de FarmVille en Facebook.',
    image: { src: '/assets/images/farmville.jpg', alt: 'FarmVille en Facebook' },
    marker: { src: '/assets/images/icon-fv.webp', alt: 'FarmVille en Facebook' },
    correctTime: 2009,
  },
  {
    id: '3',
    description: 'Estreno de Gran Hermano 3',
    image: { src: '/assets/images/granhermano.jpg', alt: 'Gran Hermano 3' },
    marker: { src: '/assets/images/icon-gh.webp', alt: 'Gran Hermano 3' },
    correctTime: 2002,
  },
  {
    id: '7',
    description: 'Sale la Nintendo Wii.',
    image: { src: '/assets/images/wii.jpg', alt: 'Nintendo Wii' },
    marker: { src: '/assets/images/icon-wii.webp', alt: 'Nintendo Wii' },
    correctTime: 2006,
  },
];

const MODES = { INSTANT: 'instant', BATCH: 'batch' };
const TYPE_GAMES = { BOTH: 'both', INSTANT: 'instant', PHASES: 'phases' };
const SLOT_ROLES = ['prev', 'active', 'next'];
const FEEDBACK_MS = 1000;
const CAROUSEL_SWIPE_THRESHOLD = 40;
const CAROUSEL_ANIM_MS = 280;
const TIMELINE_WHEEL_RESET_MS = 160;
const TIMELINE_WHEEL_STEP_THRESHOLD = 30;

function wrapIndex(index, length) {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

function getTickStep(ticksContainer) {
  const ticks = ticksContainer.querySelectorAll('.events-roll__tick');
  if (ticks.length < 2) return 14;

  const first = ticks[0].getBoundingClientRect();
  const second = ticks[1].getBoundingClientRect();

  return second.left - first.left;
}

function clampYear(year, min, max, step) {
  const index = Math.round((year - min) / step);
  const maxIndex = (max - min) / step;

  return min + Math.max(0, Math.min(maxIndex, index)) * step;
}

function getEventMarkerMedia(event) {
  if (event.marker?.src) return event.marker;
  return event.image;
}

function buildTimelineTicks(container, min, max, step) {
  container.innerHTML = '';

  for (let year = min; year <= max; year += step) {
    const index = (year - min) / step;
    const isMajor = index % 5 === 0;
    const tick = document.createElement('span');
    tick.className = `events-roll__tick events-roll__tick--${isMajor ? 'major' : 'minor'}`;
    tick.dataset.time = String(year);
    container.appendChild(tick);
  }
}

function buildTimelineFadeRoll(container, count) {
  container.innerHTML = '';

  for (let i = 0; i < count; i += 1) {
    const tick = document.createElement('span');
    tick.className = 'events-roll__tick events-roll__tick--fade';
    tick.setAttribute('aria-hidden', 'true');
    container.appendChild(tick);
  }
}

function applyTimelineConfig(timeline, config) {
  const { min, max, step, startYear } = config;

  timeline.dataset.min = String(min);
  timeline.dataset.max = String(max);
  timeline.dataset.step = String(step);
  timeline.setAttribute('aria-valuemin', String(min));
  timeline.setAttribute('aria-valuemax', String(max));
  timeline.setAttribute('aria-valuenow', String(startYear));
  timeline.setAttribute('aria-valuetext', `Año ${startYear}`);
}

/**
 * @param {string | {
 *   selector?: string,
 *   typeGame?: 'both' | 'instant' | 'phases',
 *   title?: string,
 *   events?: Array,
 *   timeline?: { min?: number, max?: number, step?: number, startYear?: number }
 * }} selectorOrOptions
 */
export default function gameEvents(selectorOrOptions = {}) {
  const options =
    typeof selectorOrOptions === 'string'
      ? { selector: selectorOrOptions }
      : selectorOrOptions;

  const {
    selector = '.events-roll',
    typeGame = TYPE_GAMES.BOTH,
    title = 'Línea temporal',
    events = DEFAULT_EVENTS,
    timeline: timelineOptions = {},
  } = options;

  const timelineConfig = {
    min: 1900,
    max: 2100,
    step: 10,
    startYear: 1950,
    ...timelineOptions,
  };

  const root = document.querySelector(selector);
  if (!root) return;

  const menu = root.querySelector('.events-roll__menu');
  const menuTitle = root.querySelector('.events-roll__menu-title');
  const menuBtns = [...root.querySelectorAll('.events-roll__menu-btn')];
  const gameEl = root.querySelector('.events-roll__game');
  const carousel = root.querySelector('.events-roll__carousel');
  const carouselStage = root.querySelector('.events-roll__carousel-stage');
  const slots = SLOT_ROLES.map((role) => carousel.querySelector(`.events-roll__event--${role}`));
  const carouselPrevBtn = root.querySelector('.events-roll__carousel-btn--prev');
  const carouselNextBtn = root.querySelector('.events-roll__carousel-btn--next');
  const carouselOverlay = root.querySelector('.events-roll__carousel-overlay');
  const checkPanel = root.querySelector('.events-roll__carousel-panel--check');
  const resultsPanel = root.querySelector('.events-roll__carousel-panel--results');
  const completePanel = root.querySelector('.events-roll__carousel-panel--complete');
  const resultsText = root.querySelector('.events-roll__results-text');
  const checkBtn = root.querySelector('.events-roll__check-btn');
  const retryBtn = root.querySelector('.events-roll__retry-btn');
  const restartBtn = root.querySelector('.events-roll__restart-btn');
  const statsProgress = root.querySelector('.events-roll__stats-item--progress');
  const statsFails = root.querySelector('.events-roll__stats-item--fails');
  const timeline = root.querySelector('.events-roll__timeline');
  const viewport = root.querySelector('.events-roll__timeline-viewport');
  const track = root.querySelector('.events-roll__timeline-track');
  const trackInner = root.querySelector('.events-roll__timeline-inner');
  const ticksContainer = root.querySelector('.events-roll__timeline-ticks');
  const rollStart = root.querySelector('.events-roll__timeline-fade--start');
  const rollEnd = root.querySelector('.events-roll__timeline-fade--end');
  const markersContainer = root.querySelector('.events-roll__markers');
  const timeOutput = root.querySelector('.events-roll__time');
  const placeBtn = root.querySelector('.events-roll__place-btn');
  const infoDialog = root.querySelector('.events-roll__info-modal');
  const infoClose = root.querySelector('.events-roll__info-close');
  const infoDismiss = root.querySelector('.events-roll__info-dismiss');

  applyTimelineConfig(timeline, timelineConfig);
  buildTimelineTicks(ticksContainer, timelineConfig.min, timelineConfig.max, timelineConfig.step);
  if (menuTitle) menuTitle.textContent = title;

  let ticks = [...ticksContainer.querySelectorAll('.events-roll__tick')];

  function rebuildFadeRolls() {
    const tickStep = getTickStep(ticksContainer);
    if (!tickStep || !trackInner.clientWidth) return;

    const padWidth = viewport.clientWidth * 0.5;
    const count = Math.max(1, Math.ceil(padWidth / tickStep));

    trackInner.style.setProperty('--events-roll-fade-width', `${padWidth}px`);
    buildTimelineFadeRoll(rollStart, count);
    buildTimelineFadeRoll(rollEnd, count);
  }
  const { min, max, step } = timelineConfig;
  const tickCount = (max - min) / step + 1;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const totalEvents = events.length;

  let gameMode = MODES.INSTANT;
  let currentIndex = 0;
  let currentYear = timelineConfig.startYear;
  let currentTranslate = 0;
  let timelineDragStartX = 0;
  let timelineDragStartTranslate = 0;
  let isTimelineDragging = false;
  let timelineWheelTimer = null;
  let timelineWheelRemainder = 0;
  let carouselDragStartX = 0;
  let isCarouselDragging = false;
  let isCarouselAnimating = false;
  let isPlacementLocked = false;
  let wrongFeedbackTimer = null;
  let activeWrongMarker = null;
  let failCount = 0;
  let batchFailCount = 0;
  let batchCorrected = false;
  let batchPhase = 'placing';

  const correctPlaced = {};
  const pendingPlaced = {};
  const markerElements = {};
  const batchWrongIds = new Set();

  function isGameComplete() {
    return Object.keys(correctPlaced).length === totalEvents;
  }

  function getOccupiedYears() {
    const years = new Set();
    Object.values(correctPlaced).forEach((year) => years.add(year));
    Object.values(pendingPlaced).forEach((year) => years.add(year));
    return years;
  }

  function isYearOccupied(year) {
    return getOccupiedYears().has(year);
  }

  function getCarouselPool() {
    if (gameMode === MODES.INSTANT) {
      return events.filter((event) => correctPlaced[event.id] === undefined);
    }

    return events.filter(
      (event) =>
        correctPlaced[event.id] === undefined && pendingPlaced[event.id] === undefined
    );
  }

  function isReadyToCheckBatch() {
    if (gameMode !== MODES.BATCH || batchPhase !== 'placing') return false;

    return events.every(
      (event) =>
        correctPlaced[event.id] !== undefined || pendingPlaced[event.id] !== undefined
    );
  }

  function getTickElement(year) {
    return ticks.find((tick) => Number(tick.dataset.time) === year);
  }

  function yearToIndex(year) {
    return (year - min) / step;
  }

  function yearToTranslate(year) {
    return -yearToIndex(year) * getTickStep(ticksContainer);
  }

  function translateToYear(translate) {
    const index = Math.round(-translate / getTickStep(ticksContainer));
    const clampedIndex = Math.max(0, Math.min(tickCount - 1, index));
    return min + clampedIndex * step;
  }

  function applyTrackTransform(translate, animate = false) {
    track.style.transition = animate && !prefersReducedMotion ? 'transform 0.2s ease' : 'none';
    track.style.transform = `translateX(${translate}px)`;
    currentTranslate = translate;
  }

  function getTickCenterLeft(tick) {
    const innerLeft = trackInner.getBoundingClientRect().left;
    const tickRect = tick.getBoundingClientRect();
    return tickRect.left - innerLeft + tickRect.width / 2;
  }

  function getMarkerLeft(year) {
    const tick = getTickElement(year);
    if (tick) return getTickCenterLeft(tick);

    const index = yearToIndex(year);
    const tickStep = getTickStep(ticksContainer);
    const paddingOffset = rollStart.offsetWidth || viewport.clientWidth * 0.5;
    return paddingOffset + index * tickStep + 1;
  }

  function positionMarker(marker, year) {
    const tick = getTickElement(year);
    marker.style.left = tick
      ? `${getTickCenterLeft(tick)}px`
      : `${getMarkerLeft(year)}px`;
    marker.dataset.placedTime = String(year);
  }

  function updateActiveTick() {
    ticks.forEach((tick) => {
      const year = Number(tick.dataset.time);
      const isCurrent = year === currentYear;
      tick.classList.toggle('is-current', isCurrent && !tick.classList.contains('is-correct'));
    });
  }

  function updateMarkerStates() {
    Object.values(markerElements).forEach((marker) => {
      const year = Number(marker.dataset.placedTime);
      const isAtTick = year === currentYear;

      marker.classList.toggle('is-active', isAtTick);
      marker.classList.toggle('is-idle', !isAtTick);
      marker.style.zIndex = isAtTick ? String(10 + Object.keys(markerElements).length) : '1';
    });
  }

  function createMarkerElement(event, year, type) {
    const markerMedia = getEventMarkerMedia(event);
    const marker = document.createElement('div');
    marker.className = `events-roll__marker is-${type}`;
    marker.role = 'listitem';
    marker.dataset.eventId = event.id;
    marker.dataset.placedTime = String(year);

    const figure = document.createElement('figure');
    figure.className = 'events-roll__marker-media';
    figure.hidden = type !== 'pending';

    const img = document.createElement('img');
    img.src = markerMedia.src;
    img.alt = markerMedia.alt;
    img.width = 200;
    img.height = 200;
    figure.appendChild(img);
    marker.appendChild(figure);

    positionMarker(marker, year);
    markersContainer.appendChild(marker);
    markerElements[event.id] = marker;

    return marker;
  }

  function clearWrongFeedback() {
    if (wrongFeedbackTimer) {
      window.clearTimeout(wrongFeedbackTimer);
      wrongFeedbackTimer = null;
    }

    if (activeWrongMarker) {
      const year = Number(activeWrongMarker.dataset.placedTime);
      getTickElement(year)?.classList.remove('is-wrong');
      activeWrongMarker.remove();
      activeWrongMarker = null;
    }
  }

  function lockPlacementDuringFeedback() {
    isPlacementLocked = true;
    placeBtn.disabled = true;
  }

  function unlockPlacement() {
    isPlacementLocked = false;
    updatePlaceButton();
  }

  function removeMarker(eventId) {
    const marker = markerElements[eventId];
    if (!marker) return;

    marker.remove();
    delete markerElements[eventId];
  }

  function showCorrectMarker(event, year, revealDelay = FEEDBACK_MS) {
    const markerMedia = getEventMarkerMedia(event);
    removeMarker(event.id);

    const marker = createMarkerElement(event, year, 'correct');
    marker.setAttribute('aria-label', `${markerMedia.alt}, colocado en ${year}`);
    getTickElement(year)?.classList.add('is-correct');
    getTickElement(year)?.classList.remove('is-current');
    updateMarkerStates();

    window.setTimeout(() => {
      marker.classList.add('is-revealed');
      marker.querySelector('.events-roll__marker-media').hidden = false;
    }, revealDelay);
  }

  function showWrongFeedback(event, year) {
    clearWrongFeedback();
    lockPlacementDuringFeedback();

    const tick = getTickElement(year);
    tick?.classList.add('is-wrong');

    const marker = document.createElement('div');
    marker.className = 'events-roll__marker is-wrong is-transient';
    marker.role = 'listitem';
    marker.dataset.placedTime = String(year);
    marker.setAttribute('aria-label', `Colocación incorrecta en ${year}`);

    positionMarker(marker, year);
    markersContainer.appendChild(marker);
    activeWrongMarker = marker;

    wrongFeedbackTimer = window.setTimeout(() => {
      tick?.classList.remove('is-wrong');
      activeWrongMarker?.remove();
      activeWrongMarker = null;
      wrongFeedbackTimer = null;
      unlockPlacement();
    }, FEEDBACK_MS);
  }

  function showPendingMarker(event, year) {
    const markerMedia = getEventMarkerMedia(event);
    const marker = createMarkerElement(event, year, 'pending');
    marker.setAttribute('aria-label', `${markerMedia.alt}, colocado provisionalmente en ${year}`);
    updateMarkerStates();
  }

  function markBatchWrong(event, year) {
    const markerMedia = getEventMarkerMedia(event);
    const marker = markerElements[event.id];
    if (!marker) return;

    marker.className = 'events-roll__marker is-wrong';
    marker.setAttribute('aria-label', `${markerMedia.alt}, incorrecto en ${year}`);
    marker.querySelector('.events-roll__marker-media').hidden = true;
    getTickElement(year)?.classList.add('is-wrong');
  }

  function updateTimeDisplay(year) {
    currentYear = clampYear(year, min, max, step);
    timeline.setAttribute('aria-valuenow', String(currentYear));
    timeline.setAttribute('aria-valuetext', `Año ${currentYear}`);
    timeOutput.textContent = String(currentYear);
    updateActiveTick();
    updateMarkerStates();
  }

  function setYear(year, animate = false) {
    const clamped = clampYear(year, min, max, step);
    applyTrackTransform(yearToTranslate(clamped), animate);
    updateTimeDisplay(clamped);
  }

  function updateSlot(slot, event, role) {
    if (!event) {
      slot.hidden = true;
      return;
    }

    slot.hidden = false;
    slot.className = `events-roll__event events-roll__event--${role}`;
    slot.dataset.eventId = event.id;

    if (role === 'active') {
      slot.setAttribute('aria-current', 'true');
      slot.removeAttribute('aria-hidden');
    } else {
      slot.removeAttribute('aria-current');
      slot.setAttribute('aria-hidden', 'true');
    }

    const body = slot.querySelector('.events-roll__event-body');
    const textEl = body.querySelector('.events-roll__event-text');
    textEl.textContent = event.description;

    let media = body.querySelector('.events-roll__event-media');

    if (role === 'active') {
      if (!media) {
        media = document.createElement('figure');
        media.className = 'events-roll__event-media';
        media.innerHTML = '<img width="800" height="600">';
        body.appendChild(media);
      }

      const img = media.querySelector('img');
      img.src = event.image.src;
      img.alt = event.image.alt;
      media.hidden = false;
    } else if (media) {
      media.remove();
    }
  }

  function hideOverlayPanels() {
    carouselOverlay.hidden = true;
    checkPanel.hidden = true;
    resultsPanel.hidden = true;
    completePanel.hidden = true;
  }

  function showCompleteOverlay() {
    carouselOverlay.hidden = false;
    checkPanel.hidden = true;
    resultsPanel.hidden = true;
    completePanel.hidden = false;
    carousel.hidden = true;
    carouselPrevBtn.disabled = true;
    carouselNextBtn.disabled = true;
    placeBtn.disabled = true;
  }

  function showCheckOverlay() {
    carouselOverlay.hidden = false;
    checkPanel.hidden = false;
    resultsPanel.hidden = true;
    completePanel.hidden = true;
  }

  function showResultsOverlay(correctCount, wrongCount) {
    carouselOverlay.hidden = false;
    checkPanel.hidden = true;
    resultsPanel.hidden = false;
    completePanel.hidden = true;
    resultsText.textContent = `${correctCount} bien, ${wrongCount} mal`;
    retryBtn.hidden = wrongCount === 0;
  }

  function updateStats() {
    const correctCount = Object.keys(correctPlaced).length;
    const pendingCount = Object.keys(pendingPlaced).length;
    const placedCount = correctCount + pendingCount;

    if (gameMode === MODES.INSTANT) {
      statsProgress.textContent = `${correctCount} de ${totalEvents} aciertos`;
      statsFails.hidden = failCount === 0;
      if (failCount > 0) {
        statsFails.textContent = `Fallos: ${failCount}`;
      }
      return;
    }

    if (batchCorrected) {
      statsProgress.textContent = `${correctCount} de ${totalEvents} aciertos`;
      statsFails.hidden = batchFailCount === 0;
      if (batchFailCount > 0) {
        statsFails.textContent = `Fallos: ${batchFailCount}`;
      }
    } else {
      statsProgress.textContent = `${placedCount} de ${totalEvents} colocados`;
      statsFails.hidden = true;
    }
  }

  function updatePlaceButton() {
    const pool = getCarouselPool();

    if (isPlacementLocked) {
      placeBtn.disabled = true;
      placeBtn.textContent = 'Colocar aquí';
      return;
    }

    if (pool.length === 0 || isGameComplete()) {
      placeBtn.disabled = true;
      placeBtn.textContent = 'Colocar aquí';
      return;
    }

    if (isYearOccupied(currentYear)) {
      placeBtn.disabled = true;
      placeBtn.textContent = 'Ya hay un evento';
      return;
    }

    placeBtn.disabled = false;
    placeBtn.textContent = 'Colocar aquí';
  }

  function updateControls() {
    if (isGameComplete()) {
      showCompleteOverlay();
      updateStats();
      return;
    }

    hideOverlayPanels();
    carousel.hidden = false;
    carouselPrevBtn.disabled = false;
    carouselNextBtn.disabled = false;

    if (gameMode === MODES.BATCH && batchPhase === 'results') {
      const correctCount = Object.keys(correctPlaced).length;
      const wrongCount = batchWrongIds.size;
      showResultsOverlay(correctCount, wrongCount);
      placeBtn.disabled = true;
      carouselPrevBtn.disabled = true;
      carouselNextBtn.disabled = true;
      updateStats();
      return;
    }

    if (gameMode === MODES.BATCH && isReadyToCheckBatch()) {
      showCheckOverlay();
      placeBtn.disabled = true;
      carouselPrevBtn.disabled = true;
      carouselNextBtn.disabled = true;
      updateStats();
      return;
    }

    updatePlaceButton();
    updateStats();
  }

  function renderCarouselSlots() {
    const pool = getCarouselPool();

    if (pool.length === 0) {
      updateControls();
      return;
    }

    if (currentIndex >= pool.length) currentIndex = 0;

    if (pool.length === 1) {
      updateSlot(slots[0], null, 'prev');
      updateSlot(slots[1], pool[0], 'active');
      updateSlot(slots[2], null, 'next');
    } else if (pool.length === 2) {
      const otherIndex = currentIndex === 0 ? 1 : 0;
      updateSlot(slots[0], pool[otherIndex], 'prev');
      updateSlot(slots[1], pool[currentIndex], 'active');
      updateSlot(slots[2], pool[otherIndex], 'next');
    } else {
      updateSlot(slots[0], pool[wrapIndex(currentIndex - 1, pool.length)], 'prev');
      updateSlot(slots[1], pool[currentIndex], 'active');
      updateSlot(slots[2], pool[wrapIndex(currentIndex + 1, pool.length)], 'next');
    }

    updateControls();
  }

  function updateCarousel() {
    if (isGameComplete()) {
      showCompleteOverlay();
      updateStats();
      return;
    }

    renderCarouselSlots();
  }

  function animateCarousel(callback) {
    if (isCarouselAnimating || prefersReducedMotion) {
      callback();
      return;
    }

    isCarouselAnimating = true;
    carousel.classList.add('is-changing');

    window.setTimeout(() => {
      callback();
      carousel.classList.remove('is-changing');
      isCarouselAnimating = false;
    }, CAROUSEL_ANIM_MS);
  }

  function goToPrevEvent(animated = false) {
    const pool = getCarouselPool();
    if (pool.length <= 1 || isCarouselAnimating) return;

    const navigate = () => {
      currentIndex = wrapIndex(currentIndex - 1, pool.length);
      renderCarouselSlots();
    };

    if (animated) animateCarousel(navigate);
    else navigate();
  }

  function goToNextEvent(animated = false) {
    const pool = getCarouselPool();
    if (pool.length <= 1 || isCarouselAnimating) return;

    const navigate = () => {
      currentIndex = wrapIndex(currentIndex + 1, pool.length);
      renderCarouselSlots();
    };

    if (animated) animateCarousel(navigate);
    else navigate();
  }

  function advanceCarouselAfterPlace() {
    const pool = getCarouselPool();
    if (pool.length === 0) {
      updateCarousel();
      return;
    }

    if (currentIndex >= pool.length) {
      currentIndex = Math.max(0, pool.length - 1);
    }

    updateCarousel();
  }

  function placeEventInstant() {
    const pool = getCarouselPool();
    const activeEvent = pool[currentIndex];
    if (!activeEvent || isPlacementLocked || isYearOccupied(currentYear)) return;

    const isCorrect = currentYear === activeEvent.correctTime;

    if (isCorrect) {
      correctPlaced[activeEvent.id] = currentYear;
      showCorrectMarker(activeEvent, currentYear);

      if (currentIndex >= pool.length - 1) {
        currentIndex = Math.max(0, pool.length - 2);
      }

      advanceCarouselAfterPlace();
    } else {
      failCount += 1;
      showWrongFeedback(activeEvent, currentYear);
      updateStats();
      updatePlaceButton();
    }
  }

  function placeEventBatch() {
    const pool = getCarouselPool();
    const activeEvent = pool[currentIndex];
    if (
      !activeEvent ||
      isPlacementLocked ||
      pendingPlaced[activeEvent.id] !== undefined ||
      isYearOccupied(currentYear)
    ) {
      return;
    }

    pendingPlaced[activeEvent.id] = currentYear;
    showPendingMarker(activeEvent, currentYear);

    if (currentIndex >= pool.length - 1) {
      currentIndex = Math.max(0, pool.length - 2);
    }

    advanceCarouselAfterPlace();
  }

  function placeEvent() {
    if (gameMode === MODES.INSTANT) placeEventInstant();
    else placeEventBatch();
  }

  function checkBatchAnswers() {
    let correctCount = 0;
    let wrongCount = 0;

    batchWrongIds.clear();

    events.forEach((event) => {
      if (correctPlaced[event.id] !== undefined) return;

      const year = pendingPlaced[event.id];
      const isCorrect = year === event.correctTime;

      if (isCorrect) {
        correctPlaced[event.id] = year;
        delete pendingPlaced[event.id];
        showCorrectMarker(event, year);
        correctCount += 1;
      } else {
        batchWrongIds.add(event.id);
        markBatchWrong(event, year);
        wrongCount += 1;
      }
    });

    batchFailCount += wrongCount;
    batchCorrected = true;

    if (wrongCount === 0 && isGameComplete()) {
      batchPhase = 'placing';
      updateCarousel();
      return;
    }

    batchPhase = 'results';
    updateCarousel();
  }

  function retryFailedBatch() {
    batchWrongIds.forEach((eventId) => {
      const year = pendingPlaced[eventId];

      removeMarker(eventId);
      delete pendingPlaced[eventId];

      getTickElement(year)?.classList.remove('is-wrong');
    });

    batchWrongIds.clear();
    batchPhase = 'placing';
    currentIndex = 0;
    updateCarousel();
  }

  function resetGameState() {
    clearWrongFeedback();
    isPlacementLocked = false;

    Object.keys(markerElements).forEach((eventId) => removeMarker(eventId));

    ticks.forEach((tick) => {
      tick.classList.remove('is-correct', 'is-wrong', 'is-current');
    });

    Object.keys(correctPlaced).forEach((key) => delete correctPlaced[key]);
    Object.keys(pendingPlaced).forEach((key) => delete pendingPlaced[key]);

    failCount = 0;
    batchFailCount = 0;
    batchCorrected = false;
    batchPhase = 'placing';
    batchWrongIds.clear();
    currentIndex = 0;

    hideOverlayPanels();
    carousel.hidden = false;
    setYear(timelineConfig.startYear, false);
    updateCarousel();
  }

  function startGame(mode) {
    closeInfoDialog();
    gameMode = mode;
    root.dataset.mode = mode;
    menu.classList.remove('is-visible');
    menu.hidden = true;
    gameEl.hidden = false;
    resetGameState();
  }

  function showMenu() {
    gameEl.hidden = true;
    menu.hidden = false;
    resetGameState();
    requestAnimationFrame(() => {
      menu.classList.add('is-visible');
      openInfoDialog();
    });
  }

  function resetGame() {
    if (typeGame === TYPE_GAMES.BOTH) {
      showMenu();
      return;
    }

    resetGameState();
  }

  function onTimelinePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    isTimelineDragging = true;
    timelineDragStartX = event.clientX;
    timelineDragStartTranslate = currentTranslate;
    viewport.setPointerCapture(event.pointerId);
    track.style.transition = 'none';
  }

  function onTimelinePointerMove(event) {
    if (!isTimelineDragging) return;

    const delta = event.clientX - timelineDragStartX;
    const nextTranslate = timelineDragStartTranslate + delta;
    const maxTranslate = 0;
    const minTranslate = yearToTranslate(max);

    const clampedTranslate = Math.max(minTranslate, Math.min(maxTranslate, nextTranslate));

    applyTrackTransform(clampedTranslate, false);
    updateTimeDisplay(translateToYear(clampedTranslate));
    updatePlaceButton();
  }

  function onTimelinePointerUp(event) {
    if (!isTimelineDragging) return;

    isTimelineDragging = false;

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    setYear(currentYear, true);
    updatePlaceButton();
  }

  function normalizeWheelDelta(event) {
    const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return rawDelta * 16;
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return rawDelta * viewport.clientWidth;

    return rawDelta;
  }

  function onTimelineWheel(event) {
    event.preventDefault();

    const delta = normalizeWheelDelta(event);
    if (!delta) return;

    timelineWheelRemainder += delta;

    if (Math.abs(timelineWheelRemainder) >= TIMELINE_WHEEL_STEP_THRESHOLD) {
      const direction = timelineWheelRemainder > 0 ? 1 : -1;

      setYear(currentYear + direction * step, true);
      updatePlaceButton();
      timelineWheelRemainder = 0;
    }

    if (timelineWheelTimer) window.clearTimeout(timelineWheelTimer);
    timelineWheelTimer = window.setTimeout(() => {
      timelineWheelRemainder = 0;
      timelineWheelTimer = null;
    }, TIMELINE_WHEEL_RESET_MS);
  }

  function onCarouselPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.target.closest('button') || !carouselOverlay.hidden) return;

    isCarouselDragging = true;
    carouselDragStartX = event.clientX;
    carouselStage.setPointerCapture(event.pointerId);
  }

  function onCarouselPointerUp(event) {
    if (!isCarouselDragging) return;

    isCarouselDragging = false;

    if (carouselStage.hasPointerCapture(event.pointerId)) {
      carouselStage.releasePointerCapture(event.pointerId);
    }

    const delta = event.clientX - carouselDragStartX;
    if (Math.abs(delta) >= CAROUSEL_SWIPE_THRESHOLD) {
      if (delta < 0) goToNextEvent(true);
      else goToPrevEvent(true);
    }
  }

  function onTimelineKeydown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setYear(currentYear - step, true);
      updatePlaceButton();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setYear(currentYear + step, true);
      updatePlaceButton();
    }
  }

  function openInfoDialog() {
    if (!infoDialog || infoDialog.open) return;
    infoDialog.showModal();
  }

  function closeInfoDialog() {
    if (!infoDialog || !infoDialog.open) return;
    infoDialog.close();
  }

  function bindInfoDialog() {
    if (!infoDialog) return;

    infoClose?.addEventListener('click', closeInfoDialog);
    infoDismiss?.addEventListener('click', closeInfoDialog);

    infoDialog.addEventListener('click', (event) => {
      if (event.target === infoDialog) closeInfoDialog();
    });

    infoDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeInfoDialog();
    });
  }

  viewport.addEventListener('pointerdown', onTimelinePointerDown);
  viewport.addEventListener('pointermove', onTimelinePointerMove);
  viewport.addEventListener('pointerup', onTimelinePointerUp);
  viewport.addEventListener('pointercancel', onTimelinePointerUp);
  viewport.addEventListener('wheel', onTimelineWheel, { passive: false });
  carouselStage.addEventListener('pointerdown', onCarouselPointerDown);
  carouselStage.addEventListener('pointerup', onCarouselPointerUp);
  carouselStage.addEventListener('pointercancel', onCarouselPointerUp);
  timeline.addEventListener('keydown', onTimelineKeydown);
  placeBtn.addEventListener('click', placeEvent);
  carouselPrevBtn?.addEventListener('click', () => goToPrevEvent(true));
  carouselNextBtn?.addEventListener('click', () => goToNextEvent(true));
  checkBtn?.addEventListener('click', checkBatchAnswers);
  retryBtn?.addEventListener('click', retryFailedBatch);
  restartBtn?.addEventListener('click', resetGame);

  menuBtns.forEach((btn) => {
    btn.addEventListener('click', () => startGame(btn.dataset.mode));
  });

  bindInfoDialog();

  window.addEventListener('resize', () => {
    rebuildFadeRolls();
    Object.values(markerElements).forEach((marker) => {
      positionMarker(marker, Number(marker.dataset.placedTime));
    });
    applyTrackTransform(yearToTranslate(currentYear), false);
  });

  const init = () => {
    timeOutput.textContent = String(timelineConfig.startYear);
    root.classList.remove('is-boot');
    rebuildFadeRolls();
    setYear(timelineConfig.startYear, false);
    requestAnimationFrame(rebuildFadeRolls);

    if (typeGame === TYPE_GAMES.BOTH) {
      gameEl.hidden = true;
      menu.hidden = false;
      requestAnimationFrame(() => {
        menu.classList.add('is-visible');
        openInfoDialog();
      });
      return;
    }

    menu.hidden = true;
    gameEl.hidden = false;
    startGame(typeGame === TYPE_GAMES.PHASES ? MODES.BATCH : MODES.INSTANT);
  };

  if (document.readyState === 'complete') {
    requestAnimationFrame(init);
  } else {
    window.addEventListener('load', () => requestAnimationFrame(init), { once: true });
  }
}

export { DEFAULT_EVENTS as EVENTS };
