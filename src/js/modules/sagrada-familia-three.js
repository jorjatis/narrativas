// =======================================================
// IMPORTACIONES NATIVAS (VÍA IMPORTMAP)
// =======================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// =======================================================
// FUNCIÓN INICIALIZADORA 3D ULTRA-FLUIDA (60 FPS)
// =======================================================
export function initSagradaFamilia3D(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const BASE_PATH = 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/10/sagrada-familia/images/models/'; 

  const sceneWrapper = container.closest('[data-model]');
  const modelName = sceneWrapper ? sceneWrapper.getAttribute('data-model') : null;
  
  if (!modelName) {
    console.error('No se encontró el nombre del modelo 3D en el atributo data-model');
    return;
  }

  const modelPath = `${BASE_PATH}${modelName}`;

  const observerOptions = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.1 
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startThreeJS(); 
        observer.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  observer.observe(container);

  function startThreeJS() {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    renderer.outputColorSpace = THREE.SRGBColorSpace; 

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false; 
    controls.enablePan = false;  
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 51.5;
    controls.maxDistance = 350.0;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 30, 10);
    scene.add(dirLight);

    const hotspots = [
      {
        blenderName: 'hotspot_0',
        elementSelector: '#sf-scene-3D-hotspots .sf-btn--01',
        referenceObject: null
      },
      {
        blenderName: 'hotspot_1',
        elementSelector: '#sf-scene-3D-hotspots .sf-btn--02',
        referenceObject: null
      }
    ];

    hotspots.forEach((hotspot) => {
      const el = document.querySelector(hotspot.elementSelector);
      if (el) el.style.display = 'none';
    });

    let sagradaFamiliaModel = null;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(modelPath, (gltf) => {
      sagradaFamiliaModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(sagradaFamiliaModel);
      const center = box.getCenter(new THREE.Vector3());

      // Centramos el modelo en el origen (0, y, 0)
      sagradaFamiliaModel.position.x = -center.x;
      sagradaFamiliaModel.position.z = -center.z;
      sagradaFamiliaModel.position.y = -box.min.y;

      scene.add(sagradaFamiliaModel);

      const currentOverlay = document.querySelector('#sf-loading-overlay');
      if (currentOverlay) {
        currentOverlay.style.opacity = '0';
        setTimeout(() => {
          currentOverlay.style.display = 'none';
        }, 500); 
      }

      hotspots.forEach((hotspot) => {
        const foundObject = sagradaFamiliaModel.getObjectByName(hotspot.blenderName);
        if (foundObject) {
          hotspot.referenceObject = foundObject;
          const el = document.querySelector(hotspot.elementSelector);
          if (el) el.style.display = 'flex';
        } else {
          console.warn(`No se encontró ${hotspot.blenderName}`);
        }
      });

      camera.position.set(208.89, 161.04, -210.80);
      controls.target.set(8.51, 60.83, -3.48);
      controls.update();
    });

    // =======================================================
    // NUEVA MATEMÁTICA VEGETAL RÁPIDA (0% LAG)
    // =======================================================
    const worldPosition = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();

    function updateHotspots() {
      if (!sagradaFamiliaModel) return;

      // Obtenemos la dirección hacia donde mira la cámara
      camera.getWorldDirection(cameraDirection);

      hotspots.forEach((hotspot) => {
        const el = document.querySelector(hotspot.elementSelector);
        if (!el || !hotspot.referenceObject) return;

        // 1. Obtener posición global del hotspot
        hotspot.referenceObject.getWorldPosition(worldPosition);

        // 2. Calcular si el hotspot está en el lado opuesto (detrás del centro del modelo)
        // Usamos la posición local del objeto con respecto al centro para saber su orientación.
        // Como el modelo está centrado en X=0 y Z=0, worldPosition.x y .z nos dan su vector desde el centro.
        const vH = new THREE.Vector3(worldPosition.x, 0, worldPosition.z).normalize();
        const vC = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
        
        // Producto punto: si da mayor que 0, el hotspot y la cámara miran en direcciones similares
        // (lo que significa que el hotspot está en la cara trasera apuntando lejos de la cámara)
        const dotProduct = vH.dot(vC);
        const isBehind = dotProduct > 0.15; // Ajusta este número (0.0 a 0.3) para graduar cuándo empieza a desvanecerse

        // 3. Proyectar el punto 3D a la pantalla 2D
        worldPosition.project(camera);

        const x = (worldPosition.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-worldPosition.y * 0.5 + 0.5) * container.clientHeight;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        // 4. Cambiar opacidad de forma instantánea pero matemática sin procesar mallas
        if (isBehind || worldPosition.z > 1) {
          el.style.opacity = '0.15'; // Detrás del edificio
          el.style.pointerEvents = 'none';
        } else {
          el.style.opacity = '1'; // Delante del edificio
          el.style.pointerEvents = 'auto';
        }
      });
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      updateHotspots();
      renderer.render(scene, camera);
    }

    animate();

    const resizeObserver = new ResizeObserver(() => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    resizeObserver.observe(container);
  }
}