import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

export default function scrambleInfoContainerTexts() {
  const pretitle = document.querySelector(".v-a-p-t");
  const title = document.querySelector(".v-a-t");
  const subtitle = document.querySelector(".v-a-s-t");

  if (!pretitle || !title || !subtitle || !gsap || !ScrambleTextPlugin) return;

  gsap.registerPlugin(ScrambleTextPlugin);

  const tl = gsap.timeline();

  function scramble(el, options = {}) {
    const finalText = el.textContent;

    el.textContent = "";

    return gsap.to(el, {
      duration: options.duration || 1.5,
      scrambleText: {
        text: finalText,
        chars: "01#@!<>-_",
        revealDelay: options.revealDelay ?? 0.2,
        speed: options.speed ?? 0.5
      },
      ease: "none"
    });
  }

  tl
    .add(scramble(pretitle, {duration: 1}))
    .add(scramble(title, {duration: 3.5}), "+=0.2")
    .add(scramble(subtitle), "+=0.2");
}