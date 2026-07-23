import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const MODEL_URL = '/assets/images/cibeles3D.glb';
const DRACO_DECODER_PATH = '/js/vendors/three/draco/';

// Sustituye estos textos e imágenes por el contenido definitivo.
const HOTSPOT_CONTENT = {
  h_losa: { title: 'La losa' },
  h__losa: { title: 'La losa' },
  h_boca: { title: 'La boca' },
  h_dragon: { title: 'El dragón' },
  h_hocico_leon: { title: 'El hocico del león' },
  h_llave: { title: 'La llave' },
  h_mano_llave: { title: 'La mano con llave' },
  h_mano_sin_llave: { title: 'La mano sin llave' },
  h_mano_sin_llave001: { title: 'La otra mano' },
  h_oso: { title: 'El oso' },
  h_pata_apoyo: { title: 'La pata de apoyo' },
  h_pata_apoyo_leon: { title: 'La pata del león' },
  h_soporte: { title: 'El soporte' },
};
const DEFAULT_HOTSPOT_IMAGE = '/assets/images/statue-01.webp';
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

function getCameraDirection() {
  return new THREE.Vector3(
    SCENE_SETTINGS.cameraX,
    SCENE_SETTINGS.cameraY,
    SCENE_SETTINGS.cameraZ,
  ).normalize();
}

function getFitDistance(camera, box, target) {
  const cameraDirection = getCameraDirection();
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

  return distance * SCENE_SETTINGS.initialMargin;
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
  container.append(renderer.domElement);

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
  // #region agent log
  let dbgLastReport = 0;
  let dbgDomWrites = 0;
  let dbgFrames = 0;
  // #endregion
  const hotspots = [];
  const hotspotScreenPosition = new THREE.Vector3();
  const cameraLookDirection = new THREE.Vector3();
  const cameraHorizontal = new THREE.Vector3();
  const BEHIND_DOT_THRESHOLD = 0.15;

  function getHotspotLabel(name) {
    return name
      .replace(/^h_/, '')
      .replace(/\.\d+$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

    const content = HOTSPOT_CONTENT[name] || {};
    const title = content.title || getHotspotLabel(name);

    if (popupTitle) popupTitle.textContent = title;
    if (popupText) popupText.textContent = content.text || DEFAULT_HOTSPOT_TEXT;
    if (popupImage) {
      popupImage.src = content.image || DEFAULT_HOTSPOT_IMAGE;
      popupImage.alt = `Imagen de ${title.toLowerCase()}`;
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
      button.addEventListener('click', () => openPopup(object.name, button));

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
        // transform directo evita invalidar cascada de custom properties
        button.style.transform = `translate3d(${roundedX}px, ${roundedY}px, 0) translate(-50%, -50%)`;
        // #region agent log
        dbgDomWrites += 1;
        // #endregion
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

    const cameraDirection = getCameraDirection();
    const initialDistance = getFitDistance(camera, modelBox, controls.target);
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

    modelPivot.rotation.y = THREE.MathUtils.degToRad(
      SCENE_SETTINGS.modelRotation,
    );
    modelPivot.updateMatrixWorld(true);
    modelBox = new THREE.Box3().setFromObject(modelPivot);

    const size = modelBox.getSize(new THREE.Vector3());
    controls.target.set(0, size.y * SCENE_SETTINGS.targetHeight, 0);
    updateCameraFraming();
    cacheHotspotWorldPositions();
  }

  function resize() {
    // #region agent log
    const resizeStart = performance.now();
    // #endregion
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    // Evita trabajo y reflow si el tamaño no cambió realmente.
    if (width === containerWidth && height === containerHeight) {
      // #region agent log
      fetch('http://127.0.0.1:7310/ingest/6b5ec826-93b4-42a5-9673-2b6c14ff0bd6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a4b4c2'},body:JSON.stringify({sessionId:'a4b4c2',runId:'post-fix',hypothesisId:'C',location:'cibeles-3D.js:resize',message:'resize skipped',data:{ms:+(performance.now()-resizeStart).toFixed(2),w:width,h:height},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return;
    }

    containerWidth = width;
    containerHeight = height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    // No resetear el encuadre/cámara aquí: solo adaptar el viewport.
    requestRender();
    // #region agent log
    fetch('http://127.0.0.1:7310/ingest/6b5ec826-93b4-42a5-9673-2b6c14ff0bd6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a4b4c2'},body:JSON.stringify({sessionId:'a4b4c2',runId:'post-fix',hypothesisId:'C',location:'cibeles-3D.js:resize',message:'resize applied',data:{ms:+(performance.now()-resizeStart).toFixed(2),w:width,h:height},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }

  function render() {
    updateHotspotPositions();
    renderer.render(scene, camera);
    // #region agent log
    dbgFrames += 1;
    const now = performance.now();
    if (now - dbgLastReport > 500) {
      fetch('http://127.0.0.1:7310/ingest/6b5ec826-93b4-42a5-9673-2b6c14ff0bd6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a4b4c2'},body:JSON.stringify({sessionId:'a4b4c2',runId:'post-fix',hypothesisId:'A',location:'cibeles-3D.js:render',message:'render batch',data:{frames:dbgFrames,domWrites:dbgDomWrites},timestamp:Date.now()})}).catch(()=>{});
      dbgFrames = 0;
      dbgDomWrites = 0;
      dbgLastReport = now;
    }
    // #endregion
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
