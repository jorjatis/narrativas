/* =========================
  Utils
========================= */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatAudioDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60).toString().padStart(2, '0');

  return `${m}:${s}`;
};

const formatTime = (current, total) => {
  return `${formatAudioDuration(current)} / ${formatAudioDuration(total)}`;
};

/* =========================
  AudioPlayer Module
========================= */
export default function audioPlayer(root = document) {
  const container = root.querySelector('.v-ply');
  if (!container) return null;

  const dom = {
    container,
    btn: container.querySelector('.v-ply__b'),
    title: container.querySelector('.v-ply__t'),
    duration: container.querySelector('.v-ply__p'),
    progress: container.querySelector('progress'),
    progressTrack: container.querySelector('.v-ply__v'),
    audio: container.querySelector('audio'),
  };

  const state = {
    currentEpId: null,
    savedTimes: new Map(),
    isDragging: false,
  };

  const togglePlay = () => {
    if (dom.audio.paused) {
      dom.audio.play();
      dom.container.classList.add('is-active', 'is-play');
      dom.container.classList.remove('is-paused');
    } else {
      dom.audio.pause();
      dom.container.classList.add('is-paused');
      dom.container.classList.remove('is-play');
    }
  };

  const updateProgressUI = () => {
    if (!dom.progress || !dom.audio.duration) return;
    dom.progress.value = dom.audio.currentTime;
    dom.duration.textContent = formatTime(dom.audio.currentTime, dom.audio.duration);
  };

  const seek = (e) => {
    if (!dom.audio.duration || !dom.progressTrack) return;

    const rect = dom.progressTrack.getBoundingClientRect();
    let x = clamp(e.clientX - rect.left, 0, rect.width);
    const percentage = x / rect.width;
    const newTime = percentage * dom.audio.duration;

    dom.progress.value = newTime;
    dom.duration.textContent = formatTime(newTime, dom.audio.duration);
  };

  const bindEvents = () => {
    if (!dom.audio) return;

    dom.btn.addEventListener('click', togglePlay);

    dom.audio.addEventListener('timeupdate', () => (!state.isDragging ? updateProgressUI() : null));
    
    dom.audio.addEventListener('loadedmetadata', () => {
      if (dom.progress) dom.progress.max = dom.audio.duration;
      dom.audio.currentTime = state.savedTimes.get(state.currentEpId) || 0;
      updateProgressUI();
    });

    dom.audio.addEventListener('ended', () => {
      dom.container.classList.remove('is-play');
      dom.container.classList.add('is-paused');
    });

    if (dom.progressTrack) {
      dom.progressTrack.addEventListener('mousedown', (e) => {
        state.isDragging = true;
        seek(e);
      });

      window.addEventListener('mousemove', (e) => {
        if (state.isDragging) seek(e);
      });

      window.addEventListener('mouseup', () => {
        if (state.isDragging) {
          state.isDragging = false;
          if (dom.audio.duration) dom.audio.currentTime = dom.progress.value;
        }
      });
    }
  };

  const loadEpisode = (ep) => {
    if (!dom.audio) return;

    if (state.currentEpId !== null) {
      state.savedTimes.set(state.currentEpId, dom.audio.currentTime);
    }

    state.currentEpId = ep.originalIndex;
    const hasAudio = Boolean(ep.audioSrc);

    dom.audio.pause();
    dom.container.classList.toggle('is-empty', !hasAudio);
    dom.btn.disabled = !hasAudio;
    dom.container.classList.remove('is-play', 'is-paused');

    if (dom.title) dom.title.textContent = ep.title;

    if (!hasAudio) {
      dom.audio.removeAttribute('src');
      dom.audio.load();
      if (dom.progress) dom.progress.value = 0;
      return;
    }

    dom.duration.textContent = 'Cargando...';
    dom.audio.src = ep.audioSrc;
    dom.audio.load();
  };

  const init = () => {
    if (!dom.audio) return;

    if (dom.audio.src) {
      dom.duration.textContent = 'Cargando...';
      
      if (dom.progress) {
        dom.progress.value = 0;
        dom.progress.max = 0;
      }

      dom.audio.load();
    }
  };

  // Inicializar eventos al ejecutar la función
  bindEvents();
  init();

  // Exponemos solo lo que el scroller necesita usar
  return {
    loadEpisode
  };
}