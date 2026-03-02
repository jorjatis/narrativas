export default function initLinesTitle() {

  const headingTitle = document.querySelector('.v-a--d-s-1');
  if (!headingTitle) return;

  // Movemos todas las lines-title dentro del heading
  const allLines = document.querySelectorAll('.lines-title');
  allLines.forEach(line => headingTitle.appendChild(line));

  function preparePath(path, reverse = false) {
    const length = path.getTotalLength();

    path.style.strokeDasharray = length;

    // Aquí invertimos si es mobile
    path.style.strokeDashoffset = reverse ? -length : length;

    path.style.setProperty('--path-length', reverse ? -length : length);
  }

function resetPath(path, reverse = false) {
  path.classList.remove('drawLeft', 'drawRight');

  const length = path.getTotalLength();
  path.style.strokeDashoffset = reverse ? -length : length;
}

function animatePair(leftPath, rightPath, reverse = false) {

  preparePath(leftPath, reverse);
  preparePath(rightPath, reverse);

  function startCycle() {

    leftPath.classList.add('drawLeft');

    leftPath.addEventListener('animationend', function leftDone() {
      leftPath.removeEventListener('animationend', leftDone);

      rightPath.classList.add('drawRight');

      rightPath.addEventListener('animationend', function rightDone() {
        rightPath.removeEventListener('animationend', rightDone);

        setTimeout(() => {
          resetPath(leftPath, reverse);
          resetPath(rightPath, reverse);
          startCycle();
        }, 1000);
      });
    });
  }

  startCycle();
}

  // Agrupamos desktop y mobile por separado
  const desktopLeft = document.querySelector('.lines-title.is-left.is-desktop svg path');
  const desktopRight = document.querySelector('.lines-title.is-right.is-desktop svg path');

  const mobileLeft = document.querySelector('.lines-title.is-left.is-mobile svg path');
  const mobileRight = document.querySelector('.lines-title.is-right.is-mobile svg path');

  // Lanzamos animación solo si existen
  if (desktopLeft && desktopRight) {
    animatePair(desktopLeft, desktopRight);
  }

  if (mobileLeft && mobileRight) {
    animatePair(mobileLeft, mobileRight, true);
  }
}