/**
 * Utilidades compartidas por los tests (este fichero no es un test: no acaba en .test.js).
 *
 *  - Node no tiene localStorage: se sustituye por un Map antes de cargar el código.
 *  - Los datos son los JSON reales de src/data/elecciones (los mismos que usa la página).
 *  - La API: el cliente real (src/js/elecciones/api.js) hablando con un backend FALSO que cumple el contrato
 *    de la documentación (POST 201 · agrupa por coordenada exacta con weight · 429 al pasar el límite).
 *    El proyecto no tiene ningún mock: esto solo existe en los tests.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beforeEach } from 'node:test';

export const almacen = new Map();
globalThis.localStorage = {
  getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
  setItem: (k, v) => almacen.set(k, String(v)),
  removeItem: (k) => almacen.delete(k),
};
beforeEach(() => almacen.clear()); // cada test empieza con el navegador "limpio"

const leer = (ruta) => JSON.parse(readFileSync(new URL(`../src/data/elecciones/${ruta}`, import.meta.url), 'utf8'));
export const PREGUNTAS_JSON = leer('preguntas_29N.json');
export const PARTIDOS_JSON = leer('partidos_29N.json');
export const VISUAL_JSON = leer('partidos-visual.json');

export const { prepararDatos } = await import('../src/js/elecciones/datos.js');
export const DATOS = prepararDatos(PREGUNTAS_JSON, PARTIDOS_JSON, VISUAL_JSON);
export const { preguntas: PREGUNTAS, partidos: PARTIDOS } = DATOS;

export const { crearTestElectoral } = await import('../src/js/elecciones/testElectoral.js');
export const { crearApi, normalizarPuntos, limitarPuntos } = await import('../src/js/elecciones/api.js');

const ERROR_429 = 'Too many attempts in a short period of time. Please try again later.';

/**
 * Backend falso con el contrato de la API de coordenadas.
 *   limitePost  POST aceptados antes de responder 429 (0 = el primero ya falla)
 *   fallarPost  responde 500 a los POST (fallo de red / servidor)
 *   semilla     puntos que ya hay en cada medio
 * Devuelve { fetchImpl, enviados } para usar con crearApi.
 */
export function backendFalso({ limitePost = Infinity, fallarPost = false, semilla = [{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: -1, y: 0.5 }] } = {}) {
  const porMedio = new Map();
  const enviados = [];
  const puntos = (medio) => {
    if (!porMedio.has(medio)) {
      const m = new Map();
      semilla.forEach((p) => votar(m, p));
      porMedio.set(medio, m);
    }
    return porMedio.get(medio);
  };
  function votar(m, { x, y }) {
    const k = `${x}|${y}`;
    if (m.has(k)) m.get(k).weight += 1;
    else m.set(k, { x, y, weight: 1 });
  }
  const json = (status, cuerpo) => new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

  async function fetchImpl(url, op = {}) {
    const ruta = new URL(url).pathname;
    if (op.method === 'POST') {
      if (fallarPost) return json(500, { error: 'Internal Server Error' });
      if (enviados.length >= limitePost) return json(429, { error: ERROR_429 });
      const body = JSON.parse(op.body);
      enviados.push(body);
      votar(puntos(body.id_medio), body.coordenadas_xy);
      return json(201, { status: 'OK' });
    }
    const medio = ruta.split('/').pop();
    const points = [...puntos(medio).values()];
    return json(200, { id_medio: medio, total_votes: points.reduce((n, p) => n + p.weight, 0), points });
  }
  return { fetchImpl, enviados };
}

/** API real del proyecto contra el backend falso. */
export const apiFalsa = (opciones) => crearApi({ fetchImpl: backendFalso(opciones).fetchImpl, limites: DATOS.limites });

/** Un lector de El Correo. Llamarlo otra vez = recargar la página (mismo localStorage). */
export const nuevo = (extra = {}) =>
  crearTestElectoral({ datos: DATOS, entorno: { hostname: 'www.elcorreo.com', search: '' }, api: apiFalsa(), ...extra });

/**
 * Contesta todas las preguntas. `valores`: lo que marca el lector en la escala de la frase (-2..2),
 * como número (el mismo en todas) o como { p1: 2, p2: -1, ... }. idResp = valor + 3 (1..5).
 */
export function contestarTodo(t, valores) {
  for (const p of PREGUNTAS) {
    const v = typeof valores === 'number' ? valores : valores[p.id];
    assert.equal(t.responder(p.id, v + 3).ok, true, `no se pudo contestar ${p.id}`);
  }
}

/** Lo que marcaría un lector que contesta a cada frase lo mismo que el partido (deshace la orientación). */
export const comoPartido = (idPartido) => Object.fromEntries(PREGUNTAS.map((p) => [p.id, p.partidos[idPartido] * p.tipo]));
