export function initScrollIndicator() {
  const indicator = document.querySelector(".v-i--scroll");
  if (!indicator) return;

  const toggleVisibility = () => {
    if (window.scrollY > 80) {
      indicator.classList.add("is-hidden");
    } else {
      indicator.classList.remove("is-hidden");
    }
  };

  // Estado inicial
  toggleVisibility();

  window.addEventListener("scroll", toggleVisibility, { passive: true });
}