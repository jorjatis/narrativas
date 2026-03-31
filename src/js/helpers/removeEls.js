/**
 * Elimina uno o varios elementos del DOM según un selector.
 *
 * @param {string} selector - Selector CSS del elemento(s) a eliminar.
 * @param {boolean} [removeAll=false] - Si es true, elimina todos los elementos que coincidan.
 *                                      Si es false, solo elimina el primero encontrado.
 *
 * @example
 * // Elimina el primer elemento con la clase ".card"
 * removeEls('.card');
 *
 * @example
 * // Elimina todos los elementos con la clase ".card"
 * removeEls('.card', true);
 */

export default function removeEls(selector, removeAll = false) {
  if (removeAll) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach(el => el.remove());
  } else {
    const element = document.querySelector(selector);
    if (!element) return;

    element.remove();
  }
}