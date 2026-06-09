// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';

// NOTE: Utils
import modal from './utils/modal.js'; 

// NOTE: Modules
import initSagradaFamilia from './modules/sagrada-familia-controller.js';
import { initSagradaFamilia3D } from './modules/sagrada-familia-three.js';
import sagradaFamiliaData from './modules/sagrada-familia-data.json';

export function initAll() {
  fadeOnScroll('.scr-ind');

  modal();

  initSagradaFamilia(sagradaFamiliaData);

  initSagradaFamilia3D('#sf-3d-canvas', 'sagrada-familia-final-3d.glb');
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);