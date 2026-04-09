/**
 * observeInView
 * ----------------------------------------
 * Detecta cuando un elemento entra o sale del viewport usando IntersectionObserver.
 *
 * Uso básico:
 *
 * observeInView({
 *   target: '#mi-elemento',
 *   threshold: 0.5,
 *   once: true,
 *   onEnter: (entry) => {
 *     console.log('Entró en pantalla');
 *   },
 *   onLeave: (entry) => {
 *     console.log('Salió de pantalla');
 *   }
 * });
 *
 * Opciones:
 *
 * @param {string|HTMLElement} target
 *  Selector o elemento a observar
 *
 * @param {number} threshold (default: 0.5)
 *  Porcentaje de visibilidad necesario (0 → 1)
 *  Ej: 0.5 = 50% visible
 *
 * @param {boolean} once (default: true)
 *  Si es true, el observer se ejecuta solo una vez
 *
 * @param {function} onEnter
 *  Callback cuando el elemento entra en viewport
 *
 * @param {function} onLeave
 *  Callback cuando el elemento sale del viewport
 *
 * Ejemplo con Lottie:
 *
 * const anim = loadLottie({ autoplay: false, loop: false, ... });
 *
 * observeInView({
 *   target: '#lottie',
 *   threshold: 0.5,
 *   onEnter: () => anim.play()
 * });
 *
 * ----------------------------------------
 */

export default function observeInView({
  target,
  threshold = 0.5,
  once = true,
  markers = false,
  onEnter = () => {},
  onLeave = () => {}
} = {}) {

  let elements = [];

  if (typeof target === 'string') {
    elements = document.querySelectorAll(target);
  } else if (target instanceof HTMLElement) {
    elements = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    elements = target;
  }

  if (!elements.length) {
    console.warn(`[observeInView] Elemento(s) no encontrado(s): ${target}`);
    return null;
  }

  // MARKERS (uno global, no por elemento)
  if (markers) {
    const marker = document.createElement('div');
    marker.style.position = 'fixed';
    marker.style.left = 0;
    marker.style.right = 0;
    marker.style.top = `${threshold * 100}vh`;
    marker.style.borderTop = '2px dashed red';
    marker.style.zIndex = 9999;
    marker.style.pointerEvents = 'none';

    marker.innerHTML = `<span style="
      position:absolute;
      right:10px;
      top:-10px;
      font-size:12px;
      background:red;
      color:white;
      padding:2px 6px;
    ">threshold ${threshold}</span>`;

    document.body.appendChild(marker);
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
        if (markers) console.log('[observeInView] ENTER', entry);

        onEnter(entry);

        if (once) {
          obs.unobserve(entry.target);
        }
      } else {
        if (markers) console.log('[observeInView] LEAVE', entry);

        onLeave(entry);
      }
    });
  }, {
    threshold: [threshold]
  });

  elements.forEach(el => observer.observe(el));

  return observer;
}