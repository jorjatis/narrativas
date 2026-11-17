// Logos de la imagen de "Compartir mi resultado".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOGOS_MEDIOS, logoDelMedio } from '../src/js/elecciones/logos.js';
import { ALLOWED_MEDIAS, NOMBRES_MEDIOS } from '../src/js/elecciones/config.js';

test('logos: cada logo es un medio permitido y tiene viewBox y trazado', () => {
  for (const [id, logo] of Object.entries(LOGOS_MEDIOS)) {
    assert.ok(ALLOWED_MEDIAS.includes(id), `${id} no está en ALLOWED_MEDIAS`);
    assert.ok(logo.ancho > 0 && logo.alto > 0, id);
    assert.match(logo.d, /^M[\d.\s\-A-Za-z]+$/, id);
  }
});

test('logos: no hay dos medios con el mismo logo', () => {
  const trazados = Object.values(LOGOS_MEDIOS).map((l) => l.d);
  assert.equal(new Set(trazados).size, trazados.length);
});

test('logos: <svg> con width/height explícitos y dentro del ancho máximo', () => {
  const svg = logoDelMedio('elcorreo');
  assert.match(svg, /^<svg [^>]*viewBox="0 0 432 56"/);
  const ancho = Number(svg.match(/width="([\d.]+)"/)[1]);
  const alto = Number(svg.match(/height="([\d.]+)"/)[1]);
  assert.ok(ancho > 0 && alto > 0);
  assert.ok(Math.abs(ancho / alto - 432 / 56) < 0.05);
  for (const id of Object.keys(LOGOS_MEDIOS)) {
    assert.ok(Number(logoDelMedio(id).match(/width="([\d.]+)"/)[1]) <= 240, id);
  }
});

test('logos: medio sin logo -> null (sale su nombre en texto)', () => {
  assert.equal(logoDelMedio('lavozdigital'), null);
  assert.equal(logoDelMedio(undefined), null);
  for (const id of ALLOWED_MEDIAS) assert.ok(LOGOS_MEDIOS[id] || NOMBRES_MEDIOS[id], id);
});
