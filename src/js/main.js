(function () {
  gsap.registerPlugin(ScrollTrigger);

  function animVideoBig() {
    const video = document.querySelector(".parallax-video-big video");

    gsap.fromTo(".parallax-video-big",
    { clipPath: "inset(30% 40%)" },
    {
      clipPath: "inset(0% 0%)",
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".parallax-video-big",
        start: "center 75%",
        end: "center 40%",
        scrub: true
      }
    });

    ScrollTrigger.create({
      trigger: ".parallax-video-big",
      start: "top 75%",
      once: true,
      onEnter: () => {
        video.play().catch(() => {});
      }
    });
  }

  function animVideosBlock() {
    const items = document.querySelectorAll(".n-vid-blk__i");

    items.forEach((item) => {
      const video = item.querySelector("video");

      gsap.fromTo(
        item,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 75%",
            once: true
          }
        }
      );

      ScrollTrigger.create({
        trigger: item,
        start: "top 75%",
        once: true,
        onEnter: () => {
          video?.play().catch(() => {});
        }
      });
    });
  }

  function wrapTitle() {
    const title = document.querySelector('.v-a-t');
    const pretitle = document.querySelector('.v-a-p-t');

    if (!title) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'v-a-t-c';

    const wrapper_cnt = document.createElement('div');
    wrapper_cnt.className = 'v-a-t-c__w';

    title.parentNode.insertBefore(wrapper, title);

    wrapper.appendChild(wrapper_cnt);

    if (pretitle) wrapper_cnt.appendChild(pretitle);
    wrapper_cnt.appendChild(title);
  }

  function initVideoStep() {
    const trigger = document.querySelector('.n-step[data-step="3"]');
    const video = window.matchMedia('(max-width: 699px)').matches
                ? document.querySelector('video.is-mobile')
                : document.querySelector('video.is-desktop');
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
      rootMargin: "0px 0px -100% 0px"
    });

    observer.observe(trigger);

    video.addEventListener('ended', () => {
      trigger?.style.removeProperty('min-height');

      played = true;

      setTimeout(() => {
        document.body.classList.remove('is-overflow');    
      }, 1000);

      trigger.classList.add('is-hidden');

      document.querySelector('.v-a-t-c')?.classList.add('is-visible');

      scrollIndicator?.classList.remove('is-hidden');
      scrollIndicator?.classList.add('is-visible');
      
      scrollIndicator?.classList.remove('is-fixed');
      scrollIndicator?.classList.add('is-absolute');

      observer.unobserve(trigger);
    });
  }

  function initAll() {
    wrapTitle();
    initVideoStep();
    animVideoBig();
    animVideosBlock();
  }

  window.scrollTo({
    top: 0,
    behavior: "auto"
  });

  document.addEventListener('DOMContentLoaded', initAll);
  // window.addEventListener('load', () => {
  //   initAll();
  // });
})();