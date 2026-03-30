export default function fadeOnScroll(selector, distanceDesktop = 60, distanceMobile = 30) {
  const el = document.querySelector(selector);
  
  if (!el) return;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    
    const currentDistance = window.innerWidth < 699 ? distanceMobile : distanceDesktop;

    if (scrollTop >= currentDistance) {
      el.classList.add("is-transparent");
    } else {
      el.classList.remove("is-transparent");
    }
  }, { passive: true });
}