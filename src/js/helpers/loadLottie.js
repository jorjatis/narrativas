import lottie from 'lottie-web';

/**
 * Helper para cargar animaciones Lottie de forma reutilizable.
 *
 * ------------------------------------------------------------ *
 * loadLottie({
 *   container: '#lottie',
 *   path: '/animations/example.json'
 * });
 *
 * ------------------------------------------------------------
 * @param {string|HTMLElement} container
 *  Selector CSS o nodo DOM donde se renderiza la animación.
 *  Ej: '#lottie' o document.getElementById('lottie')
 *
 * @param {string} [path]
 *  Ruta al archivo JSON de la animación.
 *  Ej: '/lotties/anim.json'
 *
 * @param {Object} [animationData]
 *  Alternativa a `path`. Puedes pasar directamente el JSON importado.
 *  Ej: import data from './anim.json'
 *
 * @param {'svg'|'canvas'|'html'} [renderer='svg']
 *  Tipo de renderizado. SVG es el más común.
 *
 * @param {boolean|number} [loop=true]
 *  Si la animación hace loop:
 *    - true → infinito
 *    - false → no loop
 *    - number → número de repeticiones
 *
 * @param {boolean} [autoplay=true]
 *  Si la animación empieza automáticamente.
 *
 * @param {string} [name]
 *  Nombre opcional para identificar la animación.
 *
 * @param {...Object} [rest]
 *  Cualquier otra opción soportada por lottie-web:
 *    - rendererSettings
 *    - initialSegment
 *    - assetsPath
 *    - etc.
 *
 * ------------------------------------------------------------
 * Devuelve la instancia de la animación de Lottie.
 * Permite controlarla manualmente:
 *
 * const anim = loadLottie({...});
 * anim.play();
 * anim.stop();
 * anim.pause();
 * anim.setSpeed(1.5);
 *
 */

export default function loadLottie({ container, path, renderer = 'svg', loop = true, autoplay = true, name = '', ...rest } = {}) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;

  if (!el) {
    console.warn(`[Lottie] Container no encontrado: ${container}`);
    return null;
  }

  return lottie.loadAnimation({ container: el, renderer, loop, autoplay, path, name, ...rest });
}