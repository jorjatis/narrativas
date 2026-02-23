export function initVideoPlayers(selector = '.doc-prf') {

  const blocks = document.querySelectorAll(selector);
  if (!blocks.length) return;

  blocks.forEach(block => {

    const media = block.querySelector('.doc-prf__media');
    const video = block.querySelector('.doc-prf__video');
    const buttonWrap = block.querySelector('.n-btn-ply');
    const button = buttonWrap?.querySelector('button');

    if (!media || !video || !buttonWrap || !button) {
      console.warn('Video player mal estructurado:', block);
      return;
    }

    function setState(state) {
      media.classList.remove('is-loading', 'is-playing', 'is-paused');
      media.classList.add(state);
    }

    setState('is-paused');

    // ===============================
    // CLICK
    // ===============================

    button.addEventListener('click', async () => {
      if (video.paused) {
        document.querySelectorAll('.doc-prf__video').forEach(v => {
          if (v !== video) {
            v.pause();
            const other = v.closest('.doc-prf');
            other?.querySelector('.n-btn-ply')?.classList
              .remove('is-playing');
            other?.querySelector('.n-btn-ply')?.classList
              .add('is-paused');
          }
        });

        const isReady = video.readyState >= 3;

        if (!isReady) {
          setState('is-loading');
        }

        try {
          await video.play();
          setState('is-playing');
        } catch (err) {
          setState('is-paused');
        }

      } else {
        video.pause();
        setState('is-paused');
      }
    });

    // ===============================
    // ENDED
    // ===============================

    video.addEventListener('ended', () => {
      setState('is-paused');
    });

  });

}