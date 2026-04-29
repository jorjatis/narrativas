import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function zoomShip() {
  const img = document.querySelector(".v-n-zoom-ship img");
  const text1 = document.querySelector(".ship-text--1");
  const text2 = document.querySelector(".ship-text--2");

  if (!img) return;

  function initAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 699px)", () => {
      const tl = createBaseTimeline(img);

      tl.fromTo(text1,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3 },
        0.8
      );

      tl.to(text1, {
        y: -100,
        opacity: 0,
        duration: 0.3
      }, 1.2);

      tl.fromTo(text2,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3 },
        0.6
      );

      tl.to(text2, {
        y: -100,
        opacity: 0,
        duration: 0.3
      }, 1.2);
    });

    mm.add("(max-width: 698px)", () => {
      const tl = createBaseTimeline(img);

      tl.fromTo(text2,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 }
      );

      tl.to(text2, { duration: 0.4 });

      tl.to(text2, {
        y: -50,
        opacity: 0,
        duration: 0.3
      });

      tl.fromTo(text1,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 }
      );

      tl.to(text1, { duration: 0.4 });

      tl.to(text1, {
        y: -50,
        opacity: 0,
        duration: 0.3
      });
    });

    function createBaseTimeline(img) {
      gsap.set(img, {
        scale: 5.5,
        transformOrigin: "103% 100%",
        force3D: true
      });

      return gsap.timeline({
        scrollTrigger: {
          trigger: ".v-n-zoom-ship",
          start: "center center",
          end: "+=400%",
          scrub: 1,
          pin: true
        }
      }).to(img, {
        scale: 1,
        ease: "none",
        duration: 1
      });
    }
  }

  if (img.complete) {
    initAnimation();
  } else {
    img.addEventListener("load", initAnimation);
  }
}