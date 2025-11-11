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

export function selectorNavActive() {
  const navLinks = document.querySelectorAll(".sel-nav li");
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      
      navLinks.forEach(l => {
        l.classList.remove("is-active");
        if (!l.classList.length) {
          l.removeAttribute("class");
        }
      });

      e.currentTarget.classList.add("is-active");
    });
  });
}