// Adaptadores entre el cálculo y los módulos de la visual (matriz, radar, barras): src/js/elecciones/visual.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DATOS, PARTIDOS, PREGUNTAS, VISUAL_JSON, nuevo, contestarTodo, comoPartido, prepararDatos, PREGUNTAS_JSON, PARTIDOS_JSON } from './ayuda.js';
import { calcularResultado } from '../src/js/elecciones/calculo.js';
import {
  aEscala100,
  distanciasBarras,
  limitesPlano,
  modeloMatriz,
  modeloMatrizBloqueo,
  partidoPorSlug,
  valoresRadar,
} from '../src/js/elecciones/visual.js';

const { limites, familias } = DATOS;
const temasPartidos = calcularResultado({ ...DATOS, respuestasUser: [] }).temas;

function resultadoComo(idPartido, candidato = null) {
  const t = nuevo();
  contestarTodo(t, comoPartido(idPartido));
  if (candidato) t.setCandidato(candidato);
  return t.calcular();
}

test('escala de la matriz: -2 -> 0, 0 -> 50, 2 -> 100 (y nunca se sale)', () => {
  assert.equal(aEscala100(-2), 0);
  assert.equal(aEscala100(0), 50);
  assert.equal(aEscala100(2), 100);
  assert.equal(aEscala100(1), 75);
  assert.equal(aEscala100(3), 100);
  assert.equal(aEscala100(-9), 0);
});

test('el plano se pinta con margen: de -2,2 a 2,2, y Vox ya no queda pegado al borde', () => {
  const plano = limitesPlano(limites);
  assert.deepEqual(plano, { x: 2.2, y: 2.2 });
  const m = modeloMatriz({ resultado: resultadoComo('Vox'), partidos: PARTIDOS, limites: plano });
  const vox = m.parties.find((p) => p.id === 'vox');
  // Vox tiene y = 2 (el máximo): con el margen se queda en 95,45 y no en el borde (100)
  const tope = aEscala100(2, 2.2) + 1e-9;
  assert.ok(vox.economic <= tope && vox.social <= tope, `Vox en (${vox.economic}, ${vox.social})`);
  assert.equal(aEscala100(0, 2.2), 50);
  assert.ok(Math.abs(aEscala100(2, 2.2) - 95.4545) < 1e-3);
});

test('matriz: "Tú", partidos con su slug y color, el más cercano y el elegido con su %', () => {
  const resultado = resultadoComo('Vox', 'PP');
  const m = modeloMatriz({ resultado, partidos: PARTIDOS, otrosLectores: [], limites });
  // Vox en partidos_29N.json: (1.667, 2)  ->  economic 91.67, social 100
  assert.ok(Math.abs(m.you.economic - aEscala100(resultado.usuario.x)) < 1e-9);
  assert.ok(Math.abs(m.you.social - aEscala100(resultado.usuario.y)) < 1e-9);
  assert.equal(m.closest.name, 'VOX'); // nombre de la visual (partidos-visual.json)
  assert.equal(m.closest.colorClass, 'is-vox');
  assert.equal(m.chosen.name, 'PP');
  assert.equal(m.closeness, Math.round(resultado.candidato.afinidad));
  assert.equal(m.parties.length, PARTIDOS.length);
  const pp = m.parties.find((p) => p.id === 'pp');
  assert.deepEqual([pp.colorClass, pp.economic, pp.social], ['is-pp', aEscala100(1.3333333333333333), aEscala100(1.3571428571428572)]);
  assert.equal(m.sinUsuario, undefined);
});

test('matriz: si el lector no eligió partido, se compara con el más cercano', () => {
  const m = modeloMatriz({ resultado: resultadoComo('PSOE'), partidos: PARTIDOS, limites });
  assert.equal(m.chosen.name, 'PSOE');
  assert.equal(m.closeness, 100); // 99,94 % redondeado
});

test('matriz: los otros lectores llegan con su peso como "force"', () => {
  const m = modeloMatriz({ resultado: resultadoComo('PSOE'), partidos: PARTIDOS, otrosLectores: [{ x: -2, y: 2, peso: 7 }], limites });
  assert.deepEqual(m.readers, [{ economic: 0, social: 100, force: 7 }]);
});

test('matriz con la IP bloqueada: con su último punto o, si no tiene, sin "Tú"', () => {
  const con = modeloMatrizBloqueo({ usuario: { x: 1, y: -1 }, partidos: PARTIDOS, otrosLectores: [], limites });
  assert.deepEqual(con.you, { economic: 75, social: 25 });
  assert.equal(con.sinUsuario, false);
  const sin = modeloMatrizBloqueo({ usuario: null, partidos: PARTIDOS, otrosLectores: [{ x: 0, y: 0, peso: 2 }], limites });
  assert.equal(sin.sinUsuario, true);
  assert.equal(sin.readers.length, 1);
  assert.equal(sin.parties.length, PARTIDOS.length);
});

test('barras: 0 si contesta lo mismo que el partido, 100 si lo contrario, una por pregunta', () => {
  const resultado = resultadoComo('Adelante');
  const igual = distanciasBarras({ resultado, partidos: PARTIDOS, preguntas: PREGUNTAS, slug: 'adelante' });
  assert.equal(igual.length, PREGUNTAS.length);
  assert.ok(igual.every((d) => d === 0));
  const conVox = distanciasBarras({ resultado, partidos: PARTIDOS, preguntas: PREGUNTAS, slug: 'vox' });
  assert.ok(conVox.every((d) => d >= 0 && d <= 100));
  assert.ok(conVox.includes(100)); // en alguna pregunta, opuestos del todo
  // sin resultado todavía (al cargar la página): todo a 0
  assert.ok(distanciasBarras({ resultado: null, partidos: PARTIDOS, preguntas: PREGUNTAS, slug: 'pp' }).every((d) => d === 0));
});

test('radar: "Tú" de 1 a 5 por familia (3 mientras no hay resultado); el de cada partido, fijo', () => {
  const base = { partidos: PARTIDOS, familias, temasPartidos };
  assert.deepEqual(valoresRadar({ ...base, resultado: null, serie: 'tu' }), familias.map(() => 3));
  const resultado = resultadoComo('Vox');
  const tu = valoresRadar({ ...base, resultado, serie: 'tu' });
  const vox = valoresRadar({ ...base, resultado, serie: 'vox' });
  assert.equal(tu.length, 8);
  assert.deepEqual(tu, vox); // contesta como Vox: radar idéntico
  assert.ok(vox.every((v) => v >= 1 && v <= 5));
  assert.equal(valoresRadar({ ...base, resultado, serie: 'no-existe' }), null);
});

test('slug <-> partido de los datos', () => {
  assert.equal(partidoPorSlug(PARTIDOS, 'frente-amplio').id, 'Frente Amplio');
  assert.equal(partidoPorSlug(PARTIDOS, 'eh-bildu').id, 'EH Bildu');
  assert.equal(partidoPorSlug(PARTIDOS, 'nada'), null);
});

test('partidos-visual.json es un catálogo: tiene que traer los partidos de los datos y puede tener de más', () => {
  // un partido de los datos que falte en el catálogo: error al cargar
  const { 'Ara Més': araMes, ...falta } = VISUAL_JSON;
  assert.ok(araMes);
  assert.throws(() => prepararDatos(PREGUNTAS_JSON, PARTIDOS_JSON, falta), /partidos-visual\.Ara Més: falta slug o nombre/);
  // partidos del catálogo que no vienen en los datos (hoy Junts y SALF): no se pintan, pero no es un error
  const sobran = Object.keys(VISUAL_JSON).filter((clave) => !(clave in PARTIDOS_JSON));
  assert.ok(sobran.includes('Junts') && sobran.includes('SALF'), `catálogo de más: ${sobran}`);
  const { partidos } = prepararDatos(PREGUNTAS_JSON, PARTIDOS_JSON, { ...VISUAL_JSON, Nuevo: { slug: 'nuevo', nombre: 'Nuevo' } });
  assert.deepEqual(partidos.map((p) => p.id), Object.keys(PARTIDOS_JSON)); // solo los de los datos, en su orden
});

test('todos los partidos del catálogo tienen su color, para poder pintarlos si vuelven a los datos', () => {
  const scss = (f) => readFileSync(new URL(`../src/assets/styles/components/${f}`, import.meta.url), 'utf8');
  const global = scss('_elections-global.scss');
  const matriz = scss('_elections-matriz.scss');
  const sinColor = Object.values(VISUAL_JSON)
    .filter(({ slug }) => !new RegExp(`\\.is-${slug}\\s*\\{`).test(global) || !matriz.includes(`"${slug}": $`))
    .map(({ slug }) => slug);
  assert.deepEqual(sinColor, [], 'partidos del catálogo sin .is-<slug> en _elections-global.scss o sin color en $party-fills');
});
