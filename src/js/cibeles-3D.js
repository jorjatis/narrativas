import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const MODEL_URL = '/assets/images/cibeleslimpia-v1.glb';
const DRACO_DECODER_PATH = '/js/vendors/three/draco/';

const ENABLE_DEBUG_GUI = true;
const SCENE_SETTINGS = {
  initialMargin: 0.16,
  modelRotation: 157,
  targetHeight: 0.49,
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
  let debugGui = null;
  let isDisposed = false;

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
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    updateCameraFraming();
  }

  function render() {
    frameId = null;
    if (!isVisible) return;

    controls.update();
    renderer.render(scene, camera);
  }

  function requestRender() {
    if (frameId === null && isVisible) frameId = requestAnimationFrame(render);
  }

  controls.addEventListener('change', requestRender);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) {
      requestRender();
    } else if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
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
    controls.removeEventListener('change', requestRender);
    controls.dispose();
    dracoLoader.dispose();
    debugGui?.destroy();
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
