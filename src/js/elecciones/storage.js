/**
 * Persistencia del estado del lector en localStorage.
 * Si localStorage no está disponible (modo privado antiguo, iframe con storage bloqueado...)
 * se guarda en memoria: el test funciona, pero no sobrevive a una recarga.
 */

// 2: `enviado` -> `pendiente`, nuevo `bloqueoIp`, `resultado` sobrevive a reiniciar
// 3: preguntas reales de preguntas_29N.json (idPreg 'p1'...'p24')
export const SCHEMA = 3;
const PREFIJO = 'vocento:test-electoral';

const memoria = new Map();
let disponible = null;

export function hayLocalStorage() {
  if (disponible !== null) return disponible;
  try {
    const k = `${PREFIJO}:__prueba__`;
    globalThis.localStorage.setItem(k, '1');
    globalThis.localStorage.removeItem(k);
    disponible = true;
  } catch {
    disponible = false;
  }
  return disponible;
}

/** Una clave por edición del test y medio: vocento:test-electoral:generales-29n:elcorreo */
export const claveStorage = (testId, medio) => `${PREFIJO}:${testId}:${medio || 'sin-medio'}`;

export function leer(clave) {
  try {
    const raw = hayLocalStorage() ? globalThis.localStorage.getItem(clave) : memoria.get(clave);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // JSON corrupto o storage inaccesible: se empieza de cero
  }
}

/** Devuelve true si quedó en localStorage, false si solo quedó en memoria. */
export function escribir(clave, datos) {
  const raw = JSON.stringify(datos);
  try {
    if (hayLocalStorage()) {
      globalThis.localStorage.setItem(clave, raw);
      return true;
    }
  } catch {
    /* cuota llena u otro error: caemos a memoria */
  }
  memoria.set(clave, raw);
  return false;
}

export function borrar(clave) {
  memoria.delete(clave);
  try {
    if (hayLocalStorage()) globalThis.localStorage.removeItem(clave);
  } catch {
    /* nada */
  }
}

/**
 * Forma del estado guardado.
 *  actual            índice (0-based) de la pregunta en la que está el lector
 *  respuestasUser    [{ idPreg, idResp, valor }]
 *  intentos          veces que ha COMPLETADO el test (máx. CONFIG.MAX_INTENTOS)
 *  completado        el intento actual está terminado
 *  resultado         { x, y, fecha } del ÚLTIMO resultado aceptado por la API (sin historial).
 *                    No se borra al empezar de nuevo: es lo que se pinta si la IP queda bloqueada.
 *  pendiente         { x, y, fecha } del intento recién terminado cuyo POST aún no se ha confirmado
 *                    (red caída, pestaña cerrada...). Se reintenta en la siguiente visita.
 *  candidateSelected id del partido que el lector dice que votaría (o null)
 */
export function estadoInicial({ testId, medio }) {
  const ahora = new Date().toISOString();
  return {
    schema: SCHEMA,
    testId,
    medio: medio || null,
    actual: 0,
    respuestasUser: [],
    intentos: 0,
    completado: false,
    resultado: null,
    pendiente: null,
    candidateSelected: null,
    creado: ahora,
    actualizado: ahora,
  };
}
