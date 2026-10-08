gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

var MQ_DESKTOP = "(min-width: 699px)";
var FACE_STAGGER = 0.16;
var FACE_DURATION = 0.45;
var LINE_DURATION = 0.7;
var OF_END_Y = { mobile: -18, desktop: -26 };
var OF_START_Y = { mobile: 30, desktop: 60 };

function preArticleHeader(root) {
  root = root || document;
  var section = root.querySelector(".v-a--d-s-1");
  if (!section) return;

  var imgFig = section.querySelector(".v-a-preh-img");
  var textBlock = section.querySelector(".v-a-preh-t");
  var subtitle = section.querySelector(".v-a-s-t");
  if (!imgFig || !textBlock) return;

  var bg = imgFig.querySelector(".v-a-preh-img__bg");
  var faces = gsap.utils.toArray(imgFig.querySelectorAll(".v-a-preh-img__face"));
  var word01 = textBlock.querySelector(".v-a-preh-t-s--01");
  var word02 = textBlock.querySelector(".v-a-preh-t-s--02");
  var line = textBlock.querySelector(".v-a-preh-t-s-line");
  var of = textBlock.querySelector(".v-a-preh-t-s-of");

  var isDesktop = window.matchMedia(MQ_DESKTOP).matches;
  var ofEndY = isDesktop ? OF_END_Y.desktop : OF_END_Y.mobile;
  var ofStartY = isDesktop ? OF_START_Y.desktop : OF_START_Y.mobile;

  var showFinal = function () {
    gsap.set([imgFig, textBlock, subtitle].filter(Boolean), { opacity: 1 });
    gsap.set([bg].concat(faces).filter(Boolean), { opacity: 1 });
    gsap.set([word01, word02].filter(Boolean), { opacity: 1 });
    if (line) gsap.set(line, { scaleX: 1 });
    if (subtitle) gsap.set(subtitle, { "--flag-scale": 1 });
    if (of) gsap.set(of, { y: ofEndY });
  };

  if (prefersReducedMotion()) {
    showFinal();
    return;
  }

  gsap.set([imgFig, textBlock], { opacity: 0 });
  gsap.set([bg].concat(faces), { opacity: 0 });
  gsap.set([word01, word02], { opacity: 0 });
  gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
  gsap.set(of, { y: ofStartY });
  if (subtitle) gsap.set(subtitle, { opacity: 0, "--flag-scale": 0 });

  var tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  var playImages = function (at) {
    tl.set(imgFig, { opacity: 1 }, at);
    tl.to(bg, { opacity: 1, duration: 0.9 }, at);
    tl.to(
      faces,
      { opacity: 1, duration: FACE_DURATION, stagger: FACE_STAGGER },
      typeof at === "number" ? at + 0.35 : "<0.35"
    );
  };

  var playText = function (at) {
    tl.set(textBlock, { opacity: 1 }, at);
    tl.to(word01, { opacity: 1, duration: 0.5 }, at);
    tl.to(word02, { opacity: 1, duration: 0.4 }, ">-0.1");
    tl.to(
      line,
      { scaleX: 1, duration: LINE_DURATION, ease: "power2.inOut" },
      ">-0.05"
    );
    // Al 75% de la línea, 1-O sube a su posición final
    tl.to(
      of,
      { y: ofEndY, duration: 0.55, ease: "power2.out" },
      "<" + LINE_DURATION * 0.75
    );
  };

  var playSubtitle = function (at) {
    if (!subtitle) return;
    tl.to(subtitle, { opacity: 1, duration: 0.5 }, at);
    tl.to(
      subtitle,
      { "--flag-scale": 1, duration: 0.55, ease: "power2.inOut" },
      "<0.15"
    );
  };

  if (isDesktop) {
    playImages(0);
    // Face-06 (índice 5) arranca en 0.35 + 5 * stagger
    playText(0.35 + 5 * FACE_STAGGER);
    playSubtitle(">-0.25");
  } else {
    playText(0);
    playImages(">-0.15");
    playSubtitle(">-0.2");
  }

  return tl;
}

var SEGMENT_SCALE = 1;
var MQ_CHRONO_DESK = "(min-width: 1250px)";

function CARTELA_SCROLL_UNITS() {
  return window.matchMedia(MQ_CHRONO_DESK).matches ? 0.85 : 0.5;
}

function SCROLL_PX_PER_UNIT() {
  var vh = Math.max(window.innerHeight, 600);
  var isDesk = window.matchMedia(MQ_CHRONO_DESK).matches;
  return vh * (isDesk ? 4 : 6.5);
}

var RESIZE_DEBOUNCE_MS = 150;

/** Cabecera sticky + 8px aire: 66 desk (58+8) / 58 mobile (50+8). */
function HEADER_OFFSET() {
  return window.matchMedia("(min-width: 699px)").matches ? 66 : 58;
}

function clamp01(n) {
  return gsap.utils.clamp(0, 1, Number.isFinite(n) ? n : 0);
}

function readCartelas(root) {
  return gsap.utils
    .toArray(root.querySelectorAll(".v-n-chrono__cartela"))
    .map(function (el) {
      return {
        el: el,
        at: clamp01(parseFloat(el.dataset.at)),
      };
    })
    .sort(function (a, b) {
      return a.at - b.at;
    });
}

function waitForImage(img) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalHeight > 0) return Promise.resolve();
  return new Promise(function (resolve) {
    var done = function () {
      resolve();
    };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function waitForImages(imgs) {
  return Promise.all(imgs.filter(Boolean).map(waitForImage));
}

function activeGraphic(root) {
  var desk = root.querySelector(".v-n-chrono__graphic--desk");
  var mov = root.querySelector(".v-n-chrono__graphic--mov");
  var isDesk = window.matchMedia(MQ_CHRONO_DESK).matches;
  if (isDesk && desk) return desk;
  if (mov) return mov;
  return root.querySelector(".v-n-chrono__graphic");
}

function setupChrono(root) {
  var stage = root.querySelector(".v-n-chrono__stage");
  var viewport = root.querySelector(".v-n-chrono__viewport");
  var heads = root.querySelector(".v-n-chrono__heads");
  var namesSticky = root.querySelector(".v-n-chrono__names-sticky");
  var legendMap = root.querySelector(".v-n-chrono__legend-map");
  var legendView = root.querySelector(".v-n-chrono__legend-view");

  if (!stage || !viewport) return function () {};

  if (prefersReducedMotion()) {
    root.classList.add("v-n-chrono--reduced");
    return function () {};
  }

  var cartelas = readCartelas(root);
  var ctx = null;
  var resizeTimer = null;
  var destroyed = false;

  /** Iguala el hueco del graphic a la altura real del sticky (evita saltito al pin). */
  var syncStickyGaps = function (graphic) {
    var isDesk = window.matchMedia(MQ_CHRONO_DESK).matches;

    if (!isDesk && namesSticky) {
      var gap = graphic.querySelector(".v-n-chrono__names-gap");
      var h = namesSticky.offsetHeight;
      if (gap && h > 0) {
        gap.style.aspectRatio = "auto";
        gap.style.height = h + "px";
      }
      gsap.set(namesSticky, { top: 0 });
      return;
    }

    if (heads && heads.offsetParent) {
      var facesGap = graphic.querySelector(".v-n-chrono__faces-gap");
      var facesH = heads.offsetHeight;
      if (facesGap && facesH > 0) {
        facesGap.style.aspectRatio = "auto";
        facesGap.style.height = facesH + "px";
      }
    }
  };

  var updateHeads = function (graphic) {
    var isDesk = window.matchMedia(MQ_CHRONO_DESK).matches;

    // Mobile: nombres siempre sticky arriba
    if (!isDesk && namesSticky && namesSticky.offsetParent) {
      gsap.set(namesSticky, { top: 0 });
      return;
    }

    // Desktop: caras bajo los nombres, luego se quedan en top: 0
    if (!heads || !heads.offsetParent) return;
    var names = graphic.querySelector(".v-n-chrono__names");
    var namesH = names ? names.offsetHeight : 0;
    var gy = Number(gsap.getProperty(graphic, "y")) || 0;
    gsap.set(heads, { top: Math.max(0, namesH + gy) });
  };

  var updateLegend = function (graphic) {
    if (!legendMap || !legendView) return;
    var legend = root.querySelector(".v-n-chrono__legend");
    if (!legend || !legend.offsetParent) return;

    var mapH = legendMap.offsetHeight;
    var viewportH = viewport.clientHeight;
    var graphicH = graphic.offsetHeight;
    if (mapH <= 0 || graphicH <= 0) return;

    var travel = Math.max(graphicH - viewportH, 0);
    var viewH = Math.max((viewportH / graphicH) * mapH, 8);
    var y = Math.abs(Number(gsap.getProperty(graphic, "y")) || 0);
    var progress = travel > 0 ? clamp01(y / travel) : 0;

    gsap.set(legendView, {
      height: viewH,
      y: progress * Math.max(mapH - viewH, 0),
    });
  };

  var onScrub = function (graphic) {
    updateHeads(graphic);
    updateLegend(graphic);
  };

  var build = function () {
    if (destroyed) return;

    if (ctx) {
      ctx.revert();
      ctx = null;
    }

    var graphic = activeGraphic(root);
    if (!graphic) return;

    gsap.set(graphic, { y: 0 });
    syncStickyGaps(graphic);

    var viewportH = viewport.clientHeight;
    var graphicH = graphic.offsetHeight;
    var travel = Math.max(graphicH - viewportH, 0);

    gsap.set(
      cartelas.map(function (c) {
        return c.el;
      }),
      { yPercent: 100, autoAlpha: 0 }
    );
    onScrub(graphic);

    ctx = gsap.context(function () {
      var tl = gsap.timeline({ defaults: { ease: "none" } });

      var prevAt = 0;
      cartelas.forEach(function (item) {
        var el = item.el;
        var at = item.at;
        var delta = at - prevAt;
        if (delta > 0.0001) {
          tl.to(graphic, {
            y: -travel * at,
            duration: delta * SEGMENT_SCALE,
            onUpdate: function () {
              onScrub(graphic);
            },
          });
        } else {
          tl.set(graphic, { y: -travel * at });
          tl.add(function () {
            onScrub(graphic);
          });
        }

        tl.set(el, { autoAlpha: 1 });
        tl.fromTo(
          el,
          { yPercent: 100 },
          { yPercent: -100, duration: CARTELA_SCROLL_UNITS() }
        );
        tl.set(el, { autoAlpha: 0 });

        prevAt = at;
      });

      if (prevAt < 1 - 0.0001) {
        tl.to(graphic, {
          y: -travel,
          duration: (1 - prevAt) * SEGMENT_SCALE,
          onUpdate: function () {
            onScrub(graphic);
          },
        });
      } else {
        tl.set(graphic, { y: -travel });
      }

      ScrollTrigger.create({
        trigger: stage,
        start: function () {
          return "top " + HEADER_OFFSET() + "px";
        },
        end: function () {
          return "+=" + Math.max(tl.duration() * SCROLL_PX_PER_UNIT(), viewportH);
        },
        pin: true,
        scrub: true,
        animation: tl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function () {
          onScrub(graphic);
        },
        onRefresh: function () {
          onScrub(graphic);
        },
      });
    }, root);

    ScrollTrigger.refresh();
  };

  var imgs = root.querySelectorAll(
    ".v-n-chrono__graphic img, .v-n-chrono__heads img, .v-n-chrono__names-sticky img"
  );
  waitForImages([].slice.call(imgs)).then(function () {
    if (!destroyed) build();
  });

  var onResize = function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      waitForImages([].slice.call(imgs)).then(function () {
        if (!destroyed) build();
      });
    }, RESIZE_DEBOUNCE_MS);
  };

  window.addEventListener("resize", onResize);

  return function () {
    destroyed = true;
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    if (ctx) ctx.revert();
  };
}

function chronoScroll(root) {
  root = root || document;
  var nodes = root.querySelectorAll(".v-n-chrono");
  if (!nodes.length) return;

  var cleanups = [];
  [].forEach.call(nodes, function (node) {
    cleanups.push(setupChrono(node));
  });

  return function () {
    cleanups.forEach(function (fn) {
      if (fn) fn();
    });
  };
}

/**
 * Recalcula ScrollTrigger cuando media lazy (img/video/iframe) cambia el layout.
 * Necesario en prod: el markup trae loading="lazy" y no se puede quitar.
 */
function refreshScrollTriggerOnMedia(root) {
  root = root || document;
  var timer = null;
  var refresh = function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      ScrollTrigger.refresh();
    }, 120);
  };
  var onMediaEvent = function (e) {
    var el = e.target;
    if (!el || !el.tagName) return;
    var tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "IFRAME" || tag === "SOURCE") {
      refresh();
    }
  };
  // capture: load no burbujea
  root.addEventListener("load", onMediaEvent, true);
  root.addEventListener("loadedmetadata", onMediaEvent, true);
  root.addEventListener("loadeddata", onMediaEvent, true);
  root.addEventListener("error", onMediaEvent, true);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh).catch(function () {});
  }
}

function initAll() {
  preArticleHeader();
  chronoScroll();
  refreshScrollTriggerOnMedia();
}

// En prod se llama directo (sin window load)
initAll();
