function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateSliderAria(progressWrap, progress, audio) {
  if (!progressWrap || !progress) return;

  const value = Number(progress.value) || 0;

  progressWrap.setAttribute("aria-valuenow", String(Math.round(value)));
  progressWrap.setAttribute(
    "aria-valuetext",
    audio?.duration ? formatTime(audio.currentTime) : "00:00"
  );
}

export function initAudioPlayer(root) {
  const playBtn = root.querySelector(".v-ply__b--1");
  const muteBtn = root.querySelector(".v-ply__b--2");
  const progress = root.querySelector("progress");
  const progressWrap = root.querySelector(".v-ply__v");
  const currentEl = root.querySelector(".v-ply__p-length");
  const durationEl = root.querySelector(".v-ply__p-duration");
  const audio = root.querySelector("audio");

  if (!audio) return null;

  let isDragging = false;

  function updateProgress() {
    if (!progress || !audio.duration) return;

    progress.value = (audio.currentTime / audio.duration) * 100;
    progress.max = 100;

    if (currentEl) {
      currentEl.textContent = formatTime(audio.currentTime);
    }

    updateSliderAria(progressWrap, progress, audio);
  }

  function updateDuration() {
    if (!durationEl || !audio.duration) return;

    durationEl.textContent = formatTime(audio.duration);
    updateSliderAria(progressWrap, progress, audio);
  }

  function setPlaying(playing) {
    root.classList.toggle("is-playing", playing);

    if (playBtn) {
      playBtn.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
    }
  }

  function play() {
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function pause() {
    audio.pause();
    setPlaying(false);
  }

  function seek(ratio) {
    if (!audio.duration) return;

    const clamped = Math.max(0, Math.min(1, ratio));
    audio.currentTime = clamped * audio.duration;
    updateProgress();
  }

  function seekFromEvent(event) {
    if (!progressWrap || !audio.duration) return;

    const rect = progressWrap.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;

    seek(ratio);
  }

  function toggleMute() {
    audio.muted = !audio.muted;
    muteBtn?.classList.toggle("is-active", !audio.muted);
    muteBtn?.setAttribute("aria-label", audio.muted ? "Activar sonido" : "Silenciar");
  }

  function onPlayBtnClick() {
    if (audio.paused) {
      play();
    } else {
      pause();
    }
  }

  function onPointerDown(event) {
    isDragging = true;
    seekFromEvent(event);
    progressWrap?.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!isDragging) return;

    seekFromEvent(event);
  }

  function onPointerUp(event) {
    if (!isDragging) return;

    isDragging = false;
    progressWrap?.releasePointerCapture(event.pointerId);
  }

  function onProgressKeyDown(event) {
    if (!audio.duration) return;

    const step = event.key === "PageUp" || event.key === "PageDown" ? 0.1 : 0.05;
    let ratio = audio.currentTime / audio.duration;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        ratio += step;
        event.preventDefault();
        break;
      case "ArrowLeft":
      case "ArrowDown":
        ratio -= step;
        event.preventDefault();
        break;
      case "Home":
        ratio = 0;
        event.preventDefault();
        break;
      case "End":
        ratio = 1;
        event.preventDefault();
        break;
      default:
        return;
    }

    seek(ratio);
  }

  playBtn?.addEventListener("click", onPlayBtnClick);
  muteBtn?.addEventListener("click", toggleMute);
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateDuration);
  audio.addEventListener("ended", () => setPlaying(false));

  progressWrap?.addEventListener("pointerdown", onPointerDown);
  progressWrap?.addEventListener("pointermove", onPointerMove);
  progressWrap?.addEventListener("pointerup", onPointerUp);
  progressWrap?.addEventListener("pointercancel", onPointerUp);
  progressWrap?.addEventListener("keydown", onProgressKeyDown);

  if (muteBtn) {
    muteBtn.classList.add("is-active");
    muteBtn.setAttribute("aria-label", "Silenciar");
  }

  updateSliderAria(progressWrap, progress, audio);

  return {
    audio,
    play,
    pause,
    seek,
    toggleMute,
    getCurrentTime: () => audio.currentTime,
    setCurrentTime: (time) => {
      audio.currentTime = time;
      updateProgress();
    },
    isPlaying: () => !audio.paused,
    destroy() {
      pause();
      playBtn?.removeEventListener("click", onPlayBtnClick);
      muteBtn?.removeEventListener("click", toggleMute);
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", () => setPlaying(false));
      progressWrap?.removeEventListener("pointerdown", onPointerDown);
      progressWrap?.removeEventListener("pointermove", onPointerMove);
      progressWrap?.removeEventListener("pointerup", onPointerUp);
      progressWrap?.removeEventListener("pointercancel", onPointerUp);
      progressWrap?.removeEventListener("keydown", onProgressKeyDown);
    }
  };
}
