export default function initClockBox() {

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger) return;

  const isMobile = window.innerWidth < 1025;

  const allTimers = document.querySelectorAll('.timer');
  if (!allTimers.length) return;

  /*
  ==========================================================
  DESKTOP TIMERS (lo que ya tenías)
  ==========================================================
  */

  if (isMobile) {

    const mobileTimer = document.querySelector('.timer.is-mobile');
    const desktopTimers = Array.from(document.querySelectorAll('.timer.is-desktop'));

    if (!mobileTimer || !desktopTimers.length) return;

    let currentTime = "00:00";
    mobileTimer.dataset.current = currentTime;

    // Ordenamos por posición vertical (importante)
    desktopTimers.sort((a, b) =>
      a.getBoundingClientRect().top - b.getBoundingClientRect().top
    );

    const firstTimer = desktopTimers[0];

    // 👇 RESET cuando estamos por encima del primero
    ScrollTrigger.create({
      trigger: firstTimer,
      start: "top center",
      onLeaveBack: () => {
        updateMobileTimer("00:00");
      }
    });

    // 👇 Cambios normales al entrar en cada bloque
    desktopTimers.forEach(timer => {

      const targetTime = timer.getAttribute('data-time-spin');
      if (!targetTime) return;

      ScrollTrigger.create({
        trigger: timer,
        start: "top center",
        onEnter: () => updateMobileTimer(targetTime),
        onEnterBack: () => updateMobileTimer(targetTime)
      });

    });

    function updateMobileTimer(newTime) {

      if (newTime === currentTime) return;

      animateToTime(mobileTimer, currentTime, newTime);
      currentTime = newTime;
      mobileTimer.dataset.current = newTime;
    }

  }

  /*
  ==========================================================
  MOBILE STICKY TIMER
  ==========================================================
  */

  if (isMobile) {

    const mobileTimer = document.querySelector('.timer.is-mobile');
    const desktopTimers = document.querySelectorAll('.timer.is-desktop');

    if (!mobileTimer || !desktopTimers.length) return;

    let currentTime = "00:00";
    mobileTimer.dataset.current = currentTime;

    desktopTimers.forEach(timer => {

      const targetTime = timer.getAttribute('data-time-spin');
      if (!targetTime) return;

      ScrollTrigger.create({
        trigger: timer,
        start: "top top",
        onEnter: () => updateMobileTimer(targetTime),
        onEnterBack: () => updateMobileTimer(targetTime)
      });

    });

    function updateMobileTimer(newTime) {

      if (newTime === currentTime) return;

      animateToTime(mobileTimer, currentTime, newTime);
      currentTime = newTime;
      mobileTimer.dataset.current = newTime;
    }

  }

  /*
  ==========================================================
  FUNCIONES COMPARTIDAS
  ==========================================================
  */

  function animateToTime(timerElement, oldTime, newTime) {

    const frontFace = timerElement.querySelector('.timer-front');
    if (!frontFace) return;

    const digitHeight = 24;

    frontFace.innerHTML = '';

    for (let i = 0; i < newTime.length; i++) {

      const newChar = newTime[i];

      if (newChar === ':') {
        const colon = document.createElement('div');
        colon.className = 'colon';
        colon.innerText = ':';
        frontFace.appendChild(colon);
        continue;
      }

      const wrap = document.createElement('div');
      wrap.className = 'digit-wrap';

      const strip = document.createElement('div');
      strip.className = 'digit-strip';

      const oldDigit = parseInt(oldTime[i]);
      const newDigit = parseInt(newChar);

      const sequence = getSpinSequence(oldDigit, newDigit);

      sequence.forEach(num => {
        const d = document.createElement('div');
        d.className = 'digit';
        d.innerText = num;
        strip.appendChild(d);
      });

      wrap.appendChild(strip);
      frontFace.appendChild(wrap);

      gsap.to(strip, {
        y: -(sequence.length - 1) * digitHeight,
        duration: 0.8,
        ease: "power2.inOut"
      });

    }

  }

  function getSpinSequence(start, end) {

    let res = [start];
    let curr = start;

    while (curr !== end) {
      curr = (curr + 1) % 10;
      res.push(curr);
    }

    return res;
  }

}