export default function scrollIndicatorPosition() {
  const scrInd = document.querySelector('.scr-ind');
  const container = document.querySelector('.v-a-img-c');

  if (!scrInd || !container) return;

  const sentinel = document.createElement('div');
  sentinel.style.position = 'absolute';
  sentinel.style.bottom = '0';
  sentinel.style.left = '0';
  sentinel.style.width = '100%';
  sentinel.style.height = '1px';
  sentinel.style.pointerEvents = 'none';

  container.appendChild(sentinel);

  let lastScrollY = window.scrollY;

  const observer = new IntersectionObserver(
    ([entry]) => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (entry.isIntersecting && scrollingDown) {
        // Llegas al final bajando
        scrInd.classList.add('is-absolute');
      }

      if (entry.isIntersecting && !scrollingDown) {
        // Estás en el final pero subiendo → aún no quitamos
        // esperamos a salir del sentinel
      }

      if (!entry.isIntersecting && !scrollingDown) {
        // Has salido del final hacia arriba
        scrInd.classList.remove('is-absolute');
      }

      lastScrollY = currentScrollY;
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  observer.observe(sentinel);
}