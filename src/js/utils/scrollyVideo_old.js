/**
 * Helper para inicializar ScrollyVideo de forma segura
 * @param {Object} options - Opciones de configuración
 * @param {string} options.container - ID del contenedor (sin el #)
 * @param {string} options.src - URL del video
 */

export default function initScrollyVideo({ container, src, ...rest }) {
  const element = document.getElementById(container);

  if (!element) return;

  // Comprobamos si la librería está disponible
  if (typeof ScrollyVideo !== 'undefined') {
    return new ScrollyVideo({
      scrollyVideoContainer: container,
      src: src,
      ...rest // Para ver el resto de opciones ir a https://scrollyvideo.js.org/
    });
  } else {
    console.error("ScrollyVideo library not found. Make sure the CDN script is loaded.");
  }
}