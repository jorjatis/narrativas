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

function replaceHamburgerIcon(selector = ".v-hmb svg") {
  const svg = document.querySelector(selector);
  if (!svg) return;

  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.innerHTML =
    '<path d="M19.375 17.75a.625.625 0 1 1 0 1.25H4.625a.625.625 0 1 1 0-1.25h14.75Zm-4.571-4.25a.625.625 0 0 1 0 1.25H4.625a.625.625 0 1 1 0-1.25h10.179Zm4.571-4.25a.625.625 0 1 1 0 1.25H4.625a.625.625 0 1 1 0-1.25h14.75Zm0-4.25a.625.625 0 1 1 0 1.25H4.625a.625.625 0 1 1 0-1.25h14.75Z"></path>';
}

function initAll() {
  document.body.classList.add("is-loaded");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-a-t");
  removeEls(".v-a--d-s-1 .v-a-inf-c .v-i");
  replaceHamburgerIcon();

  fadeOnScroll(".v-a--d-s-1 .v-a-img-c .scr-ind");
}

initAll();
