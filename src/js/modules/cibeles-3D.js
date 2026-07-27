import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const MODEL_URL = 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/cibeles3D.glb';
const DRACO_DECODER_PATH = '/js/vendors/three/draco/';

const HOTSPOT_CONTENT = {
  h__losa: {
    title: 'La losa',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-losa.webp',
    orientation: 'horizontal',
    text: 'Dentro del proceso de restauración integral de este 2026, se procederá a corregir la desviación de la fuente y el refuerzo del soporte sobre el que se asienta.',
  },
  h_dragon: {
    title: 'El dragón',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-dragon.webp',
    orientation: 'horizontal',
    text: 'No constaba en el proyecto original. Una vez cerrada la fuente al uso público, fue retirado de la fuente en 1862, junto con el oso.',
  },
  h_hocico_leon: {
    title: 'El hocico del león',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-hocico_leon.webp',
    orientation: 'vertical',
    text: 'Dañado al inicio de la Guerra Civil, por efecto de la metralla. Fue reparado al final de la contienda.',
  },
  h_llave: {
    title: 'La llave',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-llave.webp',
    orientation: 'horizontal',
    text: 'Además de la mano derecha, el 14 de abril de 1931, desaparecieron las llaves que sujeta en la mano izquierda. Se reparó antes de la Guerra Civil.',
  },
  h_mano_llave: {
    title: 'La mano con llave',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-mano_llave.webp',
    orientation: 'vertical',
    text: 'Dañada en dos ocasiones. Además de en la celebración de la victoria de España ante Suiza en 1994, en 2002, desaparece como resultado de un acto vandálico. Se sustituyó por una copia hecha en mármol de la misma cantera que la fuente original.',
  },
  h_mano_sin_llave: {
    title: 'La mano sin llave',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-mano_llave.webp',
    orientation: 'horizontal',
    text: 'El día de la proclamación de la II República la escultura de la diosa perdió su mano derecha. Se reparó antes de la Guerra Civil.',
  },
  h_oso: {
    title: 'El oso',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-oso.webp',
    orientation: 'horizontal',
    text: 'No estaba incluido en el proyecto original de Ventura Rodríguez. Años después de ser dañado por un robo, fue retirado definitivamente.',
  },
  h_pata_apoyo_leon: {
    title: 'La pata del león',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-pata_apoyo_leon.webp',
    orientation: 'vertical',
    text: 'Las esquirlas de los bombardeos de la aviación en la Guerra Civil también dañaron la pata de apoyo del león izquierdo.',
  },
  h_soporte: {
    title: 'El soporte',
    image: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-soporte.webp',
    orientation: 'horizontal',
    text: 'La restauración de 1980 se aprovechó para hacer el vaciado de la fuente para una réplica en bronce. Inaugurada por Tierno Galván, se envió a Ciudad de México en reconocimiento de la comunidad española emigrada al país.',
  },
};

const DEFAULT_HOTSPOT_IMAGE = 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/07/25/lasmilvidasdelacibeles/images/hotspot-losa.webp';
const DEFAULT_HOTSPOT_TEXT = 'Aquí irá el texto explicativo y la imagen real de esta parte de la estatua de la Cibeles.';

const ENABLE_DEBUG_GUI = false;
const SCENE_SETTINGS = {
  initialMargin: 0.28,
  modelRotation: 157,
  targetHeight: 0.39,
  cameraX: 1.35,
  cameraY: 0.72,
  cameraZ: 2.15,
  exposure: 0.8,
  ambientIntensity: 3.5,
  lightIntensity: 6.5,
  lightX: -3,
  lightY: 2.9,
  lightZ: 1.6,
};
// Solo las 3 primeras: Giro Y, Altura, Encuadre.
const SCENE_SETTINGS_MOBILE_SMALL = {
  modelRotation: 153,
  targetHeight: 0.25,
  initialMargin: 0.34,
};
const MOBILE_SMALL_MQ = '(max-width: 420px)';

function getSceneSettings() {
  if (window.matchMedia(MOBILE_SMALL_MQ).matches) {
    return { ...SCENE_SETTINGS, ...SCENE_SETTINGS_MOBILE_SMALL };
  }

  return SCENE_SETTINGS;
}

function getCameraDirection(settings = getSceneSettings()) {
  return new THREE.Vector3(
    settings.cameraX,
    settings.cameraY,
    settings.cameraZ,
  ).normalize();
}

function getFitDistance(camera, box, target, settings = getSceneSettings()) {
  const cameraDirection = getCameraDirection(settings);
  const verticalTan = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
  const horizontalTan = verticalTan * camera.aspect;
  const cameraRight = new THREE.Vector3();
  const cameraUp = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const corner = new THREE.Vector3();

  camera.position.copy(target).add(cameraDirection);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);
  cameraUp.setFromMatrixColumn(camera.matrixWorld, 1);

  let distance = 0;

  for (let x = 0; x <= 1; x += 1) {
    for (let y = 0; y <= 1; y += 1) {
      for (let z = 0; z <= 1; z += 1) {
        corner.set(
          x ? box.max.x : box.min.x,
          y ? box.max.y : box.min.y,
          z ? box.max.z : box.min.z,
        );
        offset.copy(corner).sub(target);

        const depthOffset = offset.dot(cameraDirection);
        const horizontalDistance = depthOffset
          + Math.abs(offset.dot(cameraRight)) / horizontalTan;
        const verticalDistance = depthOffset
          + Math.abs(offset.dot(cameraUp)) / verticalTan;

        distance = Math.max(distance, horizontalDistance, verticalDistance);
      }
    }
  }

  return distance * settings.initialMargin;
}

function disposeModel(model) {
  model.traverse((object) => {
    if (!object.isMesh) return;

    object.geometry?.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    materials.forEach((material) => {
      if (!material) return;
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      material.dispose();
    });
  });
}

function createCibelesScene(container) {
  if (container.dataset.cibeles3dReady === 'true') return;
  container.dataset.cibeles3dReady = 'true';
  container.setAttribute('aria-busy', 'true');

  const scene = new THREE.Scene();
  const loaderElement = container.querySelector('.v-n-c3d__loader');
  const hotspotLayer = container.querySelector('.v-n-c3d__hotspots');
  const popup = container.querySelector('.v-n-c3d__popup');
  const popupClose = popup?.querySelector('.v-n-c3d__popup-close');
  const popupTitle = popup?.querySelector('.v-n-c3d__popup-title');
  const popupText = popup?.querySelector('.v-n-c3d__popup-text');
  const popupImage = popup?.querySelector('.v-n-c3d__popup-image');
  const camera = new THREE.PerspectiveCamera(52, 1, 0.01, 10000);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = SCENE_SETTINGS.exposure;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-label', 'Modelo 3D de la fuente de Cibeles');
  // El canvas debe quedar debajo de hotspots/popup; si va al final, captura todos los clics.
  container.insertBefore(renderer.domElement, container.firstChild);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.mouseButtons.RIGHT = null;
  controls.mouseButtons.MIDDLE = null;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = null;

  const ambientLight = new THREE.HemisphereLight(
    0xddeaff,
    0x24201c,
    SCENE_SETTINGS.ambientIntensity,
  );
  const sideLight = new THREE.DirectionalLight(
    0xffffff,
    SCENE_SETTINGS.lightIntensity,
  );
  sideLight.position.set(
    SCENE_SETTINGS.lightX,
    SCENE_SETTINGS.lightY,
    SCENE_SETTINGS.lightZ,
  );
  scene.add(ambientLight, sideLight);

  let model = null;
  let modelPivot = null;
  let modelBox = null;
  let frameId = null;
  let isVisible = true;
  let isAnimating = false;
  let debugGui = null;
  let isDisposed = false;
  let activeHotspotButton = null;
  let containerWidth = 1;
  let containerHeight = 1;
  let resizeFrameId = null;
  const hotspots = [];
  const hotspotScreenPosition = new THREE.Vector3();
  const cameraLookDirection = new THREE.Vector3();
  const cameraHorizontal = new THREE.Vector3();
  const BEHIND_DOT_THRESHOLD = 0.15;

  function getHotspotLabel(name) {
    return name
      .replace(/^h_[\s_]*/, '')
      .replace(/\.\d+$/, '')
      .replace(/_/g, ' ')
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function normalizeHotspotKey(name) {
    return name
      .trim()
      .replace(/\s+/g, '_')
      .replace(/\.(\d+)$/, '$1');
  }

  function getHotspotContent(name) {
    const key = normalizeHotspotKey(name);
    return HOTSPOT_CONTENT[name]
      || HOTSPOT_CONTENT[key]
      || HOTSPOT_CONTENT[key.replace(/^h__+/, 'h_')]
      || {};
  }

  function closePopup() {
    if (!popup || popup.hidden) return;

    popup.hidden = true;
    controls.enabled = true;
    activeHotspotButton?.focus();
    activeHotspotButton = null;
  }

  function openPopup(name, button) {
    if (!popup) return;

    const content = getHotspotContent(name);
    const title = content.title || getHotspotLabel(name);

    if (popupTitle) popupTitle.textContent = title;
    if (popupText) popupText.textContent = content.text || DEFAULT_HOTSPOT_TEXT;
    if (popupImage) {
      const orientation = content.orientation === 'vertical' ? 'vertical' : 'horizontal';

      popupImage.querySelector('img').src = content.image || DEFAULT_HOTSPOT_IMAGE;
      popupImage.querySelector('img').alt = `Imagen de ${title.toLowerCase()}`;
      popupImage.classList.toggle('is-vertical', orientation === 'vertical');
      popupImage.classList.toggle('is-horizontal', orientation === 'horizontal');
    }

    activeHotspotButton = button;
    popup.hidden = false;
    controls.enabled = false;
    popupClose?.focus();
  }

  function handlePopupClick(event) {
    if (event.target === popup) closePopup();
  }

  function handlePopupKeydown(event) {
    if (event.key === 'Escape') closePopup();
  }

  function createHotspotButtons(root) {
    if (!hotspotLayer) return;

    root.traverse((object) => {
      if (!object.name.startsWith('h_')) return;

      const button = document.createElement('button');
      const label = getHotspotLabel(object.name);
      const worldPosition = new THREE.Vector3();
      const horizontalOffset = new THREE.Vector3();

      if (object.isMesh && object.geometry) {
        object.geometry.computeBoundingBox();
        if (object.geometry.boundingBox) {
          object.geometry.boundingBox.getCenter(worldPosition);
        }
      }

      button.type = 'button';
      button.className = 'v-n-c3d__hotspot';
      button.dataset.hotspot = object.name;
      button.setAttribute('aria-label', `Ver detalle: ${label}`);
      button.title = label;
      // Evita que OrbitControls interprete el gesto sobre el botón.
      button.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
      });
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openPopup(object.name, button);
      });

      hotspotLayer.append(button);
      hotspots.push({
        object,
        button,
        worldPosition,
        horizontalOffset,
        localPosition: worldPosition.clone(),
        isBehind: null,
        lastX: Number.NaN,
        lastY: Number.NaN,
      });
    });
  }

  // Las posiciones mundo solo cambian si se remueve el modelo; la cámara es la que orbita.
  function cacheHotspotWorldPositions() {
    if (!hotspots.length || !modelPivot) return;

    modelPivot.updateMatrixWorld(true);

    hotspots.forEach((hotspot) => {
      if (hotspot.object.isMesh && hotspot.localPosition) {
        hotspot.worldPosition.copy(hotspot.localPosition);
        hotspot.object.localToWorld(hotspot.worldPosition);
      } else {
        hotspot.object.getWorldPosition(hotspot.worldPosition);
      }

      hotspot.horizontalOffset.set(
        hotspot.worldPosition.x - controls.target.x,
        0,
        hotspot.worldPosition.z - controls.target.z,
      );

      if (hotspot.horizontalOffset.lengthSq() > 1e-8) {
        hotspot.horizontalOffset.normalize();
      } else {
        hotspot.horizontalOffset.set(0, 0, 0);
      }
    });
  }

  function updateHotspotPositions() {
    if (!hotspots.length) return;

    camera.getWorldDirection(cameraLookDirection);
    cameraHorizontal.set(cameraLookDirection.x, 0, cameraLookDirection.z);

    if (cameraHorizontal.lengthSq() > 0) cameraHorizontal.normalize();

    const halfWidth = containerWidth * 0.5;
    const halfHeight = containerHeight * 0.5;

    for (let index = 0; index < hotspots.length; index += 1) {
      const hotspot = hotspots[index];
      const { button, worldPosition, horizontalOffset } = hotspot;

      const isBehind = horizontalOffset.dot(cameraHorizontal) > BEHIND_DOT_THRESHOLD;

      hotspotScreenPosition.copy(worldPosition).project(camera);

      const x = (hotspotScreenPosition.x + 1) * halfWidth;
      const y = (1 - hotspotScreenPosition.y) * halfHeight;
      const roundedX = (x + 0.5) | 0;
      const roundedY = (y + 0.5) | 0;

      if (hotspot.lastX !== roundedX || hotspot.lastY !== roundedY) {
        hotspot.lastX = roundedX;
        hotspot.lastY = roundedY;
        // Posición vía CSS vars para no pelear con el scale del hover.
        button.style.setProperty('--hx', `${roundedX}px`);
        button.style.setProperty('--hy', `${roundedY}px`);
      }

      if (hotspot.isBehind !== isBehind) {
        hotspot.isBehind = isBehind;
        button.classList.toggle('v-n-c3d__hotspot--behind', isBehind);
        button.tabIndex = isBehind ? -1 : 0;
        button.setAttribute('aria-hidden', isBehind ? 'true' : 'false');
      }
    }
  }

  popupClose?.addEventListener('click', closePopup);
  popup?.addEventListener('click', handlePopupClick);
  popup?.addEventListener('keydown', handlePopupKeydown);

  function updateCameraFraming() {
    if (!modelBox) {
      requestRender();
      return;
    }

    const settings = getSceneSettings();
    const cameraDirection = getCameraDirection(settings);
    const initialDistance = getFitDistance(
      camera,
      modelBox,
      controls.target,
      settings,
    );
    const polarAngle = Math.acos(
      THREE.MathUtils.clamp(cameraDirection.y, -1, 1),
    );
    controls.minPolarAngle = polarAngle;
    controls.maxPolarAngle = polarAngle;
    camera.position.copy(controls.target).addScaledVector(
      cameraDirection,
      initialDistance,
    );
    controls.update();
    requestRender();
  }

  function updateModelFraming() {
    if (!modelPivot) return;

    const settings = getSceneSettings();
    modelPivot.rotation.y = THREE.MathUtils.degToRad(
      settings.modelRotation,
    );
    modelPivot.updateMatrixWorld(true);
    modelBox = new THREE.Box3().setFromObject(modelPivot);

    const size = modelBox.getSize(new THREE.Vector3());
    controls.target.set(0, size.y * settings.targetHeight, 0);
    updateCameraFraming();
    cacheHotspotWorldPositions();
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    if (width === containerWidth && height === containerHeight) return;

    containerWidth = width;
    containerHeight = height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    requestRender();
  }

  function render() {
    updateHotspotPositions();
    renderer.render(scene, camera);
  }

  function animate() {
    frameId = null;
    if (!isVisible) {
      isAnimating = false;
      return;
    }

    const needsMoreFrames = controls.update();
    render();

    if (needsMoreFrames) {
      frameId = requestAnimationFrame(animate);
      return;
    }

    isAnimating = false;
  }

  function requestRender() {
    if (!isVisible || isAnimating) return;
    isAnimating = true;
    frameId = requestAnimationFrame(animate);
  }

  controls.addEventListener('change', requestRender);

  const resizeObserver = new ResizeObserver(() => {
    if (resizeFrameId !== null) return;
    resizeFrameId = requestAnimationFrame(() => {
      resizeFrameId = null;
      resize();
    });
  });
  resizeObserver.observe(container);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) {
      requestRender();
    } else if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
      isAnimating = false;
    }
  });
  visibilityObserver.observe(container);

  const mobileSmallMedia = window.matchMedia(MOBILE_SMALL_MQ);
  const handleMobileSmallChange = () => {
    updateModelFraming();
  };
  mobileSmallMedia.addEventListener('change', handleMobileSmallChange);

  function setupDebugGui() {
    if (!ENABLE_DEBUG_GUI) return;

    import('lil-gui').then(({ default: GUI }) => {
      if (isDisposed) return;

      debugGui = new GUI({ title: 'Cibeles 3D' });
      const modelFolder = debugGui.addFolder('Modelo y cámara');
      const lightFolder = debugGui.addFolder('Iluminación');

      modelFolder
        .add(SCENE_SETTINGS, 'modelRotation', 150, 230, 1)
        .name('Giro Y')
        .onChange(updateModelFraming);
      modelFolder
        .add(SCENE_SETTINGS, 'targetHeight', -0.5, 0.5, 0.01)
        .name('Altura')
        .onChange(updateModelFraming);
      modelFolder
        .add(SCENE_SETTINGS, 'initialMargin', 0.15, 1.3, 0.01)
        .name('Encuadre')
        .onChange(updateCameraFraming);
      ['cameraX', 'cameraY', 'cameraZ'].forEach((property) => {
        modelFolder
          .add(SCENE_SETTINGS, property, -4, 4, 0.01)
          .name(property.replace('camera', 'Cámara '))
          .onChange(updateCameraFraming);
      });

      lightFolder
        .add(SCENE_SETTINGS, 'exposure', 0.1, 3, 0.01)
        .name('Exposición')
        .onChange((value) => {
          renderer.toneMappingExposure = value;
          requestRender();
        });
      lightFolder
        .add(SCENE_SETTINGS, 'ambientIntensity', 0, 5, 0.01)
        .name('Luz ambiente')
        .onChange((value) => {
          ambientLight.intensity = value;
          requestRender();
        });
      lightFolder
        .add(SCENE_SETTINGS, 'lightIntensity', 0, 10, 0.01)
        .name('Luz lateral')
        .onChange((value) => {
          sideLight.intensity = value;
          requestRender();
        });
      ['lightX', 'lightY', 'lightZ'].forEach((property) => {
        lightFolder
          .add(SCENE_SETTINGS, property, -10, 10, 0.1)
          .name(property.replace('light', 'Luz '))
          .onChange(() => {
            sideLight.position.set(
              SCENE_SETTINGS.lightX,
              SCENE_SETTINGS.lightY,
              SCENE_SETTINGS.lightZ,
            );
            requestRender();
          });
      });
    });
  }

  setupDebugGui();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    MODEL_URL,
    ({ scene: loadedModel }) => {
      model = loadedModel;
      modelBox = new THREE.Box3().setFromObject(model);

      const center = modelBox.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.y -= modelBox.min.y;
      model.position.z -= center.z;

      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = false;
      });

      createHotspotButtons(model);

      modelPivot = new THREE.Group();
      modelPivot.add(model);
      scene.add(modelPivot);
      updateModelFraming();
      resize();
      requestRender();
      container.setAttribute('aria-busy', 'false');
      loaderElement?.classList.add('is-hidden');
    },
    undefined,
    (error) => {
      container.dataset.cibeles3dReady = 'error';
      container.dataset.cibeles3dError = error.message;
      container.setAttribute('aria-busy', 'false');

      if (loaderElement) {
        loaderElement.textContent = 'No se ha podido cargar el 3D';
      }

      console.error('No se ha podido cargar el modelo 3D de Cibeles.', error);
    },
  );

  requestRender();

  return () => {
    isDisposed = true;
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    mobileSmallMedia.removeEventListener('change', handleMobileSmallChange);
    if (frameId !== null) cancelAnimationFrame(frameId);
    if (resizeFrameId !== null) cancelAnimationFrame(resizeFrameId);
    controls.removeEventListener('change', requestRender);
    controls.dispose();
    dracoLoader.dispose();
    debugGui?.destroy();
    popupClose?.removeEventListener('click', closePopup);
    popup?.removeEventListener('click', handlePopupClick);
    popup?.removeEventListener('keydown', handlePopupKeydown);
    hotspotLayer?.replaceChildren();
    if (model) disposeModel(model);
    renderer.dispose();
    renderer.domElement.remove();
    container.removeAttribute('aria-busy');
    delete container.dataset.cibeles3dReady;
  };
}

export default function cibeles3D() {
  return [...document.querySelectorAll('.v-n-c3d__scene')]
    .map(createCibelesScene)
    .filter(Boolean);
}
