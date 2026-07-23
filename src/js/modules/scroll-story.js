import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../helpers/prefersReducedMotion';

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

  // "Ceba" un audio (play en silencio + pause) durante un gesto del usuario
  // para desbloquearlo, de modo que luego se pueda reproducir por código
  // (al pinear) sin que el navegador bloquee el autoplay con sonido.
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

    // Desbloqueamos TODOS los audios (para poder cambiar de pista después)
    // y, si ya estamos pineados, reproducimos el activo con sonido.
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

    // Autoplay bloqueado: el icono dice "unmuted" pero no suena → este click solo activa sonido
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
    // Fijado de verdad: top en el offset del sticky y aún visible
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

  // Detecta el pin real del position:sticky (no solo el start del trigger)
  ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    invalidateOnRefresh: true,
    onUpdate: () => {
      setPinnedState(isStickyPinned());
    },
    onLeave: () => setPinnedState(false),
    onLeaveBack: () => setPinnedState(false),
  });

  // Desbloqueo de autoplay tras primer gesto (excepto el botón mute, que se gestiona solo)
  const unlockEvents = ['pointerdown', 'touchstart', 'keydown'];
  function removeUnlockListeners() {
    unlockEvents.forEach((evt) => window.removeEventListener(evt, onFirstGesture));
  }
  function onFirstGesture(event) {
    if (muteBtn && event.target instanceof Node && muteBtn.contains(event.target)) {
      return;
    }

    unlockAndPlay();
    removeUnlockListeners();
  }
  unlockEvents.forEach((evt) => window.addEventListener(evt, onFirstGesture, { passive: true }));

  muteBtn?.addEventListener('click', (event) => {
    onMuteClick(event);
    removeUnlockListeners();
  });
  root.addEventListener('scrolly:step', onStep);
  setMuteUI(false);

  // Solo estado inicial si ya hay un step activo (el scrolly decide cuándo)
  const activeStep = root.querySelector('.step.is-active');
  if (activeStep) applyStep(activeStep, { immediate: true });

  // Sincroniza por si el bloque ya está pineado al cargar
  setPinnedState(isStickyPinned());
}

export default function scrollStory() {
  document.querySelectorAll('[data-scroll-story]').forEach(initScrollStory);
}
