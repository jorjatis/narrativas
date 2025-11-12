// flip-countdown.js
import './vendors/flip/flip.min.js';

// ✅ Función principal de inicialización (tu animación original)
export function initFlipCountdown() {
  window.handleTickInit = function (tick) {
    const startYear = 1975;
    const endYear = new Date().getFullYear();
    const totalDuration = 5000;
    const frameRate = 60;
    const totalFrames = Math.round((totalDuration / 1000) * frameRate);
    const powerIn = 3;
    const powerOut = 3;

    function easeInOutPower(t) {
      return t < 0.5
        ? 0.5 * Math.pow(2 * t, powerIn)
        : 1 - 0.5 * Math.pow(2 * (1 - t), powerOut);
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
