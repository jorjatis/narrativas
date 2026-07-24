import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function getTextLines(textElement) {
  const tspans = [...textElement.querySelectorAll('tspan')];
  if (!tspans.length) return [textElement.textContent.trim()];

  const lines = new Map();
  tspans.forEach((tspan) => {
    const y = tspan.getAttribute('y') || '0';
    lines.set(y, `${lines.get(y) || ''}${tspan.textContent}`);
  });

  return [...lines.values()]
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function createMapLabels(mapObject, mapContent) {
  const svgDocument = mapObject.contentDocument;
  const svg = svgDocument?.documentElement;
  const textGroup = svgDocument?.querySelector('#texto');
  const textElements = [...(textGroup?.querySelectorAll('text') || [])];
  const embeddedMap = svgDocument?.querySelector('#mapa image');
  const visibleMap = mapContent.querySelector('img.v-n-pm__map');

  if (!svg || !textGroup || !textElements.length) return [];

  const embeddedMapSource = embeddedMap?.getAttributeNS(
    'http://www.w3.org/1999/xlink',
    'href',
  ) || embeddedMap?.getAttribute('href');
  if (embeddedMapSource && visibleMap) visibleMap.src = embeddedMapSource;

  const labelsLayer = document.createElement('div');
  labelsLayer.className = 'v-n-pm__map-labels';
  labelsLayer.setAttribute('aria-hidden', 'true');

  const viewBox = svg.viewBox.baseVal;
  const labels = textElements.map((textElement) => {
    const box = textElement.getBBox();
    const point = svg.createSVGPoint();
    point.x = box.x + box.width / 2;
    point.y = box.y + box.height / 2;
    const localMatrix = textElement.transform.baseVal.consolidate()?.matrix;
    const position = localMatrix ? point.matrixTransform(localMatrix) : point;
    const label = document.createElement('span');
    const lines = getTextLines(textElement);
    const labelText = lines.join(' ');

    label.className = 'v-n-pm__map-label';
    if (/calle\s*de\s*alcal/i.test(labelText)) {
      label.classList.add('v-n-pm__map-label--alcala');
    }
    label.style.left = `${((position.x - viewBox.x) / viewBox.width) * 100}%`;
    label.style.top = `${((position.y - viewBox.y) / viewBox.height) * 100}%`;

    lines.forEach((line, index, textLines) => {
      label.append(document.createTextNode(line));
      if (index < textLines.length - 1) label.append(document.createElement('br'));
    });

    labelsLayer.append(label);
    return label;
  });

  textGroup.style.opacity = '0';
  mapContent.append(labelsLayer);
  return labels;
}

function setupPerspectiveMap(root) {
  if (root.dataset.pmReady === 'true') return;
  root.dataset.pmReady = 'true';

  const stage = root.querySelector('.v-n-pm__stage');
  const plane = root.querySelector('.v-n-pm__plane');
  const mapContent = root.querySelector('.v-n-pm__content');
  const index = root.querySelector('.v-n-pm__index');
  const indexItems = gsap.utils.toArray('.v-n-pm__index-item', root);
  const indexImages = gsap.utils.toArray('.v-n-pm__index-item img', root);
  const indexTitles = gsap.utils.toArray('.v-n-pm__index-item span', root);
  const mapObject = root.querySelector('.v-n-pm__map-data');
  const billboards = gsap.utils.toArray('.v-n-pm__billboard', root);
  const billboardImages = billboards.map((billboard) => billboard.querySelector('img'));
  const shadows = gsap.utils.toArray('.v-n-pm__shadow', root);
  const anchors = gsap.utils.toArray('.v-n-pm__dot', root);
  const connectors = gsap.utils.toArray('[data-pm-connector]', root);
  const diamonds = gsap.utils.toArray('[data-pm-diamond]', root);
  const connectorGraphics = [...connectors, ...diamonds];
  const labels = createMapLabels(mapObject, mapContent);

  if (
    !stage
    || !plane
    || !mapContent
    || !index
    || !billboards.length
    || anchors.length !== 3
  ) return;

  const connectorsSvg = root.querySelector('.v-n-pm__connectors');
  let connectorsFrame = 0;
  let connectorsNeeded = true;

  function fitIndexInsideSafeArea() {
    root.style.removeProperty('--pm-statue-max-height');

    const anchorCenters = anchors.map((anchor) => {
      const rect = anchor.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    const titleHeight = Math.max(...indexTitles.map((title) => title.offsetHeight), 0);
    const minimumGap = Math.min(
      anchorCenters[1] - anchorCenters[0],
      anchorCenters[2] - anchorCenters[1],
    );
    const safeImageHeight = Math.max(40, Math.min(135, minimumGap - titleHeight - 18));

    root.style.setProperty('--pm-statue-max-height', `${safeImageHeight}px`);
  }

  function alignIndexToAnchors() {
    const stageRect = stage.getBoundingClientRect();
    const tops = anchors.map((anchor) => {
      const rect = anchor.getBoundingClientRect();
      return rect.top + rect.height / 2 - stageRect.top;
    });

    indexItems.forEach((item, itemIndex) => {
      item.style.top = `${tops[itemIndex]}px`;
    });
  }

  function getArrivalScales() {
    return billboardImages.map((billboardImage, itemIndex) => {
      const indexRect = indexImages[itemIndex].getBoundingClientRect();
      const billboardRect = billboardImage.getBoundingClientRect();
      const currentScale = Number(gsap.getProperty(billboards[itemIndex], 'scale')) || 1;
      const naturalHeight = billboardRect.height / currentScale;

      if (!naturalHeight) return 1;

      return Math.max(0.35, Math.min(1.35, indexRect.height / naturalHeight));
    });
  }

  function getImageTravelDeltas() {
    const imageRects = indexImages.map((image) => image.getBoundingClientRect());
    const anchorRects = anchors.map((anchor) => anchor.getBoundingClientRect());

    return imageRects.map((imageRect, itemIndex) => {
      const anchorRect = anchorRects[itemIndex];
      return {
        x: (
          anchorRect.left
          + anchorRect.width / 2
          - imageRect.left
          - imageRect.width / 2
        ),
        y: anchorRect.top + anchorRect.height / 2 - imageRect.bottom,
      };
    });
  }

  function updateConnectorsNow() {
    if (!connectorsSvg || !connectorsNeeded) return;

    const stageRect = stage.getBoundingClientRect();
    const isDesktop = window.matchMedia('(min-width: 699px)').matches;
    const referenceImageRect = indexImages[0]?.getBoundingClientRect();
    if (!referenceImageRect) return;

    const sharedStartX = (
      referenceImageRect.left
      - stageRect.left
      - Math.min(28, stageRect.width * 0.025)
    );

    connectorsSvg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);

    connectors.forEach((connector, connectorIndex) => {
      const image = indexImages[connectorIndex];
      const anchor = anchors[connectorIndex];
      const diamond = diamonds[connectorIndex];
      if (!image || !anchor || !diamond) return;

      const imageRect = image.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      // Desktop: rombos alineados al eje de Cibeles.
      // Mobile: Cibeles (arriba del mapa) conecta por la base;
      // Apolo/Neptuno (abajo del mapa) conectan por la parte superior.
      let lineStartX;
      let lineStartY;
      if (isDesktop) {
        lineStartX = sharedStartX;
        lineStartY = imageRect.bottom - stageRect.top;
      } else {
        const verticalGap = Math.min(16, Math.max(10, imageRect.height * 0.14));
        if (connectorIndex === 0) {
          // Cibeles (arriba): sale por el centro de la base, separada hacia abajo.
          lineStartX = imageRect.left + imageRect.width / 2 - stageRect.left;
          lineStartY = imageRect.bottom - stageRect.top + verticalGap;
        } else {
          // Apolo / Neptuno (abajo): salen por el centro superior, separadas hacia arriba.
          lineStartX = imageRect.left + imageRect.width / 2 - stageRect.left;
          lineStartY = imageRect.top - stageRect.top - verticalGap;
        }
      }
      const lineEndX = anchorRect.left + anchorRect.width / 2 - stageRect.left;
      const lineEndY = anchorRect.top + anchorRect.height / 2 - stageRect.top;
      const diamondHalfSize = 3;

      connector.setAttribute('x1', lineStartX);
      connector.setAttribute('y1', lineStartY);
      connector.setAttribute('x2', lineEndX);
      connector.setAttribute('y2', lineEndY);
      diamond.setAttribute(
        'points',
        [
          `${lineStartX},${lineStartY - diamondHalfSize}`,
          `${lineStartX + diamondHalfSize},${lineStartY}`,
          `${lineStartX},${lineStartY + diamondHalfSize}`,
          `${lineStartX - diamondHalfSize},${lineStartY}`,
        ].join(' '),
      );
    });
  }

  function updateConnectors() {
    if (connectorsFrame) return;

    connectorsFrame = requestAnimationFrame(() => {
      connectorsFrame = 0;
      updateConnectorsNow();
    });
  }

  const media = gsap.matchMedia();

  media.add(
    {
      isDesktop: '(min-width: 699px)',
      isMobile: '(max-width: 698px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { isDesktop, reduceMotion } = context.conditions;
      if (reduceMotion) return undefined;

      const desktop = Boolean(isDesktop);
      const tilt = desktop ? 58 : 32;

      gsap.set(plane, {
        rotationX: 0,
        // Desktop: un poco a la derecha al inicio (hueco del índice), centrado al final.
        xPercent: desktop ? -38 : -50,
        yPercent: -50,
        scale: 1,
        force3D: true,
      });
      gsap.set(indexImages, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        scale: 1,
        transformOrigin: '50% 100%',
      });
      gsap.set(indexTitles, { autoAlpha: 1 });
      gsap.set(billboards, {
        autoAlpha: 0,
        xPercent: -50,
        rotationX: 0,
        y: 0,
        z: 0,
        scale: 1,
        transformOrigin: '50% 100%',
        force3D: true,
      });
      gsap.set(shadows, {
        autoAlpha: 0,
        xPercent: -50,
        x: 0,
        y: 0,
        z: 1,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        skewX: 0,
        scaleX: 1,
        scaleY: 0.18,
        transformOrigin: '50% 100%',
        force3D: true,
      });
      gsap.set(labels, {
        rotationX: 0,
        z: 0,
        force3D: true,
      });
      gsap.set(connectorGraphics, { autoAlpha: 1 });

      if (desktop) {
        fitIndexInsideSafeArea();
        alignIndexToAnchors();
        labels.forEach((label) => {
          if (!label.classList.contains('v-n-pm__map-label--alcala')) return;
          if (label.dataset.pmLeft) {
            label.style.left = label.dataset.pmLeft;
            label.style.top = label.dataset.pmTop;
          }
        });
      } else {
        root.style.removeProperty('--pm-statue-max-height');
        indexItems.forEach((item) => {
          item.style.top = '';
        });
        // Aparta "Calle de Alcalá" de Cibeles en el estado final.
        labels.forEach((label) => {
          if (!label.classList.contains('v-n-pm__map-label--alcala')) return;
          if (!label.dataset.pmLeft) {
            label.dataset.pmLeft = label.style.left;
            label.dataset.pmTop = label.style.top;
          }
          label.style.left = `${parseFloat(label.dataset.pmLeft) + 8}%`;
          label.style.top = `${parseFloat(label.dataset.pmTop) - 3.5}%`;
        });
      }

      let arrivalScales = getArrivalScales();
      let grownScales = arrivalScales.map((scale) => scale * (desktop ? 1.38 : 1.18));
      gsap.set(billboards, {
        scale: (itemIndex) => arrivalScales[itemIndex],
      });
      gsap.set(shadows, {
        scaleX: (itemIndex) => arrivalScales[itemIndex],
        scaleY: (itemIndex) => arrivalScales[itemIndex] * 0.18,
      });

      connectorsNeeded = true;
      updateConnectors();

      let travelDeltas = null;
      const getTravelDelta = (itemIndex, axis) => {
        if (!travelDeltas) travelDeltas = getImageTravelDeltas();
        return travelDeltas[itemIndex][axis];
      };

      const refreshScales = () => {
        arrivalScales = getArrivalScales();
        grownScales = arrivalScales.map((scale) => scale * (desktop ? 1.38 : 1.18));
      };

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          connectorsNeeded = timeline.time() < 0.45;
          if (connectorsNeeded) updateConnectors();
        },
        scrollTrigger: {
          trigger: root,
          pin: true,
          pinSpacing: true,
          start: desktop ? 'top top' : 'top top+=52',
          end: desktop ? '+=300%' : '+=240%',
          scrub: true,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onRefreshInit: () => {
            if (desktop) {
              fitIndexInsideSafeArea();
              alignIndexToAnchors();
            }
            travelDeltas = null;
          },
          onRefresh: (self) => {
            refreshScales();
            if (self.progress < 0.35) {
              gsap.set(billboards, {
                scale: (itemIndex) => arrivalScales[itemIndex],
                rotationX: 0,
              });
            }
            connectorsNeeded = self.progress < 0.45;
            updateConnectors();
          },
        },
      });

      timeline
        .set(indexImages, { autoAlpha: 1, x: 0, y: 0 }, 0)
        .set(indexTitles, { autoAlpha: 1 }, 0)
        .set(billboards, {
          autoAlpha: 0,
          rotationX: 0,
          scale: (itemIndex) => arrivalScales[itemIndex],
        }, 0)
        .set(shadows, {
          autoAlpha: 0,
          x: 0,
          skewX: 0,
          scaleX: (itemIndex) => arrivalScales[itemIndex],
          scaleY: (itemIndex) => arrivalScales[itemIndex] * 0.18,
        }, 0)
        .set(connectorGraphics, { autoAlpha: 1 }, 0)
        .set(plane, {
          rotationX: 0,
          xPercent: desktop ? -38 : -50,
          yPercent: -50,
          scale: 1,
        }, 0)
        .to(indexTitles, { autoAlpha: 0, duration: 0.2 }, 0.05)
        .to(
          indexImages,
          {
            x: (itemIndex) => getTravelDelta(itemIndex, 'x'),
            y: (itemIndex) => getTravelDelta(itemIndex, 'y'),
            duration: 0.34,
          },
          0.03,
        )
        .to(connectorGraphics, { autoAlpha: 0, duration: 0.12 }, 0.26)
        .set(indexImages, { autoAlpha: 0 }, 0.34)
        .set(
          billboards,
          {
            autoAlpha: 1,
            rotationX: 0,
            scale: (itemIndex) => arrivalScales[itemIndex],
          },
          0.35,
        )
        .to(
          plane,
          {
            rotationX: tilt,
            // Un poco a la izquierda: el Retiro pesa a la derecha y desequilibra el centro visual.
            xPercent: desktop ? -54 : -50,
            yPercent: desktop ? -68 : -50,
            scale: desktop ? 1.08 : 1.06,
            duration: 0.58,
          },
          0.35,
        )
        .to(
          billboards,
          {
            // Compensa el tilt del plano para que sigan de pie, sin elevarse en Z.
            rotationX: -tilt,
            z: 0,
            scale: (itemIndex) => grownScales[itemIndex],
            stagger: 0.04,
            duration: 0.4,
          },
          0.35,
        )
        .to(
          labels,
          {
            rotationX: -tilt,
            z: desktop ? 8 : 4,
            stagger: 0.012,
            duration: 0.28,
          },
          0.42,
        )
        .to(
          shadows,
          {
            autoAlpha: 0.55,
            x: desktop ? 14 : 8,
            skewX: desktop ? -18 : -14,
            scaleX: (itemIndex) => grownScales[itemIndex] * 1.02,
            scaleY: (itemIndex) => grownScales[itemIndex] * (desktop ? 0.2 : 0.16),
            stagger: 0.04,
            duration: 0.3,
          },
          0.38,
        )
        .to({}, { duration: 0.18 });

      return () => {
        if (connectorsFrame) {
          cancelAnimationFrame(connectorsFrame);
          connectorsFrame = 0;
        }
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
  );

  const resizeObserver = new ResizeObserver(() => {
    connectorsNeeded = true;
    updateConnectors();
    ScrollTrigger.refresh();
  });
  resizeObserver.observe(stage);
  resizeObserver.observe(plane);
  updateConnectors();
}

function whenImagesReady(images) {
  return Promise.all(
    images.map(
      (image) => (
        image.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })
      ),
    ),
  );
}

function initPerspectiveMap(root) {
  const mapObject = root.querySelector('.v-n-pm__map-data');
  if (!mapObject) return;

  const boot = () => {
    setupPerspectiveMap(root);
    const images = gsap.utils.toArray('img', root);
    whenImagesReady(images).then(() => ScrollTrigger.refresh());
  };

  if (mapObject.contentDocument?.documentElement) {
    boot();
    return;
  }

  mapObject.addEventListener('load', boot, { once: true });

  // Fallback por si el <object> no dispara load (p. ej. algunos móviles).
  window.setTimeout(() => {
    if (root.dataset.pmReady === 'true') return;
    boot();
  }, 1200);
}

export default function perspectiveMap() {
  document.querySelectorAll('[data-perspective-map]').forEach(initPerspectiveMap);
}
