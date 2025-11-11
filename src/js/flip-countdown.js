// Importar el vendor directamente dentro del bundle
import './vendors/flip/flip.min.js';

// flip-anim.js
export function initFlipCountdown() {
  window.handleTickInit = function (tick) {
    const startYear = new Date().getFullYear();
    const endYear = 1975;
    const totalDuration = 5000; // duración total en ms
    const frameRate = 60;
    const totalFrames = Math.round((totalDuration / 1000) * frameRate);
    const power = 3; // controla el easing (2 = normal, 3 = más fuerte)

    function easeInOutPower(t) {
      return t < 0.5
        ? 0.5 * Math.pow(2 * t, power)
        : 1 - 0.5 * Math.pow(2 * (1 - t), power);
    }

    tick.value = { years: startYear };
    let frame = 0;

    const timer = Tick.helper.interval(() => {
      const progress = frame / totalFrames;
      const eased = easeInOutPower(progress);
      const currentYear = Math.round(
        startYear - (startYear - endYear) * eased
      );

      tick.value = { years: currentYear };
      frame++;

      if (frame >= totalFrames) {
        tick.value = { years: endYear };
        timer.stop();
      }
    }, 1000 / frameRate);
  };
}
