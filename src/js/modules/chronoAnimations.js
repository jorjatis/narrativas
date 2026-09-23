import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Al cruzar el breakpoint, matchMedia mata el último ScrollTrigger y
// pone a 0 la posición que el refresh iba a restaurar. La página se queda arriba.
let scrollLock = 0;
let scrollAnchor = 0;

ScrollTrigger.addEventListener("refreshInit", () => {
  if (scrollLock === 0) {
    scrollAnchor = window.scrollY || document.documentElement.scrollTop || 0;
  }
  scrollLock += 1;
});

ScrollTrigger.addEventListener("refresh", () => {
  scrollLock = Math.max(0, scrollLock - 1);
  if (scrollLock > 0 || scrollAnchor < 2) return;

  const restore = () => {
    const current = window.scrollY || document.documentElement.scrollTop || 0;
    if (current + 2 >= scrollAnchor) return;
    window.scrollTo(0, scrollAnchor);
    ScrollTrigger.update();
  };

  restore();
  requestAnimationFrame(restore);
});

const DRAW_LEAD = 40;
const HORIZ_SCROLL_MIN = 100;
const HORIZ_SCROLL_MAX = 230;
const HORIZ_SCROLL_RATIO = 0.5;
const CATCHUP_RATIO = 0.65;
const LAG_SOFT = 260;
const DRAW_SMOOTH = 95;
const DESKTOP_MQ = "(min-width: 1140px)";
const drawCache = new WeakMap();

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wrapYearLabels(root) {
  root.querySelectorAll(".player-year").forEach((year) => {
    if (year.querySelector(".player-year__label")) return;

    const label = document.createElement("span");
    label.className = "player-year__label";
    const text = document.createElement("span");
    text.className = "player-year__text";

    [...year.childNodes].forEach((node) => {
      if (node.nodeType === 1 && node.classList.contains("player-year-cup")) return;
      text.appendChild(node);
    });

    label.appendChild(text);
    year.appendChild(label);
  });
}

function buildSegments(points) {
  const segments = [];
  const lengthAt = [0];
  let total = 0;
  let lag = 0;

  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const dy = b.y - a.y;
    const len = Math.hypot(b.x - a.x, dy);

    total += len;
    lengthAt[i] = total;
    if (len < 0.01) continue;

    const from = total - len;

    if (Math.abs(dy) < 1) {
      const base = gsap.utils.clamp(
        HORIZ_SCROLL_MIN,
        HORIZ_SCROLL_MAX,
        len * HORIZ_SCROLL_RATIO
      );
      const cost = base * (1 - 0.35 * Math.min(1, lag / LAG_SOFT));
      segments.push({ start: a.y + lag, cost, len, from });
      lag += cost;
      continue;
    }

    const catchLen = Math.min(len, lag / CATCHUP_RATIO);

    if (catchLen > 0.01) {
      segments.push({
        start: a.y + lag,
        cost: catchLen * (1 - CATCHUP_RATIO),
        len: catchLen,
        from,
      });
      lag -= catchLen * CATCHUP_RATIO;
    }

    const restLen = len - catchLen;
    if (restLen > 0.01) {
      segments.push({
        start: a.y + catchLen + lag,
        cost: restLen,
        len: restLen,
        from: from + catchLen,
      });
    }
  }

  return { segments, lengthAt, total };
}

function targetLength(cache, drawY) {
  const { segments } = cache;
  let length = 0;

  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    if (drawY <= seg.start) return seg.from;

    const progress = seg.cost > 0 ? (drawY - seg.start) / seg.cost : 1;
    if (progress < 1) return seg.from + seg.len * progress;

    length = seg.from + seg.len;
  }

  return length;
}

function revealClip(svg) {
  const rect = svg.querySelector(".chrono-pipeline__draw-clip");
  if (!rect) return;
  const h = svg.viewBox.baseVal.height || svg.getBoundingClientRect().height;
  rect.setAttribute("height", String(h + 160));
}

function paintDraw(cache) {
  const { path, maskPath, total, lengthAt } = cache;
  const visible = gsap.utils.clamp(0, total, cache.state.len);
  const hidden = total - visible;

  path.style.strokeDasharray = String(total);
  path.style.strokeDashoffset = String(hidden);

  if (maskPath) {
    maskPath.setAttribute("stroke-dasharray", String(total));
    maskPath.setAttribute("stroke-dashoffset", String(hidden));
  }

  const delay = Math.max(18, cache.strokeWidth * 0.6);

  cache.shadows.forEach((group) => {
    const index = Number(group.dataset.i);
    if (!Number.isFinite(index)) return;

    const ready = visible >= (lengthAt[index] || 0) + delay;
    if (ready === (group.dataset.on === "1")) return;

    group.dataset.on = ready ? "1" : "0";
    gsap.killTweensOf(group);
    gsap.to(group, {
      attr: { opacity: ready ? 0.3 : 0 },
      duration: ready ? 0.34 : 0.18,
      ease: ready ? "power1.out" : "power1.in",
    });
  });
}

function followDraw(cache) {
  cache.tick = (time, delta) => {
    const diff = cache.target - cache.state.len;

    if (Math.abs(diff) < 0.25) {
      if (cache.state.len === cache.target) return;
      cache.state.len = cache.target;
      paintDraw(cache);
      return;
    }

    cache.state.len += diff * (1 - Math.exp(-delta / DRAW_SMOOTH));
    paintDraw(cache);
  };

  gsap.ticker.add(cache.tick);
}

function updateDraw(timeline) {
  const cache = drawCache.get(timeline);
  if (!cache) return;

  const { svg, path } = cache;
  const box = svg.getBoundingClientRect();
  if (box.height < 2) return;

  if (prefersReducedMotion()) {
    path.style.strokeDasharray = "none";
    path.style.strokeDashoffset = "0";
    revealClip(svg);
    cache.shadows.forEach((group) => group.setAttribute("opacity", "0.3"));
    return;
  }

  const viewH = svg.viewBox.baseVal.height || box.height;
  const scaleY = viewH / box.height;
  const drawY = (window.innerHeight - DRAW_LEAD - box.top) * scaleY;

  revealClip(svg);
  cache.target = targetLength(cache, drawY);

  if (cache.settled) return;

  cache.settled = true;
  cache.state.len = cache.target;
  paintDraw(cache);
  followDraw(cache);
}

function setupPipeDraw(timeline) {
  const id = "chrono-draw";
  const prev = ScrollTrigger.getById(id);
  if (prev && prev.trigger === timeline) {
    updateDraw(timeline);
    prev.refresh();
    return;
  }

  prev?.kill();
  if (timeline._chronoDrawScroll) {
    window.removeEventListener("scroll", timeline._chronoDrawScroll);
  }

  updateDraw(timeline);

  const onScroll = () => updateDraw(timeline);
  timeline._chronoDrawScroll = onScroll;
  window.addEventListener("scroll", onScroll, { passive: true });

  ScrollTrigger.create({
    id,
    trigger: timeline,
    start: "top bottom",
    end: "bottom top",
    onUpdate: onScroll,
    onRefresh: onScroll,
    onEnter: onScroll,
    onEnterBack: onScroll,
  });
}

function revealChronoBoxes(timeline, isDesktop, reduceMotion) {
  const boxes = [...timeline.querySelectorAll(".chrono-box")];
  if (!boxes.length) return;

  if (reduceMotion) {
    gsap.set(boxes, { autoAlpha: 1, x: 0, y: 0 });
    return;
  }

  boxes.forEach((box) => {
    const fromRight = isDesktop && box.closest(".v-n-chrono-timeline__item--06");

    gsap.fromTo(
      box,
      {
        autoAlpha: 0,
        x: fromRight ? 48 : 0,
        y: fromRight ? 0 : 28,
      },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto",
        scrollTrigger: {
          trigger: box,
          start: "top 86%",
          once: true,
        },
      }
    );
  });
}

function burstConfetti(cup) {
  const host = cup.closest(".player-year") || cup.parentElement;
  if (!host) return;

  const hostBox = host.getBoundingClientRect();
  const cupBox = cup.getBoundingClientRect();
  const originX = cupBox.left - hostBox.left + cupBox.width / 2;
  const originY = cupBox.top - hostBox.top + 2;
  const count = gsap.utils.random(2, 3, 1);

  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement("span");
    bit.className = "player-year-cup__confetti";
    bit.setAttribute("aria-hidden", "true");
    host.appendChild(bit);

    const dir = count === 2 ? (i === 0 ? -1 : 1) : i - 1;
    const size = gsap.utils.random(2, 3.4);

    gsap.set(bit, {
      left: originX,
      top: originY,
      xPercent: -50,
      width: size,
      height: size * gsap.utils.random(1, 1.6),
      rotation: gsap.utils.random(-22, 22),
    });

    gsap
      .timeline({ onComplete: () => bit.remove() })
      .to(bit, {
        x: dir * gsap.utils.random(10, 20),
        y: gsap.utils.random(-22, -34),
        rotation: `+=${dir * gsap.utils.random(70, 140)}`,
        duration: 0.32,
        ease: "power2.out",
      })
      .to(
        bit,
        {
          y: "+=28",
          x: `+=${dir * 4}`,
          opacity: 0,
          rotation: `+=${dir * 40}`,
          duration: 0.38,
          ease: "power1.in",
        },
        "-=0.06"
      );
  }
}

function playCup(cup) {
  const svg = cup.querySelector("svg") || cup;
  const tl = gsap.timeline();

  cup.style.overflow = "hidden";

  tl.fromTo(
    svg,
    { yPercent: 110 },
    { yPercent: 0, duration: 0.3, ease: "power2.out" }
  )
    .add(() => {
      cup.style.overflow = "visible";
      burstConfetti(cup);
    }, 0.14)
    .to(
      svg,
      {
        keyframes: [
          { y: -11, rotation: -8, duration: 0.13, ease: "power2.out" },
          { y: 3, rotation: 5, duration: 0.1, ease: "power1.inOut" },
          { y: -2, rotation: -2, duration: 0.08, ease: "power1.inOut" },
          { y: 0, rotation: 0, duration: 0.18, ease: "power2.out" },
        ],
      },
      0.14
    );

  return tl;
}

function revealPlayerBox(box, isDesktop, reduceMotion) {
  const years = [...box.querySelectorAll(".player-year__text")];
  const cups = [...box.querySelectorAll(".player-year-cup")];
  const player = box.querySelector(".player");
  const yearsWrap = box.querySelector(".player-years");

  if (reduceMotion) {
    gsap.set(years, { xPercent: 0 });
    gsap.set(cups.map((cup) => cup.querySelector("svg") || cup), { yPercent: 0, y: 0, rotation: 0 });
    cups.forEach((cup) => {
      cup.style.overflow = "visible";
    });
    if (yearsWrap) gsap.set(yearsWrap, { autoAlpha: 1 });
    if (player) gsap.set(player, { autoAlpha: 1, x: 0 });
    return;
  }

  if (yearsWrap) gsap.set(yearsWrap, { autoAlpha: 0 });
  gsap.set(years, { xPercent: -105 });
  if (player) gsap.set(player, { autoAlpha: 0, x: -28 });
  cups.forEach((cup) => {
    const svg = cup.querySelector("svg") || cup;
    cup.style.overflow = "hidden";
    gsap.set(svg, { yPercent: 110 });
  });

  const stagger = isDesktop ? 0.14 : 0.07;
  const yearDuration = 0.55;

  ScrollTrigger.create({
    trigger: box,
    start: "top 82%",
    once: true,
    onEnter: () => {
      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

      if (yearsWrap) {
        tl.to(yearsWrap, { autoAlpha: 1, duration: 0.2, ease: "power1.out" });
      }

      if (years.length) {
        tl.to(years, {
          xPercent: 0,
          duration: yearDuration,
          ease: "power3.out",
          stagger,
        });
      }

      cups.forEach((cup) => {
        tl.add(playCup(cup), years.length ? ">-0.12" : 0);
      });

      if (player) {
        tl.to(
          player,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          years.length || cups.length ? ">-0.15" : 0
        );
      }
    },
  });
}

function setupTimeline(timeline) {
  wrapYearLabels(timeline);

  timeline.addEventListener("chrono-pipeline:drawn", (event) => {
    const prev = drawCache.get(timeline);
    if (prev?.tick) gsap.ticker.remove(prev.tick);

    const svg = timeline.querySelector("svg.chrono-pipeline");
    const path = svg?.querySelector(".chrono-pipeline__path");
    if (!svg || !path) return;

    const points = event.detail?.points || [];
    const { segments, lengthAt } = buildSegments(points);
    const cache = {
      svg,
      path,
      maskPath: svg.querySelector(".chrono-pipeline__mask-path"),
      shadows: [...svg.querySelectorAll(".chrono-pipeline__shadow")],
      strokeWidth: event.detail?.strokeWidth || 24,
      total: path.getTotalLength(),
      segments,
      lengthAt,
      state: { len: 0 },
      target: 0,
      tick: null,
      settled: false,
    };

    drawCache.set(timeline, cache);

    if (prefersReducedMotion()) {
      updateDraw(timeline);
      return;
    }

    setupPipeDraw(timeline);
  });

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: DESKTOP_MQ,
      isMobile: "(max-width: 1139px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { isDesktop, reduceMotion } = context.conditions;

      revealChronoBoxes(timeline, isDesktop, reduceMotion);
      timeline.querySelectorAll(".player-box").forEach((box) => {
        revealPlayerBox(box, isDesktop, reduceMotion);
      });

      if (!reduceMotion) setupPipeDraw(timeline);

      return () => {
        ScrollTrigger.getById("chrono-draw")?.kill();
        if (timeline._chronoDrawScroll) {
          window.removeEventListener("scroll", timeline._chronoDrawScroll);
          timeline._chronoDrawScroll = null;
        }
        const cache = drawCache.get(timeline);
        if (cache?.tick) {
          gsap.ticker.remove(cache.tick);
          cache.tick = null;
        }
      };
    }
  );
}

export default function chronoAnimations() {
  const timelines = document.querySelectorAll(".v-n-chrono-timeline");
  if (!timelines.length) return;

  timelines.forEach(setupTimeline);
}
