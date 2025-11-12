// dom-utils.js

// NOTE: Mover el subtítulo debajo del título
export function moveSubtitle() {
  const titleHeading = document.querySelector('.voc-article--detail-visual .voc-title');
  const subtitleHeading = document.querySelector('.voc-d--visual .voc-subtitle');

  if (titleHeading && subtitleHeading) {
    titleHeading.insertAdjacentElement('afterend', subtitleHeading);
  }
}

// NOTE: Mover el countdown arriba
export function moveFlipCountdown() {
  const titleHeading = document.querySelector('.voc-article--detail-visual .voc-title');
  const flipCountdown = document.querySelector('.tick');
  if (titleHeading && flipCountdown) {
    titleHeading.insertAdjacentElement('beforebegin', flipCountdown);
  }
}

// NOTE: Selector de categoría
export function selectorNavActive() {
  const nav = document.querySelector(".sel-nav");
  const toggleBtn = nav?.querySelector(".sel-nav-tgl");
  const navItems = nav?.querySelectorAll("li") || [];
  const sections = Array.from(document.querySelectorAll(".title-card[id]"));

  // --- TOGGLE (solo mobile)
  if (toggleBtn && nav) {
    toggleBtn.addEventListener("click", () => {
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", !isExpanded);
      nav.classList.toggle("is-active", !isExpanded);

      // (Opcional) invertir orientación del icono si es un SVG rotado por CSS
      const icon = toggleBtn.querySelector(".voc-icon svg");
      if (icon) icon.classList.toggle("is-flipped", !isExpanded);
    });
  }

  // --- CLICK manual en los <li>
  navItems.forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();

      // Quitar is-active de todos los <li> y limpiar class vacíos
      navItems.forEach(li => {
        li.classList.remove("is-active");
        if (!li.classList.length) li.removeAttribute("class");
      });

      // Añadir is-active al actual
      item.classList.add("is-active");

      // Hacer scroll suave al destino
      const anchor = item.querySelector("a");
      if (!anchor) return;
      const targetId = anchor.getAttribute("href").substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Cerrar menú móvil si estaba abierto
      if (toggleBtn && toggleBtn.getAttribute("aria-expanded") === "true") {
        toggleBtn.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-active");
        const icon = toggleBtn.querySelector(".voc-icon svg");
        if (icon) icon.classList.remove("is-flipped");
      }
    });
  });

  // --- SCROLL automático (scroll spy)
  let activeId = null;

  function updateActiveSection() {
    let current = sections[0];
    const viewportCenter = window.innerHeight / 2;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(viewportCenter - sectionCenter);

      const currentCenter = current.getBoundingClientRect().top + current.getBoundingClientRect().height / 2;
      if (distance < Math.abs(viewportCenter - currentCenter)) {
        current = section;
      }
    });

    if (current && current.id !== activeId) {
      activeId = current.id;
      navItems.forEach(li => {
        li.classList.remove("is-active");
        if (!li.classList.length) li.removeAttribute("class");
      });
      const newItem = document.querySelector(`.sel-nav li a[href="#${activeId}"]`)?.parentElement;
      if (newItem) newItem.classList.add("is-active");
    }
  }

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  updateActiveSection();
}
