export function initCardPreviewHover() {
  document.querySelectorAll('.card').forEach(card => {
    let timer;
    const video = card.querySelector('.card-media-preview-video');

    card.addEventListener('mouseenter', () => {
      timer = setTimeout(() => {
        video.style.opacity = '1';
        video.play();
      }, 500);
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(timer);
      video.pause();
      video.currentTime = 0;
      video.style.opacity = '0';
    });
  });
}
