import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function animateFidelAtril() {
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  const createAnimation = (query, endValue, options = {}) => {
    const {
      start = "15% center",
      end = () => `${window.innerHeight * .7} center`,
    } = options;

    mm.add(query, () => {
      gsap.fromTo(".atril figure",
        { marginTop: 0 },
        {
          marginTop: endValue,
          ease: "none",
          scrollTrigger: {
            trigger: ".v-n-mth--8 > figure",
            start,
            end,
            scrub: true,
            onLeave: () => ScrollTrigger.refresh(),
            onEnterBack: () => ScrollTrigger.refresh()
          }
        }
      );
    });
  };

  // Si quiero ajustar el start y el end mas:
  // createAnimation("(min-width: 850px) and (max-width: 1299px)", -715, {
  //   start: "20% center",
  //   end: "45% center"
  // });

  createAnimation("(max-width: 349px)", -220);
  createAnimation("(min-width: 350px) and (max-width: 500px)", -305, {
    start: "15% center",
    end: () => `${window.innerHeight * .55} center`
  });
  createAnimation("(min-width: 501px) and (max-width: 698px)", -515);
  createAnimation("(min-width: 699px) and (max-width: 849px)", -640);
  createAnimation("(min-width: 850px) and (max-width: 1023px)", -715);
  createAnimation("(min-width: 1024px) and (max-width: 1299px)", -715, {
    start: "10% center",
    end: () => `${window.innerHeight * .7} center`
  });
  createAnimation("(min-width: 1300px)", "-55%", {
    start: "10% center",
    end: () => `${window.innerHeight * .8} center`
  });
}