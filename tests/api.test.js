// Medio, envío (POST) y lectura (GET) de coordenadas contra la API (aquí, un backend falso con su contrato).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nuevo, contestarTodo, comoPartido, crearTestElectoral, crearApi, normalizarPuntos, limitarPuntos, backendFalso, apiFalsa, DATOS } from './ayuda.js';
import { detectarMedio, medioDesdeHost } from '../src/js/elecciones/medio.js';
import { CONFIG } from '../src/js/elecciones/config.js';

test('detección del medio por hostname (solo los permitidos)', () => {
  assert.equal(medioDesdeHost('www.elcorreo.com'), 'elcorreo');
  assert.equal(medioDesdeHost('pre.elcorreo.com'), 'elcorreo');
  assert.equal(medioDesdeHost('www.hoy.es'), 'hoy');
  assert.equal(medioDesdeHost('www.salamancahoy.es'), 'salamancahoy');
  assert.equal(medioDesdeHost('www.abc.es'), 'abc');
  assert.equal(medioDesdeHost('abc.pirata.com'), null);
  assert.equal(medioDesdeHost('elcorreo.pirata.com'), null);
  assert.equal(medioDesdeHost('www.elcorreo.com.pirata.net'), null);
  assert.equal(detectarMedio({ hostname: 'pirata.com' }).permitido, false);
  assert.equal(detectarMedio({ hostname: 'localhost', search: '?medio=ideal' }).id, 'ideal');
  assert.equal(detectarMedio({ hostname: 'localhost', search: '?medio=pirata' }).id, 'elcorreo');
  assert.equal(detectarMedio({ hostname: 'static.cdn.com', enIframe: true, referrer: 'https://www.diariosur.es/x' }).id, 'diariosur');
});

test('desarrollo: localhost y Netlify cuentan como desarrollo (?medio= para elegir medio); un medio real, no', () => {
  assert.deepEqual(detectarMedio({ hostname: 'localhost', search: '' }), { id: 'elcorreo', permitido: true, origen: 'dev', dev: true });
  assert.equal(detectarMedio({ hostname: 'test-29n.netlify.app', search: '?medio=ideal' }).id, 'ideal');
  assert.equal(detectarMedio({ hostname: 'test-29n.netlify.app' }).dev, true);
  assert.equal(detectarMedio({ hostname: 'www.elcorreo.com', search: '?medio=ideal' }).id, 'elcorreo'); // en un medio no se cambia
  assert.equal(detectarMedio({ hostname: 'www.elcorreo.com' }).dev, false);
});

test('sin API inyectada se llama siempre a la API real (preproducción)', async () => {
  const llamadas = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, op) => (llamadas.push([url, op?.method]), new Response('{"status":"OK"}', { status: 201 }));
  try {
    const t = crearTestElectoral({ datos: DATOS, entorno: { hostname: 'localhost', search: '' } });
    contestarTodo(t, 1);
    await t.finalizar();
  } finally {
    globalThis.fetch = original;
  }
  assert.equal(CONFIG.API_BASE, 'https://pre-service-data.vocento.com/api/coordenadas');
  assert.deepEqual(llamadas[0], [CONFIG.API_BASE, 'POST']);
  assert.deepEqual(llamadas[1], [`${CONFIG.API_BASE}/elcorreo`, 'GET']);
});

test('finalizar: un solo POST aunque haya doble clic, GET con otros lectores, nada repetido al recargar', async () => {
  const backend = backendFalso();
  const api = crearApi({ fetchImpl: backend.fetchImpl, limites: DATOS.limites });
  const t = nuevo({ api });
  contestarTodo(t, comoPartido('PSOE'));
  t.suscribir((e) => e.completado && t.cargarResultados()); // la maqueta pide resultados al ver "completado"
  const [r1, r2] = await Promise.all([t.finalizar(), t.finalizar()]);
  assert.equal(r1, r2);
  assert.equal(backend.enviados.length, 1);
  assert.deepEqual(backend.enviados[0], { id_medio: 'elcorreo', coordenadas_xy: { x: -0.8, y: -1 } });
  assert.equal(r1.lectura.total, 4); // 3 que ya había + el nuestro
  assert.deepEqual(r1.otrosLectores.find((p) => p.x === 1 && p.y === 1), { x: 1, y: 1, peso: 2 }); // agrupados
  assert.equal(t.getEstado().pendiente, null); // confirmado por la API

  const r3 = await nuevo({ api }).cargarResultados(); // recarga
  assert.equal(r3.envio.yaEnviado, true);
  assert.equal(backend.enviados.length, 1);
});

test('si el POST falla por la red, se ve el resultado y se reintenta en la siguiente visita', async () => {
  const t = nuevo({ api: apiFalsa({ fallarPost: true }) });
  contestarTodo(t, 1);
  const r = await t.finalizar();
  assert.equal(r.envio.ok, false);
  assert.ok(r.resultado.usuario);
  assert.notEqual(t.getEstado().pendiente, null);
  assert.equal(t.getEstado().resultado, null); // aún no aceptado
  assert.equal((await nuevo().cargarResultados()).envio.ok, true);
});

test('medio no permitido: se puede hacer el test, pero no se envía ni se lee', async () => {
  const t = nuevo({ entorno: { hostname: 'www.pirata.com' } });
  contestarTodo(t, 1);
  const r = await t.finalizar();
  assert.equal(r.envio.omitido, true);
  assert.equal(r.otrosLectores.length, 0);
});

test('POST: formato del backend, 1 decimal, y no se envían medios ni puntos imposibles', async () => {
  const llamadas = [];
  const fetchImpl = async (url, op) => (llamadas.push([url, op]), new Response('{"status":"OK"}', { status: 201 }));
  const api = crearApi({ baseUrl: 'https://api.test/coordenadas', fetchImpl });
  await api.enviarCoordenadas('elcorreo', { x: 1.2345, y: -1.963 });
  assert.equal(llamadas[0][1].method, 'POST');
  assert.deepEqual(JSON.parse(llamadas[0][1].body), { id_medio: 'elcorreo', coordenadas_xy: { x: 1.2, y: -2 } });
  await assert.rejects(api.enviarCoordenadas('pirata', { x: 0, y: 0 }), { codigo: 'MEDIO_NO_PERMITIDO' });
  await assert.rejects(api.enviarCoordenadas('elcorreo', { x: 0, y: 2.1 }), { codigo: 'COORDENADAS_NO_VALIDAS' }); // máx. ±2
});

test('errores del backend con código propio (400, 404, 429)', async () => {
  const con = (status, cuerpo) => crearApi({ fetchImpl: async () => new Response(JSON.stringify(cuerpo), { status }) });
  await assert.rejects(con(429, { error: 'Too many attempts' }).enviarCoordenadas('elcorreo', { x: 0, y: 0 }), { codigo: 'LIMITE_PETICIONES' });
  await assert.rejects(con(400, { error: 'Payload JSON incompleto' }).enviarCoordenadas('elcorreo', { x: 0, y: 0 }), { codigo: 'PETICION_NO_VALIDA' });
  await assert.rejects(con(404, {}).obtenerCoordenadas('elcorreo'), { codigo: 'MEDIO_NO_ENCONTRADO' });
});

test('GET: se lee el formato real y se descartan puntos fuera del plano', () => {
  const r = normalizarPuntos({
    id_medio: 'elcorreo',
    total_votes: 6,
    points: [
      { x: 1, y: 0, weight: 3 },
      { x: 1.9, y: -2, weight: 1 }, // extremo pero posible
      { x: 2.2, y: -2.6, weight: 1 }, // fuera de ±2 (p. ej. votos de la escala antigua)
      { x: 3, y: 4, weight: 1 }, // fuera
    ],
  });
  assert.equal(r.total, 6);
  assert.deepEqual(r.puntos, [{ x: 1, y: 0, peso: 3 }, { x: 1.9, y: -2, peso: 1 }]);
  assert.equal(r.descartados, 2);
  assert.deepEqual(normalizarPuntos('basura'), { total: 0, puntos: [], descartados: 0 });
});

test('si hay demasiados puntos para pintar, se quedan los de más peso', () => {
  const pts = [{ x: 0, y: 0, peso: 1 }, { x: 1, y: 1, peso: 5 }, { x: 2, y: 2, peso: 3 }];
  assert.deepEqual(limitarPuntos(pts, 2).map((p) => p.peso), [5, 3]);
});
