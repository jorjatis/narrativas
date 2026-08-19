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

  video.addEventListener('timeupdate', () => {
    if (dragging || (!video.paused && rafId)) return;
    updateScrub();
  });
  video.addEventListener('loadedmetadata', () => updateScrub());

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

function getHeaderOffset(root) {
  const raw = getComputedStyle(root).getPropertyValue('--preh-header').trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 58;
}

const PAYWALL_SELECTOR = 'ev-engagement[group-name="paywall-abc"][redirect="false"]';
const MAIN_PAYWALL_SELECTOR = 'main.v-w-c, main.v-d-c';
const PREH_ROOT = '.v-n-preh';

function getPaywallMain() {
  return document.querySelector(MAIN_PAYWALL_SELECTOR);
}

function hasPaywallMainStyles(main = getPaywallMain()) {
  if (!main) return false;

  const { height, overflowY, overflow, position } = main.style;
  const clipped = overflowY === 'clip' || overflow === 'clip';

  return Boolean(height) && clipped && position === 'relative';
}

function hasArticlePaywall() {
  if (document.querySelector(PAYWALL_SELECTOR)) return true;
  return hasPaywallMainStyles();
}

function applyPrehPaywall() {
  const root = document.querySelector(PREH_ROOT);
  if (!root || root.classList.contains('is-paywall')) return;

  root.classList.add('is-paywall');

  const scene01 = root.querySelector('.v-n-preh-scene--01');
  const scene02 = root.querySelector('.v-n-preh-scene--02');
  const scene03 = root.querySelector('.v-n-preh-scene--03');
  const pathDraw = root.querySelector('.v-a-t__path-draw');

  if (scene03) {
    scene03.style.display = 'none';
    scene03.setAttribute('aria-hidden', 'true');
  }

  if (!root.classList.contains('is-ready')) return;

  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger === root) st.kill();
  });

  if (scene01) gsap.set(scene01, { autoAlpha: 0, yPercent: -100 });
  if (scene02) gsap.set(scene02, { autoAlpha: 1, yPercent: 0 });
  if (pathDraw) gsap.set(pathDraw, { strokeDashoffset: 0 });

  ScrollTrigger.refresh();
}

function initHasPaywall() {
  if (hasArticlePaywall()) {
    applyPrehPaywall();
    return;
  }

  const scope = document.body;
  const main = getPaywallMain();

  const check = () => {
    if (!hasArticlePaywall()) return;
    applyPrehPaywall();
    observer.disconnect();
  };

  const observer = new MutationObserver(check);
  observer.observe(scope, { childList: true, subtree: true });

  if (main) {
    observer.observe(main, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  }
}

function initPreArticleHeader() {
  const root = document.querySelector(PREH_ROOT);
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
  const skipScene03 = hasArticlePaywall() || root.classList.contains('is-paywall');

  if (!stage || !scene01 || !scene02 || !scene03) return;

  if (skipScene03) {
    root.classList.add('is-paywall');
    scene03.style.display = 'none';
    scene03.setAttribute('aria-hidden', 'true');
  }

  const headerOffset = getHeaderOffset(root);
  const pathLength = pathDraw?.getTotalLength?.() || 533;

  if (pathLength) {
    const dash = { strokeDasharray: pathLength };
    if (pathTrack) gsap.set(pathTrack, { ...dash, strokeDashoffset: 0 });
    gsap.set(pathDraw, { ...dash, strokeDashoffset: pathLength });
  }

  if (prefersReducedMotion()) {
    gsap.set(scene01, { autoAlpha: 0, yPercent: -100 });

    if (skipScene03) {
      gsap.set(scene02, { autoAlpha: 1, yPercent: 0 });
      gsap.set(scene03, { autoAlpha: 0 });
      if (pathDraw && pathLength) gsap.set(pathDraw, { strokeDashoffset: 0 });
    } else {
      gsap.set(scene02, { autoAlpha: 0, yPercent: -100 });
      gsap.set(scene03, { autoAlpha: 1 });
      if (pathDraw && pathLength) gsap.set(pathDraw, { strokeDashoffset: 0 });
      gsap.set(frames, { clipPath: 'inset(0 0% 0 0)' });
    }

    root.classList.add('is-ready');
    return;
  }

  gsap.set(scene02, { autoAlpha: 0, yPercent: 0 });
  gsap.set(scene03, { autoAlpha: skipScene03 ? 0 : 1, yPercent: 0 });

  const scrollEnd = skipScene03
    ? () => `+=${Math.round(window.innerHeight * 1.35)}`
    : () => `+=${Math.round(window.innerHeight * 3)}`;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: `top ${headerOffset}px`,
      end: scrollEnd,
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

  if (skipScene03) {
    tl.to({}, { duration: 0.55 }, 2.1);
    root.classList.add('is-ready');
    return;
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
const LABEL_OFFSET_Y = 14;
const PLACE_EDGE_PAD = 8;

const TIP_OFFSET_FROM_BOTTOM = 100;

const MAP_INTRINSIC_W = 1920;
const MAP_INTRINSIC_H = 4496;

const PATH_SAMPLE_STEPS = 240;

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

  const dots = buildMapDots(root, path, pathLength);
  const places = buildMapPlaces(root, path, pathLength);

  const placeLabels = () => {
    positionMapLabels(root, path);
    positionMapDots(root, path, dots);
  };

  const revealAlongPath = (drawn) => {
    syncPathRevealVisibility(dots, drawn, pathLength);
    syncPathRevealVisibility(places, drawn, pathLength);
  };

  if (prefersReducedMotion()) {
    gsap.set(path, { ...dash, strokeDashoffset: 0 });
    root.classList.add('is-map-ready');
    placeLabels();
    revealAlongPath(pathLength);
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
    revealAlongPath(drawn);
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
      revealAlongPath(drawn);
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
  label.style.top = `${screen.y - trackRect.top - LABEL_OFFSET_Y}px`;
  label.classList.add('is-placed');
}

/**
 * Sitúa los topónimos en coords del mapa y elige lado (is-flip) para que
 * no se corten por los bordes del track/viewport. Si el ancla está muy al
 * borde, empuja el label para que quepa entero.
 */
function positionPlaceLabels(root, path) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  const places = root.querySelectorAll('.v-n-route-medias__map-place');
  if (!track || !svg?.createSVGPoint || !places.length) return;

  const ctm = path.getScreenCTM?.();
  if (!ctm) return;

  const trackRect = track.getBoundingClientRect();
  const limitRight = Math.min(trackRect.right, window.innerWidth) - PLACE_EDGE_PAD;
  const limitLeft = Math.max(trackRect.left, 0) + PLACE_EDGE_PAD;
  const pt = svg.createSVGPoint();

  places.forEach((el) => {
    const anchor = placeAnchorPoint(el, path);
    if (!anchor) return;

    pt.x = anchor.x;
    pt.y = anchor.y;
    const screen = pt.matrixTransform(ctm);
    const anchorLeft = screen.x - trackRect.left;

    el.style.left = `${anchorLeft}px`;
    el.style.top = `${screen.y - trackRect.top}px`;

    const centered = el.hasAttribute('data-path-end');
    const preferLeft = el.dataset.side === 'left';
    el.classList.toggle('is-flip', !centered && preferLeft);
    el.classList.add('is-placed');

    let rect = el.getBoundingClientRect();

    if (!centered) {
      // Desborde derecha → texto a la izquierda del punto
      if (!el.classList.contains('is-flip') && rect.right > limitRight) {
        el.classList.add('is-flip');
        rect = el.getBoundingClientRect();
      }

      // Desborde izquierda → texto a la derecha del punto
      if (el.classList.contains('is-flip') && rect.left < limitLeft) {
        el.classList.remove('is-flip');
        rect = el.getBoundingClientRect();
        // Si ambos lados cortan, quédate en el que menos desborde
        if (rect.right > limitRight) {
          const overflowRight = rect.right - limitRight;
          el.classList.add('is-flip');
          const flipped = el.getBoundingClientRect();
          const overflowLeft = limitLeft - flipped.left;
          if (overflowRight <= overflowLeft) el.classList.remove('is-flip');
          rect = el.getBoundingClientRect();
        }
      }
    }

    // Ancla pegada al borde: empuja para que el label quepa entero
    // (p. ej. Cáceres en mobile, cortado por la izquierda)
    if (rect.left < limitLeft) {
      el.style.left = `${anchorLeft + (limitLeft - rect.left)}px`;
    } else if (rect.right > limitRight) {
      el.style.left = `${anchorLeft - (rect.right - limitRight)}px`;
    }
  });
}

function buildMapDots(root, path, pathLength) {
  const nodes = [...root.querySelectorAll('.v-n-route-medias__map-dot')];
  return nodes.map((el) => {
    if (el.hasAttribute('data-path-start')) {
      return { el, length: 0 };
    }
    if (el.hasAttribute('data-path-end')) {
      return { el, length: pathLength };
    }

    return { el, length: lengthFromMapCoords(el, path, pathLength) };
  });
}

function buildMapPlaces(root, path, pathLength) {
  const nodes = [...root.querySelectorAll('.v-n-route-medias__map-place')];
  return nodes.map((el) => {
    if (el.hasAttribute('data-path-end')) {
      return { el, length: pathLength };
    }
    if (el.hasAttribute('data-path-start')) {
      return { el, length: 0 };
    }

    return { el, length: lengthFromMapCoords(el, path, pathLength) };
  });
}

function placeAnchorPoint(el, path) {
  if (el.hasAttribute('data-path-end')) {
    return path.getPointAtLength(path.getTotalLength());
  }
  if (el.hasAttribute('data-path-start')) {
    return path.getPointAtLength(0);
  }

  const x = Number(el.dataset.mapX);
  const y = Number(el.dataset.mapY);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function lengthFromMapCoords(el, path, pathLength) {
  const x = Number(el.dataset.mapX);
  const y = Number(el.dataset.mapY);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return Number.POSITIVE_INFINITY;
  }
  return closestLengthOnPath(path, pathLength, x, y);
}

function closestLengthOnPath(path, pathLength, x, y) {
  let bestLen = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i <= PATH_SAMPLE_STEPS; i += 1) {
    const len = (i / PATH_SAMPLE_STEPS) * pathLength;
    const p = path.getPointAtLength(len);
    const dist = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      bestLen = len;
    }
  }

  const step = pathLength / PATH_SAMPLE_STEPS;
  let lo = Math.max(0, bestLen - step);
  let hi = Math.min(pathLength, bestLen + step);

  for (let i = 0; i < 24; i += 1) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    const p1 = path.getPointAtLength(m1);
    const p2 = path.getPointAtLength(m2);
    const d1 = (p1.x - x) ** 2 + (p1.y - y) ** 2;
    const d2 = (p2.x - x) ** 2 + (p2.y - y) ** 2;
    if (d1 < d2) hi = m2;
    else lo = m1;
  }

  return (lo + hi) / 2;
}

function positionMapDots(root, path, dots) {
  const track = root.querySelector('.v-n-route-medias__map-track');
  const svg = root.querySelector('.v-n-route-medias__map-svg');
  if (!track || !svg?.createSVGPoint || !dots.length) return;

  const ctm = path.getScreenCTM?.();
  if (!ctm) return;

  const trackRect = track.getBoundingClientRect();
  const pt = svg.createSVGPoint();

  dots.forEach(({ el, length }) => {
    if (!Number.isFinite(length)) return;

    const p = path.getPointAtLength(length);
    pt.x = p.x;
    pt.y = p.y;
    const screen = pt.matrixTransform(ctm);

    el.style.left = `${screen.x - trackRect.left}px`;
    el.style.top = `${screen.y - trackRect.top}px`;
    el.classList.add('is-placed');
  });
}

function syncPathRevealVisibility(items, drawn, pathLength) {

  const revealPad = Math.max(2, pathLength * 0.0005);

  items.forEach(({ el, length }) => {
    if (!Number.isFinite(length)) {
      el.classList.remove('is-visible');
      return;
    }
    el.classList.toggle('is-visible', drawn + revealPad >= length);
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

const MQ_MOBILE = '(max-width: 699px)';

function initRouteMediasVideoModal() {
  const root = document.querySelector('.v-n-route-medias');
  if (!root) return;

  const shells = [...root.querySelectorAll('.video-player')];
  if (!shells.length) return;

  const mq = window.matchMedia(MQ_MOBILE);
  let active = null;

  const close = ({ pause = true } = {}) => {
    if (!active) return;

    const { shell, placeholder, overlay, video } = active;

    if (pause && video && !video.paused) {
      try {
        video.pause();
      } catch (_) {
        
      }
    }

    if (placeholder?.parentNode) {
      placeholder.parentNode.insertBefore(shell, placeholder);
      placeholder.remove();
    }

    overlay?.remove();
    document.body.classList.remove('is-route-video-modal');
    active = null;

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  };

  const open = (shell, video) => {
    if (active?.shell === shell) return;
    if (active) close({ pause: true });

    const placeholder = document.createElement('div');
    placeholder.className = 'v-n-route-medias__video-ph';
    placeholder.setAttribute('aria-hidden', 'true');
    const height = shell.getBoundingClientRect().height;
    if (height) placeholder.style.height = `${Math.round(height)}px`;

    shell.parentNode.insertBefore(placeholder, shell);

    const overlay = document.createElement('div');
    overlay.className = 'v-n-route-medias-video-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Reproductor de vídeo');

    const panel = document.createElement('div');
    panel.className = 'v-n-route-medias-video-modal__panel';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'v-n-route-medias-video-modal__close';
    closeBtn.setAttribute('aria-label', 'Cerrar vídeo');
    closeBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M2.5 2.5l9 9M11.5 2.5l-9 9"/></svg>';

    panel.appendChild(shell);
    overlay.appendChild(closeBtn);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.body.classList.add('is-route-video-modal');

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      if (video?.paused) {
        const playPromise = video.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      }
    });

    closeBtn.addEventListener('click', () => close({ pause: true }));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close({ pause: true });
    });

    active = { shell, placeholder, overlay, video };
    closeBtn.focus({ preventScroll: true });
  };

  shells.forEach((shell) => {
    shell.addEventListener(
      'play',
      (event) => {
        const video = event.target;
        if (!(video instanceof HTMLVideoElement)) return;
        if (!mq.matches) return;
        open(shell, video);
      },
      true,
    );
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && active) close({ pause: true });
  });

  const onMqChange = () => {
    if (!mq.matches && active) close({ pause: false });
  };

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onMqChange);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onMqChange);
  }
}

function initAll() {
  document.body.classList.add('is-loaded');

  removeEls('.v-a--d-s-1 > .v-a-inf-c');
  fadeOnScroll(".v-a--d-s-1 .v-a-img-c > .scr-ind");
  initAudioPlayer();
  initVideoSubtitles();
  initPreArticleHeader();
  initHasPaywall();
  initRouteMediasMap();
  initRouteMediasVideoModal();
}

initAll();
