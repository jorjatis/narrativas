export default function overflowable() {
  const containers = document.querySelectorAll('.is-overflowable');

  if (!containers.length) return;

  containers.forEach(container => {
    createOverflowControls(container);
  });
}

function createOverflowControls(container) {
  const wrapper = document.createElement('div');

  wrapper.className = 'overflow-wrapper';

  container.parentNode.insertBefore(wrapper, container);

  wrapper.append(container);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'overflow-btn overflow-btn--left';
  leftBtn.type = 'button';
  leftBtn.setAttribute('aria-label', 'Ver anteriores');
  leftBtn.innerHTML = '<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><path d="M4.2905 6.0005L0.21725 1.9275C0.0789167 1.789 0.00808339 1.61492 0.00475006 1.40525C0.00158339 1.19575 0.0724167 1.0185 0.21725 0.8735C0.36225 0.728667 0.537916 0.65625 0.74425 0.65625C0.950583 0.65625 1.12625 0.728667 1.27125 0.8735L5.7655 5.36775C5.859 5.46142 5.925 5.56017 5.9635 5.664C6.002 5.76783 6.02125 5.88 6.02125 6.0005C6.02125 6.121 6.002 6.23317 5.9635 6.337C5.925 6.44083 5.859 6.53958 5.7655 6.63325L1.27125 11.1275C1.13275 11.2658 0.958666 11.3367 0.749 11.34C0.5395 11.3432 0.36225 11.2723 0.21725 11.1275C0.0724167 10.9825 0 10.8068 0 10.6005C0 10.3942 0.0724167 10.2185 0.21725 10.0735L4.2905 6.0005Z"></path></svg>';
  leftBtn.hidden = true;

  const rightBtn = document.createElement('button');
  rightBtn.className = 'overflow-btn overflow-btn--right';
  rightBtn.type = 'button';
  rightBtn.setAttribute('aria-label', 'Ver siguientes');
  rightBtn.innerHTML = '<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><path d="M4.2905 6.0005L0.21725 1.9275C0.0789167 1.789 0.00808339 1.61492 0.00475006 1.40525C0.00158339 1.19575 0.0724167 1.0185 0.21725 0.8735C0.36225 0.728667 0.537916 0.65625 0.74425 0.65625C0.950583 0.65625 1.12625 0.728667 1.27125 0.8735L5.7655 5.36775C5.859 5.46142 5.925 5.56017 5.9635 5.664C6.002 5.76783 6.02125 5.88 6.02125 6.0005C6.02125 6.121 6.002 6.23317 5.9635 6.337C5.925 6.44083 5.859 6.53958 5.7655 6.63325L1.27125 11.1275C1.13275 11.2658 0.958666 11.3367 0.749 11.34C0.5395 11.3432 0.36225 11.2723 0.21725 11.1275C0.0724167 10.9825 0 10.8068 0 10.6005C0 10.3942 0.0724167 10.2185 0.21725 10.0735L4.2905 6.0005Z"></path></svg>';
  rightBtn.hidden = true;

  wrapper.append(leftBtn);
  wrapper.append(rightBtn);

  function hasOverflow() {
    return (
      container.scrollWidth > container.clientWidth
    );
  }

  function updateButtons() {
    const overflow = hasOverflow();

    if (!overflow) {
      leftBtn.hidden = true;
      rightBtn.hidden = true;

      return;
    }

    const scrollLeft = container.scrollLeft;

    const maxScroll = container.scrollWidth - container.clientWidth;

    leftBtn.hidden = scrollLeft <= 4;

    rightBtn.hidden = scrollLeft >= maxScroll - 4;
  }

  function scroll(direction) {
    container.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth'
    });
  }

  leftBtn.addEventListener( 'click', () => {
    scroll('left');
  });
  
  rightBtn.addEventListener( 'click', () => {
    scroll('right');
  });

  container.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);

  updateButtons();
}