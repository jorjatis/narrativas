// El <script> de arranque (elections-boot.hbs): elige la vista inicial antes de pintar, sin esperar a main.js.
// Se ejecuta tal cual sale de la plantilla, contra el localStorage que deja el código real del test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { almacen, nuevo, contestarTodo } from './ayuda.js';

const { SCHEMA, claveStorage } = await import('../src/js/elecciones/storage.js');
const { CONFIG } = await import('../src/js/elecciones/config.js');

const plantilla = readFileSync(new URL('../src/views/partials/includes/elections-boot.hbs', import.meta.url), 'utf8');
// Fuera todos los comentarios {{!-- --}} (también el del catch), como hace Handlebars al renderizar.
const codigo = plantilla.replace(/{{!--[\s\S]*?--}}/g, '').match(/<script>([\s\S]*?)<\/script>/)[1];

/** Ejecuta el arranque en una "página" de `hostname` y devuelve las clases que deja en .v-elec. */
function arrancar({ hostname = 'www.elcorreo.com', search = '', storage = almacen, roto = false, cabecera = null } = {}) {
  const clases = new Set(['v-elec']);
  const el = { classList: { add: (...c) => c.forEach((x) => clases.add(x)) } };
  const ls = roto
    ? { getItem() { throw new Error('SecurityError'); }, key: () => null, length: 0 }
    : { getItem: (k) => (storage.has(k) ? storage.get(k) : null), key: (i) => [...storage.keys()][i] ?? null, get length() { return storage.size; } };
  vm.runInNewContext(codigo, {
    window: { localStorage: ls },
    location: { hostname, search },
    document: { currentScript: { parentNode: el }, querySelector: (sel) => (sel === 'header.v-h' ? cabecera : null) },
    Date, JSON,
  });
  return [...clases].filter((c) => c !== 'v-elec').sort();
}

test('arranque: coincide con la clave y el SCHEMA del código', () => {
  const prefijo = claveStorage(CONFIG.TEST_ID, 'x').slice(0, -1);
  assert.ok(codigo.includes(`'${prefijo}'`), `el arranque debe usar la clave ${prefijo}<medio>`);
  assert.ok(codigo.includes(`e.schema !== ${SCHEMA}`), `el arranque debe comprobar schema ${SCHEMA}`);
});

test('arranque: sin nada guardado, portada (oculta hasta que main.js la muestra)', () => {
  assert.deepEqual(arrancar(), ['is-booting']);
});

test('arranque: test a medias -> "Continuar"', () => {
  const t = nuevo();
  t.responder('p1', 4);
  assert.deepEqual(arrancar(), ['is-booting', 'is-resume']);
});

test('arranque: abierto pero sin contestar nada -> portada', () => {
  nuevo(); // guarda el estado vacío
  assert.deepEqual(arrancar(), ['is-booting']);
});

test('arranque: test terminado -> resultados desde el primer pintado', async () => {
  const t = nuevo();
  contestarTodo(t, 1);
  await t.finalizar();
  assert.deepEqual(arrancar(), ['is-booting', 'is-widgets-on']);
});

test('arranque: un bloqueo de IP de versiones anteriores ya no cuenta (lo decide el servidor)', () => {
  const t = nuevo();
  const e = JSON.parse(almacen.get(t.clave));
  almacen.set(t.clave, JSON.stringify({ ...e, bloqueoIp: new Date().toISOString() }));
  assert.deepEqual(arrancar(), ['is-booting']);
});

test('arranque: en local (sin medio en el host) usa la única clave guardada', async () => {
  const t = nuevo();
  contestarTodo(t, 0);
  await t.finalizar();
  assert.deepEqual(arrancar({ hostname: 'localhost' }), ['is-booting', 'is-widgets-on']);
});

test('arranque: datos de otra versión, JSON roto o localStorage bloqueado -> portada, sin errores', () => {
  const clave = claveStorage(CONFIG.TEST_ID, 'elcorreo');
  almacen.set(clave, JSON.stringify({ schema: SCHEMA - 1, completado: true }));
  assert.deepEqual(arrancar(), ['is-booting']);
  almacen.set(clave, '{roto');
  assert.deepEqual(arrancar(), ['is-booting']);
  assert.deepEqual(arrancar({ roto: true }), ['is-booting']);
});

test('nuestro JS no usa "var" (solo const/let)', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const raiz = new URL('../', import.meta.url);
  const rutas = ['src/js/elecciones', 'src/js/modules', 'src/js/main.js', 'scripts', 'tests', 'src/data/lib', 'src/views'];
  const ficheros = [];
  const recorrer = (rel) => {
    const url = new URL(rel, raiz);
    if (statSync(url).isDirectory()) readdirSync(url).forEach((n) => recorrer(`${rel}/${n}`));
    else if (/\.(js|hbs)$/.test(rel)) ficheros.push(rel);
  };
  rutas.forEach(recorrer);
  const conVar = ficheros.filter((f) => /(^|[\s;({])var\s+[\w$]/m.test(readFileSync(new URL(f, raiz), 'utf8')));
  assert.deepEqual(conVar, []);
});

test('arranque: la cabecera del medio pasa siempre a v-h--t3', () => {
  const clases = new Set(['v-h', 'v-h--t2', 'is-fixed']);
  const cabecera = { classList: {
    add: (...c) => c.forEach((x) => clases.add(x)),
    remove: (...c) => c.forEach((x) => clases.delete(x)),
    [Symbol.iterator]: () => clases.values(),
  } };
  arrancar({ cabecera });
  assert.deepEqual([...clases].sort(), ['is-fixed', 'v-h', 'v-h--t3']);
  assert.deepEqual(arrancar(), ['is-booting']); // sin cabecera en la página, no falla
});
