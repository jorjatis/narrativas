(function () {
  function wrapTitle() {
    const title = document.querySelector('.v-a-t');
    if (!title) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'v-a-t-c';

    title.parentNode.insertBefore(wrapper, title);
    wrapper.appendChild(title);
  }

  function splitTitleLetters() {
    const title = document.querySelector('.v-a-t');
    if (!title) return;

    const text = title.textContent.trim();
    title.innerHTML = '';

    [...text].forEach(char => {

      if (char === ' ') {
        title.appendChild(document.createTextNode('\u00A0'));
        return;
      }

      const span = document.createElement('span');
      span.className = 'v-a-t__l';
      span.textContent = char;

      span.style.setProperty('--d', (Math.random() * 0.6).toFixed(2) + 's');

      title.appendChild(span);
    });
  }

  function initVideoStep() {
    const trigger = document.querySelector('.n-step[data-step="2"]');
    const video = document.querySelector('.n-sticky video');
    const scrollIndicator = document.querySelector('.scr-ind');

    const getOffset = () => {
      return window.matchMedia('(max-width: 669px)').matches ? 52 : 58;
    };

    if (!trigger || !video) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const offset = getOffset();
        const y = window.scrollY + trigger.getBoundingClientRect().top;

        window.scrollTo({
          top: y + offset,
          behavior: "auto"
        });

        document.body.classList.add('is-overflow');
        scrollIndicator.classList.add('is-hidden');

        video.currentTime = 0;
        video.play();

        obs.unobserve(trigger);
      });
    }, {
      threshold: 0,
      rootMargin: "0px 0px -100% 0px"
    });

    observer.observe(trigger);

    video.addEventListener('ended', () => {
      document.body.classList.remove('is-overflow');
      document.querySelector('.v-a-t-c')?.classList.add('is-visible');
      scrollIndicator.classList.remove('is-hidden');
      scrollIndicator.classList.add('is-visible');
    });
  }

  function initAll() {
    wrapTitle();
    splitTitleLetters();
    initVideoStep();
  }

  document.addEventListener('DOMContentLoaded', initAll);
})();