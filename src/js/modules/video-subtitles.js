export default function initVideoSubtitles() {
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
  const subsBox = scene.querySelector('.vid-subs__subs');
  const subsScroll = subsBox?.querySelector('.vid-subs__subs-scroll');
  const paragraph = subsScroll?.querySelector('p');
  const scrub = scene.querySelector('.vid-subs__scrub');
  const scrubTrack = scene.querySelector('.vid-subs__scrub-track');
  const scrubFill = scene.querySelector('.vid-subs__scrub-fill');

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
    // Solo se puede hacer scroll manual con el vídeo en pausa.
    subsScroll.classList.toggle('is-locked', playing);
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
    const atEnd = maxScroll <= 1 || subsScroll.scrollTop >= maxScroll - 2;
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

  const maybeReady = () => {
    if (!videoReady || !transcriptReady) return;

    scene.classList.remove('is-load');
    player.classList.remove('is-load');
    player.classList.add('is-active', 'is-pause');
    player.classList.remove('is-play');
    playButton.disabled = false;

    syncWords(video.currentTime, { force: true });
    updateScrub();
    updateSubsFade();
    if (scrubTrack) scrubTrackWidth = scrubTrack.getBoundingClientRect().width;
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
    seekTo(start);
    if (video.paused) play();
  };

  subsScroll.addEventListener('scroll', updateSubsFade, { passive: true });

  const blockManualScroll = (event) => {
    if (!subsScroll.classList.contains('is-locked')) return;
    event.preventDefault();
  };

  subsScroll.addEventListener('wheel', blockManualScroll, { passive: false });
  subsScroll.addEventListener('touchmove', blockManualScroll, { passive: false });

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
  const padding = 8;

  const above = wordRect.top < containerRect.top + padding;
  const below = wordRect.bottom > containerRect.bottom - padding;
  if (!above && !below) return;

  const offset =
    wordRect.top -
    containerRect.top -
    containerRect.height / 2 +
    wordRect.height / 2;

  container.scrollTo({
    top: container.scrollTop + offset,
    behavior: 'auto',
  });
}
