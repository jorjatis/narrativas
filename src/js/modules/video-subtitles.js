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
  const paragraph = subsBox?.querySelector('p');
  const scrub = scene.querySelector('.vid-subs__scrub');
  const scrubTrack = scene.querySelector('.vid-subs__scrub-track');
  const scrubFill = scene.querySelector('.vid-subs__scrub-fill');

  if (!player || !video || !subsBox || !paragraph || !playButton) return;

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
  let rafId = 0;
  let videoReady = false;
  let transcriptReady = false;
  let dragging = false;

  const setPlaying = (playing) => {
    if (!player.classList.contains('is-active')) return;
    player.classList.toggle('is-play', playing);
    player.classList.toggle('is-pause', !playing);
  };

  const updateScrub = (time = video.currentTime) => {
    if (!scrubFill || !video.duration) return;
    const progress = Math.min(1, Math.max(0, time / video.duration));
    scrubFill.style.width = `${progress * 100}%`;
  };

  const updateSubsFade = () => {
    const maxScroll = subsBox.scrollHeight - subsBox.clientHeight;
    const atEnd = maxScroll <= 1 || subsBox.scrollTop >= maxScroll - 2;
    subsBox.classList.toggle('is-end', atEnd);
  };

  const maybeReady = () => {
    if (!videoReady || !transcriptReady) return;

    scene.classList.remove('is-load');
    player.classList.remove('is-load');
    player.classList.add('is-active', 'is-pause');
    player.classList.remove('is-play');
    playButton.disabled = false;

    syncWords(video.currentTime);
    updateScrub();
    updateSubsFade();
  };

  const renderWords = (items) => {
    paragraph.replaceChildren();
    wordEls = items.map((item, index) => {
      const span = document.createElement('span');
      span.className = 'vid-subs__word';
      span.dataset.start = String(item.start);
      span.dataset.end = String(item.end);
      span.dataset.index = String(index);
      span.textContent = item.word;
      span.tabIndex = 0;
      span.setAttribute('role', 'button');
      span.setAttribute('aria-label', `Ir a ${item.word}`);
      paragraph.append(span, document.createTextNode(' '));
      return span;
    });
  };

  const syncWords = (time) => {
    if (!wordEls.length) return;

    let activeIndex = -1;
    for (let i = 0; i < words.length; i += 1) {
      if (time >= words[i].start) activeIndex = i;
      else break;
    }

    wordEls.forEach((el, index) => {
      const isOver = index <= activeIndex;
      const isActive = index === activeIndex;
      el.classList.toggle('vid-subs__word--over', isOver);
      el.classList.toggle('is-active', isActive);
    });

    if (activeIndex >= 0 && activeIndex !== lastActiveIndex) {
      scrollToWord(subsBox, wordEls[activeIndex]);
      lastActiveIndex = activeIndex;
      updateSubsFade();
    }
  };

  const tick = () => {
    syncWords(video.currentTime);
    updateScrub();
    if (!video.paused && !video.ended) {
      rafId = requestAnimationFrame(tick);
    }
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
    lastActiveIndex = -1;
    syncWords(next);
    updateScrub(next);
  };

  const seekFromPointer = (clientX) => {
    if (!scrubTrack || !video.duration) return;
    const rect = scrubTrack.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    seekTo(ratio * video.duration);
  };

  const seekToWord = (wordEl) => {
    const start = Number(wordEl.dataset.start);
    if (!Number.isFinite(start)) return;
    seekTo(start);
    if (video.paused) play();
  };

  subsBox.addEventListener('scroll', updateSubsFade, { passive: true });

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
    syncWords(video.duration || video.currentTime);
    updateScrub(video.duration || video.currentTime);
  });
  video.addEventListener('pause', () => {
    if (!video.ended) setPlaying(false);
  });
  video.addEventListener('play', () => setPlaying(true));
  video.addEventListener('timeupdate', () => {
    if (!dragging) updateScrub();
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

function scrollToWord(container, wordEl) {
  if (!container || !wordEl) return;

  const containerRect = container.getBoundingClientRect();
  const wordRect = wordEl.getBoundingClientRect();
  const offset =
    wordRect.top -
    containerRect.top -
    containerRect.height / 2 +
    wordRect.height / 2;

  container.scrollTo({
    top: container.scrollTop + offset,
    behavior: 'smooth',
  });

  container.dispatchEvent(new Event('scroll'));
}
