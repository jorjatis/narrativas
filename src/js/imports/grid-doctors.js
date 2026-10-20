export default function initGridDoctors() {
  const { gsap } = window;
  const doctorCards = document.querySelectorAll(".doctor-card");

  if (!gsap || !doctorCards.length) return;

  gsap.from(doctorCards, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".grid-doctors__g",
      start: "top 70%",
      toggleActions: "play none none none"
    }
  });
}
