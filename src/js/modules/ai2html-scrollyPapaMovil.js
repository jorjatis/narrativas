export default function ai2htmlScrollyPapaMovil() {
  if (typeof window === "undefined" || !("querySelector" in document)) return;

  const initAi2Html = (containerId) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const namespace = "";
      let observer;
      let isFirstLoad = !!window.IntersectionObserver;

      const updateSrc = el => {
          const src = el.getAttribute("data-src");
          if (src && el.getAttribute("src") !== src) {
              el.setAttribute("src", src);
          }
      };

      const handleIntersection = entries => {
          if (entries.reduce(((acc, entry) => acc || entry.isIntersecting), false)) {
              isFirstLoad = false;
              render();
          }
      };

      const queryAll = (selector, ctx) => {
          return ctx ? Array.prototype.slice.call(ctx.querySelectorAll(selector)) : [];
      };

      const render = () => {
          const artboards = queryAll(`.${namespace}artboard:where([data-min-width],[data-max-width])`, container);
          const width = window.innerWidth;

          artboards.forEach(artboard => {
              const minWidth = artboard.getAttribute("data-min-width");
              const maxWidth = artboard.getAttribute("data-max-width");
              
              if (+minWidth <= width && (+maxWidth >= width || null === maxWidth)) {
                  if (!isFirstLoad) {
                      queryAll(`.${namespace}f2h-img`, artboard).forEach(updateSrc);
                  }
                  artboard.style.display = "block";
              } else {
                  artboard.style.display = "none";
              }
          });

          if (isFirstLoad && !observer) {
              const isVisible = el => {
                  const rect = el.getBoundingClientRect();
                  return rect.top < window.innerHeight && rect.bottom > 0;
              };

              if (isVisible(container)) {
                  isFirstLoad = false;
                  render();
              } else {
                  observer = new IntersectionObserver(handleIntersection, { rootMargin: "400px 400px" });
                  observer.observe(container);
              }
          }
      };

      const throttle = (func, delay) => {
          let timeout = null, lastRun = 0;
          const run = () => {
              lastRun = Date.now();
              timeout = null;
              func();
          };
          return function () {
              const remaining = delay - (Date.now() - lastRun);
              if (remaining <= 0 || remaining > delay) {
                  clearTimeout(timeout);
                  run();
              } else if (!timeout) {
                  timeout = setTimeout(run, remaining);
              }
          };
      };

      const throttledResize = throttle(render, 200);

      render();
      window.addEventListener("resize", throttledResize);
  };

  const graficos = ["estado-uno-final-box", "estado-dos-final-box"];
  
  graficos.forEach(id => initAi2Html(id));
}