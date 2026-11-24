// Candidaturas por medio (src/data/elecciones/candidaturas-medios.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nuevo, contestarTodo, VISUAL_JSON, PARTIDOS } from './ayuda.js';
import { ALLOWED_MEDIAS } from '../src/js/elecciones/config.js';
import { candidaturasDelMedio, filtrarDatos, validarCandidaturas } from '../src/js/elecciones/candidaturas.js';
import { textoCompartir } from '../src/js/elecciones/compartir.js';

const CANDIDATURAS = JSON.parse(readFileSync(new URL('../src/data/elecciones/candidaturas-medios.json', import.meta.url), 'utf8'));
const ids = (t) => t.datos.partidos.map((p) => p.id);

test('el diccionario cubre todos los medios y solo usa partidos del catálogo', () => {
  assert.deepEqual(validarCandidaturas(CANDIDATURAS, { medios: ALLOWED_MEDIAS, catalogo: VISUAL_JSON }), []);
});

test('ABC y Mujerhoy ven todas; un medio desconocido o sin medio, también', () => {
  for (const m of ['abc', 'mujerhoy', 'noexiste', null]) assert.equal(candidaturasDelMedio(CANDIDATURAS, m), null, m);
  const t = nuevo({ entorno: { hostname: 'www.abc.es', search: '' }, candidaturas: CANDIDATURAS });
  assert.equal(t.datos.partidos.length, PARTIDOS.length);
  assert.equal(t.candidaturas, null);
});

test('El Correo: nacionales + PNV y EH Bildu, en el orden de los datos', () => {
  const t = nuevo({ candidaturas: CANDIDATURAS }); // www.elcorreo.com
  assert.deepEqual(ids(t), ['PP', 'PSOE', 'Vox', 'PNV', 'Frente Amplio', 'Podemos', 'EH Bildu']);
  assert.ok(!t.candidaturas.includes('CC'));
});

test('lo descartado desaparece de la afinidad, el ranking y el texto de compartir', () => {
  const t = nuevo({ candidaturas: CANDIDATURAS });
  contestarTodo(t, 0); // todo "Depende": en el centro, donde sin filtro CC (-0,4 · -0,8) sería de los más cercanos
  const r = t.calcular();
  const visto = new Set([...r.partidos, ...r.ranking].map((p) => p.id));
  for (const id of ['CC', 'Compromis', 'ERC', 'BNG', 'Ara Més', 'Adelante']) assert.ok(!visto.has(id), id);
  assert.ok(!r.porPregunta.some((q) => 'CC' in q.partidos));
  assert.ok(!r.temas.some((q) => 'CC' in q.partidos));
  assert.ok(!textoCompartir({ ranking: r.ranking, nombreMedio: 'El Correo', enlace: 'x' }).includes('CC'));
});

test('no se puede elegir como candidato un partido que no se presenta en el medio', () => {
  const t = nuevo({ entorno: { hostname: 'www.canarias7.es', search: '' }, candidaturas: CANDIDATURAS });
  assert.equal(t.setCandidato('CC').ok, true);
  assert.equal(t.setCandidato('PNV').ok, false);
});

test('si el filtro dejara el test sin partidos, se enseñan todos', () => {
  const datos = { partidos: [{ id: 'PP' }] };
  assert.equal(filtrarDatos(datos, ['Nadie']), datos);
  assert.equal(filtrarDatos(datos, null), datos);
});

test('radar y barras comparan con todos: con los datos completos, CC tiene barras y radar aunque se lea en El Correo', async () => {
  const { DATOS } = await import('./ayuda.js');
  const { calcularResultado } = await import('../src/js/elecciones/calculo.js');
  const { distanciasBarras, valoresRadar } = await import('../src/js/elecciones/visual.js');
  const t = nuevo({ candidaturas: CANDIDATURAS });
  contestarTodo(t, 2);
  const todos = calcularResultado({ ...DATOS, respuestasUser: t.getEstado().respuestasUser });
  const barras = distanciasBarras({ resultado: todos, partidos: DATOS.partidos, preguntas: DATOS.preguntas, slug: 'cc' });
  assert.ok(barras.some((d) => d > 0));
  // con el resultado filtrado, CC no tendría datos
  assert.ok(distanciasBarras({ resultado: t.calcular(), partidos: DATOS.partidos, preguntas: DATOS.preguntas, slug: 'cc' }).every((d) => d === 0));
  const temas = calcularResultado({ ...DATOS, respuestasUser: [] }).temas;
  assert.ok(valoresRadar({ resultado: null, partidos: DATOS.partidos, familias: DATOS.familias, temasPartidos: temas, serie: 'cc' }).every(Number.isFinite));
});
