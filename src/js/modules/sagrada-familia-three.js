import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export function initSagradaFamilia3D(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // =======================================================
  // CONFIGURACIÓN DE LA RUTA BASE
  // Modifica esta variable con la carpeta donde guardas tus 3D
  // =======================================================
  const BASE_PATH = 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/10/sagrada-familia/images/models/'; 

  // Obtener solo el nombre del archivo desde el HTML
  const sceneWrapper = container.closest('[data-model]');
  const modelName = sceneWrapper ? sceneWrapper.getAttribute('data-model') : null;
  
  if (!modelName) {
    console.error('No se encontró el nombre del modelo 3D en el atributo data-model');
    return;
  }

  // Concatenamos la ruta base con el nombre del archivo
  const modelPath = `${BASE_PATH}${modelName}`;

  // =======================================================
  // CONFIGURACIÓN DE LAZY LOAD (Intersection Observer)
  // =======================================================
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

  // =======================================================
  // FUNCIÓN PRINCIPAL DE THREE.JS
  // =======================================================
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

      sagradaFamiliaModel.position.x = -center.x;
      sagradaFamiliaModel.position.z = -center.z;
      sagradaFamiliaModel.position.y = -box.min.y;

      scene.add(sagradaFamiliaModel);

      // Quitar el loader global de la pantalla
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
          console.log('Hotspot encontrado:', hotspot.blenderName);
        } else {
          console.warn(`No se encontró ${hotspot.blenderName}`);
        }
      });

      camera.position.set(208.89, 161.04, -210.80);
      controls.target.set(8.51, 60.83, -3.48);
      controls.update();
    });

    const worldPosition = new THREE.Vector3();

    function updateHotspots() {
      hotspots.forEach((hotspot) => {
        const el = document.querySelector(hotspot.elementSelector);
        if (!el || !hotspot.referenceObject) return;

        hotspot.referenceObject.getWorldPosition(worldPosition);
        worldPosition.project(camera);

        const x = (worldPosition.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-worldPosition.y * 0.5 + 0.5) * container.clientHeight;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        if (worldPosition.z > 1) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        } else {
          el.style.opacity = '1';
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