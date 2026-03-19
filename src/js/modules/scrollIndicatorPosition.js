export default function scrollIndicatorPosition() {
  const scrInd = document.querySelector('.scr-ind');
  const container = document.querySelector('.v-a-img-c');

  if (!scrInd || !container) return;

  // Creamos un "sentinel" al final del contenedor
  const sentinel = document.createElement('div');
  sentinel.style.position = 'absolute';
  sentinel.style.bottom = '0';
  sentinel.style.left = '0';
  sentinel.style.width = '100%';
  sentinel.style.height = '1px';
  sentinel.style.pointerEvents = 'none';

  container.appendChild(sentinel);

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        // Hemos llegado al final del contenedor
        scrInd.classList.add('is-absolute');
      } else {
        scrInd.classList.remove('is-absolute');
      }
    },
    {
      root: null,
      threshold: 0
    }
  );

  observer.observe(sentinel);
}