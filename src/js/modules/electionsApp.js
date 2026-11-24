/**
 * Une la lógica del test (src/js/elecciones) con la visual. Sustituye a los antiguos electionsMock.js y
 * mockData.js: los datos salen de src/data/elecciones/*.json y los resultados, del cálculo real y de la API
 * de coordenadas (preproducción: ver API_BASE en src/js/elecciones/config.js).
 *
 * Devuelve un objeto "app" que usan electionsTest.js (carrusel de preguntas) y electionsShare.js (compartir).
 */
import preguntasJson from '@data/elecciones/preguntas_29N.json';
import partidosJson from '@data/elecciones/partidos_29N.json';
import visualJson from '@data/elecciones/partidos-visual.json';
import candidaturasJson from '@data/elecciones/candidaturas-medios.json';
import { prepararDatos } from '../elecciones/datos';
import { crearTestElectoral } from '../elecciones/testElectoral';
import { calcularResultado } from '../elecciones/calculo';
import {
  distanciasBarras,
  limitesPlano,
  modeloMatriz,
  modeloMatrizBloqueo,
  partidoPorId,
  partidoPorSlug,
  valoresRadar,
} from '../elecciones/visual';
import { initBars } from './electionsBars';
import { initMatriz } from './electionsMatriz';
import { initRadial } from './electionsRadial';

/**
 * La pregunta de partido sale de la plantilla con todas las candidaturas (el HTML es el mismo en todos los
 * medios). Aquí se quitan las que no se presentan en el medio del lector, antes de que arranque el carrusel.
 * Los desplegables del radar y de las barras NO se tocan: ahí se puede comparar con cualquier partido.
 *   claves  claves de partido permitidas (test.candidaturas) o null = no se quita nada
 */
function podarPreguntaPartido(claves) {
  if (!claves) return;
  const slugs = new Set(claves.map((k) => visualJson[k]?.slug).filter(Boolean));
  document.querySelectorAll('.v-elec input[name="elec-p"]').forEach((input) => {
    if (!slugs.has(input.value)) (input.closest('.v-elec-test__opt') ?? input).remove();
  });
  // La nota del asterisco (p. ej. Junts sin programa) sobra si ya no queda ningún partido sin datos.
  if (!document.querySelector('.v-elec input[name="elec-p"][disabled]')) document.getElementById('elec-p-nota')?.remove();
}

const AVISO_BLOQUEO = 'Esta IP ha intentado demasiadas veces el test. No es posible hacer más.';

/** Selecciona una opción de un desplegable .v-slc como si se pulsara (así se actualizan todos sus módulos). */
function elegirEnDesplegable(select, atributo, valor) {
  const opcion = select?.querySelector(`.v-slc__a[data-${atributo}="${CSS.escape(valor)}"]`);
  if (opcion && !opcion.classList.contains('is-disabled')) opcion.click();
}

/**
 * La cabecera del medio va siempre en su variante t3. Normalmente ya lo hizo el script de arranque
 * (elections-boot.hbs) antes de pintar; esto cubre el caso de que el CMS lo hubiera quitado.
 *
 * Además se queda vigilando: en algunos medios su propio JS vuelve a poner la cabecera en t2 (p. ej. al
 * pulsar "Volver a empezar", que sube al principio de la página) o la sustituye por otra. En cuanto pasa,
 * se devuelve a t3. Al cambiarla se dispara otra vez el observador, pero ya está en t3 y no hace nada.
 */
const VARIANTE = /^v-h--t\d+$/;

function ponerT3(cabecera) {
  const otras = [...cabecera.classList].filter((c) => VARIANTE.test(c) && c !== 'v-h--t3');
  if (otras.length) cabecera.classList.remove(...otras);
  if (!cabecera.classList.contains('v-h--t3')) cabecera.classList.add('v-h--t3');
}

function cabeceraT3() {
  let vigilada = null;
  const deClase = new MutationObserver(() => vigilada && ponerT3(vigilada));

  const vigilar = () => {
    const cabecera = document.querySelector('header.v-h');
    if (!cabecera) return;
    ponerT3(cabecera);
    if (cabecera === vigilada) return;
    vigilada = cabecera;
    deClase.disconnect();
    deClase.observe(cabecera, { attributes: true, attributeFilter: ['class'] });
  };

  vigilar();
  // Si el medio cambia la cabecera entera (otro <header> en su sitio), se vigila la nueva.
  const contenedor = vigilada?.parentNode;
  if (contenedor) new MutationObserver(vigilar).observe(contenedor, { childList: true });
}

export function initElecciones() {
  const shell = document.querySelector('.v-elec');
  if (!shell) return null;
  cabeceraT3();

  // test.datos: solo las candidaturas que se presentan en el medio del lector (candidaturas-medios.json).
  // Es lo que usan la afinidad, la matriz, compartir y la pregunta de partido. Radar y barras usan `todos`.
  const todos = prepararDatos(preguntasJson, partidosJson, visualJson);
  const test = crearTestElectoral({ datos: todos, candidaturas: candidaturasJson });
  const { datos } = test;
  podarPreguntaPartido(test.candidaturas);
  const { partidos, preguntas, familias } = datos;
  const limites = limitesPlano(datos.limites); // el plano de la matriz, con margen: -2,2 .. 2,2
  // Las medias por familia de TODOS los partidos no dependen del lector: se calculan una vez (radar).
  const temasPartidos = calcularResultado({ ...todos, respuestasUser: [] }).temas;

  let ultimo = null; // última respuesta de finalizar() / cargarResultados() / cargarBloqueo()
  const oyentes = new Set();
  const resultado = () => (ultimo && !ultimo.bloqueado ? ultimo.resultado : null);
  /**
   * Barras: el resultado del lector calculado con todos los partidos (el de `ultimo` solo trae los del medio).
   * Se recalcula al cambiar de partido en el desplegable; son 26 preguntas, no cuesta nada.
   */
  const resultadoTodos = () =>
    resultado() ? calcularResultado({ ...todos, respuestasUser: test.getEstado().respuestasUser }) : null;
  const visualDe = (slug) => {
    const p = partidoPorSlug(todos.partidos, slug);
    return p ? { id: p.slug, name: p.nombre, colorClass: p.colorClass } : null;
  };

  // ---------- widgets ----------

  initRadial({
    themes: familias,
    values: (serie) => valoresRadar({ resultado: resultado(), partidos: todos.partidos, familias, temasPartidos, serie }),
    name: (serie) => (serie === 'tu' ? 'Tú' : partidoPorSlug(todos.partidos, serie)?.nombre ?? serie),
    subscribe: (fn) => oyentes.add(fn),
  });

  initBars({
    chosenId: partidos[0].slug,
    party: visualDe,
    distances: (slug) => distanciasBarras({ resultado: resultadoTodos(), partidos: todos.partidos, preguntas, slug }),
    subscribe: (fn) => oyentes.add(fn),
  });

  let matriz = null;
  function pintarMatriz(modelo) {
    if (!matriz) matriz = initMatriz(modelo);
    else {
      matriz.setReaders(modelo.readers);
      matriz.update(modelo);
    }
  }

  const aviso = document.getElementById('v-elec-aviso');
  const reiniciar = document.getElementById('v-elec-restart');

  /**
   * El resultado del lector se calcula en el navegador: se pinta ya, sin esperar a la red.
   * Los puntos de los demás lectores (GET) se añaden cuando llegan, sin mover nada de sitio.
   */
  /**
   * Quita .is-booting (la visual oculta desde el script de arranque) cuando han cargado las tipografías,
   * para que no se vea el texto cambiar de fuente. Como mucho espera 1 s.
   */
  let revelada = false;
  function revelar() {
    if (revelada) return;
    revelada = true;
    const fuentes = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fuentes, new Promise((ok) => { window.setTimeout(ok, 1000); })])
      .then(() => requestAnimationFrame(() => shell.classList.remove('is-booting')));
  }

  let radarYBarrasListos = false; // ver pintar(); vuelve a false al empezar de nuevo

  function pintarLocal() {
    if (test.estaBloqueado() || !test.getEstado().completado) return;
    pintar({ ok: true, bloqueado: false, resultado: test.calcular(), otrosLectores: [], local: true });
  }

  function pintar(r) {
    revelar(); // resultados listos: la visual aparece (ver elections-boot.hbs)
    ultimo = r;
    if (!r?.ok) return r;

    shell.classList.toggle('is-blocked', Boolean(r.bloqueado));
    if (aviso) {
      aviso.hidden = !r.bloqueado;
      aviso.textContent = r.bloqueado ? AVISO_BLOQUEO : '';
    }

    if (r.bloqueado) {
      pintarMatriz(modeloMatrizBloqueo({ usuario: r.usuario, partidos, otrosLectores: r.otrosLectores, limites }));
    } else {
      pintarMatriz(modeloMatriz({ resultado: r.resultado, partidos, otrosLectores: r.otrosLectores, limites }));
      // Radar y barras solo se preparan la primera vez que se pinta este resultado. El resultado se pinta dos
      // veces (al momento, y otra al llegar los demás lectores, que solo cambian la matriz): si se repitiera,
      // se re-animarían y devolverían los desplegables al partido elegido aunque el lector ya los hubiera cambiado.
      if (!radarYBarrasListos) {
        radarYBarrasListos = true;
        oyentes.forEach((fn) => fn()); // radar ("Tú") y barras con las respuestas del lector
        // Radar y barras empiezan comparando con el partido que eligió el lector.
        const elegido = r.resultado.candidato && partidoPorId(partidos, r.resultado.candidato.id);
        if (elegido) {
          const [, rival] = document.querySelectorAll('.v-elec-radial .v-slc');
          elegirEnDesplegable(rival, 'series', elegido.slug);
          elegirEnDesplegable(document.querySelector('.v-elec-bars .v-slc'), 'party', elegido.slug);
        }
      }
    }

    if (reiniciar) reiniciar.hidden = !test.puedeReiniciar(); // sin intentos o IP bloqueada: sin botón
    return r;
  }

  // ---------- lo que usa el carrusel del test (electionsTest.js) ----------

  return {
    test,
    datos,
    revelar,
    /** true en localhost / Netlify: muestra "Rellenar test". */
    esDesarrollo: Boolean(test.medio.dev),

    alResponder(idPreg, idResp) {
      return test.responder(idPreg, idResp);
    },

    /** El carrusel ha pasado a la pregunta `indice` (0..23): se guarda para retomar ahí. */
    alVer(indice) {
      if (indice < preguntas.length) test.irA(indice);
    },

    /** Última pregunta: el partido que cree más cercano. Termina el test, lo envía y pinta los resultados. */
    alElegirPartido(slug) {
      const partido = partidoPorSlug(partidos, slug);
      if (partido) test.setCandidato(partido.id);
      const envio = test.finalizar(); // marca el test como hecho al instante; el POST/GET va después
      pintarLocal(); // sin esperar a la red: los widgets nunca se ven vacíos ni cambian de tamaño al llegar los datos
      return envio.then(pintar);
    },

    /** "Empezar de nuevo". false si ya no se puede (10 intentos o IP bloqueada). */
    alReiniciar() {
      const ok = test.reiniciar().ok;
      if (ok) radarYBarrasListos = false; // el próximo resultado vuelve a preparar radar y barras
      return ok;
    },

    /** Cómo estaba el lector al cargar la página: para reanudar o enseñar su resultado. */
    estadoInicial() {
      const e = test.getEstado();
      const candidato = e.candidateSelected && partidoPorId(partidos, e.candidateSelected);
      let modo = 'nuevo';
      if (e.completado) modo = 'completado';
      else if (e.respuestasUser.length) modo = 'a-medias';
      return {
        modo,
        respuestas: e.respuestasUser.map((r) => ({ idPreg: r.idPreg, idResp: r.idResp })),
        candidato: candidato?.slug ?? null,
        actual: e.actual,
      };
    },

    /** Al volver con el test terminado o bloqueado: vuelve a pintar (y reintenta el envío pendiente). */
    mostrarGuardado() {
      pintarLocal();
      return (test.estaBloqueado() ? test.cargarBloqueo() : test.cargarResultados()).then(pintar);
    },

    /** Para compartir: el resultado del lector o null. */
    resultadoActual: resultado,
  };
}
