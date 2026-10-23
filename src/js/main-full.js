function removeEls(target, { all = true, delay = 0 } = {}) {
  let elements = [];

  if (typeof target === "string") {
    elements = all
      ? document.querySelectorAll(target)
      : [document.querySelector(target)];
  } else if (target instanceof HTMLElement) {
    elements = [target];
  } else if (target instanceof NodeList || Array.isArray(target)) {
    elements = target;
  }

  elements.forEach((el) => {
    if (!el) return;

    const remove = () => el.remove();

    if (delay > 0) {
      setTimeout(remove, delay);
    } else {
      remove();
    }
  });
}

function moveEls(el, target, position = "prepend") {
  const element = document.querySelector(el);
  const targetEl = document.querySelector(target);

  if (!element || !targetEl) return;

  if (position === "prepend" && targetEl.firstElementChild === element) return;
  if (position === "append" && targetEl.lastElementChild === element) return;

  const actions = {
    prepend: () => targetEl.prepend(element),
    append: () => targetEl.append(element),
    before: () => targetEl.before(element),
    after: () => targetEl.after(element),
  };

  if (!actions[position]) {
    console.warn(`Posición no válida: ${position}`);
    return;
  }

  actions[position]();
}

function fadeOnScroll(selector, threshold = 50) {
  const indicators = document.querySelectorAll(selector);
  if (!indicators.length) return;

  const update = () => {
    const visible = window.scrollY < threshold;

    indicators.forEach((el) => {
      el.classList.toggle("is-visible", visible);
      el.setAttribute("aria-hidden", String(!visible));
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initAll() {
  document.body.classList.add("is-loaded");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-a-t");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-i");
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");  
  fadeOnScroll(".v-a--d-s-1 .v-a-img-c .scr-ind");
}

initAll();
