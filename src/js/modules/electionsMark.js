const CENTER_X = 90.757;
const CENTER_Y = 89.743;

const power3Out = (t) => 1 - (1 - t) ** 4;
const power1Out = (t) => 1 - (1 - t) ** 2;

function play(duration, delay, ease, paint) {
  return new Promise((resolve) => {
    const ms = duration * 1000;
    const wait = delay * 1000;
    if (ms <= 0 && wait <= 0) {
      paint(1);
      resolve();
      return;
    }

    let started = 0;
    const tick = (now) => {
      if (!started) started = now;
      const elapsed = now - started - wait;
      if (elapsed < 0) {
        requestAnimationFrame(tick);
        return;
      }
      const t = ms <= 0 ? 1 : Math.min(1, elapsed / ms);
      paint(ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

function settle(dots, square) {
  dots.forEach((dot) => {
    dot.setAttribute('cx', dot.dataset.x);
    dot.setAttribute('cy', dot.dataset.y);
  });
  if (square) square.style.opacity = '1';
}

export function initElectionsMark() {
  const mark = document.querySelector('.v-elec-h__mark');
  if (!mark || mark.dataset.ready) return;
  mark.dataset.ready = '1';

  const dots = [...mark.querySelectorAll('.v-elec-h__dot')];
  const square = mark.querySelector('.v-elec-h__square');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    settle(dots, square);
    return;
  }

  const duration = 0.42;
  const stagger = 0.01;

  dots.forEach((dot, index) => {
    const x1 = parseFloat(dot.dataset.x);
    const y1 = parseFloat(dot.dataset.y);
    dot.setAttribute('cx', CENTER_X);
    dot.setAttribute('cy', CENTER_Y);
    play(duration, stagger * index, power3Out, (t) => {
      dot.setAttribute('cx', CENTER_X + (x1 - CENTER_X) * t);
      dot.setAttribute('cy', CENTER_Y + (y1 - CENTER_Y) * t);
    });
  });

  if (!square) return;
  const delay = duration + stagger * Math.max(0, dots.length - 1);
  play(0.32, delay, power1Out, (t) => {
    square.style.opacity = String(t);
  });
}
