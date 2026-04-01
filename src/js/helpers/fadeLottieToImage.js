
/**
 * Hace fade-out a un Lottie y fade-in a una imagen después de X milisegundos.
 *
 * @param {string} lottieSelector - Selector CSS del lottie-player.
 * @param {string} imageSelector - Selector CSS de la imagen final.
 * @param {number} [delay=5000] - Tiempo en ms antes de aplicar el efecto.
 */

export default function fadeLottieToImage(lottieSelector, imageSelector, delay = 5000) {
  const lottieEl = document.querySelector(lottieSelector);
  const imgEl = document.querySelector(imageSelector);

  if (!lottieEl || !imgEl) return;

  // Inicializa opacidad
  lottieEl.style.opacity = 1;
  lottieEl.style.transition = "opacity 0.5s";

  imgEl.style.opacity = 0;
  imgEl.style.transition = "opacity 1s";

  setTimeout(() => {
    // Fade-out Lottie
    lottieEl.style.opacity = 0;

    // Fade-in Imagen
    imgEl.style.opacity = 1;
  }, delay);
}