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

  function getActiveStep() {
    return root.querySelector('.step.is-active') || root.querySelector('.step');
  }

  function getStepCard(step) {
    return step?.querySelector('.step__c') || step || null;
  }

  function isCardVisible(card) {
    if (!card) return false;
    const rect = card.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  function isAnySameAudioCardVisible(audioId) {
    return [...root.querySelectorAll('.step')]
      .filter((step) => step.dataset.audio === String(audioId))
      .some((step) => isCardVisible(getStepCard(step)));
  }

  // Hueco entre dos cartelas consecutivas del mismo audio.
  // Vale igual al scrollear hacia abajo (A sale por arriba, B aún abajo)
  // y hacia arriba (B sale por abajo, A aún arriba): A.bottom <= 0 && B.top >= vh.
  function isInSameAudioContiguousGap(audioId) {
    const steps = [...root.querySelectorAll('.step')];
    const vh = window.innerHeight;

    for (let i = 0; i < steps.length - 1; i += 1) {
      if (steps[i].dataset.audio !== String(audioId)) continue;
      if (steps[i + 1].dataset.audio !== String(audioId)) continue;

      const a = getStepCard(steps[i]).getBoundingClientRect();
      const b = getStepCard(steps[i + 1]).getBoundingClientRect();
      if (a.bottom <= 0 && b.top >= vh) return true;
    }

    return false;
  }

  function shouldAudioPlayNow() {
    if (!isStickyPinned()) return false;

    const activeStep = getActiveStep();
    const audioId = activeStep?.dataset.audio ?? currentAudioId;
    if (audioId == null) return false;

    if (isAnySameAudioCardVisible(audioId)) return true;

    return isInSameAudioContiguousGap(audioId);
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

  // Detección de pin robusta: escuchamos el scroll directamente (con rAF) y
  // usamos las posiciones REALES del sticky. Así funciona aunque el contenedor
  // crezca después de inicializar (imágenes/contenido que cargan tarde y
  // desfasan las posiciones que cachea ScrollTrigger), evitando que el audio
  // se pare antes de tiempo cerca del final del bloque.
  let pinTicking = false;
  function syncPinnedState() {
    setPinnedState(shouldAudioPlayNow());
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

  // Desbloqueo de autoplay: CUALQUIER interacción del usuario en cualquier
  // parte de la página (no solo el botón de sonido) desbloquea el audio.
  // Mantenemos los listeners hasta que el audio suene de verdad, de forma que
  // al llegar a is-pinned empiece a sonar solo sin tener que pulsar el botón.
  // Nota: en móvil, el propio gesto de scroll (touchstart) ya desbloquea.
  const unlockEvents = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'];

  function audioIsAudible() {
    return !!activeAudio && !activeAudio.paused && !activeAudio.muted;
  }
  function removeUnlockListeners() {
    unlockEvents.forEach((evt) => window.removeEventListener(evt, onUserGesture));
  }
  function onUserGesture(event) {
    // El botón de sonido tiene su propia gestión
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
  root.addEventListener('scrolly:step', (event) => {
    onStep(event);
    syncPinnedState();
  });
  setMuteUI(false);

  // Solo estado inicial si ya hay un step activo (el scrolly decide cuándo)
  const activeStep = root.querySelector('.step.is-active');
  if (activeStep) applyStep(activeStep, { immediate: true });

  // Sincroniza por si el bloque ya está pineado al cargar
  setPinnedState(shouldAudioPlayNow());
}

export default function scrollStory() {
  document.querySelectorAll('[data-scroll-story]').forEach(initScrollStory);
}
