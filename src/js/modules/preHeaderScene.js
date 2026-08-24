import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import typewriter from "../helpers/typewriter";

gsap.registerPlugin(ScrollTrigger);

function imgKey(el) {
  const img = el.querySelector("img");
  const src = img?.getAttribute("src") || img?.currentSrc || "";
  return src.split("/").pop().split("?")[0];
}

function pickHomeFace(mainFace, faces) {
  const key = imgKey(mainFace);
  const matches = faces.filter((el) => imgKey(el) === key);
  if (!matches.length) return null;

  const from = mainFace.getBoundingClientRect();
  const fx = from.left + from.width / 2;
  const fy = from.top + from.height / 2;
  let best = matches[0];
  let bestD = Infinity;

  matches.forEach((el) => {
    const r = el.getBoundingClientRect();
    const d = (r.left + r.width / 2 - fx) ** 2 + (r.top + r.height / 2 - fy) ** 2;
    if (d < bestD) {
      bestD = d;
      best = el;
    }
  });

  return best;
}

function destTo(el, target) {
  const x = Number(gsap.getProperty(el, "x")) || 0;
  const y = Number(gsap.getProperty(el, "y")) || 0;
  const scale = Number(gsap.getProperty(el, "scale")) || 1;
  const from = el.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  return {
    x: to.left - (from.left - x),
    y: to.top - (from.top - y),
    scale: to.width / (from.width / scale),
  };
}

export default function preHeaderScene() {
  const scene = document.querySelector(".v-n-preh__scene");
  const phase1 = scene?.querySelector(".v-n-preh__phase--1");
  const phase2 = scene?.querySelector(".v-n-preh__phase--2");
  const phase3 = scene?.querySelector(".v-n-preh__phase--3");
  if (!scene || !phase1) return;

  const mainFace = phase1.querySelector(".v-n-preh__face--main");
  const facePhase1 = mainFace?.querySelector("img");
  const txtDashPhase1 = phase1.querySelector(".v-n-preh__txt-slash");
  const subCPhase1 = phase1.querySelector(".v-n-preh__sub-c");
  const subsPhase1 = phase1.querySelectorAll(".v-n-preh__sub");
  const txtPhase1 = phase1.querySelector(".v-n-preh__txt");
  const txtPhase2 = phase2?.querySelector(".v-n-preh__t");
  const facesEl = phase2?.querySelector(".v-n-preh__faces");
  const faces = [...(facesEl?.querySelectorAll(".v-n-preh__face") ?? [])];
  const homeFace = mainFace && faces.length ? pickHomeFace(mainFace, faces) : null;
  const otherFaces = faces.filter((el) => el !== homeFace);

  const slotFace = phase3?.querySelector(".v-n-preh__face--slot")
    || phase3?.querySelector(".v-n-preh__face--1");
  const pachasFace = phase3?.querySelector(".v-n-preh__face--pachas")
    || phase3?.querySelector(".v-n-preh__face--2");
  const pachasSub = pachasFace?.parentElement?.querySelector(".v-n-preh__sub");
  const anonSub = slotFace?.parentElement?.querySelector(".v-n-preh__sub");
  const hermanos = phase3?.querySelector(".v-n-preh__convo-dash-txt");
  const convoLine = phase3?.querySelector(".v-n-preh__convo-dash-line");
  const txtLead = phase3?.querySelector(".v-n-preh__txt--lead");
  const txtQuote = phase3?.querySelector(".v-n-preh__txt--quote");
  const txtEnd = phase3?.querySelector(".v-n-preh__txt--end");
  const quoteSlash = pachasFace?.querySelector(".v-n-preh__txt-slash");

  const dest2 = { x: 0, y: 0, scale: 1 };
  const dest3 = { x: 0, y: 0, scale: 1 };

  if (faces.length) gsap.set(faces, { autoAlpha: 0 });
  if (homeFace) gsap.set(homeFace, { autoAlpha: 0 });
  if (slotFace) gsap.set(slotFace, { autoAlpha: 0 });
  if (convoLine) gsap.set(convoLine, { scaleX: 0, transformOrigin: "left center" });

  const intro = gsap.timeline({
    defaults: { duration: 0.7, ease: "power2.out" },
  });

  intro
    .fromTo(facePhase1, { autoAlpha: 0 }, { autoAlpha: 1 })
    .fromTo(subsPhase1, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.12 }, "<");

  const typedPhase1 = typewriter(txtPhase1, { timeline: intro, position: "-=0.5" });

  intro.fromTo(
    txtDashPhase1,
    { autoAlpha: 0 },
    { autoAlpha: 1 },
    `<${typedPhase1?.at(5) ?? 0}`
  );

  const scroll = gsap.timeline({
    paused: true,
    defaults: { ease: "none" },
  });

  scroll.fromTo(
    [txtPhase1, subCPhase1, txtDashPhase1],
    { opacity: 1 },
    {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      immediateRender: false,
    }
  );

  typewriter(txtPhase2, {
    timeline: scroll,
    stagger: { amount: 1 },
  });

  if (otherFaces.length) {
    scroll.to(
      otherFaces,
      {
        autoAlpha: 1,
        duration: 0.4,
        stagger: { amount: 0.8, from: "random" },
        ease: "power1.out",
      },
      0.6
    );
  }

  const syncDest = () => {
    if (mainFace && homeFace) Object.assign(dest2, destTo(mainFace, homeFace));
    if (mainFace && slotFace) Object.assign(dest3, destTo(mainFace, slotFace));
  };

  intro.then(() => {
    syncDest();

    if (mainFace && homeFace) {
      scroll.to(
        mainFace,
        {
          x: () => dest2.x,
          y: () => dest2.y,
          scale: () => dest2.scale,
          transformOrigin: "0% 0%",
          duration: 0.7,
          ease: "power2.inOut",
        },
        0.5
      );
    }

    const fadeOutP2 = [txtPhase2, ...otherFaces].filter(Boolean);
    scroll.addLabel("phase3");

    if (fadeOutP2.length) {
      scroll.to(
        fadeOutP2,
        { autoAlpha: 0, duration: 0.55, ease: "power2.out" },
        "phase3"
      );
    }

    if (mainFace && slotFace) {
      scroll.to(
        mainFace,
        {
          x: () => dest3.x,
          y: () => dest3.y,
          scale: () => dest3.scale,
          transformOrigin: "0% 0%",
          duration: 0.75,
          ease: "power2.inOut",
        },
        "phase3"
      );
    }

    if (anonSub) {
      scroll.to(anonSub, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, "phase3+=0.5");
    }

    if (convoLine) {
      scroll.to(
        convoLine,
        { scaleX: 1, duration: 0.5, ease: "power2.out" },
        "phase3+=0.7"
      );
    }

    if (hermanos) {
      scroll.to(
        hermanos,
        { autoAlpha: 1, duration: 0.35, ease: "power2.out" },
        "phase3+=0.8"
      );
    }

    const pachasBits = [pachasFace, pachasSub].filter(Boolean);
    if (pachasBits.length) {
      scroll.to(
        pachasBits,
        { autoAlpha: 1, duration: 0.45, ease: "power2.out" },
        "phase3+=1.2"
      );
    }

    scroll.addLabel("lead", "phase3+=1.7");

    if (txtLead) {
      scroll.set(txtLead, { autoAlpha: 1 }, "lead");
      typewriter(txtLead, {
        timeline: scroll,
        position: "lead",
        fill: true,
        fillFrom: 0.3,
        showTarget: false,
        stagger: { amount: 1.5 },
        duration: 0.02,
      });
    }

    scroll.addLabel("quote", "+=0.15");

    if (txtQuote) {
      scroll.set(txtQuote, { autoAlpha: 1 }, "quote");
      const typedQuote = typewriter(txtQuote, {
        timeline: scroll,
        position: "quote",
        showTarget: false,
        stagger: { amount: 0.7 },
      });

      if (quoteSlash) {
        scroll.fromTo(
          quoteSlash,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.2, ease: "power2.out", immediateRender: false },
          `quote+=${typedQuote?.at(5) ?? 0}`
        );
      }
    }

    scroll.addLabel("endCopy", "+=0.12");

    if (txtEnd) {
      scroll.set(txtEnd, { autoAlpha: 1 }, "endCopy");
      typewriter(txtEnd, {
        timeline: scroll,
        position: "endCopy",
        showTarget: false,
        stagger: { amount: 0.9 },
      });
    }

    scroll.to({}, { duration: 0.85 });

    ScrollTrigger.create({
      animation: scroll,
      trigger: scene,
      start: "top top",
      end: () => {
        const vh = window.innerHeight;
        const scaled = scroll.duration() * vh * 0.48;
        return `+=${Math.round(gsap.utils.clamp(vh * 2.4, vh * 3.6, scaled))}`;
      },
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: syncDest,
    });
  });
}
