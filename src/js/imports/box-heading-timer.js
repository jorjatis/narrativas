export default function initBoxHeadingTimer() {

  function timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToTime(total) {
    const DAY = 24 * 60;
    total = total % DAY;

    const h = Math.floor(total / 60);
    const m = total % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function easeInOut(t) {
    return t < 0.5
      ? 16 * t * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 5) / 2;
  }

  function animateTimer(el, duration = 2500) {
    const span = el.querySelector('span');
    if (!span || !el.dataset.timeSpin) return;

    const startTime = timeToMinutes(span.textContent.trim());
    const endTime = timeToMinutes(el.dataset.timeSpin);

    const DAY = 24 * 60;
    const adjustedEnd = endTime >= startTime
      ? endTime
      : endTime + DAY;

    const start = performance.now();

    function update(now) {
      const rawProgress = Math.min((now - start) / duration, 1);
      const easedProgress = easeInOut(rawProgress);

      const current = Math.floor(
        startTime + (adjustedEnd - startTime) * easedProgress
      );

      span.textContent = minutesToTime(current);

      if (rawProgress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  document.querySelectorAll('.is-timer').forEach(timer => {
    animateTimer(timer, 2500);
  });
}