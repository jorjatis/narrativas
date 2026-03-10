(function () {
  function splitTitleLetters() {
    const title = document.querySelector('.v-a-t');
    if (!title) return;

    const text = title.textContent;
    title.textContent = '';

    [...text].forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter === ' ' ? '\u00A0' : letter;

      const delay = (Math.random() * 0.6).toFixed(2);
      span.style.setProperty('--d', `${delay}s`);

      title.appendChild(span);
    });
  }

  function initVideoStep() {
    const trigger = document.querySelector('.n-step[data-step="2"]');
    const video = document.querySelector('.n-sticky video');

    if (!trigger || !video) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.body.classList.add('is-overflow');
          video.currentTime = 0;
          video.play();

          obs.unobserve(trigger);
        }
      });
    }, {
      root: null,
      threshold: 0,
      rootMargin: "0px 0px -100% 0px"
    });

    observer.observe(trigger);

    video.addEventListener('ended', () => {
      document.body.classList.remove('is-overflow');
      document.querySelector('.v-a-t').classList.add('is-visible');
    });
  }

  function initAll() {
    // splitTitleLetters();
    // initVideoStep();
  }

  document.addEventListener('DOMContentLoaded', initAll);
})();