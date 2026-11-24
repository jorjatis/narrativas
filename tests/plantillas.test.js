// Plantillas Handlebars de la visual: se renderizan con los datos reales (src/data/index.js) y el mismo
// Handlebars del proyecto, y se comprueba el HTML que sale (lo que llega a la página).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { PREGUNTAS_JSON, PARTIDOS } from './ayuda.js';
import { ESCALA } from '../src/js/elecciones/config.js';

// Los partidos que se pintan: los de partidos_29N.json (no todo el catálogo de partidos-visual.json), en su orden
const SLUGS = PARTIDOS.map((p) => p.slug);

const require = createRequire(import.meta.url);
const Handlebars = require('handlebars');
const datosPagina = require('../src/data/index.js');

const plantilla = (nombre) => readFileSync(new URL(`../src/views/partials/includes/${nombre}.hbs`, import.meta.url), 'utf8');
const hb = Handlebars.create();
hb.registerPartial('includes/elections-heading', '<div class="v-elec-h"></div>');
const render = (nombre, datos = datosPagina) => hb.compile(plantilla(nombre))(datos);
const todos = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const ids = Object.keys(PREGUNTAS_JSON);

test('datos de la página: las 26 preguntas del JSON, en orden, con su familia', () => {
  const { preguntas, total } = datosPagina.elecciones;
  assert.equal(total, 26);
  assert.deepEqual(preguntas.map((p) => p.id), ids);
  assert.deepEqual(preguntas.map((p) => p.n), ids.map((_, i) => i + 1));
  assert.equal(preguntas[0].claim, PREGUNTAS_JSON.p1.claim);
  assert.equal(preguntas[0].familia, 'Vivienda');
  assert.ok(datosPagina.metadata, 'se mantienen los metadatos de index.json');
});

test('el valor de cada botón es el idResp de la escala del cálculo (5 = Muy de acuerdo ... 1 = Muy en desacuerdo)', () => {
  for (const o of datosPagina.elecciones.OPCIONES) {
    const escala = ESCALA.find((e) => e.idResp === o.valor);
    assert.equal(o.etiqueta, escala.etiqueta, `valor ${o.valor}`);
  }
  assert.deepEqual(datosPagina.elecciones.OPCIONES.map((o) => o.valor), [5, 4, 3, 2, 1]); // orden del diseño
});

test('pregunta de partido: un partido sin datos sale deshabilitado, con asterisco y la nota debajo', () => {
  const html = render('elections-test');
  const card = html.slice(html.indexOf('v-elec-test__item--party'));
  assert.ok(card.includes('id="elec-p-junts" value="junts" disabled aria-describedby="elec-p-nota"'));
  assert.ok(card.includes('v-elec-test__bt--off" for="elec-p-junts"'));
  assert.ok(card.includes('<abbr title="Junts per Catalunya">Junts*</abbr>'));
  assert.match(card, /<\/fieldset>\s*<p class="v-elec-test__nota-p" id="elec-p-nota">\*Junts [^<]+<\/p>/);

  // si un día llegan sus datos, se pinta como uno más (sin deshabilitar y sin nota)
  const { datosElecciones } = require('../src/data/lib/elecciones.js');
  const e = datosElecciones();
  const conJunts = {
    ...datosPagina,
    elecciones: { ...e, partidos: [...e.partidos, { clave: 'Junts', slug: 'junts', nombre: 'Junts', titulo: 'Junts per Catalunya' }], partidosSinDatos: [], notasSinDatos: [] },
  };
  const otra = render('elections-test', conJunts);
  assert.ok(otra.includes('id="elec-p-junts" value="junts">'));
  assert.ok(!otra.includes('v-elec-test__nota-p'));
});

test('test: 26 cartelas con sus preguntas, 5 respuestas cada una y la pregunta de partido al final', () => {
  const html = render('elections-test');
  assert.deepEqual(todos(html, /<li class="v-elec-test__item v-elec-test__item--q" data-elec-q="([^"]+)"/g), ids);
  const titulos = todos(html, /<h2 class="v-elec-test__qt">([^<]+)<\/h2>/g);
  assert.equal(titulos.length, 27);
  assert.equal(titulos[0], Handlebars.escapeExpression(PREGUNTAS_JSON.p1.claim));
  assert.match(titulos[26], /^¿Qué partido/);

  const valores = todos(html, /name="elec-q-\d+" id="[^"]+" value="(\d)"/g);
  assert.equal(valores.length, 26 * 5);
  assert.deepEqual(valores.slice(0, 5), ['5', '4', '3', '2', '1']);

  const idsInputs = todos(html, /<input type="radio" name="[^"]+" id="([^"]+)"/g);
  assert.equal(new Set(idsInputs).size, idsInputs.length, 'ids de input repetidos');
  // cada label apunta a un input que existe
  const fors = todos(html, /<label class="v-elec-test__bt[^"]*"(?: data-elec-next)? for="([^"]+)"/g);
  assert.ok(fors.every((f) => idsInputs.includes(f)));

  // se pueden elegir los partidos de los datos; los "sinDatos" del catálogo (hoy Junts) salen deshabilitados
  const partidos = todos(html, /name="elec-p" id="elec-p-([^"]+)" value="\1">/g);
  assert.deepEqual(partidos, SLUGS);
  const sinDatos = todos(html, /name="elec-p" id="elec-p-([^"]+)" value="\1" disabled/g);
  assert.deepEqual(sinDatos, ['junts']);
  assert.ok(html.includes('<abbr title="Partido Popular">PP</abbr>'));
  assert.ok(!html.includes('Esta es la aclaración'), 'sin textos de prueba');
});

test('"Necesito saber más" en todas las preguntas, con el campo "contexto" del JSON', () => {
  assert.equal(render('elections-test').split('Necesito saber más').length - 1, 26);
  const conContexto = structuredClone(datosPagina);
  Object.assign(conContexto.elecciones.preguntas[0], { contexto: 'Zonas tensionadas: donde el alquiler supera el 30 % de la renta.', contextoPendiente: false });
  // hoy todas traen contexto en el JSON: se quita el de la segunda para ver el aviso de que falta
  const { CONTEXTO_PENDIENTE } = require('../src/data/lib/elecciones.js');
  Object.assign(conContexto.elecciones.preguntas[1], { contexto: CONTEXTO_PENDIENTE, contextoPendiente: true });
  const html = render('elections-test', conContexto);
  const primera = html.slice(html.indexOf('data-elec-q="p1"'), html.indexOf('data-elec-q="p2"'));
  assert.ok(primera.includes('<div class="v-elec-test__more-txt">Zonas tensionadas: donde el alquiler supera el 30 % de la renta.</div>'));
  // sin contexto en el JSON: aviso de que falta (marcado con data-elec-pendiente)
  const segunda = html.slice(html.indexOf('data-elec-q="p2"'), html.indexOf('data-elec-q="p3"'));
  assert.ok(segunda.includes('data-elec-pendiente>Contexto pendiente'));
});

test('el contexto sale del JSON: se lee el campo "contexto" de cada pregunta', () => {
  const { datosElecciones } = require('../src/data/lib/elecciones.js');
  const { preguntas } = datosElecciones();
  for (const p of preguntas) {
    const delJson = (PREGUNTAS_JSON[p.id].contexto || '').trim();
    assert.equal(p.contextoPendiente, !delJson);
    if (delJson) assert.equal(p.contexto, delJson);
  }
});

test('DATOS: todas las preguntas tienen su texto de contexto', { todo: 'falta el campo "contexto" en preguntas_29N.json' }, () => {
  const sin = Object.entries(PREGUNTAS_JSON).filter(([, p]) => !(p.contexto || '').trim()).map(([id]) => id);
  assert.deepEqual(sin, []);
});

test('index.html e index-sandbox.html llevan los mismos datos del test, cada una con sus metadatos', () => {
  const sandbox = require('../src/data/index-sandbox.js');
  assert.deepEqual(sandbox.elecciones, datosPagina.elecciones);
  assert.equal(sandbox.metadata.edition.ppll, true);
  assert.equal(datosPagina.metadata.edition.ppll, false);
});

test('barras: una fila por pregunta y un partido por opción del desplegable', () => {
  const html = render('elections-bars');
  assert.deepEqual(todos(html, /<div class="v-elec-bars__item" style="--distance: 0" data-elec-q="([^"]+)"/g), ids);
  assert.deepEqual(todos(html, /data-party="([^"]+)"/g), SLUGS);
});

test('radar: los dos desplegables con "Tú" y los 13 partidos, cada opción en su <li>', () => {
  const html = render('elections-radial');
  const opciones = todos(html, /<button class="v-slc__a" type="button" data-series="([^"]+)"/g);
  const esperado = ['tu', ...SLUGS];
  assert.deepEqual(opciones, [...esperado, ...esperado]);
  assert.equal((html.match(/<li class="v-slc__l">/g) || []).length, esperado.length * 2);
});

test('modal de compartir: sin los atributos del compartidor del medio, con los de analítica', () => {
  const html = plantilla('elections-share-results-modal');
  assert.ok(!html.includes('data-voc-social-sharer'), 'el JS del medio compartiría la noticia, no el resultado');
  assert.ok(!html.includes('data-voc-portals'));
  assert.ok(!html.includes('data-voc-component="copy-link"'));
  assert.deepEqual(todos(html, /data-elec-red="([^"]+)"/g), ['whatsapp', 'facebook', 'twitter', 'linkedin', 'telegram', 'threads']);
  const redes = ['whatsapp', 'facebook', 'twitter', 'linkedin', 'telegram', 'threads', 'link'];
  const imagen = ['descargar', 'compartir', 'copiar'];
  assert.deepEqual(todos(html, /data-voc-vtm-id="([^"]+)"/g), [
    ...redes.map(() => 'compartirrrss'), ...imagen.map(() => 'elecciones'),
  ]);
  assert.deepEqual(todos(html, /data-voc-vtm-info="([^"]+)"/g), [
    ...redes.map((r) => `compartir-resultado-elecciones-${r}`),
    ...imagen.map((a) => `${a}-resultado-elecciones-noticia`),
  ]);
  assert.ok(!html.includes('WhastApp'));
});

test('matriz: la cabecera no lleva un resultado de prueba escrito a mano', () => {
  const html = plantilla('elections-matriz');
  assert.ok(html.includes('<span class="v-elec-res__party-color is-default"></span>'));
  assert.ok(!/VOX|84%/.test(html));
});

// ---------- las dos versiones: index-sandbox (pruebas) e index-ok (limpia) ----------

const { readdirSync } = await import('node:fs');
/** Renderiza el contenedor completo (article-content) con todos los parciales del proyecto. */
function renderPagina(datos) {
  const h = Handlebars.create();
  for (const carpeta of ['includes', 'kraken-components', 'layout']) {
    const dir = new URL(`../src/views/partials/${carpeta}/`, import.meta.url);
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.hbs'))) {
      const nombre = f.replace(/\.hbs$/, '');
      const fuente = readFileSync(new URL(f, dir), 'utf8');
      h.registerPartial(`${carpeta}/${nombre}`, fuente);
      h.registerPartial(`./${carpeta}/${nombre}`, fuente);
      h.registerPartial(`./${nombre}`, fuente); // rutas relativas dentro de la misma carpeta
    }
  }
  return h.compile(readFileSync(new URL('../src/views/partials/layout/article-content.hbs', import.meta.url), 'utf8'))(datos);
}

test('index-ok (versión limpia): sin "Rellenar test" ni avisos de pruebas; contexto de ejemplo donde falta', () => {
  const ok = require('../src/data/index-ok.js');
  const { CONTEXTO_EJEMPLO } = require('../src/data/lib/elecciones.js');
  assert.equal(ok.elecciones.rellenar, false);
  const html = renderPagina(ok);
  assert.ok(!html.includes('v-elec-fill'), 'no lleva el botón Rellenar test');
  assert.ok(!html.includes('Contexto pendiente'));
  assert.ok(!html.includes('Metodología pendiente'));
  assert.ok(!/lorem ipsum/i.test(html));
  // "Necesito saber más" en todas: con el contexto del JSON o, si falta, con el texto de ejemplo marcado
  assert.equal(html.split('Necesito saber más').length - 1, 26);
  const sinContexto = Object.values(PREGUNTAS_JSON).filter((p) => !(p.contexto || '').trim()).length;
  assert.equal(html.split(`data-elec-pendiente>${CONTEXTO_EJEMPLO}`).length - 1, sinContexto);
  assert.equal(html.includes('La metodología'), Boolean((ok.metodologia || '').trim()));
  assert.equal((html.match(/data-elec-q="p\d+"/g) || []).length, 52); // 26 en el test + 26 en las barras
});

test('index-ok: la metodología sale del campo "metodologia" de index-ok.json', () => {
  const { datosElecciones } = require('../src/data/lib/elecciones.js');
  const html = renderPagina({ elecciones: datosElecciones({ pruebas: false, metodologia: 'Se han analizado los <b>programas</b>.' }) });
  assert.ok(html.includes('La metodología'));
  assert.ok(html.includes('Se han analizado los <b>programas</b>.'));
});

test('index-sandbox (versión de pruebas): con "Rellenar test" y avisos de lo que falta', () => {
  const sandbox = require('../src/data/index-sandbox.js');
  const html = renderPagina(sandbox);
  assert.ok(html.includes('id="v-elec-fill"'));
  assert.equal(html.split('Necesito saber más').length - 1, 26);
  assert.ok(html.includes('La metodología'));
});
