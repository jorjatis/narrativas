/**
 * Mueve un elemento del DOM a una nueva posición relativa a otro elemento.
 *
 * @param {string} el - Selector CSS del elemento que se quiere mover.
 * @param {string} target - Selector CSS del elemento de referencia.
 * @param {"prepend" | "append" | "before" | "after"} [position="prepend"] 
 *        Posición donde se insertará el elemento respecto al target:
 *        - "prepend": dentro del target, al inicio
 *        - "append": dentro del target, al final
 *        - "before": antes del target
 *        - "after": después del target
 *
 * @example
 * // Mover un elemento al inicio de otro
 * moveEls('.item', '.container');
 *
 * @example
 * // Mover un elemento al final de otro
 * moveEls('.item', '.container', 'append');
 *
 * @example
 * // Mover un elemento antes de otro
 * moveEls('.item', '.container', 'before');
 *
 * @example
 * // Mover un elemento después de otro
 * moveEls('.item', '.container', 'after');
 */

export default function moveEls(el, target, position = "prepend") {
  const element = document.querySelector(el);
  const targetEl = document.querySelector(target);

  if (!element || !targetEl) return;

  switch (position) {
    case "prepend":
      targetEl.prepend(element);
      break;

    case "append":
      targetEl.append(element);
      break;

    case "before":
      targetEl.before(element);
      break;

    case "after":
      targetEl.after(element);
      break;

    default:
      console.warn(`Posición no válida: ${position}`);
  }
}