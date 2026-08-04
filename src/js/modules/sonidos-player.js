export default function initSonidosPlayer() {
  const players = [...document.querySelectorAll('.v-n-sonidos .v-ply')];
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

function createPlayer(player) {
  const button = player.querySelector('.v-ply__b');
  const audio = player.querySelector('audio');
  const clip = player.querySelector('.v-ply__clip');

  if (!button || !audio) return { pause() {} };

  let rafId = 0;
  let onPlay = null;
  let ready = false;

  const setPlaying = (playing) => {
    player.classList.toggle('is-play', playing);
    player.classList.toggle('is-pause', !playing);
  };

  const updateProgress = () => {
    if (!clip || !audio.duration) return;
    const progress = Math.min(1, Math.max(0, audio.currentTime / audio.duration));
    clip.style.width = `${progress * 100}%`;
  };

  const tick = () => {
    updateProgress();
    if (!audio.paused && !audio.ended) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const pause = () => {
    audio.pause();
    cancelAnimationFrame(rafId);
    if (player.classList.contains('is-active')) setPlaying(false);
    updateProgress();
  };

  const play = async () => {
    try {
      await audio.play();
      onPlay?.();
      setPlaying(true);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    } catch (error) {
      console.warn('[sonidos-player] No se pudo reproducir el audio', error);
    }
  };

  player.classList.add('is-load');
  player.classList.remove('is-active', 'is-play', 'is-pause');
  button.disabled = true;

  const markReady = () => {
    if (ready) return;
    ready = true;
    player.classList.remove('is-load');
    player.classList.add('is-active');
    button.disabled = false;
    if (clip) clip.style.width = '0%';
  };

  if (audio.readyState >= 2) {
    markReady();
  } else {
    audio.addEventListener('canplaythrough', markReady, { once: true });
    audio.addEventListener('loadeddata', markReady, { once: true });
    audio.addEventListener('error', () => {
      player.classList.remove('is-load');
      button.disabled = true;
    }, { once: true });
    audio.load();
  }

  button.addEventListener('click', () => {
    if (!player.classList.contains('is-active')) return;
    if (audio.paused) play();
    else pause();
  });

  audio.addEventListener('ended', () => {
    cancelAnimationFrame(rafId);
    audio.currentTime = 0;
    setPlaying(false);
    if (clip) clip.style.width = '0%';
  });

  return {
    pause,
    set onPlay(fn) {
      onPlay = fn;
    },
  };
}
