/**
 * Player de audio reutilizable para `.v-ply.is-audio-player`.
 *
 * Variantes de UI (según markup):
 * - `.v-ply__clip` → progreso por onda (sonidos)
 * - `progress` + `.v-ply__p` → barra y tiempo `MM:SS / MM:SS`
 *
 * Carga:
 * - `preload="none"` → lazy: 1er click pone `is-load`, al listo `is-active` + `is-play`
 * - resto → eager: `is-load` al init, al listo `is-active` (listo para play)
 */
export default function initAudioPlayer() {
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
