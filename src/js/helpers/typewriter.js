/**
 * typewriter
 * ----------------------------------------
 * Parte el texto y lo revela en secuencia (efecto máquina de escribir).
 *
 * Uso básico:
 *
 * typewriter(".v-n-preh__txt");
 * typewriter(".v-n-preh__txt", { type: "words" });
 *
 * En una timeline:
 *
 * typewriter(".v-n-preh__t", { timeline: tl });
 *
 * Opciones:
 *
 * @param {string|HTMLElement|NodeList|Array} target
 *  Selector o elemento(s) a partir
 *
 * @param {"chars"|"words"} type (default: "chars")
 *  "chars" → letra a letra / "words" → palabra a palabra
 *
 * @param {number} stagger (default: 0.03)
 *  Segundos entre cada unidad
 *
 * @param {number} duration (default: 0.01)
 *  Duración de cada unidad (casi instantánea = typewriter)
 *
 * @param {number} delay (default: 0)
 *  Delay inicial en segundos
 *
 * @param {gsap.core.Timeline} timeline
 *  Si se pasa, el efecto se añade a esa timeline
 *
 * @param {string|number} position
 *  Position parameter de GSAP cuando hay timeline
 *
 * @param {boolean} paused (default: false)
 *  Si es true, no arranca hasta .play() (solo sin timeline)
 *
 * @param {boolean} showTarget (default: true)
 *  Si es false, no fuerza opacity: 1 en el contenedor (lo controla la timeline)
 *
 * @param {boolean} fill (default: false)
 *  El texto ya se ve (opacity fillFrom) y se “rellena” hasta 1
 *
 * @param {number} fillFrom (default: 0.3)
 *  Opacidad inicial de cada unidad cuando fill es true
 *
 * @param {function} onComplete
 *  Callback al terminar
 *
 * Devuelve { split, chars, words, items, tween, at, revert }
 *
 * at(n) → segundos desde el inicio hasta la unidad n (1-based)
 * ----------------------------------------
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "./prefersReducedMotion";

gsap.registerPlugin(SplitText);

function toElements(target) {
  if (typeof target === "string") return [...document.querySelectorAll(target)];
  if (target instanceof HTMLElement) return [target];
  if (target instanceof NodeList || Array.isArray(target)) return [...target].filter(Boolean);
  return [];
}

export default function typewriter(
  target,
  {
    type = "chars",
    stagger = 0.03,
    duration = 0.01,
    delay = 0,
    ease = "none",
    paused = false,
    timeline,
    position,
    showTarget = true,
    fill = false,
    fillFrom = 0.3,
    reduceMotion = prefersReducedMotion(),
    onComplete,
  } = {}
) {
  const elements = toElements(target);
  const splitByWords = type === "words";

  if (!elements.length) {
    console.warn(`[typewriter] Elemento(s) no encontrado(s): ${target}`);
    return null;
  }

  if (type !== "chars" && type !== "words") {
    console.warn(`[typewriter] type debe ser "chars" o "words". Recibido: ${type}`);
    return null;
  }

  if (!splitByWords) {
    gsap.set(elements, { fontKerning: "none", textRendering: "optimizeSpeed" });
  }

  const split = SplitText.create(elements, {
    type: splitByWords ? "words" : "words, chars",
    tag: "span",
    aria: "auto",
  });

  const items = splitByWords ? split.words : split.chars;

  const staggerAt = (index) => {
    if (typeof stagger === "number") return index * stagger;
    const amount = stagger?.amount ?? 0;
    const n = items.length;
    if (n <= 1) return 0;
    return (index / (n - 1)) * amount;
  };

  if (showTarget) {
    gsap.set(elements, { opacity: 1, visibility: "inherit" });
  }

  const result = {
    split,
    chars: split.chars,
    words: split.words,
    items,
    at(count) {
      const index = Math.max(0, Math.min(count, items.length) - 1);
      return staggerAt(index);
    },
  };

  if (reduceMotion) {
    gsap.set(items, { opacity: 1, visibility: "inherit" });
    onComplete?.();
    return { ...result, tween: null, revert: () => split.revert() };
  }

  if (fill) {
    gsap.set(items, { opacity: fillFrom, visibility: "inherit" });
    const toVars = {
      opacity: 1,
      duration,
      stagger,
      delay,
      ease,
      immediateRender: false,
      onComplete,
    };
    const tween = timeline
      ? timeline.to(items, toVars, position)
      : gsap.to(items, { ...toVars, paused });

    return {
      ...result,
      tween,
      revert() {
        if (!timeline) tween.kill();
        split.revert();
      },
    };
  }

  const fromVars = {
    opacity: 0,
    duration,
    stagger,
    delay,
    ease,
    immediateRender: true,
    onComplete,
  };

  const tween = timeline
    ? timeline.from(items, fromVars, position)
    : gsap.from(items, { ...fromVars, paused });

  return {
    ...result,
    tween,
    revert() {
      if (!timeline) tween.kill();
      split.revert();
    },
  };
}
