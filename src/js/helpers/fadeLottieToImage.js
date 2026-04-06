export default function fadeLottieWithOptionalImage(delay = 5000) {
  const lottieEl = document.querySelector('[data-lottie]');
  // const imgEl = document.querySelector('[data-image]'); // Comentada por ahora

  if (!lottieEl /* || !imgEl */) return;

  let executed = false;

  // Estilos iniciales
  Object.assign(lottieEl.style, {
    opacity: 1,
    transition: "opacity 0.5s ease"
  });

  /*
  Object.assign(imgEl.style, {
    opacity: 0,
    transition: "opacity 1s ease"
  });
  */

  const runAnimation = () => {
    if (executed) return;
    executed = true;

    lottieEl.style.opacity = 0;
    if (lottieEl.pause) lottieEl.pause();

    // imgEl.style.opacity = 1; // Comentado por ahora
  };

  // Solo delay (control manual)
  // setTimeout(runAnimation, delay);

  lottieEl.addEventListener("complete", () => {
    setTimeout(runAnimation, delay);
  });
}