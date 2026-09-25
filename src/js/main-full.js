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

function removeEls(target, { all = true, delay = 0 } = {}) {
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

function zoomInImage() {
  if (window.matchMedia('(max-width: 699px)').matches) return;

  const zoomDuration = 90;
  const img = document.querySelector('.v-a--d-s-1 .v-a-img-c .v-a-img');

  if (!img) return;

  img.style.transition = `transform ${zoomDuration}s linear`;
  img.style.transform = 'scale(1.5)';
}

function initAll() {
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-i");

  document.body.classList.add("is-loaded");
  document.querySelector('.v-a--d-s-1 .v-a-inf-c .v-a-t').innerHTML = '<span>Los últimos</span><span class="v-a-t__loc">Mongolia</span><span>hombres libres</span>';

  moveEls(".v-d--abc .scr-ind", ".v-a--d-s-1 .v-a-img-c", "prepend");

  moveEls(".v-n-suh--first", ".v-d--abc .v-a-s-t", "before");

  fadeOnScroll(".v-a--d-s-1 .v-a-img-c .scr-ind");

  zoomInImage();
}

initAll();