import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function scrolly() {
  gsap.registerPlugin(ScrollTrigger);

  const containers = document.querySelectorAll(".v-n-scrolly");
  if (!containers.length) return;

  containers.forEach((container) => {
    const steps = container.querySelectorAll(".step");
    const bgData = Array.from(container.querySelectorAll(".bg-item")).map(el => ({
      el,
      video: el.querySelector("video") || null
    }));

    let currentIndex = -1;

    const config = {
      fadeIn: 0.6,
      fadeOut: 0.3,
      start: "top center",
      end: "bottom center",
    };

    gsap.set(bgData.map(b => b.el), { opacity: 0 });

    function activate(index, immediate = false) {
      if (index === currentIndex || index < 0) return;

      const duration = immediate ? 0 : config.fadeIn;
      
      if (currentIndex !== -1) {
        const prev = bgData[currentIndex];
        prev.el.classList.remove("is-active");
        if (prev.video) prev.video.pause();
        gsap.to(prev.el, { opacity: 0, duration: config.fadeOut, overwrite: true });
        steps[currentIndex]?.classList.remove("is-active");
      }

      const next = bgData[index];
      if (next) {
        next.el.classList.add("is-active");
        steps[index]?.classList.add("is-active");
        if (next.video) next.video.play().catch(() => {});
        gsap.to(next.el, { opacity: 1, duration, overwrite: true });
      }

      currentIndex = index;
    }

    steps.forEach((step, index) => {
      const bgIndex = parseInt(step.dataset.bg, 10);

      ScrollTrigger.create({
        trigger: step,
        start: config.start,
        end: config.end,
        onToggle: (self) => {
          if (self.isActive) activate(bgIndex);
        },
        onRefresh: (self) => {
          if (self.isActive) activate(bgIndex, true);
        }
      });
    });

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();

      if (currentIndex === -1) {
        activate(0, true);
      }
    });
  });
}