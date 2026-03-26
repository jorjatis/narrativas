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