/**
 * En prod el icono del menú llega con <use> a un sprite externo.
 * Sustituye el contenido del SVG por el path local.
 */
export default function replaceHamburgerIcon(
  selector = ".v-hmb svg"
) {
  const svg = document.querySelector(selector);
  if (!svg) return;

  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.innerHTML =
    '<path d="M19.375 17.75a.625.625 0 1 1 0 1.25H4.625a.625.625 0 1 1 0-1.25h14.75Zm-4.571-4.25a.625.625 0 0 1 0 1.25H4.625a.625.625 0 1 1 0-1.25h10.179Zm4.571-4.25a.625.625 0 1 1 0 1.25H4.625a.625.625 0 1 1 0-1.25h14.75Zm0-4.25a.625.625 0 1 1 0 1.25H4.625a.625.625 0 1 1 0-1.25h14.75Z"></path>';
}
