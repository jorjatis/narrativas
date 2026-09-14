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

function headerPinOffset() {
  const desktop = window.matchMedia("(min-width: 699px)").matches;
  const headerH = desktop ? 58 : 50;
  const banner = document.querySelector(".v-h-a");
  const bannerOn = Boolean(
    banner &&
    getComputedStyle(banner).display !== "none" &&
    banner.offsetHeight > 0
  );
  return headerH + (bannerOn ? 48 : 0);
}

function syncChromeOffset() {
  const offset = headerPinOffset();
  document.documentElement.style.setProperty("--preh-offset", `${offset}px`);
  return offset;
}

export default function preHeaderScene() {
  const preh = document.querySelector(".v-n-preh");
  const scene = preh?.querySelector(".v-n-preh__scene");
  const phase1 = scene?.querySelector(".v-n-preh__phase--1");
  const phase2 = scene?.querySelector(".v-n-preh__phase--2");
  const phase3 = scene?.querySelector(".v-n-preh__phase--3");
  if (!preh || !scene || !phase1) return;

  const mainFace = phase1.querySelector(".v-n-preh__face--main");
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

  syncChromeOffset();

  const intro = gsap.timeline({
    defaults: { duration: 0.7, ease: "power2.out" },
  });

  intro
    .fromTo(mainFace, { autoAlpha: 0 }, { autoAlpha: 1 })
    .fromTo(subsPhase1, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.12 }, "<");

  const typedPhase1 = typewriter(txtPhase1, { timeline: intro, position: "-=0.5" });

  intro.fromTo(
    txtDashPhase1,
    { autoAlpha: 0 },
    { autoAlpha: 1 },
    `<${typedPhase1?.at(5) ?? 0}`
  );

  const syncDest = () => {
    if (mainFace && homeFace) Object.assign(dest2, destTo(mainFace, homeFace));
    if (mainFace && slotFace) Object.assign(dest3, destTo(mainFace, slotFace));
  };

  const addLead = (scroll, position) => {
    if (!txtLead) return;
    scroll.fromTo(
      txtLead,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.55, ease: "power1.out", immediateRender: false },
      position
    );
    return typewriter(txtLead, {
      timeline: scroll,
      position: `${position}+=0.55`,
      fill: true,
      fillFrom: 0.3,
      showTarget: false,
      stagger: { amount: 2.6 },
      duration: 0.02,
    });
  };

  const addConvo = (scroll, start) => {
    if (anonSub) {
      scroll.to(anonSub, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, `${start}+=0.15`);
    }
    if (convoLine) {
      scroll.to(
        convoLine,
        { scaleX: 1, duration: 0.5, ease: "power2.out" },
        `${start}+=0.35`
      );
    }
    if (hermanos) {
      scroll.to(
        hermanos,
        { autoAlpha: 1, duration: 0.35, ease: "power2.out" },
        `${start}+=0.45`
      );
    }
    const pachasBits = [pachasFace, pachasSub].filter(Boolean);
    if (pachasBits.length) {
      scroll.to(
        pachasBits,
        { autoAlpha: 1, duration: 0.45, ease: "power2.out" },
        `${start}+=0.85`
      );
    }
  };

  const addQuote = (scroll, position) => {
    if (!txtQuote) return;
    scroll.set(txtQuote, { autoAlpha: 1 }, position);
    const typedQuote = typewriter(txtQuote, {
      timeline: scroll,
      position,
      showTarget: false,
      stagger: { amount: 0.95 },
    });
    if (quoteSlash) {
      scroll.fromTo(
        quoteSlash,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2, ease: "power2.out", immediateRender: false },
        `${position}+=${typedQuote?.at(5) ?? 0}`
      );
    }
    return typedQuote;
  };

  const addEnd = (scroll, position) => {
    if (!txtEnd) return;
    scroll.set(txtEnd, { autoAlpha: 1 }, position);
    return typewriter(txtEnd, {
      timeline: scroll,
      position,
      showTarget: false,
      stagger: { amount: 1.15 },
    });
  };

  intro.then(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 698px)",
        isDesktop: "(min-width: 699px)",
      },
      (context) => {
        const { isMobile } = context.conditions;
        const reversions = [];
        const remember = (typed) => {
          if (typed?.revert) reversions.push(() => typed.revert());
        };

        syncDest();

        const scroll = gsap.timeline({
          paused: true,
          defaults: { ease: "none" },
        });

        scroll.fromTo(
          [txtPhase1, subCPhase1, txtDashPhase1],
          { opacity: 1 },
          {
            opacity: 0,
            duration: 0.65,
            ease: "power2.out",
            immediateRender: false,
          }
        );

        if (txtPhase2) {
          scroll.set(txtPhase2, { autoAlpha: 1 }, 0.65);
        }

        remember(
          typewriter(txtPhase2, {
            timeline: scroll,
            position: 0.65,
            stagger: { amount: 1.25 },
            showTarget: false,
          })
        );

        if (otherFaces.length) {
          scroll.to(
            otherFaces,
            {
              autoAlpha: 1,
              duration: 0.5,
              stagger: { amount: 1, from: "random" },
              ease: "power1.out",
            },
            0.7
          );
        }

        if (mainFace && homeFace) {
          scroll.to(
            mainFace,
            {
              x: () => dest2.x,
              y: () => dest2.y,
              scale: () => dest2.scale,
              transformOrigin: "0% 0%",
              duration: 0.9,
              ease: "power2.inOut",
            },
            0.55
          );
        }

        const fadeOutP2 = [txtPhase2, ...otherFaces].filter(Boolean);
        scroll.to({}, { duration: 1.5 });
        scroll.addLabel("phase3");

        if (fadeOutP2.length) {
          scroll.to(
            fadeOutP2,
            { autoAlpha: 0, duration: 0.55, ease: "power2.out" },
            "phase3"
          );
        }

        if (isMobile) {
          if (mainFace) {
            scroll.to(mainFace, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, "phase3");
          }

          scroll.addLabel("lead", "phase3+=0.4");
          remember(addLead(scroll, "lead"));

          scroll.addLabel("phase3b", "+=0.25");
          if (txtLead) {
            scroll.to(txtLead, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, "phase3b");
          }

          if (mainFace && slotFace) {
            scroll.set(
              mainFace,
              {
                x: () => dest3.x,
                y: () => dest3.y,
                scale: () => dest3.scale,
                transformOrigin: "0% 0%",
              },
              "phase3b"
            );
            scroll.to(mainFace, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, "phase3b+=0.15");
          }

          addConvo(scroll, "phase3b+=0.35");
          scroll.addLabel("quote", "phase3b+=1.75");
          remember(addQuote(scroll, "quote"));
          scroll.addLabel("endCopy", "+=0.12");
          remember(addEnd(scroll, "endCopy"));
        } else {
          const slotMove = 0.75;
          if (mainFace && slotFace) {
            scroll.to(
              mainFace,
              {
                x: () => dest3.x,
                y: () => dest3.y,
                scale: () => dest3.scale,
                transformOrigin: "0% 0%",
                duration: slotMove,
                ease: "power2.inOut",
              },
              "phase3"
            );
          }

          addConvo(scroll, `phase3+=${slotMove * 0.72}`);
          scroll.addLabel("lead", "phase3+=2.15");
          remember(addLead(scroll, "lead"));
          scroll.addLabel("quote", "+=0.15");
          remember(addQuote(scroll, "quote"));
          scroll.addLabel("endCopy", "+=0.12");
          remember(addEnd(scroll, "endCopy"));
        }

        scroll.to({}, { duration: 1.4 });

        const refreshScene = () => {
          syncChromeOffset();
          syncDest();
        };

        ScrollTrigger.create({
          animation: scroll,
          trigger: preh,
          start: () => `top ${headerPinOffset()}px`,
          end: () => {
            const vh = window.innerHeight;
            const scaled = scroll.duration() * vh * 1.1;
            return `+=${Math.round(gsap.utils.clamp(vh * 5.5, vh * 11, scaled))}`;
          },
          pin: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: refreshScene,
        });

        return () => {
          reversions.forEach((fn) => fn());
        };
      }
    );
  });
}
