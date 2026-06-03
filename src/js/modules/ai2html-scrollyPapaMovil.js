export default function ai2htmlScrollyPapaMovil() {
  if (!("querySelector" in document)) return;

  if (window.__papamovilAi2htmlSetup) {
    window.__papamovilAi2htmlSetup();
    return;
  }

  const initialized = new WeakSet();

  const select = (selector, context) =>
    Array.prototype.slice.call(
      (context || document).querySelectorAll(selector)
    );

  const hydrateImage = (image) => {
    const src = image.getAttribute("data-src");

    if (src && image.getAttribute("src") !== src) {
      image.setAttribute("src", src);
    }
  };

  const debounce = (callback, delay) => {
    let timeout = null;
    let lastRun = 0;

    return () => {
      const remaining = delay - (Date.now() - lastRun);

      const run = () => {
        lastRun = Date.now();
        timeout = null;
        callback();
      };

      if (remaining <= 0 || remaining > delay) {
        clearTimeout(timeout);
        run();
      } else if (!timeout) {
        timeout = setTimeout(run, remaining);
      }
    };
  };

  const isInViewport = (node) => {
    const box = node.getBoundingClientRect();

    return box.top < window.innerHeight && box.bottom > 0;
  };

  const setupAi2html = (container) => {
    if (!container || initialized.has(container)) return;

    initialized.add(container);

    let observer = null;
    let lazy = !!window.IntersectionObserver;

    const render = () => {
      const artboards = select(".artboard", container);

      const availableWidth = document.documentElement.clientWidth;

      artboards.forEach((artboard) => {
        const minWidth = artboard.getAttribute("data-min-width");
        const maxWidth = artboard.getAttribute("data-max-width");

        const visible =
          (minWidth === null || Number(minWidth) <= availableWidth) &&
          (maxWidth === null || Number(maxWidth) >= availableWidth);

        artboard.style.display = visible ? "block" : "none";

        if (visible && !lazy) {
          select(".f2h-img", artboard).forEach(hydrateImage);
        }
      });

      if (lazy && !observer) {
        if (isInViewport(container)) {
          lazy = false;
          render();
        } else {
          observer = new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                lazy = false;

                observer.disconnect();
                observer = null;

                render();
              }
            },
            {
              rootMargin: "400px 400px",
            }
          );

          observer.observe(container);
        }
      }
    };

    render();

    document.addEventListener("DOMContentLoaded", render);

    window.addEventListener("resize", debounce(render, 200));
  };

  const setupAll = () =>
    select(".figma2html[data-ai2html]").forEach(setupAi2html);

  window.__papamovilAi2htmlSetup = setupAll;

  setupAll();

  document.addEventListener("DOMContentLoaded", setupAll);
}