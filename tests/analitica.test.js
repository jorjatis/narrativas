// Analítica (plan "Etiquetado Narrativas"): formato de AEP_customName y llamada a _satellite.track.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIRECT_CALLS, pasoConCeros, payloadNarrativa, trackNarrativa } from '../src/js/elecciones/analitica.js';

test('ANALITICA: el paso siempre lleva 2 dígitos', () => {
  assert.equal(pasoConCeros(0), '00');
  assert.equal(pasoConCeros(5), '05');
  assert.equal(pasoConCeros(24), '24');
  assert.equal(pasoConCeros(undefined), '00');
});

test('ANALITICA: payloads como los ejemplos del plan', () => {
  assert.equal(payloadNarrativa('iniciar', 0), '29n-elecciones|iniciar|00|');
  assert.equal(payloadNarrativa('paso', 4), '29n-elecciones|paso|04|');
  assert.equal(payloadNarrativa('compartir', 25, 'Vox'), '29n-elecciones|compartir|25|Vox');
  assert.equal(payloadNarrativa('reiniciar', 26), '29n-elecciones|reiniciar|26|');
});

test('ANALITICA: un "|" en un valor dinámico se cambia por "-"', () => {
  assert.equal(payloadNarrativa('compartir', 25, 'Sumar|Podemos'), '29n-elecciones|compartir|25|Sumar-Podemos');
});

test('ANALITICA: llama a _satellite.track con el Direct Call y el evento "narrativa"', () => {
  const llamadas = [];
  const satellite = { track: (...args) => llamadas.push(args) };
  trackNarrativa('paso', 7, '', satellite);
  assert.deepEqual(llamadas, [
    [DIRECT_CALLS.paso, { AEP_eventName: 'narrativa', AEP_customName: '29n-elecciones|paso|07|' }],
  ]);
  assert.equal(DIRECT_CALLS.paso, 'pasoNarrativa');
});

test('ANALITICA: sin _satellite, o si falla, no rompe nada', () => {
  assert.equal(trackNarrativa('paso', 1, '', undefined), null);
  assert.equal(trackNarrativa('paso', 1, '', { track: () => { throw new Error('x'); } }), null);
  assert.equal(trackNarrativa('accion-que-no-existe', 1, '', { track: () => {} }), null);
});
