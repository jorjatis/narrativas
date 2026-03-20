export default function scrollIndicatorPosition() {
  const scrInd = document.querySelector('.scr-ind');
  const container = document.querySelector('.v-a-img-c');
  const triggerBlock = document.querySelector('.v-a--d-s-1');

  if (!scrInd || !container || !triggerBlock) return;

  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute; bottom:0; left:0; width:100%; height:1px; pointer-events:none;';
  container.appendChild(sentinel);

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!scrInd.classList.contains('is-absolute')) {
          scrInd.classList.add('is-visible');
        }
      } else {
        scrInd.classList.remove('is-visible');
      }
    },
    { threshold: 0.1 }
  );

  const positionObserver = new IntersectionObserver(
    ([entry]) => {
      const isScrollingDown = window.scrollY > (positionObserver.lastScrollY || 0);
      
      if (entry.isIntersecting && isScrollingDown) {
        scrInd.classList.add('is-absolute');
        scrInd.classList.remove('is-visible');
      } else if (!entry.isIntersecting && !isScrollingDown) {
        scrInd.classList.remove('is-absolute');

        if (triggerBlock.getBoundingClientRect().top < window.innerHeight) {
          scrInd.classList.add('is-visible');
        }
      }
      positionObserver.lastScrollY = window.scrollY;
    },
    { rootMargin: "0px 0px -30px 0px" }
  );

  visibilityObserver.observe(triggerBlock);
  positionObserver.observe(sentinel);

  const initialTriggerRect = triggerBlock.getBoundingClientRect();
  if (initialTriggerRect.top < window.innerHeight && initialTriggerRect.bottom > 0) {
    scrInd.classList.add('is-visible');
  }
}