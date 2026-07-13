import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const containers = document.querySelectorAll(".v-n-scrolly");
  if (!containers.length) return;

  containers.forEach((container) => {
    const steps = [...container.querySelectorAll(".step")];
    const backgrounds = [...container.querySelectorAll(".bg-item")];
    const bullets = [...container.querySelectorAll(".pagination button")];

    const scroller = container.closest(".v-n-scrolly-scroller") || window;

    let currentBg = -1;

    gsap.set(backgrounds, { opacity: 0 });

    function setBackground(index, immediate = false) {
      if (currentBg === index) return;

      backgrounds.forEach((bg, i) => {
        bg.classList.toggle("is-active", i === index);

        gsap.to(bg, {
          opacity: i === index ? 1 : 0,
          duration: immediate ? 0 : 0.5,
          overwrite: true
        });
      });

      currentBg = index;
    }

    function setActiveStep(step) {
      steps.forEach((s) => s.classList.remove("is-active"));
      step.classList.add("is-active");

      bullets.forEach((b) => b.classList.remove("is-active"));

      const index = Number(step.dataset.step);

      if (bullets[index]) {
        bullets[index].classList.add("is-active");
      }
    }

    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        scroller,

        start: "top center",
        end: "bottom center",

        onEnter() {
          setActiveStep(step);
          setBackground(Number(step.dataset.bg));
        },

        onEnterBack() {
          setActiveStep(step);
          setBackground(Number(step.dataset.bg));
        }
      });
    });

    const first = steps[0];

    if (first) {
      setActiveStep(first);
      setBackground(Number(first.dataset.bg), true);
    }

    if (bullets[index]) {
      bullets.forEach((bullet, index) => {
        bullet.addEventListener("click", () => {
          steps[index].scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        });
      });
    }
  });
}