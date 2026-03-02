export default function initClockHeading() {
  const { gsap, ScrollTrigger } = window;

  const clocks = document.querySelectorAll(".clock-heading");
  if (!clocks.length) return;

  clocks.forEach((clock) => {

    const clockFace = clock.querySelector(".clock-heading__time-clock");
    const timeTxt = clock.querySelector(".clock-heading__time-txt");

    if (!clockFace || !timeTxt) return;

    const time = timeTxt.textContent.trim();
    const [hoursRaw, minutesRaw] = time.split(":");

    let hours = parseInt(hoursRaw, 10);
    const minutes = parseInt(minutesRaw, 10);

    hours = hours % 12;

    const minuteDeg = minutes * 6;
    const hourDeg = (hours * 30) + (minutes * 0.5);

    ScrollTrigger.create({
      trigger: clock,
      start: "top 50%",
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        tl.to(clockFace, {
          "--minute-rotate": minuteDeg + "deg",
          duration: 0.45,
          ease: "linear",
          autoRound: false
        }).to(clockFace, {
          "--hour-rotate": hourDeg + "deg",
          duration: 0.45,
          ease: "linear",
          autoRound: false
        }, 0);
      }
    });
  });
}