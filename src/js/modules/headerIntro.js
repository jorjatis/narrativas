// import gsap from "gsap";
// import lottie from "lottie-web/build/player/lottie_light";
// import animationData from "@images/el10-intro.json";

// const PIPE_OVERLAP = 22;
// const BLOCK_HIDDEN = "inset(0% 0% 100% 0%)";
// const BLOCK_SHOWN = "inset(0% 0% 0% 0%)";
// const WORD_DURATION = 0.52;

// function prefersReducedMotion() {
//   return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// }

// function readPipeStart(timeline) {
//   const path = timeline.querySelector(".chrono-pipeline__path");
//   const d = path?.getAttribute("d") || "";
//   const match = d.match(/M\s+(-?[\d.]+)\s+(-?[\d.]+)/);
//   if (!match) return null;

//   return {
//     x: Number(match[1]),
//     y: Number(match[2]),
//     width: Number(path.getAttribute("stroke-width")) || 24,
//   };
// }

// function mountLottie(host) {
//   return lottie.loadAnimation({
//     container: host,
//     renderer: "svg",
//     loop: false,
//     autoplay: false,
//     animationData: structuredClone(animationData),
//   });
// }

// // El JSON nuevo ya viene recortado al 10. Mantenemos el lienzo nativo para
// // no abrir un hueco bajo el trazo (el recorte por bbox + stroke lo agrandaba).
// function fitToContent(anim, host) {
//   const svg = host.querySelector("svg");
//   if (!svg) return;

//   const width = Number(svg.getAttribute("width")) || anim.animationData?.w;
//   const height = Number(svg.getAttribute("height")) || anim.animationData?.h;
//   if (!width || !height) return;

//   svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
//   host.style.aspectRatio = `${width} / ${height}`;
// }

// function placePipe(pipe, host, timeline) {
//   const start = readPipeStart(timeline);
//   if (!start) return false;

//   const hostBox = host.getBoundingClientRect();
//   if (hostBox.height < 2) return false;

//   const originBox = pipe.parentElement.getBoundingClientRect();
//   const timelineBox = timeline.getBoundingClientRect();
//   const top = hostBox.bottom - PIPE_OVERLAP;
//   const height = timelineBox.top + start.y - top;

//   if (height < 1) return false;

//   gsap.set(pipe, {
//     width: start.width,
//     height,
//     left: timelineBox.left + start.x - start.width / 2 - originBox.left,
//     top: top - originBox.top,
//     // El 10 proyecta su sombra sobre el arranque del tubo. La atamos al ancho
//     // del trazo para que caiga igual en cualquier breakpoint.
//     "--pipe-shadow": `${start.width * 1.7}px`,
//   });

//   return true;
// }

// function endState(preh, words, pipe, anim) {
//   gsap.set(preh, { autoAlpha: 1 });
//   gsap.set(words, { clipPath: BLOCK_SHOWN });
//   gsap.set(pipe, { clipPath: BLOCK_SHOWN });
//   anim?.goToAndStop(anim.totalFrames - 1, true);
// }

// function buildIntro(preh, words, pipe, anim, growPipe) {
//   const frame = { value: 0 };
//   const lastFrame = Math.max(anim.totalFrames - 1, 0);
//   const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

//   tl.to(preh, { autoAlpha: 1, duration: 0.7, ease: "power1.out" })
//     .to(words[0], { clipPath: BLOCK_SHOWN, duration: WORD_DURATION, ease: "power2.out" }, "-=0.2")
//     .to(
//       frame,
//       {
//         value: lastFrame,
//         duration: lastFrame / (anim.frameRate || 25),
//         ease: "none",
//         onUpdate: () => anim.goToAndStop(frame.value, true),
//       },
//       ">-0.05"
//     )
//     .add(() => growPipe(), ">")
//     .to(words[1], { clipPath: BLOCK_SHOWN, duration: WORD_DURATION, ease: "power2.out" }, ">")
//     .to(words[2], { clipPath: BLOCK_SHOWN, duration: 0.6, ease: "power2.out" }, ">-0.18");

//   return tl;
// }

// function setupHeader(preh) {
//   const animHost = preh.querySelector(".v-n-preh-shirt__anim");
//   const pipe = preh.querySelector(".v-n-preh__pipe");
//   const words = [...preh.querySelectorAll(".v-n-preh__txt")];
//   const timeline = document.querySelector(".v-n-chrono-timeline");

//   if (!animHost || !pipe || words.length < 3) return;

//   const anim = mountLottie(animHost);
//   let ready = false;
//   let grown = false;

//   const place = () => {
//     if (!timeline || !ready) return false;
//     return placePipe(pipe, animHost, timeline);
//   };

//   const growPipe = () => {
//     if (!place()) return;
//     grown = true;
//     // Se revela con clip-path, no con scaleY, para que la sombra del arranque
//     // salga ya a tamaño real en el primer fotograma en lugar de estirarse.
//     gsap.fromTo(
//       pipe,
//       { clipPath: BLOCK_HIDDEN },
//       {
//         clipPath: BLOCK_SHOWN,
//         duration: gsap.utils.clamp(1.1, 2.4, pipe.offsetHeight / 760),
//         ease: "power1.inOut",
//       }
//     );
//   };

//   anim.addEventListener("DOMLoaded", () => {
//     fitToContent(anim, animHost);
//     ready = true;

//     if (prefersReducedMotion() || preh.getBoundingClientRect().bottom < 0) {
//       place();
//       endState(preh, words, pipe, anim);
//       grown = true;
//       return;
//     }

//     buildIntro(preh, words, pipe, anim, growPipe);
//   });

//   const refresh = () => {
//     if (!grown) return;
//     place();
//   };

//   timeline?.addEventListener("chrono-pipeline:drawn", refresh);
//   window.addEventListener("resize", refresh);
// }

// export default function headerIntro() {
//   document.querySelectorAll(".v-n-preh").forEach(setupHeader);
// }

export default function headerIntro() {}
