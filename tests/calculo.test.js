// La lógica de cálculo, comparada con lo que da el notebook de Python con los mismos datos.
// tests/fixtures/referencia-python.json se generó ejecutando tal cual las funciones de backup_afinidad_parte2.ipynb (v3).
// El punto del lector se toma de coordenadas_afinidad (coordenadas_usuario de la v3 divide la y entre Σ peso_x).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PREGUNTAS, PARTIDOS, DATOS, nuevo, contestarTodo, comoPartido } from './ayuda.js';
import { calcularResultado, coordenadasUsuario, afinidad, orientar } from '../src/js/elecciones/calculo.js';

const { casos } = JSON.parse(readFileSync(new URL('./fixtures/referencia-python.json', import.meta.url)));
const cerca = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: JS ${a} · Python ${b}`);
const respuestas = (crudas) => Object.entries(crudas).map(([idPreg, valor]) => ({ idPreg, valor }));

for (const caso of casos) {
  test(`igual que el notebook de Python: ${caso.nombre}`, () => {
    const respuestasUser = respuestas(caso.crudas);
    const r = calcularResultado({ ...DATOS, respuestasUser });

    // coordenadas: sin redondear, idénticas
    const u = coordenadasUsuario(PREGUNTAS, respuestasUser);
    cerca(u.x, caso.usuario.x, 1e-12, 'x');
    cerca(u.y, caso.usuario.y, 1e-12, 'y');

    // afinidad con cada partido (2 decimales, como el notebook). Tolerancia de 0,01: con un 5 exacto en el
    // tercer decimal (p. ej. 54,125) Python redondea al par (54,12) y JavaScript hacia arriba (54,13).
    for (const p of r.partidos) cerca(p.afinidad, caso.afinidad[p.id], 0.0100001, `afinidad ${p.id}`);

    // distancia pregunta a pregunta, exacta
    for (const q of r.porPregunta) {
      for (const pt of PARTIDOS) assert.equal(q.partidos[pt.id].distancia, caso.distancias[q.id][pt.id], `${q.id} ${pt.id}`);
    }

    // radar: medias por familia + 3 (redondeadas a 3 decimales)
    for (const t of r.temas) {
      cerca(t.usuario, caso.familias[t.familia].Usuario, 0.0005, `radar ${t.familia} usuario`);
      for (const pt of PARTIDOS) cerca(t.partidos[pt.id], caso.familias[t.familia][pt.id], 0.0005, `radar ${t.familia} ${pt.id}`);
    }
  });
}

test('el tipo da la vuelta a la respuesta: "muy de acuerdo" con una frase de izquierdas es -2', () => {
  const p2 = PREGUNTAS.find((p) => p.id === 'p2'); // sanidad para indocumentados, tipo -1
  assert.equal(orientar(p2, 2), -2);
  const p1 = PREGUNTAS.find((p) => p.id === 'p1'); // endurecer fronteras, tipo 1
  assert.equal(orientar(p1, 2), 2);
});

test('el deslizador recibe la postura en la escala de la frase', () => {
  const t = nuevo();
  contestarTodo(t, comoPartido('PSOE'));
  const alquiler = t.calcular().porPregunta.find((q) => q.id === 'p4'); // limitar precios del alquiler
  assert.equal(alquiler.partidos.PP.valor, -2); // PP: muy en desacuerdo
  assert.equal(alquiler.partidos.PP.orientado, 2); // = a la derecha
  assert.equal(alquiler.usuario.valor, alquiler.partidos.PSOE.valor);
  assert.equal(alquiler.partidos.PSOE.distancia, 0);
});

test('todo Neutro cae en (0, 0), cuenta las 24 preguntas y en el radar es 3 (la mitad)', () => {
  const t = nuevo();
  contestarTodo(t, 0);
  const r = t.calcular();
  assert.deepEqual(r.usuario, { x: 0, y: 0 });
  assert.equal(r.contestadas, 24);
  assert.equal(r.neutras, 24);
  assert.ok(r.temas.every((t) => t.usuario === 3));
});

test('afinidad: 100 % en el mismo punto', () => {
  assert.equal(afinidad({ x: 1, y: 1 }, { x: 1, y: 1 }), 100);
});

test('ranking, partido más cercano y cercanía con el partido elegido', () => {
  const t = nuevo();
  contestarTodo(t, comoPartido('PSOE'));
  t.setCandidato('PP');
  const r = t.calcular();
  assert.equal(r.masCercano.id, 'PSOE');
  assert.deepEqual(r.ranking.map((p) => p.afinidad), r.ranking.map((p) => p.afinidad).sort((a, b) => b - a));
  assert.equal(r.candidato.id, 'PP');
  assert.equal(r.temas.length, 8);
});

// ---------- afinidad: rango 0..100 ----------

test('afinidad: 50 % si coincide en un eje y es opuesto en el otro; 0 % si es opuesto en los dos', () => {
  assert.equal(afinidad({ x: 1, y: -2 }, { x: 1, y: 2 }), 50);
  assert.equal(afinidad({ x: -2, y: 0.5 }, { x: 2, y: 0.5 }), 50);
  assert.equal(afinidad({ x: -2, y: -2 }, { x: 2, y: 2 }), 0);
});

test('con los datos reales ninguna afinidad baja de 0 (ni contestando como el partido más extremo)', () => {
  const extremos = [...PARTIDOS.map((p) => comoPartido(p.id)), ...[-2, 2].map((v) => Object.fromEntries(PREGUNTAS.map((p) => [p.id, v * p.tipo])))];
  for (const valores of extremos) {
    const r = calcularResultado({ ...DATOS, respuestasUser: respuestas(valores) });
    assert.ok(Math.abs(r.usuario.x) <= 2 && Math.abs(r.usuario.y) <= 2, 'el lector no se sale de ±2');
    for (const p of r.partidos) assert.ok(p.afinidad >= 0, `${p.id}: ${p.afinidad}`);
  }
});
