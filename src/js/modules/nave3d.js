// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import GUI from 'lil-gui';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

// export default function moduleNave3D() {
//   const container = document.querySelector('.nave-3d');
//   if (!container) return;

//   const canvas = container.querySelector('.nave-3d__canvas');
//   const overlay = container.querySelector('.nave-3d__overlay');

//   // -------------------
//   // SCENE
//   // -------------------
//   const scene = new THREE.Scene();

//   const camera = new THREE.PerspectiveCamera(
//     45,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     100
//   );

//   // 👉 valores buenos base
//   camera.position.set(0, 1, 4);

//   const renderer = new THREE.WebGLRenderer({
//     canvas,
//     alpha: true,
//     antialias: true
//   });

//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//   // -------------------
//   // LIGHTS
//   // -------------------
//   const light = new THREE.DirectionalLight(0xffffff, 1.2);
//   light.position.set(5, 5, 5);
//   scene.add(light);

//   const ambient = new THREE.AmbientLight(0xffffff, 0.8);
//   scene.add(ambient);

//   // -------------------
//   // CONTROLS
//   // -------------------
//   const controls = new OrbitControls(camera, canvas);
  
//   controls.mouseButtons = {
//     LEFT: THREE.MOUSE.ROTATE,
//     MIDDLE: THREE.MOUSE.DOLLY,
//     RIGHT: null
//   };
//   controls.enablePan = false;
//   controls.mouseButtons.RIGHT = null;
//   controls.enableDamping = true;

//   controls.minDistance = 2.5;
//   controls.maxDistance = 6;

//   const isMobile = window.matchMedia('(max-width: 768px)').matches;

//   if (!isMobile) {
//     controls.enableZoom = false;

//     canvas.addEventListener('wheel', (e) => {
//       if (e.shiftKey) {
//         controls.enableZoom = true;
//       } else {
//         controls.enableZoom = false;
//       }
//     });

//     canvas.addEventListener('contextmenu', (e) => {
//       e.stopPropagation();
//     });
//   }

//   canvas.addEventListener('pointerdown', (e) => {
//     if (e.button === 2) return; // botón derecho → ignorar
//   });

//   // -------------------
//   // MODEL
//   // -------------------
//   const mtlLoader = new MTLLoader();
//   let model;

//   mtlLoader.load('/assets/images/Ast11.mtl', (materials) => {
//     materials.preload();

//     const objLoader = new OBJLoader();
//     objLoader.setMaterials(materials);

//     objLoader.load('/assets/images/Ast11.obj', (object) => {
//       model = object;

//       // 👉 mismos ajustes que ya tenías
//       model.position.set(0, 0.03, 0);
//       model.scale.setScalar(0.54);
//       model.rotation.y = 0;

//       scene.add(model);

//       controls.target.set(0, 1, 0);
//       controls.update();
//     });
//   });

//   // -------------------
//   // OVERLAY FADE
//   // -------------------
//   let timeout;

//   function hideOverlay() {
//     overlay?.classList.add('hidden');
//     clearTimeout(timeout);
//   }

//   function showOverlayDelayed() {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       overlay?.classList.remove('hidden');
//     }, 2000);
//   }

//   controls.addEventListener('start', hideOverlay);
//   controls.addEventListener('end', showOverlayDelayed);
//   // -------------------
//   // LOOP
//   // -------------------
//   function animate() {
//     controls.update();
//     renderer.render(scene, camera);
//     requestAnimationFrame(animate);
//   }

//   animate();

//   // -------------------
//   // RESIZE
//   // -------------------
//   window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   });

//   // -------------------
//   // GUI
//   // -------------------
//   function initDebug(model) {
//     const gui = new GUI();

//     const params = {
//       posX: model.position.x,
//       posY: model.position.y,
//       posZ: model.position.z,
//       scale: model.scale.x,
//       rotY: model.rotation.y,
//       camZ: camera.position.z,
//       camY: camera.position.y,
//     };

//     gui.add(params, 'posX', -2, 2, 0.001).onChange(v => model.position.x = v);
//     gui.add(params, 'posY', -2, 2, 0.001).onChange(v => model.position.y = v);
//     gui.add(params, 'posZ', -2, 2, 0.001).onChange(v => model.position.z = v);

//     gui.add(params, 'scale', 0.1, 5, 0.01).onChange(v => model.scale.setScalar(v));

//     gui.add(params, 'rotY', -Math.PI, Math.PI, 0.01).onChange(v => model.rotation.y = v);

//     gui.add(params, 'camZ', 1, 10, 0.1).onChange(v => camera.position.z = v);
//     gui.add(params, 'camY', -2, 5, 0.1).onChange(v => camera.position.y = v);
//   }
// }