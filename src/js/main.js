(function () {
  function setRealViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  function initViewportFix() {
    setRealViewportHeight();

    window.addEventListener('orientationchange', () => {
      setTimeout(setRealViewportHeight, 150);
    });

    window.visualViewport?.addEventListener('resize', () => {
      setRealViewportHeight();
    });
  }

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
    const html = document.documentElement;

    const trigger = document.querySelector('.n-step[data-step="2"]');
    const video = document.querySelector('.n-sticky video');
    const scrollIndicator = document.querySelector('.scr-ind');

    if (!trigger || !video) return;

    let played = false;

    const getOffset = () =>
      window.matchMedia('(max-width: 669px)').matches ? 52 : 58;

    function forceScroll(targetY) {
      let frames = 8;

      function tick() {
        window.scrollTo(0, targetY);
        frames--;
        if (frames > 0) {
          requestAnimationFrame(tick);
        }
      }

      tick();
    }

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || played) return;

        const offset = getOffset();
        const y = trigger.offsetTop;
        const targetY = y + offset;

        requestAnimationFrame(() => {
          html.classList.add('no-snap');
          trigger?.style.setProperty('min-height', '150vh');
          forceScroll(targetY);

          document.body.classList.add('is-overflow');
          scrollIndicator?.classList.add('is-hidden');

          video.currentTime = 0;
          video.play();
        });
      });
    }, {
      threshold: 0,
      rootMargin: "0px 0px -50% 0px"
    });

    observer.observe(trigger);

    video.addEventListener('ended', () => {
      trigger?.style.removeProperty('min-height');

      played = true;

      setTimeout(() => {
        document.body.classList.remove('is-overflow');    
      }, 1000);

      document.querySelector('.v-a-t-c')?.classList.add('is-visible');

      scrollIndicator?.classList.remove('is-hidden');
      scrollIndicator?.classList.add('is-visible');

      observer.unobserve(trigger);
    });
  }

  function initAll() {
    initViewportFix();

    wrapTitle();
    splitTitleLetters();
    initVideoStep();
  }

  document.addEventListener('DOMContentLoaded', initAll);
  // window.addEventListener('load', () => {
  //   initAll();
  // });
})();