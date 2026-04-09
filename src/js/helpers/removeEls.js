/**
 * removeElements
 * ----------------------------------------
 * Elimina uno o varios elementos del DOM
 *
 * Uso básico:
 *
 * removeElements('.mi-clase');
 * removeElements('#mi-id');
 * removeElements(elemento);
 * removeElements([el1, el2]);
 *
 * Opciones:
 *
 * @param {string|HTMLElement|NodeList|Array} target
 *  Selector, elemento o lista de elementos
 *
 * @param {boolean} all (default: true)
 *  Si es selector:
 *   - true → elimina todos los matches
 *   - false → solo el primero
 *
 * @param {number} delay (default: 0)
 *  Delay en ms antes de eliminar
 *
 * ----------------------------------------
 */

export default function removeEls(target, { all = true, delay = 0 } = {}) {
  let elements = [];

  if (typeof target === 'string') {
    elements = all
      ? document.querySelectorAll(target)
      : [document.querySelector(target)];
  } else if (target instanceof HTMLElement) {
    elements = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    elements = target;
  }

  elements.forEach(el => {
    if (!el) return;

    const remove = () => el.remove();

    if (delay > 0) {
      setTimeout(remove, delay);
    } else {
      remove();
    }
  });
}