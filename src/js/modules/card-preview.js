export function initCardPreviewHover() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (prefersReducedMotion || !supportsHover) {
    return;
  }

  document.querySelectorAll('.card').forEach(card => {
    let timer;
    const video = card.querySelector('.card-media-preview-video');
    const mediaLink = card.querySelector('.card-media');

    if (!video || !mediaLink) {
      return;
    }

    mediaLink.addEventListener('mouseenter', () => {
      timer = setTimeout(() => {
        video.style.opacity = '1';
        video.play();
      }, 180);
    });

    mediaLink.addEventListener('mouseleave', () => {
      clearTimeout(timer);
      video.pause();
      video.currentTime = 0;
      video.style.opacity = '0';
    });
  });
}
