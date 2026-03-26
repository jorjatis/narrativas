export default function fadeOnScroll(element, distance = 60) {
  window.addEventListener("scroll", () => {
    const el = document.querySelector(element);
    
    if (!element) return;

    const scrollTop = window.scrollY;

    if (scrollTop >= distance) {
      el.classList.add("is-transparent");
    } else {
      el.classList.remove("is-transparent");
    }
  });
}