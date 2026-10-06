import gsap from "gsap";
import { prefersReducedMotion } from "../helpers/prefersReducedMotion.js";

const MQ_DESKTOP = `(min-width: 699px)`;
const FACE_STAGGER = 0.16;
const FACE_DURATION = 0.45;
const LINE_DURATION = 0.7;
const OF_END_Y = { mobile: -18, desktop: -26 };
const OF_START_Y = { mobile: 30, desktop: 60 };

/**
 * Intro del pre-article-header: imágenes + tipografía.
 * Desktop: bg → faces (stagger) → texto al llegar a face-06.
 * Mobile: texto primero → imágenes después.
 */
export default function preArticleHeader(root = document) {
  const section = root.querySelector(".v-a--d-s-1");
  if (!section) return;

  const imgFig = section.querySelector(".v-a-preh-img");
  const textBlock = section.querySelector(".v-a-preh-t");
  const subtitle = section.querySelector(".v-a-s-t");
  if (!imgFig || !textBlock) return;

  const bg = imgFig.querySelector(".v-a-preh-img__bg");
  const faces = gsap.utils.toArray(imgFig.querySelectorAll(".v-a-preh-img__face"));
  const word01 = textBlock.querySelector(".v-a-preh-t-s--01");
  const word02 = textBlock.querySelector(".v-a-preh-t-s--02");
  const line = textBlock.querySelector(".v-a-preh-t-s-line");
  const of = textBlock.querySelector(".v-a-preh-t-s-of");
  const flag = subtitle?.querySelector(".v-a-s-t-flag");

  const isDesktop = window.matchMedia(MQ_DESKTOP).matches;
  const ofEndY = isDesktop ? OF_END_Y.desktop : OF_END_Y.mobile;
  const ofStartY = isDesktop ? OF_START_Y.desktop : OF_START_Y.mobile;

  const showFinal = () => {
    gsap.set([imgFig, textBlock, subtitle].filter(Boolean), { opacity: 1 });
    gsap.set([bg, ...faces].filter(Boolean), { opacity: 1 });
    gsap.set([word01, word02].filter(Boolean), { opacity: 1 });
    if (line) gsap.set(line, { scaleX: 1 });
    if (flag) gsap.set(flag, { scaleX: 1 });
    if (of) gsap.set(of, { y: ofEndY });
  };

  if (prefersReducedMotion()) {
    showFinal();
    return;
  }

  gsap.set([imgFig, textBlock], { opacity: 0 });
  gsap.set([bg, ...faces], { opacity: 0 });
  gsap.set([word01, word02], { opacity: 0 });
  gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
  if (flag) gsap.set(flag, { scaleX: 0, transformOrigin: "left center" });
  gsap.set(of, { y: ofStartY });
  if (subtitle) gsap.set(subtitle, { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  const playImages = (at) => {
    tl.set(imgFig, { opacity: 1 }, at);
    tl.to(bg, { opacity: 1, duration: 0.9 }, at);
    tl.to(
      faces,
      { opacity: 1, duration: FACE_DURATION, stagger: FACE_STAGGER },
      typeof at === "number" ? at + 0.35 : "<0.35"
    );
  };

  const playText = (at) => {
    tl.set(textBlock, { opacity: 1 }, at);
    tl.to(word01, { opacity: 1, duration: 0.5 }, at);
    tl.to(word02, { opacity: 1, duration: 0.4 }, ">-0.1");
    tl.to(
      line,
      { scaleX: 1, duration: LINE_DURATION, ease: "power2.inOut" },
      ">-0.05"
    );
    // Al 75% de la línea, 1-O sube a su posición final
    tl.to(
      of,
      { y: ofEndY, duration: 0.55, ease: "power2.out" },
      `<${LINE_DURATION * 0.75}`
    );
  };

  const playSubtitle = (at) => {
    if (!subtitle) return;
    tl.to(subtitle, { opacity: 1, duration: 0.5 }, at);
    if (flag) {
      tl.to(
        flag,
        { scaleX: 1, duration: 0.55, ease: "power2.inOut" },
        "<0.15"
      );
    }
  };

  if (isDesktop) {
    playImages(0);
    // Face-06 (índice 5) arranca en 0.35 + 5 * stagger
    playText(0.35 + 5 * FACE_STAGGER);
    playSubtitle(">-0.25");
  } else {
    playText(0);
    playImages(">-0.15");
    playSubtitle(">-0.2");
  }

  return tl;
}
