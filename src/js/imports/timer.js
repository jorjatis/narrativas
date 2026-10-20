const DIGIT_HEIGHT = 24;
const INITIAL_TIME = "00:00";

export default function initClockBox() {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) return;

  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": initDesktopTimers,
    "(max-width: 1024px)": initMobileTimer
  });
}

function initDesktopTimers() {
  const { gsap } = window;
  const timers = document.querySelectorAll(".timer.is-desktop");

  timers.forEach((timer) => {
    if (timer.dataset.timerInit) return;
    timer.dataset.timerInit = "true";

    const startTime = timer.getAttribute("data-time-start");
    const endTime = timer.getAttribute("data-time-spin");
    const frontFace = timer.querySelector(".timer-front");

    if (!startTime || !endTime || !frontFace) return;

    const columns = renderTimerFace(frontFace, startTime, endTime);
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: timer,
        start: "top 70%",
        toggleActions: "play none none none",
        once: true
      }
    });

    columns.reverse().forEach((column, index) => {
      timeline.to(column.element, {
        y: -column.steps * DIGIT_HEIGHT,
        duration: 1.2,
        ease: "power2.inOut"
      }, index * 0.15);
    });
  });
}

function initMobileTimer() {
  const { ScrollTrigger } = window;
  const mobileTimer = document.querySelector(".timer.is-mobile");
  const desktopTimers = Array.from(document.querySelectorAll(".timer.is-desktop"))
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

  if (!mobileTimer || !desktopTimers.length || mobileTimer.dataset.timerInit) return;

  mobileTimer.dataset.timerInit = "true";
  mobileTimer.dataset.current = INITIAL_TIME;

  let currentTime = INITIAL_TIME;

  desktopTimers.forEach((timer, index) => {
    const targetTime = timer.getAttribute("data-time-spin");
    if (!targetTime) return;

    ScrollTrigger.create({
      trigger: timer,
      start: "top center",
      onEnter: () => updateMobileTimer(targetTime),
      onEnterBack: () => updateMobileTimer(targetTime),
      onLeaveBack: () => {
        const previousTimer = desktopTimers[index - 1];
        updateMobileTimer(previousTimer?.getAttribute("data-time-spin") || INITIAL_TIME);
      }
    });
  });

  function updateMobileTimer(newTime) {
    if (!newTime || newTime === currentTime) return;

    animateToTime(mobileTimer, currentTime, newTime);
    currentTime = newTime;
    mobileTimer.dataset.current = newTime;
  }
}

function animateToTime(timer, oldTime, newTime) {
  const { gsap } = window;
  const frontFace = timer.querySelector(".timer-front");

  if (!gsap || !frontFace) return;

  const columns = renderTimerFace(frontFace, oldTime, newTime);

  columns.forEach((column) => {
    gsap.to(column.element, {
      y: -column.steps * DIGIT_HEIGHT,
      duration: 0.8,
      ease: "power2.inOut"
    });
  });
}

function renderTimerFace(frontFace, startTime, endTime) {
  const columns = [];
  frontFace.innerHTML = "";

  for (let i = 0; i < endTime.length; i += 1) {
    const endChar = endTime[i];

    if (endChar === ":") {
      frontFace.appendChild(createColon());
      continue;
    }

    const sequence = getSpinSequence(
      Number.parseInt(startTime[i], 10),
      Number.parseInt(endChar, 10),
      getDigitMax(i)
    );
    const wrap = document.createElement("div");
    const strip = document.createElement("div");

    wrap.className = "digit-wrap";
    strip.className = "digit-strip";

    sequence.forEach((digit) => {
      const digitEl = document.createElement("div");
      digitEl.className = "digit";
      digitEl.textContent = digit;
      strip.appendChild(digitEl);
    });

    wrap.appendChild(strip);
    frontFace.appendChild(wrap);
    columns.push({ element: strip, steps: sequence.length - 1 });
  }

  return columns;
}

function createColon() {
  const colon = document.createElement("div");
  colon.className = "colon";
  colon.textContent = ":";
  return colon;
}

function getDigitMax(index) {
  if (index === 0) return 2;
  if (index === 3) return 5;
  return 9;
}

function getSpinSequence(start, end, max) {
  const safeStart = Number.isNaN(start) ? 0 : start;
  const safeEnd = Number.isNaN(end) ? 0 : end;
  const result = [safeStart];
  let current = safeStart;

  while (current !== safeEnd) {
    current = current + 1 > max ? 0 : current + 1;
    result.push(current);

    if (result.length > max + 2) break;
  }

  return result;
}
