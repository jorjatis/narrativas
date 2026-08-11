function fadeOnScroll(selector, threshold = 50) {
  const indicators = document.querySelectorAll(selector);
  if (!indicators.length) return;

  const update = () => {
    const visible = window.scrollY < threshold;

    indicators.forEach((el) => {
      el.classList.toggle("is-visible", visible);
      el.setAttribute("aria-hidden", String(!visible));
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function removeEls(target, { all = true, delay = 0 } = {}) {
  let elements = [];

  if (typeof target === 'string') {
    elements = all
      ? document.querySelectorAll(target)
      : [document.querySelector(target)];
  } else if (target instanceof HTMLElement) {
    elements = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    elements = target;
  }

  elements.forEach(el => {
    if (!el) return;

    const remove = () => el.remove();

    if (delay > 0) {
      setTimeout(remove, delay);
    } else {
      remove();
    }
  });
}

function initAudioPlayer() {
  const players = [...document.querySelectorAll('.v-ply.is-audio-player')];
  if (!players.length) return;

  const instances = players.map((player) => createPlayer(player));

  instances.forEach((instance) => {
    instance.onPlay = () => {
      instances.forEach((other) => {
        if (other !== instance) other.pause();
      });
    };
  });
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function createPlayer(player) {
  const button = player.querySelector('.v-ply__b');
  const audio = player.querySelector('audio');
  const clip = player.querySelector('.v-ply__clip');
  const progressEl = player.querySelector('progress');
  const timeEl = player.querySelector('.v-ply__p');
  const scrubTrack = player.querySelector('.v-ply__v');

  if (!button || !audio) return { pause() {} };

  const lazy = (audio.getAttribute('preload') || 'auto').toLowerCase() === 'none';

  let rafId = 0;
  let onPlay = null;
  let ready = false;
  let loading = false;
  let scrubbing = false;

  const setPlaying = (playing) => {
    player.classList.add('is-active');
    player.classList.toggle('is-play', playing);
    player.classList.toggle('is-pause', !playing);
  };

  const updateUi = () => {
    const duration = audio.duration;
    const current = audio.currentTime || 0;
    const hasDuration = Number.isFinite(duration) && duration > 0;

    if (clip && hasDuration) {
      const progress = Math.min(1, Math.max(0, current / duration));
      clip.style.width = `${progress * 100}%`;
    }

    if (progressEl && hasDuration) {
      progressEl.max = duration;
      progressEl.value = Math.min(current, duration);
    }

    if (timeEl && hasDuration) {
      timeEl.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    }
  };

  const tick = () => {
    if (!scrubbing) updateUi();
    if (!audio.paused && !audio.ended) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const pause = () => {
    audio.pause();
    cancelAnimationFrame(rafId);
    if (ready) setPlaying(false);
    updateUi();
  };

  const play = async () => {
    try {
      await audio.play();
      onPlay?.();
      setPlaying(true);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    } catch (error) {
      console.warn('[audio-player] No se pudo reproducir el audio', error);
      setPlaying(false);
    }
  };

  const seekFromEvent = (event) => {
    if (!ready || !scrubTrack) return;
    const duration = audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const rect = scrubTrack.getBoundingClientRect();
    if (!rect.width) return;

    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    updateUi();
  };

  const markReady = ({ autoplay = false } = {}) => {
    if (ready) return;
    ready = true;
    loading = false;
    player.classList.remove('is-load');
    player.classList.add('is-active');
    button.disabled = false;
    if (clip) clip.style.width = '0%';
    updateUi();
    if (autoplay) play();
    else setPlaying(false);
  };

  const startLoad = ({ autoplay = false } = {}) => {
    if (loading || ready) return;
    loading = true;
    player.classList.add('is-load');
    player.classList.remove('is-active', 'is-play', 'is-pause');
    button.disabled = true;

    const onReady = () => markReady({ autoplay });

    if (audio.readyState >= 2) {
      onReady();
      return;
    }

    audio.addEventListener('canplaythrough', onReady, { once: true });
    audio.addEventListener('loadeddata', onReady, { once: true });
    audio.addEventListener('error', () => {
      loading = false;
      player.classList.remove('is-load');
      button.disabled = true;
      console.warn('[audio-player] Error al cargar el audio', audio.src);
    }, { once: true });
    audio.load();
  };

  button.addEventListener('click', () => {
    if (!ready) {
      if (lazy) startLoad({ autoplay: true });
      return;
    }
    if (audio.paused) play();
    else pause();
  });

  if (scrubTrack) {
    scrubTrack.style.cursor = 'pointer';
    scrubTrack.style.touchAction = 'none';

    scrubTrack.addEventListener('pointerdown', (event) => {
      if (!ready || event.button !== 0) return;
      scrubbing = true;
      scrubTrack.setPointerCapture(event.pointerId);
      seekFromEvent(event);
      event.preventDefault();
    });

    scrubTrack.addEventListener('pointermove', (event) => {
      if (!scrubbing) return;
      seekFromEvent(event);
    });

    const endScrub = (event) => {
      if (!scrubbing) return;
      scrubbing = false;
      if (scrubTrack.hasPointerCapture?.(event.pointerId)) {
        scrubTrack.releasePointerCapture(event.pointerId);
      }
      updateUi();
    };

    scrubTrack.addEventListener('pointerup', endScrub);
    scrubTrack.addEventListener('pointercancel', endScrub);
  }

  audio.addEventListener('ended', () => {
    cancelAnimationFrame(rafId);
    audio.currentTime = 0;
    setPlaying(false);
    if (clip) clip.style.width = '0%';
    updateUi();
  });

  if (lazy) {
    button.disabled = false;
  } else {
    startLoad({ autoplay: false });
  }

  return {
    pause,
    set onPlay(fn) {
      onPlay = fn;
    },
  };
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

function initVideoSubtitles() {
  const scenes = [...document.querySelectorAll('.vid-subs')];
  if (!scenes.length) return;

  scenes.forEach((scene) => {
    createVideoSubtitles(scene);
  });
}

function createVideoSubtitles(scene) {
  const player = scene.querySelector('.vid-subs__video.v-ply');
  const video = player?.querySelector('video');
  const playButton = player?.querySelector('.v-ply__b');
  const soundHint = scene.querySelector('.vid-subs__sound-hint');
  const subsBox = scene.querySelector('.vid-subs__subs');
  const subsScroll = subsBox?.querySelector('.vid-subs__subs-scroll');
  const paragraph = subsScroll?.querySelector('p');
  const scrub = scene.querySelector('.vid-subs__scrub');
  const scrubTrack = scene.querySelector('.vid-subs__scrub-track');
  const scrubFill = scene.querySelector('.vid-subs__scrub-fill');
  const wantsAutoplay = video?.hasAttribute('autoplay');

  if (!player || !video || !subsBox || !subsScroll || !paragraph || !playButton) return;

  const transcriptUrl =
    scene.dataset.transcript ||
    video.dataset.transcript ||
    deriveTranscriptUrl(video.getAttribute('src'));

  scene.classList.add('is-load');
  player.classList.add('is-load');
  player.classList.remove('is-active', 'is-play', 'is-pause');
  playButton.disabled = true;

  let words = [];
  let wordEls = [];
  let lastActiveIndex = -1;
  let lastScrubProgress = -1;
  let rafId = 0;
  let videoReady = false;
  let transcriptReady = false;
  let dragging = false;
  let scrubTrackWidth = 0;

  const setPlaying = (playing) => {
    if (!player.classList.contains('is-active')) return;
    player.classList.toggle('is-play', playing);
    player.classList.toggle('is-pause', !playing);
    syncMutedUi();
  };

  const syncMutedUi = () => {
    const muted = Boolean(video.muted);
    const active = player.classList.contains('is-active');

    player.classList.toggle('is-muted', active && muted);

    if (!active) {
      playButton.setAttribute('aria-label', 'Reproducir o pausar el vídeo');
      return;
    }

    if (muted) {
      playButton.setAttribute('aria-label', 'Activar el sonido');
      return;
    }

    playButton.setAttribute(
      'aria-label',
      video.paused || video.ended ? 'Reproducir el vídeo' : 'Pausar el vídeo',
    );
  };

  const updateScrub = (time = video.currentTime) => {
    if (!scrubFill || !video.duration) return;
    const progress = Math.min(1, Math.max(0, time / video.duration));
    if (Math.abs(progress - lastScrubProgress) < 0.0005) return;
    lastScrubProgress = progress;
    scrubFill.style.transform = `scaleX(${progress})`;
  };

  const updateSubsFade = () => {
    const maxScroll = subsScroll.scrollHeight - subsScroll.clientHeight;
    const atStart = maxScroll <= 1 || subsScroll.scrollTop <= 2;
    const atEnd = maxScroll <= 1 || subsScroll.scrollTop >= maxScroll - 2;
    subsBox.classList.toggle('is-start', atStart);
    subsBox.classList.toggle('is-end', atEnd);
  };

  const findActiveIndex = (time) => {
    let low = 0;
    let high = words.length - 1;
    let activeIndex = -1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      if (words[mid].start <= time) {
        activeIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return activeIndex;
  };

  const applyWordRange = (fromIndex, toIndex) => {
    if (fromIndex >= 0 && wordEls[fromIndex]) {
      wordEls[fromIndex].classList.remove('is-active');
    }

    if (toIndex > fromIndex) {
      for (let i = Math.max(0, fromIndex + 1); i <= toIndex; i += 1) {
        wordEls[i]?.classList.add('vid-subs__word--over');
      }
    } else if (toIndex < fromIndex) {
      for (let i = toIndex + 1; i <= fromIndex; i += 1) {
        wordEls[i]?.classList.remove('vid-subs__word--over', 'is-active');
      }
    }

    if (toIndex >= 0) {
      const activeEl = wordEls[toIndex];
      activeEl?.classList.add('vid-subs__word--over', 'is-active');
      scrollWordIntoView(subsScroll, activeEl);
    }

    lastActiveIndex = toIndex;
    updateSubsFade();
  };

  const syncWords = (time, { force = false } = {}) => {
    if (!wordEls.length) return;

    const activeIndex = findActiveIndex(time);
    if (!force && activeIndex === lastActiveIndex) return;

    if (force || lastActiveIndex < 0 || Math.abs(activeIndex - lastActiveIndex) > 8) {
      // Seek grande o primer sync: repinta el rango completo de forma barata.
      wordEls.forEach((el, index) => {
        el.classList.toggle('vid-subs__word--over', index <= activeIndex);
        el.classList.toggle('is-active', index === activeIndex);
      });
      if (activeIndex >= 0) scrollWordIntoView(subsScroll, wordEls[activeIndex]);
      lastActiveIndex = activeIndex;
      updateSubsFade();
      return;
    }

    applyWordRange(lastActiveIndex, activeIndex);
  };

  const tick = () => {
    syncWords(video.currentTime);
    updateScrub();
    if (!video.paused && !video.ended) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const hideSoundHint = () => {
    soundHint?.classList.add('is-hidden');
  };

  const unmute = () => {
    if (!video.muted) return;
    video.muted = false;
    hideSoundHint();
    syncMutedUi();
  };

  const maybeReady = () => {
    if (!videoReady || !transcriptReady) return;

    scene.classList.remove('is-load');
    player.classList.remove('is-load');
    player.classList.add('is-active');
    playButton.disabled = false;

    syncWords(video.currentTime, { force: true });
    updateScrub();
    updateSubsFade();
    if (scrubTrack) scrubTrackWidth = scrubTrack.getBoundingClientRect().width;

    if (wantsAutoplay) {
      video.muted = true;
      syncMutedUi();
      play();
    } else {
      player.classList.add('is-pause');
      player.classList.remove('is-play');
      syncMutedUi();
    }
  };

  const renderWords = (items) => {
    const fragment = document.createDocumentFragment();
    wordEls = items.map((item, index) => {
      const span = document.createElement('span');
      span.className = 'vid-subs__word';
      span.dataset.start = String(item.start);
      span.dataset.end = String(item.end);
      span.dataset.index = String(index);
      span.textContent = item.word;
      span.tabIndex = 0;
      span.setAttribute('role', 'button');
      fragment.append(span, document.createTextNode(' '));
      return span;
    });
    paragraph.replaceChildren(fragment);
    lastActiveIndex = -1;
  };

  const pause = () => {
    video.pause();
    cancelAnimationFrame(rafId);
    setPlaying(false);
    syncWords(video.currentTime);
    updateScrub();
  };

  const play = async () => {
    if (!player.classList.contains('is-active')) return;
    try {
      await video.play();
      setPlaying(true);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    } catch (error) {
      console.warn('[video-subtitles] No se pudo reproducir el vídeo', error);
      setPlaying(false);
    }
  };

  const toggle = () => {
    if (!player.classList.contains('is-active')) return;

    // Primer clic con vídeo muteado: activa el sonido (y reproduce si estaba pausado).
    if (video.muted) {
      unmute();
      if (video.paused || video.ended) play();
      return;
    }

    if (video.paused || video.ended) play();
    else pause();
  };

  const seekTo = (time) => {
    if (!Number.isFinite(time) || !video.duration) return;
    const next = Math.min(Math.max(0, time), video.duration);
    video.currentTime = next;
    syncWords(next, { force: true });
    updateScrub(next);
  };

  const seekFromPointer = (clientX) => {
    if (!scrubTrack || !video.duration) return;
    if (!scrubTrackWidth) {
      scrubTrackWidth = scrubTrack.getBoundingClientRect().width;
    }
    if (!scrubTrackWidth) return;
    const rectLeft = scrubTrack.getBoundingClientRect().left;
    const ratio = Math.min(1, Math.max(0, (clientX - rectLeft) / scrubTrackWidth));
    seekTo(ratio * video.duration);
  };

  const seekToWord = (wordEl) => {
    const start = Number(wordEl.dataset.start);
    if (!Number.isFinite(start)) return;
    unmute();
    seekTo(start);
    if (video.paused) play();
  };

  subsScroll.addEventListener('scroll', updateSubsFade, { passive: true });

  player.addEventListener('click', (event) => {
    if (event.target.closest('.vid-subs__scrub')) return;
    if (event.target.closest('.vid-subs__word')) return;
    toggle();
  });

  playButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggle();
  });

  paragraph.addEventListener('click', (event) => {
    const wordEl = event.target.closest('.vid-subs__word');
    if (!wordEl || !player.classList.contains('is-active')) return;
    event.stopPropagation();
    seekToWord(wordEl);
  });

  paragraph.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const wordEl = event.target.closest('.vid-subs__word');
    if (!wordEl) return;
    event.preventDefault();
    seekToWord(wordEl);
  });

  if (scrub && scrubTrack) {
    scrub.addEventListener('pointerdown', (event) => {
      if (!player.classList.contains('is-active')) return;
      event.preventDefault();
      event.stopPropagation();
      dragging = true;
      scrub.classList.add('is-drag');
      scrubTrackWidth = scrubTrack.getBoundingClientRect().width;
      scrub.setPointerCapture?.(event.pointerId);
      seekFromPointer(event.clientX);
    });

    scrub.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      event.preventDefault();
      seekFromPointer(event.clientX);
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      scrub.classList.remove('is-drag');
      if (event?.pointerId != null) scrub.releasePointerCapture?.(event.pointerId);
    };

    scrub.addEventListener('pointerup', endDrag);
    scrub.addEventListener('pointercancel', endDrag);
    scrub.addEventListener('click', (event) => event.stopPropagation());
  }

  video.addEventListener('ended', () => {
    cancelAnimationFrame(rafId);
    setPlaying(false);
    syncWords(video.duration || video.currentTime, { force: true });
    updateScrub(video.duration || video.currentTime);
  });
  video.addEventListener('pause', () => {
    if (!video.ended) setPlaying(false);
  });
  video.addEventListener('play', () => setPlaying(true));
  // Solo rAF actualiza scrub durante play; timeupdate cubre pause/seek externo.
  video.addEventListener('timeupdate', () => {
    if (dragging || (!video.paused && rafId)) return;
    updateScrub();
  });
  video.addEventListener('loadedmetadata', () => updateScrub());

  // Si el bloque sale de pantalla (scroll / slideUp), pausar el vídeo
  observeInView({
    target: scene,
    threshold: 0,
    once: false,
    onLeave: () => {
      if (!video.paused) pause();
    },
  });

  const markVideoReady = () => {
    if (videoReady) return;
    videoReady = true;
    maybeReady();
  };

  if (video.readyState >= 3) markVideoReady();
  else {
    video.addEventListener('canplay', markVideoReady, { once: true });
    video.addEventListener('error', () => {
      videoReady = true;
      maybeReady();
    }, { once: true });
  }

  if (!transcriptUrl) {
    console.warn('[video-subtitles] No hay URL de transcript');
    transcriptReady = true;
    maybeReady();
    return;
  }

  fetch(transcriptUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      words = normalizeWords(data);
      renderWords(words);
      transcriptReady = true;
      maybeReady();
    })
    .catch((error) => {
      console.warn('[video-subtitles] No se pudo cargar el transcript', error);
      transcriptReady = true;
      maybeReady();
    });
}

function deriveTranscriptUrl(src) {
  if (!src || src === '#') return null;
  return src.replace(/\.[^/.]+$/, '.json');
}

function normalizeWords(data) {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => ({
      word: String(item.word || '').trim(),
      start: Number(item.start),
      end: Number(item.end),
    }))
    .filter((item) => item.word && Number.isFinite(item.start) && Number.isFinite(item.end));
}

function scrollWordIntoView(container, wordEl) {
  if (!container || !wordEl) return;

  const containerRect = container.getBoundingClientRect();
  const wordRect = wordEl.getBoundingClientRect();

  // Mantener la palabra activa centrada en vertical dentro de la caja.
  const offset =
    wordRect.top -
    containerRect.top -
    containerRect.height / 2 +
    wordRect.height / 2;

  const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
  const nextTop = Math.min(Math.max(0, container.scrollTop + offset), maxScroll);

  if (Math.abs(nextTop - container.scrollTop) < 1) return;

  container.scrollTo({
    top: nextTop,
    behavior: 'auto',
  });
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

function getHeaderOffset(root) {
  const raw = getComputedStyle(root).getPropertyValue('--preh-header').trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 58;
}

function initPreArticleHeader() {
  const root = document.querySelector('.v-n-preh');
  if (!root) return;

  const run = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => createPreArticleHeader(root));
    });
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(run, run);
  } else {
    run();
  }
}

function createPreArticleHeader(root) {
  const stage = root.querySelector('.v-n-preh__stage');
  const scene01 = root.querySelector('.v-n-preh-scene--01');
  const scene02 = root.querySelector('.v-n-preh-scene--02');
  const scene03 = root.querySelector('.v-n-preh-scene--03');
  const pathTrack = root.querySelector('.v-a-t__path-track');
  const pathDraw = root.querySelector('.v-a-t__path-draw');
  const frames = [...root.querySelectorAll('.vid-frames')];

  if (!stage || !scene01 || !scene02 || !scene03) return;

  const headerOffset = getHeaderOffset(root);
  const pathLength = pathDraw?.getTotalLength?.() || 533;

  if (pathLength) {
    const dash = { strokeDasharray: pathLength };
    if (pathTrack) gsap.set(pathTrack, { ...dash, strokeDashoffset: 0 });
    gsap.set(pathDraw, { ...dash, strokeDashoffset: pathLength });
  }

  if (prefersReducedMotion()) {
    gsap.set(scene01, { autoAlpha: 0, yPercent: -100 });
    gsap.set(scene02, { autoAlpha: 0, yPercent: -100 });
    gsap.set(scene03, { autoAlpha: 1 });
    if (pathDraw && pathLength) gsap.set(pathDraw, { strokeDashoffset: 0 });
    gsap.set(frames, { clipPath: 'inset(0 0% 0 0)' });
    root.classList.add('is-ready');
    return;
  }

  gsap.set(scene02, { autoAlpha: 0, yPercent: 0 });
  gsap.set(scene03, { autoAlpha: 1, yPercent: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: `top ${headerOffset}px`,
      end: () => `+=${Math.round(window.innerHeight * 3)}`,
      pin: true,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  tl.to(scene01, { yPercent: -100, duration: 1 }, 0);
  tl.to(scene02, { autoAlpha: 1, duration: 0.7 }, 0.15);

  if (pathDraw && pathLength) {
    tl.to(pathDraw, { strokeDashoffset: 0, duration: 1.1 }, 1);
  } else {
    tl.to({}, { duration: 1.1 }, 1);
  }

  tl.to(scene02, { yPercent: -100, duration: 1 }, 2.3);

  tl.to({}, { duration: 0.55 }, 3.3);

  frames.forEach((frame, index) => {
    tl.to(
      frame,
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.9,
        ease: 'power1.out',
      },
      3.85 + index * 0.2,
    );
  });

  tl.to({}, { duration: 0.7 }, 5.15);

  root.classList.add('is-ready');
}

const ST_ID = 'route-medias-map';
const TIP_OFFSET_FROM_BOTTOM = 100;
const MAP_INTRINSIC_W = 1920;
const MAP_INTRINSIC_H = 4496;

function initRouteMediasMap() {
  const root = document.querySelector('.v-n-route-medias');
  if (!root) return;

  const preh = document.querySelector('.v-n-preh');
  if (preh && !preh.classList.contains('is-ready')) {
    const obs = new MutationObserver(() => {
      if (!preh.classList.contains('is-ready')) return;
      obs.disconnect();
      createRouteMediasMap(root);
    });
    obs.observe(preh, { attributes: true, attributeFilter: ['class'] });
    return;
  }

  createRouteMediasMap(root);
}

function syncMapSectionMinHeight(root) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  if (!track) return false;

  const trackWidth = track.getBoundingClientRect().width;
  if (!trackWidth) return false;

  const next = `${Math.ceil((trackWidth * MAP_INTRINSIC_H) / MAP_INTRINSIC_W)}px`;
  if (root.style.minHeight === next) return false;
  root.style.minHeight = next;
  return true;
}

function createRouteMediasMap(root) {
  const path = root.querySelector('.v-n-route-medias__map-path');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  if (!path?.getTotalLength || !svg?.createSVGPoint) return;

  ScrollTrigger.getById(ST_ID)?.kill();
  syncMapSectionMinHeight(root);

  const pathLength = path.getTotalLength();
  if (!pathLength) return;

  const dash = {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  };

  const placeLabels = () => positionMapLabels(root, path);

  if (prefersReducedMotion()) {
    gsap.set(path, { ...dash, strokeDashoffset: 0 });
    root.classList.add('is-map-ready');
    placeLabels();
    bindMapLabelResize(root, placeLabels);
    return;
  }

  gsap.set(path, dash);

  const setOffset = gsap.quickTo(path, 'strokeDashoffset', {
    duration: 0.45,
    ease: 'none',
    overwrite: true,
  });

  const syncTip = () => {
    const drawn = lengthAtViewportGuide(path, svg, pathLength);
    setOffset(pathLength - drawn);
  };

  ScrollTrigger.create({
    id: ST_ID,
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: syncTip,
    onRefresh: () => {
      placeLabels();
      const drawn = lengthAtViewportGuide(path, svg, pathLength);
      gsap.set(path, { strokeDashoffset: pathLength - drawn });
    },
  });

  root.classList.add('is-map-ready');
  placeLabels();
  syncTip();
  bindMapLabelResize(root, placeLabels, syncTip);

  const refresh = () => {
    placeLabels();
    ScrollTrigger.refresh();
  };

  root.querySelectorAll('img, video').forEach((media) => {
    if (media.complete) return;
    media.addEventListener('load', refresh, { once: true });
  });
}

function lengthAtViewportGuide(path, svg, pathLength) {
  const ctm = path.getScreenCTM?.();
  if (!ctm) return 0;

  const targetY = window.innerHeight - TIP_OFFSET_FROM_BOTTOM;
  const pt = svg.createSVGPoint();

  const screenYAt = (len) => {
    const p = path.getPointAtLength(len);
    pt.x = p.x;
    pt.y = p.y;
    return pt.matrixTransform(ctm).y;
  };

  const startY = screenYAt(0);
  const endY = screenYAt(pathLength);

  if (targetY <= startY) return 0;
  if (targetY >= endY) return pathLength;

  let lo = 0;
  let hi = pathLength;
  for (let i = 0; i < 28; i += 1) {
    const mid = (lo + hi) / 2;
    if (screenYAt(mid) < targetY) lo = mid;
    else hi = mid;
  }

  return (lo + hi) / 2;
}

function positionMapLabels(root, path) {
  positionTitleLabel(root, path);
  positionPlaceLabels(root, path);
}

function positionTitleLabel(root, path) {
  const label = root.querySelector('.v-n-route-medias__map-label');
  const track = root.querySelector('.v-n-route-medias__map-track');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  if (!label || !track || !svg?.createSVGPoint) return;

  const ctm = path.getScreenCTM?.();
  if (!ctm) return;

  const start = path.getPointAtLength(0);
  const pt = svg.createSVGPoint();
  pt.x = start.x;
  pt.y = start.y;
  const screen = pt.matrixTransform(ctm);
  const trackRect = track.getBoundingClientRect();

  label.style.left = `${screen.x - trackRect.left}px`;
  label.style.top = `${screen.y - trackRect.top - 14}px`;
  label.classList.add('is-placed');
}

function positionPlaceLabels(root, path) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  const places = root.querySelectorAll('.v-n-route-medias__map-place');
  if (!track || !svg?.createSVGPoint || !places.length) return;

  const ctm = path.getScreenCTM?.();
  if (!ctm) return;

  const trackRect = track.getBoundingClientRect();
  const limitRight = Math.min(trackRect.right, window.innerWidth) - 8;
  const limitLeft = Math.max(trackRect.left, 0) + 8;
  const pt = svg.createSVGPoint();

  places.forEach((el) => {
    const x = Number(el.dataset.mapX);
    const y = Number(el.dataset.mapY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    pt.x = x;
    pt.y = y;
    const screen = pt.matrixTransform(ctm);

    el.style.left = `${screen.x - trackRect.left}px`;
    el.style.top = `${screen.y - trackRect.top}px`;

    const preferLeft = el.dataset.side === 'left';
    el.classList.toggle('is-flip', preferLeft);
    el.classList.add('is-placed');

    const rect = el.getBoundingClientRect();
    if (!el.classList.contains('is-flip') && rect.right > limitRight) {
      el.classList.add('is-flip');
    } else if (el.classList.contains('is-flip') && rect.left < limitLeft) {
      el.classList.remove('is-flip');
      const again = el.getBoundingClientRect();
      if (again.right > limitRight) {
        const overflowRight = again.right - limitRight;
        el.classList.add('is-flip');
        const flipped = el.getBoundingClientRect();
        const overflowLeft = limitLeft - flipped.left;
        if (overflowRight <= overflowLeft) el.classList.remove('is-flip');
      }
    }
  });
}

function bindMapLabelResize(root, placeLabels, syncTip) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  if (!track) return;

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const heightChanged = syncMapSectionMinHeight(root);
      placeLabels();
      syncTip?.();
      if (heightChanged) ScrollTrigger.refresh();
    });
  };

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(schedule);
    ro.observe(track);
    ro.observe(root);
  }

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });

  if (document.fonts?.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }
}

function initAll() {
  document.body.classList.add('is-loaded');

  removeEls('.v-a--d-s-1 > .v-a-inf-c');
  fadeOnScroll(".v-a--d-s-1 .v-a-img-c > .scr-ind");
  initAudioPlayer();
  initVideoSubtitles();
  initPreArticleHeader();
  initRouteMediasMap();
}

initAll();