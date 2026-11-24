// NOTE: Helpers

// NOTE: Modules
import { initElecciones } from './modules/electionsApp';
import { initElectionsMark } from './modules/electionsMark';
import { initElectionsShare } from './modules/electionsShare';
import { initElectionsTest } from './modules/electionsTest';
import { loadMoreQuestions } from './modules/loadMoreQuestions';
import { selectPartyColor } from './modules/selectPartyColor';
import { selectRivals } from './modules/selectRivals';

export function initAll() {
  initElectionsMark();
  // Datos, cálculo y API del test (sustituye a los antiguos mocks). Lo usan compartir y el carrusel.
  const app = initElecciones();
  // Los desplegables tienen que escuchar antes de initElectionsTest: si el test ya estaba hecho, este pinta el
  // resultado al instante y selecciona en radar y barras el partido elegido por el lector. Si aún no escuchasen,
  // los datos cambiarían a ese partido pero la etiqueta del desplegable se quedaría en "PP".
  selectPartyColor();
  selectRivals();
  initElectionsShare(app);
  initElectionsTest(app);
  loadMoreQuestions();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

// En local se arranca en cuanto el HTML está listo. Esperar a "load" obligaba a esperar a todo lo externo
// (scripts y CSS de Vocento, CMP, imágenes...) y el test tardaba segundos en responder.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll, { once: true });
else initAll();
