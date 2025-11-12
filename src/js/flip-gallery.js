// flip-gallery.js
import './vendors/flip/flip.min.js';

// 🗂️ Guardamos todas las instancias identificadas por el ID de su contenedor
const tickInstances = new Map();
const tickTimers = new Map();

/**
 * Handler global que Tick ejecuta cuando se inicializa cada flip
 * Usa data-gallery-id para saber a qué galería pertenece
 */
window.handleGalleryTickInit = (tick) => {
  const parentGallery = tick.root.closest('.grid-gallery');
  if (!parentGallery) return;

  const galleryId = parentGallery.dataset.category || `gallery-${Date.now()}`;
  tickInstances.set(galleryId, tick);
  tick.value = { years: 1975 }; // valor inicial
};

/**
 * 🎞️ Animar el flip de una galería concreta hacia un año
 */
export function animateFlipToYear(category, targetYear) {
  const tickInstance = tickInstances.get(category);
  if (!tickInstance) {
    console.warn(`No se encontró instancia de flip para ${category}`);
    return;
  }

  // Detener animación anterior si existe
  const prevTimer = tickTimers.get(category);
  if (prevTimer) {
    prevTimer.stop();
    tickTimers.delete(category);
  }

  const currentYear = parseInt(tickInstance.value.years || 1975);
  const target = parseInt(targetYear);
  if (currentYear === target) return;

  const totalDuration = 1500;
  const frameRate = 60;
  const totalFrames = Math.round((totalDuration / 1000) * frameRate);
  let frame = 0;

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const timer = Tick.helper.interval(() => {
    frame++;
    const progress = Math.min(frame / totalFrames, 1);
    const eased = ease(progress);
    const newYear = Math.round(currentYear + (target - currentYear) * eased);
    tickInstance.value = { years: String(newYear).padStart(4, '0') };

    if (progress >= 1) {
      tickInstance.value = { years: String(target).padStart(4, '0') };
      timer.stop();
      tickTimers.delete(category);
    }
  }, 1000 / frameRate);

  tickTimers.set(category, timer);
}
