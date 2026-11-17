// Lo que se guarda en localStorage: reanudar, intentos, último resultado, datos corruptos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { almacen, nuevo, contestarTodo, comoPartido } from './ayuda.js';

test('reanudar: si sale en la pregunta 3, vuelve a la 3 con lo que contestó', () => {
  const a = nuevo();
  a.responder('p1', 4);
  a.siguiente();
  a.responder('p2', 2);
  a.siguiente();
  const b = nuevo(); // "recarga la página"
  assert.equal(b.preguntaActual().indice, 2);
  assert.equal(b.preguntaActual().pregunta.id, 'p3');
  assert.equal(b.respuestaDe('p1').idResp, 4);
  assert.equal(b.respuestaDe('p2').valor, -1);
  assert.equal(b.siguiente().ok, false); // no puede saltarse la 3 sin contestar
});

test('Neutro se puede marcar en todas y el test se envía', async () => {
  const t = nuevo();
  contestarTodo(t, 0);
  assert.ok(t.preguntaActual().opciones.every((o) => !o.deshabilitada));
  const r = await t.finalizar();
  assert.equal(r.ok, true);
  assert.deepEqual([t.getEstado().resultado.x, t.getEstado().resultado.y], [0, 0]);
});

test('no se puede terminar con preguntas sin contestar', async () => {
  const t = nuevo();
  t.responder('p1', 5);
  const r = await t.finalizar();
  assert.equal(r.error, 'FALTAN_RESPUESTAS');
});

test('10 intentos como máximo, y sin botón "Inténtalo otra vez" al llegar', async () => {
  const t = nuevo();
  for (let i = 1; i <= 10; i++) {
    contestarTodo(t, 1);
    assert.equal((await t.finalizar()).ok, true);
    assert.equal(t.getEstado().intentos, i);
    if (i < 10) assert.equal(t.reiniciar().ok, true);
  }
  assert.equal(t.intentosRestantes(), 0);
  assert.equal(t.puedeReiniciar(), false);
  assert.equal(t.reiniciar().error, 'MAX_INTENTOS');
  assert.equal(nuevo().reiniciar().error, 'MAX_INTENTOS'); // también tras recargar
});

test('solo se guarda el último resultado (sin historial), y se limpia lo que sobre', async () => {
  const t = nuevo();
  contestarTodo(t, comoPartido('PSOE'));
  await t.finalizar();
  t.reiniciar();
  contestarTodo(t, comoPartido('PNV'));
  await t.finalizar();
  const guardado = JSON.parse(almacen.get(t.clave));
  assert.deepEqual([guardado.resultado.x, guardado.resultado.y], [0.185, -0.469]); // el de PNV, el último
  assert.equal(guardado.intentos, 2);
  assert.equal('historial' in guardado, false);

  almacen.set(t.clave, JSON.stringify({ ...guardado, historial: [{ x: 1, y: 1 }], basura: 1 }));
  nuevo();
  const limpio = JSON.parse(almacen.get(t.clave));
  assert.equal('historial' in limpio, false);
  assert.equal('basura' in limpio, false);
  assert.deepEqual(limpio.resultado, guardado.resultado);
});

test('localStorage manipulado o corrupto no rompe nada', () => {
  const t = nuevo();
  almacen.set(t.clave, '{no es json');
  assert.equal(nuevo().getEstado().intentos, 0);
  almacen.set(
    t.clave,
    JSON.stringify({
      schema: 3,
      testId: 'generales-29n',
      intentos: 999,
      actual: 50,
      completado: true,
      respuestasUser: [{ idPreg: 'p1', idResp: 9 }, { idPreg: 'p99', idResp: 2 }, { idPreg: 'p2', idResp: '5', valor: -2 }],
    }),
  );
  const e = nuevo().getEstado();
  assert.equal(e.intentos, 10); // recortado al máximo
  assert.equal(e.completado, false); // le faltan preguntas
  assert.deepEqual(e.respuestasUser, [{ idPreg: 'p2', idResp: 5, valor: 2 }]); // el valor sale de idResp, no del guardado
  assert.equal(e.actual, 0); // vuelve a la primera sin contestar
});

test('datos de una versión anterior del test se descartan', () => {
  const t = nuevo();
  almacen.set(t.clave, JSON.stringify({ schema: 2, testId: 'generales-29n', intentos: 5, respuestasUser: [{ idPreg: 0, idResp: 4 }] }));
  assert.equal(nuevo().getEstado().intentos, 0);
});
