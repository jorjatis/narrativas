export default function canPlayWebm() {
  function isSafariOrIOS() {
    const ua = navigator.userAgent;

    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    return isIOS || isSafari;
  }

  function supportsWebM() {
    const video = document.createElement('video');
    return video.canPlayType('video/webm') !== '';
  }

  const shouldUseGif = isSafariOrIOS() || !supportsWebM();

  document.querySelectorAll('.n-vid-webm').forEach(container => {
    const video = container.querySelector('video');
    const gif = container.querySelector('img');

    if (!video || !gif) return;

    if (shouldUseGif) {
      video.style.display = 'none';
      gif.style.display = 'block';
    } else {
      gif.style.display = 'none';
      video.style.display = 'block';
    }
  });
}