/**
 * Controlador del test: une estado (localStorage), cálculo y API.
 * No toca el DOM: la maqueta se suscribe a los cambios y llama a estos métodos.
 *
 *   const test = crearTestElectoral({ datos: prepararDatos(preguntas, partidos, visual) });
 *   test.suscribir(estado => pintar(estado));
 *   test.responder('p1', 4);                        // idPreg del JSON, idResp 1..5
 *   const { resultado, otrosLectores, lectura } = await test.finalizar();
 *   // otrosLectores: [{ x, y, peso, cuota, opacidad }]  ·  lectura.total: total_votes del medio
 */
import { CONFIG, ESCALA } from './config.js';
import { detectarMedio } from './medio.js';
import * as storage from './storage.js';
import { calcularResultado, valorDeRespuesta, redondear } from './calculo.js';
import { crearApi, limitarPuntos } from './api.js';

function leerEntorno() {
  if (typeof window === 'undefined') return {};
  let enIframe = false;
  try {
    enIframe = window.self !== window.top;
  } catch {
    enIframe = true;
  }
  return {
    hostname: window.location.hostname,
    search: window.location.search,
    referrer: document.referrer,
    enIframe,
  };
}

const clonar = (o) => JSON.parse(JSON.stringify(o));

export function crearTestElectoral({
  datos, // { preguntas, partidos, familias, limites } de prepararDatos() (obligatorio)
  testId = CONFIG.TEST_ID,
  maxIntentos = CONFIG.MAX_INTENTOS,
  medio: medioExplicito = null,
  entorno = leerEntorno(),
  api: apiInyectada = null,
} = {}) {
  const { preguntas, partidos, familias, limites } = datos;
  const indicePorId = new Map(preguntas.map((p, i) => [p.id, i]));

  if (!datos?.preguntas?.length) throw new Error('crearTestElectoral: faltan los datos (prepararDatos)');
  const medio = detectarMedio({ ...entorno, explicito: medioExplicito });
  // Siempre la API real (CONFIG.API_BASE, hoy preproducción). Los tests inyectan la suya.
  const api = apiInyectada ?? crearApi({ limites: datos.limites });

  const clave = storage.claveStorage(testId, medio.id);
  const oyentes = new Set();
  let estado = sanear(storage.leer(clave)) ?? storage.estadoInicial({ testId, medio: medio.id });
  let finalizando = null;
  let cargando = null;
  let cargandoBloqueo = null;
  guardar(false);

  // ---------- estado interno ----------

  function guardar(avisar = true) {
    estado.actualizado = new Date().toISOString();
    storage.escribir(clave, estado);
    if (avisar) {
      const copia = getEstado();
      oyentes.forEach((fn) => fn(copia));
    }
  }

  /** Limpia lo que venga de localStorage: puede ser de otra versión, estar a medias o manipulado. */
  function sanear(guardado) {
    if (!guardado || typeof guardado !== 'object') return null;
    if (guardado.schema !== storage.SCHEMA || guardado.testId !== testId) return null;

    // Solo se conservan los campos que hoy forman parte del estado: lo que sobre (p. ej. el antiguo
    // "historial" de coordenadas, o datos metidos a mano) se descarta y desaparece en el siguiente guardado.
    const base = storage.estadoInicial({ testId, medio: medio.id });
    const e = Object.fromEntries(Object.keys(base).map((k) => [k, k in guardado ? guardado[k] : base[k]]));
    e.medio = medio.id;

    // Respuestas: solo preguntas y opciones que existen hoy; el valor se recalcula desde idResp.
    const porPregunta = new Map();
    for (const r of Array.isArray(e.respuestasUser) ? e.respuestasUser : []) {
      const valor = valorDeRespuesta(r?.idResp);
      if (indicePorId.has(r?.idPreg) && valor !== null) {
        porPregunta.set(r.idPreg, { idPreg: r.idPreg, idResp: Number(r.idResp), valor });
      }
    }
    const respuestas = preguntas.filter((p) => porPregunta.has(p.id)).map((p) => porPregunta.get(p.id));
    e.respuestasUser = respuestas;

    e.intentos = Math.min(maxIntentos, Math.max(0, Math.floor(Number(e.intentos) || 0)));
    if (!partidos.some((p) => p.id === e.candidateSelected)) e.candidateSelected = null;

    const contestadas = new Set(respuestas.map((r) => r.idPreg));
    const primeraLibre = preguntas.findIndex((p) => !contestadas.has(p.id));

    const esPunto = (r) => r && typeof r === 'object' && Number.isFinite(r.x) && Number.isFinite(r.y);
    if (!esPunto(e.resultado)) e.resultado = null;
    if (!esPunto(e.pendiente)) e.pendiente = null;

    if (e.completado && primeraLibre !== -1) {
      // Cambiaron las preguntas desde que terminó: vuelve a estar a medias.
      e.completado = false;
      e.pendiente = null;
    }
    if (!e.completado) e.pendiente = null;

    // El bloqueo por IP no se guarda (lo decide el servidor en cada envío): se descarta el de versiones anteriores.
    delete e.bloqueoIp;

    // Vuelve a la pregunta donde lo dejó, sin saltarse ninguna sin contestar.
    const tope = primeraLibre === -1 ? preguntas.length - 1 : primeraLibre;
    e.actual = Math.min(Math.max(0, Math.floor(Number(e.actual) || 0)), tope);

    return e;
  }

  const contestadas = () => new Set(estado.respuestasUser.map((r) => r.idPreg));
  const primeraSinContestar = () => {
    const hechas = contestadas();
    return preguntas.findIndex((p) => !hechas.has(p.id));
  };

  // ---------- lectura ----------

  function getEstado() {
    return clonar(estado);
  }

  function respuestaDe(idPreg) {
    return estado.respuestasUser.find((r) => r.idPreg === idPreg) ?? null;
  }

  const todasContestadas = () => primeraSinContestar() === -1;
  const haHechoElTest = () => estado.intentos > 0;
  const intentosRestantes = () => Math.max(0, maxIntentos - estado.intentos);
  /**
   * La API ha respondido "demasiados intentos" (429) en esta visita: no se puede hacer (ni repetir) el test.
   * No se guarda ni caduca: lo decide el servidor. Al recargar, si el servidor sigue limitando, el siguiente
   * envío vuelve a recibir el 429 y se vuelve a enseñar el aviso.
   */
  let bloqueadoPorServidor = false;
  const estaBloqueado = () => bloqueadoPorServidor;
  /** Mostrar o no el botón "Inténtalo otra vez": quedan intentos y la IP no está bloqueada. */
  const puedeReiniciar = () => intentosRestantes() > 0 && !estaBloqueado();

  function preguntaActual() {
    const p = preguntas[estado.actual];
    return {
      indice: estado.actual,
      total: preguntas.length,
      pregunta: p,
      respuesta: respuestaDe(p.id),
      opciones: ESCALA.map((o) => ({ ...o })),
      esPrimera: estado.actual === 0,
      esUltima: estado.actual === preguntas.length - 1,
    };
  }

  // ---------- acciones ----------

  function responder(idPreg, idResp) {
    if (estado.completado) return { ok: false, error: 'TEST_COMPLETADO' };
    if (!indicePorId.has(idPreg)) return { ok: false, error: 'PREGUNTA_NO_VALIDA' };
    const valor = valorDeRespuesta(idResp);
    if (valor === null) return { ok: false, error: 'RESPUESTA_NO_VALIDA' };

    const nueva = { idPreg, idResp: Number(idResp), valor };
    const resto = estado.respuestasUser.filter((r) => r.idPreg !== idPreg);
    estado.respuestasUser = preguntas
      .map((p) => (p.id === idPreg ? nueva : resto.find((r) => r.idPreg === p.id)))
      .filter(Boolean);
    guardar();
    return { ok: true };
  }

  /** Solo deja ir a preguntas ya contestadas o a la primera pendiente. */
  function irA(indice) {
    if (estado.completado) return { ok: false, error: 'TEST_COMPLETADO' };
    const libre = primeraSinContestar();
    const tope = libre === -1 ? preguntas.length - 1 : libre;
    if (!Number.isInteger(indice) || indice < 0 || indice > tope) return { ok: false, error: 'PREGUNTA_NO_ACCESIBLE' };
    estado.actual = indice;
    guardar();
    return { ok: true };
  }

  const siguiente = () => irA(estado.actual + 1);
  const anterior = () => irA(estado.actual - 1);

  function setCandidato(idPartido) {
    if (idPartido !== null && !partidos.some((p) => p.id === idPartido)) return { ok: false, error: 'PARTIDO_NO_VALIDO' };
    estado.candidateSelected = idPartido;
    guardar();
    return { ok: true };
  }

  function calcular() {
    return calcularResultado({
      preguntas,
      partidos,
      familias,
      respuestasUser: estado.respuestasUser,
      candidato: estado.candidateSelected,
    });
  }

  /**
   * Cierra el intento: calcula, guarda (antes de tocar la red), hace POST y GET.
   * Si ya estaba completado no cuenta otro intento ni repite el POST: solo recarga resultados.
   */
  function finalizar() {
    if (finalizando) return finalizando; // doble clic
    finalizando = (async () => {
      if (!estado.completado) {
        if (estaBloqueado()) return cargarBloqueo();
        if (!todasContestadas()) return { ok: false, error: 'FALTAN_RESPUESTAS', pendiente: primeraSinContestar() };
        if (estado.intentos >= maxIntentos) return { ok: false, error: 'MAX_INTENTOS' };

        const { usuario } = calcular();
        const punto = { x: redondear(usuario.x), y: redondear(usuario.y), fecha: new Date().toISOString() };
        estado.completado = true;
        estado.intentos += 1;
        if (medio.permitido) {
          estado.pendiente = punto; // pasa a `resultado` cuando la API lo acepte
        } else {
          estado.resultado = punto; // sin medio no hay envío: el resultado es directamente el último
        }
        guardar();
      }
      return cargarResultados();
    })().finally(() => {
      finalizando = null;
    });
    return finalizando;
  }

  /**
   * Para pintar la pantalla de resultados (también al volver a la página con el test hecho).
   * Si el POST de este intento falló (red caída, cierre de pestaña...), lo reintenta una vez.
   */
  function cargarResultados() {
    // Si ya hay una carga en marcha (p. ej. la maqueta re-renderiza al guardar), se reutiliza: un solo POST.
    if (!cargando) cargando = cargarResultadosAhora().finally(() => (cargando = null));
    return cargando;
  }

  async function cargarResultadosAhora() {
    if (estaBloqueado()) return cargarBloqueo();
    if (!estado.completado) return { ok: false, error: 'TEST_NO_COMPLETADO' };
    const resultado = calcular();

    let envio;
    if (!medio.permitido) {
      envio = { ok: false, omitido: true, error: 'MEDIO_NO_PERMITIDO' };
    } else if (!estado.pendiente) {
      envio = { ok: true, yaEnviado: true };
    } else {
      try {
        await api.enviarCoordenadas(medio.id, estado.pendiente);
        estado.resultado = estado.pendiente;
        estado.pendiente = null;
        guardar();
        envio = { ok: true };
      } catch (err) {
        if (err.codigo === 'LIMITE_PETICIONES') {
          bloquearPorIp();
          return cargarBloqueo();
        }
        // Otro fallo (red, 5xx...): se enseña el resultado igualmente y se reintenta en la próxima visita.
        envio = { ok: false, error: err.codigo || 'ERROR', detalle: err.message };
      }
    }

    const { otrosLectores, lectura } = await leerOtrosLectores();
    return { ok: true, bloqueado: false, resultado, otrosLectores, envio, lectura };
  }

  async function leerOtrosLectores() {
    if (!medio.permitido) return { otrosLectores: [], lectura: { ok: false, omitido: true } };
    try {
      const { total, puntos, descartados } = await api.obtenerCoordenadas(medio.id);
      // [{ x, y, peso }]: la matriz pinta la intensidad de cada punto según su peso
      return {
        otrosLectores: limitarPuntos(puntos),
        lectura: { ok: true, total, puntos: puntos.length, descartados },
      };
    } catch (err) {
      return { otrosLectores: [], lectura: { ok: false, error: err.codigo || 'ERROR', detalle: err.message } };
    }
  }

  /**
   * La API ha rechazado el envío por límite de IP. Ese intento no ha quedado registrado:
   * se descarta (no cuenta como intento) y se conserva el último resultado aceptado, si lo hay.
   */
  function bloquearPorIp() {
    bloqueadoPorServidor = true;
    estado.intentos = Math.max(0, estado.intentos - 1);
    estado.pendiente = null;
    estado.completado = false;
    estado.respuestasUser = [];
    estado.actual = 0;
    guardar();
  }

  /**
   * Datos para la vista de bloqueo ("Esta IP ha intentado demasiadas veces el test"):
   *  - usuario: su último resultado guardado { x, y } o null si nunca tuvo uno (entonces se pinta sin su punto)
   *  - partidos: posición fija de cada partido (partidos_29N.json)
   *  - otrosLectores / lectura: el GET del medio (si también falla, el plano sale sin lectores)
   */
  function cargarBloqueo() {
    if (!cargandoBloqueo) {
      cargandoBloqueo = (async () => {
        const { otrosLectores, lectura } = await leerOtrosLectores();
        return {
          ok: true,
          bloqueado: true,
          error: 'LIMITE_IP',
          usuario: estado.resultado ? { x: estado.resultado.x, y: estado.resultado.y } : null,
          partidos: partidos.map(({ id, slug, nombre, colorClass, x, y }) => ({ id, slug, nombre, colorClass, x, y, posicion: { x, y } })),
          otrosLectores,
          lectura,
        };
      })().finally(() => (cargandoBloqueo = null));
    }
    return cargandoBloqueo;
  }

  /**
   * "Inténtalo otra vez": borra las respuestas del intento actual (el último `resultado` se conserva).
   * No se puede al llegar a maxIntentos ni con la IP bloqueada.
   */
  function reiniciar() {
    if (estaBloqueado()) return { ok: false, error: 'LIMITE_IP' };
    if (intentosRestantes() <= 0) return { ok: false, error: 'MAX_INTENTOS' };
    estado.actual = 0;
    estado.respuestasUser = [];
    estado.completado = false;
    estado.pendiente = null;
    guardar();
    return { ok: true };
  }

  /** Solo para desarrollo: borra todo rastro del lector para este test y medio. */
  function borrarDatos() {
    storage.borrar(clave);
    estado = storage.estadoInicial({ testId, medio: medio.id });
    guardar();
  }

  function suscribir(fn) {
    oyentes.add(fn);
    return () => oyentes.delete(fn);
  }

  return {
    medio,
    clave,
    preguntas,
    partidos: partidos.map(({ id, slug, nombre, titulo, colorClass }) => ({ id, slug, nombre, titulo, colorClass })),
    familias,
    limites, // { x, y }: hasta dónde llega cada eje, para escalar el plano
    // lectura
    getEstado,
    preguntaActual,
    respuestaDe,
    todasContestadas,
    haHechoElTest,
    intentosRestantes,
    puedeReiniciar,
    estaBloqueado,
    calcular,
    // acciones
    responder,
    irA,
    siguiente,
    anterior,
    setCandidato,
    finalizar,
    cargarResultados,
    cargarBloqueo,
    reiniciar,
    borrarDatos,
    suscribir,
  };
}
