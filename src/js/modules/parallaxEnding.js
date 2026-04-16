import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function parallaxEnding() {
  gsap.registerPlugin(ScrollTrigger);

  function gsapMatchMedia(configs) {
    const mm = gsap.matchMedia();

    Object.entries(configs).forEach(([query, fn]) => {
      mm.add(query, fn);
    });

    return mm;
  }

  gsapMatchMedia({
    "(min-width: 1024px)": () => {
      createParallax(180);
    },

    "(min-width: 768px) and (max-width: 1023px)": () => {
      createParallax(120);
    },

    "(max-width: 767px)": () => {
      createParallax(80);
    }
  });

  function createParallax(margin) {
    gsap.to(".v-n-mth--18 .v-n-img--2", {
      marginTop: margin,
      force3D: true,
      ease: "none",
      scrollTrigger: {
        trigger: ".v-n-mth--18 .v-n-mth-fig",
        start: "center center",
        end: "75% center",
        scrub: true,
        onLeave: () => ScrollTrigger.refresh(),
        onEnterBack: () => ScrollTrigger.refresh()
      }
    });
  }
}