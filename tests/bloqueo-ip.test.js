// Límite de 150 POST/día por IP del backend: qué ve el lector cuando la API lo rechaza.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { almacen, nuevo, contestarTodo, comoPartido, crearApi, apiFalsa, PARTIDOS } from './ayuda.js';

test('429 sin resultado previo: aviso y mapa sin su punto; el intento no cuenta', async () => {
  const t = nuevo({ api: apiFalsa({ limitePost: 0 }) });
  contestarTodo(t, 1);
  const r = await t.finalizar();
  assert.equal(r.bloqueado, true);
  assert.equal(r.usuario, null); // nunca tuvo coordenada
  assert.ok(r.otrosLectores.length > 0); // el GET sí se pinta
  assert.equal(r.partidos.length, PARTIDOS.length);
  assert.deepEqual(r.partidos.find((p) => p.id === 'PP').posicion, { x: 1.78, y: 1.44 });
  assert.equal(r.partidos.find((p) => p.id === 'PP').slug, 'pp');

  assert.equal(t.getEstado().intentos, 0);
  assert.deepEqual(t.getEstado().respuestasUser, []);
  assert.equal(t.puedeReiniciar(), false); // sin botón "Inténtalo otra vez"
  assert.equal(t.reiniciar().error, 'LIMITE_IP');
  // Nada temporal en el navegador: al recargar no hay bloqueo guardado; lo vuelve a decidir el servidor.
  assert.equal(nuevo().estaBloqueado(), false);
  assert.equal(JSON.parse(almacen.get(t.clave)).bloqueoIp, undefined);
});

test('429 con resultado previo: se pinta su último resultado aceptado', async () => {
  const t = nuevo({ api: apiFalsa({ limitePost: 1 }) }); // acepta 1, luego 429
  contestarTodo(t, comoPartido('PSOE'));
  assert.equal((await t.finalizar()).bloqueado, false);
  const previo = t.getEstado().resultado;

  t.reiniciar();
  contestarTodo(t, comoPartido('Vox'));
  const r = await t.finalizar();
  assert.equal(r.bloqueado, true);
  assert.deepEqual(r.usuario, { x: previo.x, y: previo.y }); // el del PSOE, no el rechazado
  assert.equal(t.getEstado().intentos, 1);
});

test('429 al reintentar un envío pendiente de otra visita también bloquea', async () => {
  const t = nuevo({ api: apiFalsa({ fallarPost: true }) });
  contestarTodo(t, 1);
  await t.finalizar(); // falla la red: queda pendiente
  const r = await nuevo({ api: apiFalsa({ limitePost: 0 }) }).cargarResultados();
  assert.equal(r.bloqueado, true);
});

test('se reconoce el límite por el texto aunque no venga con 429', async () => {
  const error = 'Too many attempts in a short period of time. Please try again later.';
  const api = crearApi({ fetchImpl: async () => new Response(JSON.stringify({ error }), { status: 400 }) });
  await assert.rejects(api.enviarCoordenadas('elcorreo', { x: 0, y: 0 }), { codigo: 'LIMITE_PETICIONES' });
});

test('al recargar tras un 429, si el servidor sigue limitando, vuelve el aviso; si no, se envía normal', async () => {
  const t = nuevo({ api: apiFalsa({ limitePost: 0 }) });
  contestarTodo(t, 1);
  await t.finalizar();

  const otraVez = nuevo({ api: apiFalsa({ limitePost: 0 }) });
  contestarTodo(otraVez, 1);
  assert.equal((await otraVez.finalizar()).bloqueado, true);

  const yaPuede = nuevo({ api: apiFalsa() });
  contestarTodo(yaPuede, 1);
  const r = await yaPuede.finalizar();
  assert.equal(r.bloqueado, false);
  assert.equal(r.envio.ok, true);
});
