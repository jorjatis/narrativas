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

function createMapLabels(mapObject, plane) {
  const svgDocument = mapObject.contentDocument;
  const svg = svgDocument?.documentElement;
  const textGroup = svgDocument?.querySelector('#texto');
  const textElements = [...(textGroup?.querySelectorAll('text') || [])];
  const embeddedMap = svgDocument?.querySelector('#mapa image');
  const visibleMap = plane.querySelector('img.p3d__map');

  if (!svg || !textGroup || !textElements.length) return [];

  const embeddedMapSource = embeddedMap?.getAttributeNS(
    'http://www.w3.org/1999/xlink',
    'href',
  ) || embeddedMap?.getAttribute('href');
  if (embeddedMapSource && visibleMap) visibleMap.src = embeddedMapSource;

  const labelsLayer = document.createElement('div');
  labelsLayer.className = 'p3d__map-labels';
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

    label.className = 'p3d__map-label';
    label.style.left = `${((position.x - viewBox.x) / viewBox.width) * 100}%`;
    label.style.top = `${((position.y - viewBox.y) / viewBox.height) * 100}%`;

    getTextLines(textElement).forEach((line, index, lines) => {
      label.append(document.createTextNode(line));
      if (index < lines.length - 1) label.append(document.createElement('br'));
    });

    labelsLayer.append(label);
    return label;
  });

  textGroup.style.opacity = '0';
  plane.append(labelsLayer);
  return labels;
}

function setupPerspectiveScene(root) {
  if (root.dataset.p3dReady === 'true') return;
  root.dataset.p3dReady = 'true';

  const stage = root.querySelector('.p3d__stage');
  const plane = root.querySelector('.p3d__plane');
  const mapContent = root.querySelector('.p3d__content');
  const index = root.querySelector('.p3d__index');
  const indexItems = gsap.utils.toArray('.p3d__index-item', root);
  const indexImages = gsap.utils.toArray('.p3d__index-item img', root);
  const indexTitles = gsap.utils.toArray('.p3d__index-item span', root);
  const mapObject = root.querySelector('.p3d__map-data');
  const billboards = gsap.utils.toArray('.p3d__billboard', root);
  const shadows = gsap.utils.toArray('.p3d__shadow', root);
  const anchors = gsap.utils.toArray('.p3d__dot-anchor', root);
  const connectors = gsap.utils.toArray('[data-p3d-connector]', root);
  const caption = root.querySelector('.p3d__caption');
  const labels = createMapLabels(mapObject, mapContent);

  if (
    !stage
    || !plane
    || !mapContent
    || !index
    || !billboards.length
    || anchors.length !== 3
  ) return;

  function fitIndexInsideSafeArea() {
    root.style.removeProperty('--p3d-statue-max-height');

    const anchorCenters = anchors.map((anchor) => {
      const rect = anchor.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    const minimumGap = Math.min(
      anchorCenters[1] - anchorCenters[0],
      anchorCenters[2] - anchorCenters[1],
    );
    const titleHeight = Math.max(...indexTitles.map((title) => title.offsetHeight));
    const safeImageHeight = Math.max(40, Math.min(135, minimumGap - titleHeight - 18));

    root.style.setProperty('--p3d-statue-max-height', `${safeImageHeight}px`);
  }

  function alignIndexToAnchors() {
    const stageRect = stage.getBoundingClientRect();

    indexItems.forEach((item, itemIndex) => {
      const anchorRect = anchors[itemIndex].getBoundingClientRect();
      item.style.top = `${anchorRect.top + anchorRect.height / 2 - stageRect.top}px`;
    });
  }

  function setBillboardArrivalScales() {
    const contentScale = mapContent.getBoundingClientRect().width / mapContent.offsetWidth;
    const arrivalScales = billboards.map((billboard, itemIndex) => {
      const billboardImage = billboard.querySelector('img');
      const arrivingHeight = indexImages[itemIndex].offsetHeight * 0.72;
      return Math.max(
        0.2,
        Math.min(0.75, arrivingHeight / (billboardImage.offsetHeight * contentScale)),
      );
    });

    gsap.set(billboards, {
      scale: (itemIndex) => arrivalScales[itemIndex],
    });
  }

  function updateConnectors() {
    const stageRect = stage.getBoundingClientRect();
    const width = stageRect.width;
    const height = stageRect.height;
    const connectorsSvg = root.querySelector('.p3d__connectors');

    connectorsSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    connectors.forEach((connector, indexPosition) => {
      const image = indexItems[indexPosition]?.querySelector('img');
      const anchor = anchors[indexPosition];
      if (!image || !anchor) return;

      const imageRect = image.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const anchorCenterY = anchorRect.top + anchorRect.height / 2;
      connector.setAttribute('x1', imageRect.left - stageRect.left);
      connector.setAttribute('y1', imageRect.bottom - stageRect.top);
      connector.setAttribute(
        'x2',
        anchorRect.left + anchorRect.width / 2 - stageRect.left,
      );
      connector.setAttribute(
        'y2',
        anchorCenterY - stageRect.top,
      );
    });
  }

  const media = gsap.matchMedia();

  media.add(
    {
      desktop: '(min-width: 699px)',
      mobile: '(max-width: 698px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    ({ conditions }) => {
      const { desktop, reduceMotion } = conditions;
      if (reduceMotion) return undefined;

      const tilt = desktop ? 58 : 48;

      gsap.set(plane, {
        rotationX: 0,
        xPercent: desktop ? 0 : -42,
        yPercent: -50,
        scale: 1,
        force3D: true,
      });
      gsap.set(indexImages, {
        x: 0,
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
        scale: 0.52,
        force3D: true,
      });
      gsap.set(shadows, { autoAlpha: 0, scale: 0.35 });
      gsap.set(labels, {
        rotationX: 0,
        z: 0,
        force3D: true,
      });
      gsap.set(connectors, { autoAlpha: 1 });
      gsap.set(caption, { autoAlpha: 0, y: 10 });

      if (desktop) {
        fitIndexInsideSafeArea();
        alignIndexToAnchors();
      } else {
        root.style.removeProperty('--p3d-statue-max-height');
        indexItems.forEach((item) => {
          item.style.top = '';
        });
      }
      setBillboardArrivalScales();
      updateConnectors();

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: updateConnectors,
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * (desktop ? 4.5 : 3.2)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            if (desktop && self.progress === 0) {
              fitIndexInsideSafeArea();
              alignIndexToAnchors();
            }
            updateConnectors();
          },
        },
      });

      timeline
        .to(indexTitles, { autoAlpha: 0, duration: 0.2 }, 0.05)
        .to(
          indexImages,
          {
            x: (itemIndex, image) => {
              const imageRect = image.getBoundingClientRect();
              const anchorRect = anchors[itemIndex].getBoundingClientRect();
              return (
                anchorRect.left
                + anchorRect.width / 2
                - imageRect.left
                - imageRect.width / 2
              );
            },
            y: (itemIndex, image) => {
              const imageRect = image.getBoundingClientRect();
              const anchorRect = anchors[itemIndex].getBoundingClientRect();
              return (
                anchorRect.top
                + anchorRect.height / 2
                - imageRect.bottom
              );
            },
            scale: 0.72,
            duration: 0.34,
          },
          0.03,
        )
        .to(connectors, { autoAlpha: 0, duration: 0.16 }, 0.27)
        .set(billboards, { autoAlpha: 1 }, 0.36)
        .set(indexImages, { autoAlpha: 0 }, 0.36)
        .to(
          plane,
          {
            rotationX: tilt,
            xPercent: desktop ? -20 : -50,
            yPercent: desktop ? -72 : -61,
            scale: desktop ? 1.08 : 1.02,
            duration: 0.58,
          },
          0.36,
        )
        .to(
          billboards,
          {
            rotationX: -tilt,
            y: 0,
            z: 0,
            scale: 1,
            stagger: 0.065,
            duration: 0.4,
          },
          0.36,
        )
        .to(
          labels,
          {
            rotationX: -tilt,
            z: desktop ? 18 : 12,
            stagger: 0.012,
            duration: 0.28,
          },
          0.42,
        )
        .to(
          shadows,
          {
            autoAlpha: 0.34,
            scale: 1,
            stagger: 0.065,
            duration: 0.24,
          },
          0.44,
        )
        .to(caption, { autoAlpha: 1, y: 0, duration: 0.18 }, 0.72)
        .to({}, { duration: 0.2 });

      return () => timeline.kill();
    },
  );

  const resizeObserver = new ResizeObserver(updateConnectors);
  resizeObserver.observe(stage);
  resizeObserver.observe(plane);
  updateConnectors();
}

function initPerspectiveScene(root) {
  const mapObject = root.querySelector('.p3d__map-data');
  if (!mapObject) return;

  if (mapObject.contentDocument?.documentElement) {
    setupPerspectiveScene(root);
    return;
  }

  mapObject.addEventListener('load', () => setupPerspectiveScene(root), { once: true });
}

export default function pruebasPerspective() {
  document.querySelectorAll('[data-p3d]').forEach(initPerspectiveScene);
}
