/**
 * Aplica una clase a un elemento cuando se supera una distancia de scroll.
 *
 * @param {string} element - Selector CSS del elemento al que se le aplicará la clase.
 * @param {number} [distance=60] - Distancia en píxeles desde el top para activar el efecto.
 *
 * @description
 * Cuando el usuario hace scroll y supera la distancia indicada,
 * se añade la clase "is-transparent". Si vuelve por debajo,
 * la clase se elimina.
 *
 * @example
 * // Aplicar efecto al header a partir de 60px
 * fadeOnScroll('.header');
 *
 * @example
 * // Aplicar efecto a partir de 120px
 * fadeOnScroll('.navbar', 120);
 */

export default function fadeOnScroll(element, distance = 60) {
  window.addEventListener("scroll", () => {
    const el = document.querySelector(element);
    
    if (!el) return;

    const scrollTop = window.scrollY;

    if (scrollTop >= distance) {
      el.classList.add("is-transparent");
    } else {
      el.classList.remove("is-transparent");
    }
  });
}