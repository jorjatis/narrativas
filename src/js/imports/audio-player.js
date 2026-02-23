export function initAudioPlayers(selector = '.n-aud') {

  const players = document.querySelectorAll(selector);
  if (!players.length) return;

  players.forEach(player => {

    const audio = player.querySelector('.n-aud__ply-aud');
    const button = player.querySelector('.n-btn-ply button');
    const svgs = player.querySelectorAll('.n-aud__ply-wave svg');

    const currentEl = player.querySelector('.n-aud__ply-actual');
    const totalEl = player.querySelector('.n-aud__ply-total');

    if (!audio || !button || !svgs.length) {
      console.warn('Audio player mal estructurado:', player);
      return;
    }

    // ===============================
    // STATE
    // ===============================

    function setState(state) {
      player.classList.remove('is-loading', 'is-playing', 'is-paused');
      player.classList.add(state);
    }

    setState('is-paused');

    // ===============================
    // CREATE PROGRESS PATHS (para ambos SVG)
    // ===============================

    const waves = [];

    svgs.forEach(svg => {

      const basePath = svg.querySelector('path');
      if (!basePath) return;

      const progressPath = basePath.cloneNode(true);
      progressPath.setAttribute('stroke', '#2185FF');

      svg.appendChild(progressPath);

      const pathLength = basePath.getTotalLength();

      progressPath.style.strokeDasharray = pathLength;
      progressPath.style.strokeDashoffset = pathLength;
      progressPath.style.transition = 'stroke-dashoffset 0.1s linear';

      waves.push({
        svg,
        basePath,
        progressPath,
        pathLength
      });

    });

    if (!waves.length) return;

    // ===============================
    // FORMAT TIME
    // ===============================

    function formatTime(time) {
      if (!time || isNaN(time)) return "00:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // ===============================
    // UPDATE PROGRESS (ambos SVG)
    // ===============================

    function updateProgress() {
      if (!audio.duration) return;

      const progress = audio.currentTime / audio.duration;

      waves.forEach(wave => {
        const draw = wave.pathLength * (1 - progress);
        wave.progressPath.style.strokeDashoffset = draw;
      });

      if (currentEl) {
        currentEl.textContent = formatTime(audio.currentTime);
      }
    }

    // ===============================
    // PRESSED STATE (desktop + mobile)
    // ===============================

    function addPressed() {
      button.classList.add('is-pressed');
    }

    function removePressed() {
      button.classList.remove('is-pressed');
    }

    // Pointer Events (unifica mouse + touch)
    button.addEventListener('pointerdown', addPressed);
    button.addEventListener('pointerup', removePressed);
    button.addEventListener('pointercancel', removePressed);
    button.addEventListener('pointerleave', removePressed);

    // ===============================
    // BUTTON CLICK
    // ===============================

    button.addEventListener('click', () => {

      if (audio.paused) {

        document.querySelectorAll('.n-aud__ply-aud').forEach(a => {
          if (a !== audio) {
            a.pause();
            const other = a.closest('.n-aud');
            other?.classList.remove('is-playing');
            other?.classList.add('is-paused');
          }
        });

        audio.play();
        setState('is-playing');

      } else {

        audio.pause();
        setState('is-paused');

      }

    });

    // ===============================
    // SEEK (en ambos SVG)
    // ===============================

    waves.forEach(wave => {

      wave.svg.addEventListener('click', (e) => {
        if (!audio.duration) return;

        const rect = wave.svg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));

        audio.currentTime = percentage * audio.duration;
        updateProgress();
      });

    });

    // ===============================
    // AUDIO EVENTS
    // ===============================

    audio.addEventListener('loadstart', () => {
      setState('is-loading');
    });

    audio.addEventListener('loadedmetadata', () => {
      if (totalEl) {
        totalEl.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('canplay', () => {
      if (audio.paused) {
        setState('is-paused');
      }
    });

    audio.addEventListener('timeupdate', updateProgress);

    audio.addEventListener('ended', () => {
      setState('is-paused');
    });

  });

}