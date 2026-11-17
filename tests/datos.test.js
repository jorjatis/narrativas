// Carga y validación de src/data/preguntas_29N.json y partidos_29N.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PREGUNTAS, PARTIDOS, DATOS, prepararDatos, VISUAL_JSON } from './ayuda.js';
import { coordenadasUsuario } from '../src/js/elecciones/calculo.js';

const referencia = JSON.parse(readFileSync(new URL('./fixtures/referencia-python.json', import.meta.url)));

test('se cargan las 24 preguntas, los 14 partidos y las 8 familias en el orden del radar', () => {
  assert.equal(PREGUNTAS.length, 24);
  assert.equal(PREGUNTAS[0].id, 'p1');
  assert.equal(PARTIDOS.length, 14);
  const compromis = PARTIDOS.find((p) => p.id === 'Compromis'); // id del JSON, nombre y clase de la visual
  assert.deepEqual([compromis.nombre, compromis.slug, compromis.colorClass], ['Compromís', 'compromis', 'is-compromis']);
  assert.deepEqual(DATOS.familias, [
    'Inmigración', 'Vivienda', 'Territorialidad', 'Impuestos',
    'Derechos sociales', 'Medio ambiente', 'Seguridad', 'Unión Europea',
  ]);
  // cada partido tiene su clase de color definida en el SCSS de la visual
  const scss = readFileSync(new URL('../src/assets/styles/components/_elections-global.scss', import.meta.url), 'utf8');
  const sinColor = PARTIDOS.filter((p) => !new RegExp(`\\.${p.colorClass}\\s*\\{`).test(scss)).map((p) => p.colorClass);
  assert.deepEqual(sinColor, [], 'clases is-<partido> que no están en _elections-global.scss');
});

test('los ejes van de -2 a 2: el lector se divide entre la suma de pesos de cada eje', () => {
  assert.deepEqual(DATOS.limites, { x: 2, y: 2 });
  const extremo = PREGUNTAS.map((p) => ({ idPreg: p.id, valor: 2 * p.tipo })); // el extremo derecho/conservador en todo
  assert.deepEqual(coordenadasUsuario(PREGUNTAS, extremo), { x: 2, y: 2 });
});

test('un JSON mal formado falla al cargar y dice qué está mal', () => {
  const preguntas = {
    p1: { claim: 'Ok', familia: 'A', tipo: 1, peso_x: 1, peso_y: 1, PP: 2 },
    p2: { claim: '', familia: 'A', tipo: 2, peso_x: -1, peso_y: 1, PP: 3, Nuevo: 1 },
  };
  assert.throws(
    () => prepararDatos(preguntas, { PP: { x: 1, y: 1 } }),
    (err) =>
      ['p2: falta "claim"', 'p2: "tipo" debe ser 1 o -1', 'p2: "peso_x"', 'p2.PP: debe ser un entero', 'p2.Nuevo: partido que no está']
        .every((trozo) => err.message.includes(trozo)),
  );
  assert.throws(() => prepararDatos({ p1: { claim: 'Ok', familia: 'A', tipo: 1, peso_x: 1, peso_y: 1 } }, { PP: { x: 1, y: 1 } }), /p1\.PP/);
  // "contexto" es un campo permitido (el texto de "Necesito saber más"), pero tiene que ser texto
  const ok = { claim: 'Ok', familia: 'A', tipo: 1, peso_x: 1, peso_y: 1, PP: 2 };
  const visual = { PP: { slug: 'pp', nombre: 'PP' } };
  assert.equal(prepararDatos({ p1: { ...ok, contexto: ' Explicación ' } }, { PP: { x: 1, y: 1 } }, visual).preguntas[0].contexto, 'Explicación');
  assert.throws(() => prepararDatos({ p1: { ...ok, contexto: 3 } }, { PP: { x: 1, y: 1 } }, visual), /"contexto" debe ser texto/);
});

// ---------------------------------------------------------------------------------------------
// Coherencia entre los dos JSON. Si el equipo de datos actualiza uno y no el otro, fallan aquí.
// ---------------------------------------------------------------------------------------------

test('DATOS: partidos_29N.json coincide con la fórmula aplicada a las respuestas de preguntas_29N.json', () => {
  // Si falla en TODOS los partidos, lo más probable es que hayan cambiado el formato (orientadas o no).
  const distintos = PARTIDOS.filter((pt) => {
    const c = coordenadasUsuario(PREGUNTAS, PREGUNTAS.map((p) => ({ idPreg: p.id, valor: p.partidos[pt.id] * p.tipo })));
    return Math.abs(c.x - pt.x) > 0.006 || Math.abs(c.y - pt.y) > 0.006; // el JSON viene con 2 decimales
  });
  assert.deepEqual(distintos.map((p) => p.id), [], 'partidos cuya posición no sale de sus respuestas');
});

test('DATOS: quien contesta igual que un partido lo tiene como el más cercano', () => {
  const fallan = referencia.casos
    .filter((c) => c.nombre.startsWith('igual que '))
    .map((c) => {
      const partido = c.nombre.replace('igual que ', '');
      const max = Math.max(...Object.values(c.afinidad));
      return c.afinidad[partido] < max ? `${partido} (sale ${Object.keys(c.afinidad).find((k) => c.afinidad[k] === max)})` : null;
    })
    .filter(Boolean);
  assert.deepEqual(fallan, []);
});

test('DATOS: no hay dos partidos en el mismo punto (empatarían siempre)', () => {
  const puntos = PARTIDOS.map((p) => `${p.x},${p.y}`);
  assert.equal(new Set(puntos).size, puntos.length);
});
