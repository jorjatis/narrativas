/**
 * observeInView
 * ----------------------------------------
 * Detecta cuando un elemento entra o sale del viewport usando IntersectionObserver.
 *
 * Uso básico:
 *
 * observeInView({
 *   target: '#mi-elemento',
 *   threshold: 0,
 *   rootMargin: '0px 0px -40% 0px',
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
 * @param {string|HTMLElement|NodeList|Array} target
 *  Selector o elemento(s) a observar
 *
 * @param {number} threshold (default: 0)
 *  Porcentaje del ELEMENTO que debe estar visible (0 → 1).
 *  No es una posición en el viewport.
 *
 * @param {string} rootMargin (default: '0px')
 *  Igual que CSS margin sobre el root. Para disparar cuando el top
 *  del elemento cruza el 60% del viewport: '0px 0px -40% 0px'
 *
 * @param {boolean} once (default: true)
 *  Si es true, el observer se ejecuta solo una vez
 *
 * @param {function} onEnter
 *  Callback cuando el elemento entra en la zona de intersección
 *
 * @param {function} onLeave
 *  Callback cuando el elemento sale de la zona de intersección
 *
 * ----------------------------------------
 */

export default function observeInView({
  target,
  threshold = 0,
  rootMargin = "0px",
  once = true,
  onEnter = () => {},
  onLeave = () => {}
} = {}) {
  let elements = [];

  if (typeof target === "string") {
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

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          onEnter(entry);

          if (once) {
            obs.unobserve(entry.target);
          }
        } else {
          onLeave(entry);
        }
      });
    },
    {
      threshold: [threshold],
      rootMargin
    }
  );

  elements.forEach((el) => observer.observe(el));

  return observer;
}
