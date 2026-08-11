function loadPreview(video) {
  if (video.getAttribute('src')) {
    return;
  }

  const src = video.getAttribute('data-preview-src');
  if (!src) {
    return;
  }

  video.setAttribute('src', src);
  video.load();
}

function showPreview(card) {
  const video = card.querySelector('.card-media-preview');
  if (!video) {
    return;
  }

  loadPreview(video);
  card.classList.add('is-previewing');
  const playPromise = video.play();
  if (playPromise) {
    playPromise.catch(() => {});
  }
}

function hidePreview(card) {
  const video = card.querySelector('.card-media-preview');
  card.classList.remove('is-previewing');

  if (!video) {
    return;
  }

  video.pause();
  if (video.readyState > 0) {
    video.currentTime = 0;
  }
}

export function initMediaPreview() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    return;
  }

  const cards = document.querySelectorAll('[data-media-preview]');
  if (!cards.length) {
    return;
  }

  cards.forEach((card) => {
    const media = card.querySelector('.card-media');
    if (!media) {
      return;
    }

    media.addEventListener('mouseenter', () => showPreview(card));
    media.addEventListener('mouseleave', () => hidePreview(card));
    media.addEventListener('focusin', () => showPreview(card));
    media.addEventListener('focusout', (event) => {
      if (!media.contains(event.relatedTarget)) {
        hidePreview(card);
      }
    });
  });
}
