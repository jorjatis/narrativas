// Adaptadores entre el cálculo y los módulos de la visual (matriz, radar, barras): src/js/elecciones/visual.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
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
  assert.ok(vox.economic < 95 && vox.social < 95, `Vox en (${vox.economic}, ${vox.social})`);
  assert.equal(aEscala100(0, 2.2), 50);
  assert.ok(Math.abs(aEscala100(2, 2.2) - 95.4545) < 1e-3);
});

test('matriz: "Tú", partidos con su slug y color, el más cercano y el elegido con su %', () => {
  const resultado = resultadoComo('Vox', 'PP');
  const m = modeloMatriz({ resultado, partidos: PARTIDOS, otrosLectores: [], limites });
  // Vox en partidos_29N.json: (1.96, 1.97)  ->  economic 99, social 99.25
  assert.ok(Math.abs(m.you.economic - aEscala100(resultado.usuario.x)) < 1e-9);
  assert.ok(Math.abs(m.you.social - aEscala100(resultado.usuario.y)) < 1e-9);
  assert.equal(m.closest.name, 'VOX'); // nombre de la visual (partidos-visual.json)
  assert.equal(m.closest.colorClass, 'is-vox');
  assert.equal(m.chosen.name, 'PP');
  assert.equal(m.closeness, Math.round(resultado.candidato.afinidad));
  assert.equal(m.parties.length, PARTIDOS.length);
  const pp = m.parties.find((p) => p.id === 'pp');
  assert.deepEqual([pp.colorClass, pp.economic, pp.social], ['is-pp', aEscala100(1.78), aEscala100(1.44)]);
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
  const resultado = resultadoComo('Podemos');
  const igual = distanciasBarras({ resultado, partidos: PARTIDOS, preguntas: PREGUNTAS, slug: 'podemos' });
  assert.equal(igual.length, 24);
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

test('partidos-visual.json tiene que cubrir exactamente los partidos de los datos', () => {
  const { SALF, ...falta } = VISUAL_JSON;
  assert.throws(() => prepararDatos(PREGUNTAS_JSON, PARTIDOS_JSON, falta), /partidos-visual\.SALF: falta slug o nombre/);
  assert.throws(
    () => prepararDatos(PREGUNTAS_JSON, PARTIDOS_JSON, { ...VISUAL_JSON, Nuevo: { slug: 'nuevo', nombre: 'Nuevo' } }),
    /partidos-visual\.Nuevo: partido que no está/,
  );
  assert.ok(SALF);
});
