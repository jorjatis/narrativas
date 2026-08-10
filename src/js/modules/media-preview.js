function loadPreview(previewImg) {
  const src = previewImg.getAttribute('data-preview-src');
  if (!src || previewImg.getAttribute('src')) {
    return;
  }

  previewImg.setAttribute('src', src);
}

function showPreview(card) {
  const previewImg = card.querySelector('.card-media-preview');
  if (!previewImg) {
    return;
  }

  loadPreview(previewImg);
  card.classList.add('is-previewing');
}

function hidePreview(card) {
  card.classList.remove('is-previewing');
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
