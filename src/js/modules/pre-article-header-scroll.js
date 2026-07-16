import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hasArticlePaywall, onArticlePaywallChange } from "../helpers/hasArticlePaywall";
import { prefersReducedMotion } from "../helpers/prefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  scroll: {
    speed: 0.33,
    scrub: 0.5
  },
  text: {
    enterScale: 0.15,
    exitScale: 50,
    exitXPercent: 0,
    transformOrigin: "50% 50%"
  },
  timing: {
    text1Hold: 1.4,
    textEnter: 1.8,
    textHold: 1,
    textExit: 3
  },
  images: {
    fromScale: 0,
    duration: 2.4,
    stagger: 0.5,
    mobileDuration: 0.7,
    mobileOffsetY: 20,
    infoStartFactor: 0.35
  },
  infoDuration: 0.6,
  endHold: 2.5,
  paywallEndHold: 0
};

const MOBILE_MAX_WIDTH = 699;
const { transformOrigin } = CONFIG.text;

function isMobileLayout() {
  return window.innerWidth <= MOBILE_MAX_WIDTH;
}

function measureCenterOffsets(figures, container) {
  const containerRect = container.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerCenterY = containerRect.top + containerRect.height / 2;
  const figureRects = figures.map((figure) => figure.getBoundingClientRect());

  return figureRects.map((rect) => ({
    x: containerCenterX - (rect.left + rect.width / 2),
    y: containerCenterY - (rect.top + rect.height / 2)
  }));
}

function waitForImages(figures) {
  const imgs = figures.flatMap((figure) => [...figure.querySelectorAll("img")]);

  return Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        })
    )
  );
}

function collectTextPanels(root) {
  const panels = [...root.querySelectorAll(".intro-text")];
  const text1El = panels.find((el) => el.classList.contains("intro-text--1"));
  const secondary = panels
    .filter((el) => el !== text1El)
    .map((el) => ({ el, zoom: el.querySelector(".intro-text__zoom") }))
    .filter((panel) => panel.zoom);

  return {
    text1El,
    text1Zoom: text1El?.querySelector(".intro-text__zoom"),
    secondary
  };
}

function setEpisodeButtonsFocusable(buttons, focusable) {
  buttons.forEach((button) => {
    if (focusable) {
      button.removeAttribute("tabindex");
    } else {
      button.setAttribute("tabindex", "-1");
    }
  });
}

function addTextExit(timeline, zoomEl, exitStart) {
  const { exitScale, exitXPercent } = CONFIG.text;
  const { textExit } = CONFIG.timing;

  timeline.to(
    zoomEl,
    {
      scale: exitScale,
      xPercent: exitXPercent,
      autoAlpha: 0,
      duration: textExit,
      ease: "power1.in",
      transformOrigin
    },
    exitStart
  );
}

function addTextEnter(timeline, zoomEl, start) {
  const { enterScale } = CONFIG.text;
  const { textEnter } = CONFIG.timing;

  timeline.fromTo(
    zoomEl,
    {
      scale: enterScale,
      autoAlpha: 0,
      immediateRender: false,
      transformOrigin
    },
    {
      scale: 1,
      autoAlpha: 1,
      duration: textEnter,
      ease: "power2.out",
      transformOrigin
    },
    start
  );
}

function hidePaywalledContent(root, imgContainer) {
  root.classList.add("v-a-preh--paywall");
  imgContainer?.setAttribute("hidden", "");
}

function isPaywallText3(el, skipImages) {
  return skipImages && el.classList.contains("intro-text--3");
}

function buildTimeline(elements, getOffsets, { skipImages = false } = {}) {
  const { root, stage, text1El, text1Zoom, secondary, imgContainer, figures, episodeButtons } = elements;
  const { text1Hold, textEnter, textHold, textExit } = CONFIG.timing;
  const { fromScale, duration: imgDuration, stagger } = CONFIG.images;

  const secondaryZooms = secondary.map((panel) => panel.zoom);
  let imagesStartTime = 0;

  gsap.set(secondary.map((panel) => panel.el), { autoAlpha: 0, zIndex: 1 });
  gsap.set(imgContainer, { zIndex: 1, pointerEvents: "none" });

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => "+=" + Math.round(window.innerHeight * timeline.duration() * CONFIG.scroll.speed),
      pin: stage,
      scrub: CONFIG.scroll.scrub,
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const shouldImages = !skipImages && self.progress * timeline.duration() >= imagesStartTime;
        root.classList.toggle("intro-images-active", shouldImages);
        setEpisodeButtonsFocusable(episodeButtons, shouldImages);
      },
      onLeave() {
        root.classList.add("intro-scroll-complete");
        gsap.set(figures, { clearProps: "transform,willChange", autoAlpha: 1 });
        gsap.set([text1Zoom, ...secondaryZooms], { clearProps: "transform,filter" });
      },
      onEnterBack() {
        root.classList.remove("intro-scroll-complete");
      }
    }
  });

  let t = 0;

  timeline
    .set(text1El, { zIndex: 3 }, 0)
    .set(text1Zoom, { scale: 1, autoAlpha: 1, transformOrigin }, 0);

  t += text1Hold;
  addTextExit(timeline, text1Zoom, t);
  const text1Gone = t + textExit;
  timeline.set(text1El, { zIndex: 1 }, text1Gone);
  t = text1Gone;

  secondary.forEach(({ el, zoom }) => {
    const paywallText3 = isPaywallText3(el, skipImages);

    timeline.set(el, { autoAlpha: 1, zIndex: 3 }, t);
    addTextEnter(timeline, zoom, t);

    if (paywallText3) {
      t += textEnter;
      return;
    }

    const exitStart = t + textEnter + textHold;
    addTextExit(timeline, zoom, exitStart);
    const gone = exitStart + textExit;
    timeline.set(el, { autoAlpha: 0, zIndex: 1 }, gone);
    t = gone;
  });

  imagesStartTime = t;

  if (skipImages) {
    if (CONFIG.paywallEndHold > 0) {
      timeline.to({}, { duration: CONFIG.paywallEndHold }, t);
    }

    return timeline;
  }

  timeline.set(imgContainer, { zIndex: 4, pointerEvents: "auto" }, imagesStartTime);

  if (isMobileLayout()) {
    const { mobileDuration, mobileOffsetY, stagger: mobileStagger } = CONFIG.images;

    timeline
      .set(
        figures,
        {
          autoAlpha: 0,
          y: mobileOffsetY,
          clearProps: "x,scale"
        },
        0
      )
      .to(
        figures,
        {
          autoAlpha: 1,
          y: 0,
          duration: mobileDuration,
          stagger: mobileStagger,
          ease: "power2.out"
        },
        imagesStartTime
      );
  } else {
    timeline
      .set(
        figures,
        {
          x: (index) => getOffsets()[index]?.x ?? 0,
          y: (index) => getOffsets()[index]?.y ?? 0,
          scale: fromScale,
          autoAlpha: 0,
          transformOrigin: "center center",
          force3D: true
        },
        0
      )
      .to(
        figures,
        {
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: imgDuration,
          stagger,
          ease: "power1.out",
          force3D: true
        },
        imagesStartTime
      );
  }

  const activeImgDuration = isMobileLayout() ? CONFIG.images.mobileDuration : imgDuration;
  const infos = [...root.querySelectorAll(".intro-img-info")];

  infos.forEach((info) => {
    const figure = info.closest(".intro-img");
    const index = figure ? figures.indexOf(figure) : -1;
    const at = index >= 0
      ? imagesStartTime + index * stagger
      : imagesStartTime + activeImgDuration * CONFIG.images.infoStartFactor;

    timeline.fromTo(
      info,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: CONFIG.infoDuration, ease: "power1.out" },
      at
    );
  });

  const imagesEnd = imagesStartTime + activeImgDuration + stagger * Math.max(0, figures.length - 1);
  t = imagesEnd;

  timeline.to({}, { duration: CONFIG.endHold }, t);

  return timeline;
}

export default function preArticleHeaderScroll() {
  const root = document.querySelector(".v-a-preh");
  if (!root) return null;

  const stage = root.querySelector(".intro-stage");
  const imgContainer = root.querySelector(".intro-img-c");
  const figures = [...root.querySelectorAll(".intro-img")];
  const episodeButtons = [...root.querySelectorAll(".open-modal")];
  const infos = [...root.querySelectorAll(".intro-img-info")];
  const { text1El, text1Zoom, secondary } = collectTextPanels(root);
  let skipImages = hasArticlePaywall();

  if (!stage || !text1El || !text1Zoom || !imgContainer || !figures.length) {
    return null;
  }

  if (skipImages) {
    hidePaywalledContent(root, imgContainer);
  }

  if (prefersReducedMotion()) {
    root.classList.add("intro-scroll-complete");

    if (!skipImages) {
      root.classList.add("intro-images-active");
      gsap.set(figures, { autoAlpha: 1, clearProps: "transform" });
      gsap.set(infos, { autoAlpha: 1 });
      setEpisodeButtonsFocusable(episodeButtons, true);
    } else {
      const text3 = root.querySelector(".intro-text--3");
      const text3Zoom = text3?.querySelector(".intro-text__zoom");

      if (text3 && text3Zoom) {
        gsap.set(text3, { autoAlpha: 1, zIndex: 3 });
        gsap.set(text3Zoom, { scale: 1, autoAlpha: 1, transformOrigin });
      }
    }

    return null;
  }

  setEpisodeButtonsFocusable(episodeButtons, false);

  if (isMobileLayout()) {
    gsap.set(figures, { autoAlpha: 0, y: CONFIG.images.mobileOffsetY });
  } else {
    gsap.set(figures, { autoAlpha: 0, scale: 0 });
  }
  gsap.set(infos, { autoAlpha: 0 });

  const elements = { root, stage, text1El, text1Zoom, secondary, imgContainer, figures, episodeButtons };
  let timeline = null;
  let resizeTimer = null;

  const createTimeline = () => {
    if (!skipImages) {
      gsap.set(figures, { clearProps: "transform" });
    }

    const getOffsets = isMobileLayout()
      ? () => []
      : () => measureCenterOffsets(figures, imgContainer);

    timeline?.scrollTrigger?.kill();
    timeline?.kill();
    timeline = buildTimeline(elements, getOffsets, { skipImages });
    ScrollTrigger.refresh();
  };

  const startTimeline = () => {
    requestAnimationFrame(createTimeline);
  };

  if (skipImages) {
    startTimeline();
  } else {
    waitForImages(figures).then(startTimeline);
  }

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createTimeline, 250);
  };

  window.addEventListener("resize", onResize, { passive: true });

  const stopPaywallWatch = onArticlePaywallChange(() => {
    if (skipImages) return;

    skipImages = true;
    hidePaywalledContent(root, imgContainer);
    createTimeline();
  });

  return {
    kill() {
      stopPaywallWatch();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
    }
  };
}
