/**
 * Envío y lectura de coordenadas.
 *   POST {API_BASE}           body: { id_medio, coordenadas_xy: { x, y } }
 *   GET  {API_BASE}/{medio}   -> coordenadas del resto de lectores de ese medio
 */
import { CONFIG } from './config.js';
import { esMedioPermitido } from './medio.js';
import { redondear } from './calculo.js';

export class ApiError extends Error {
  constructor(codigo, mensaje, status = null) {
    super(mensaje || codigo);
    this.name = 'ApiError';
    // MEDIO_NO_PERMITIDO | COORDENADAS_NO_VALIDAS | TIMEOUT | RED | RESPUESTA_NO_VALIDA
    // PETICION_NO_VALIDA (400) | MEDIO_NO_ENCONTRADO (404) | LIMITE_PETICIONES (429) | HTTP (resto)
    this.codigo = codigo;
    this.status = status;
  }
}

// Hasta dónde puede llegar un punto en cada eje (sale de los datos: ver limites en datos.js).
const LIMITES_POR_DEFECTO = Object.freeze({ x: 2, y: 2 });
const dentro = (n, limite) => Number.isFinite(n) && Math.abs(n) <= limite + 1e-9;
const esPunto = (x, y, limites) => dentro(x, limites.x) && dentro(y, limites.y);

function comprobarMedio(medio) {
  if (!esMedioPermitido(medio)) throw new ApiError('MEDIO_NO_PERMITIDO', `Medio no permitido: ${medio}`);
}

function comprobarPunto({ x, y } = {}, limites = LIMITES_POR_DEFECTO) {
  if (!esPunto(x, y, limites)) {
    throw new ApiError('COORDENADAS_NO_VALIDAS', `Coordenadas fuera de rango: (${x}, ${y})`);
  }
  // Se envía con pocos decimales: el backend agrupa por punto exacto (weight).
  return { x: redondear(x, CONFIG.DECIMALES_ENVIO), y: redondear(y, CONFIG.DECIMALES_ENVIO) };
}

/**
 * Respuesta del GET:
 *   { id_medio, total_votes, points: [{ x, y, weight }] }
 * El backend ya agrupa los votos que caen en el mismo punto (weight = nº de lectores ahí).
 * Por si cambia, también se aceptan listas sueltas [{x,y}] / [{coordenadas_xy:{x,y}}] (peso 1).
 *
 * Devuelve { total, puntos: [{ x, y, peso }], descartados }:
 *  - puntos fusionados por coordenada (si llegan duplicados se suman los pesos)
 *  - descartados: puntos que no son números o caen fuera del plano (LIMITES de datos.js)
 *  - total: total_votes del backend; si no viene, la suma de pesos válidos
 */
export function normalizarPuntos(json, limites = LIMITES_POR_DEFECTO) {
  const lista = Array.isArray(json)
    ? json
    : json?.points ?? json?.data ?? json?.coordenadas ?? json?.items ?? json?.results ?? [];
  if (!Array.isArray(lista)) return { total: 0, puntos: [], descartados: 0 };

  const porPunto = new Map();
  let descartados = 0;
  for (const item of lista) {
    let c = item?.coordenadas_xy ?? item?.coordenadas ?? item;
    if (typeof c === 'string') {
      try {
        c = JSON.parse(c);
      } catch {
        descartados++;
        continue;
      }
    }
    const x = Number(c?.x);
    const y = Number(c?.y);
    const peso = item?.weight === undefined ? 1 : Math.floor(Number(item.weight));
    if (!esPunto(x, y, limites) || !(peso > 0)) {
      descartados++;
      continue;
    }
    const clave = `${x}|${y}`;
    const previo = porPunto.get(clave);
    if (previo) previo.peso += peso;
    else porPunto.set(clave, { x, y, peso });
  }

  const puntos = [...porPunto.values()];
  const sumaPesos = puntos.reduce((n, p) => n + p.peso, 0);
  const totalBackend = Number(json?.total_votes);
  return { total: Number.isFinite(totalBackend) ? totalBackend : sumaPesos, puntos, descartados };
}

/** Si hay demasiados puntos para pintar, se quedan los n con más lectores. */
export function limitarPuntos(puntos, n = CONFIG.MAX_PUNTOS_LECTORES) {
  if (puntos.length <= n) return puntos;
  return puntos.slice().sort((a, b) => b.peso - a.peso).slice(0, n);
}

/** Códigos documentados por el backend (Confluence: "Encuesta electoral - Matriz de datos"). */
const CODIGOS_HTTP = { 400: 'PETICION_NO_VALIDA', 404: 'MEDIO_NO_ENCONTRADO', 429: 'LIMITE_PETICIONES' };

export function crearApi({
  baseUrl = CONFIG.API_BASE,
  timeoutMs = CONFIG.API_TIMEOUT_MS,
  fetchImpl = (...args) => globalThis.fetch(...args),
  limites = LIMITES_POR_DEFECTO,
} = {}) {
  async function peticion(url, opciones = {}) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
    let res;
    try {
      res = await fetchImpl(url, { ...opciones, signal: controlador.signal });
    } catch (err) {
      if (err?.name === 'AbortError') throw new ApiError('TIMEOUT', `Sin respuesta en ${timeoutMs} ms`);
      throw new ApiError('RED', err?.message || 'Error de red');
    } finally {
      clearTimeout(temporizador);
    }
    const texto = await res.text();
    if (!res.ok) {
      let detalle = '';
      try {
        detalle = JSON.parse(texto)?.error ?? '';
      } catch {
        /* cuerpo no JSON */
      }
      const codigo = CONFIG.PATRON_LIMITE_IP.test(detalle) ? 'LIMITE_PETICIONES' : CODIGOS_HTTP[res.status] ?? 'HTTP';
      throw new ApiError(codigo, `HTTP ${res.status}${detalle ? `: ${detalle}` : ''}`, res.status);
    }
    if (!texto) return null;
    try {
      return JSON.parse(texto);
    } catch {
      throw new ApiError('RESPUESTA_NO_VALIDA', 'La respuesta no es JSON', res.status);
    }
  }

  return {
    async enviarCoordenadas(medio, punto) {
      comprobarMedio(medio);
      const coordenadas_xy = comprobarPunto(punto, limites);
      return peticion(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id_medio: medio, coordenadas_xy }),
      });
    },

    async obtenerCoordenadas(medio) {
      comprobarMedio(medio);
      const json = await peticion(`${baseUrl}/${encodeURIComponent(medio)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      return normalizarPuntos(json, limites);
    },
  };
}
