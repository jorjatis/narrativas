import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function animateFidelAtril() {
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  const createAnimation = (query, endValue, options = {}) => {
    const {
      start = "15% center",
      end = "30% center"
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
            scrub: true
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
  createAnimation("(min-width: 350px) and (max-width: 500px)", -305);
  createAnimation("(min-width: 501px) and (max-width: 698px)", -515);
  createAnimation("(min-width: 699px) and (max-width: 849px)", -665);
  createAnimation("(min-width: 850px) and (max-width: 1299px)", -715);
  createAnimation("(min-width: 1300px)", "-55%");
}