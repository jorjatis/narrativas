// scripts/extraer-cms.js: saca el bloque .v-elec que se pega en el CMS y comprueba que es autocontenido.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { extraerBloque, comprobar, quitarComentarios } = require('../scripts/extraer-cms.js');
const Handlebars = require('handlebars');

test('extrae exactamente el <div class="v-elec">, con sus <div> anidados', () => {
  const html = '<body><header></header><div class="v-elec"><div><div>a</div></div><p>b</p></div><div class="v-c-cmp">c</div></body>';
  assert.equal(extraerBloque(html), '<div class="v-elec"><div><div>a</div></div><p>b</p></div>');
  assert.throws(() => extraerBloque('<div class="otro"></div>'), /No se encuentra/);
});

test('avisa si un icono no está definido dentro del bloque o si se cuela algo de pruebas', () => {
  const ok = comprobar('<div class="v-elec"><svg><symbol id="icon-a"></symbol></svg><svg><use href="#icon-a"></use></svg></div>');
  assert.deepEqual(ok.problemas, []);
  const mal = comprobar('<div class="v-elec"><svg><use href="#icon-b"></use></svg><button id="v-elec-fill"></button>Contexto pendiente</div>');
  assert.equal(mal.problemas.length, 3);
});

test('index-ok: el bloque .v-elec lleva dentro todos sus iconos y nada de pruebas', () => {
  const datos = require('../src/data/index-ok.js');
  const h = Handlebars.create();
  for (const carpeta of ['includes', 'kraken-components', 'layout']) {
    const dir = new URL(`../src/views/partials/${carpeta}/`, import.meta.url);
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.hbs'))) {
      const fuente = readFileSync(new URL(f, dir), 'utf8');
      const nombre = f.replace(/\.hbs$/, '');
      for (const alias of [`${carpeta}/${nombre}`, `./${carpeta}/${nombre}`, `./${nombre}`]) h.registerPartial(alias, fuente);
    }
  }
  const pagina = h.compile(readFileSync(new URL('../src/views/partials/layout/article-content.hbs', import.meta.url), 'utf8'))(datos);
  const { problemas, iconos, contextosDeEjemplo } = comprobar(quitarComentarios(extraerBloque(pagina)));
  assert.deepEqual(problemas, []);
  assert.ok(iconos >= 15, `iconos usados: ${iconos}`); // con "Necesito saber más", también icon-elec-more
  assert.equal(typeof contextosDeEjemplo, 'number');
});

test('el fichero para el CMS lleva el CSS delante y el JS detrás, con ?v= para la caché', () => {
  const { envolver } = require('../scripts/extraer-cms.js');
  const v = () => 'abc12345';
  const sin = envolver('<div class="v-elec">x</div>', { ruta: 'RUTA_DIST', v });
  assert.match(sin, /<link rel="stylesheet" href="RUTA_DIST\/assets\/styles\/main\.css\?v=abc12345">\n<div class="v-elec">x<\/div>\n<script src="RUTA_DIST\/js\/main\.js\?v=abc12345" defer><\/script>/);
  assert.ok(!sin.includes('<!--'), 'sin comentarios');
  const con = envolver('<div class="v-elec">x</div>', { ruta: 'https://cdn.ejemplo.com/29n', v });
  assert.ok(con.includes('href="https://cdn.ejemplo.com/29n/assets/styles/main.css?v=abc12345"'));
  assert.ok(con.includes('src="https://cdn.ejemplo.com/29n/js/main.js?v=abc12345"'));
});

test('el bloque para el CMS sale sin comentarios (HTML ni JS) y se avisa si se colara alguno', () => {
  const { quitarComentarios } = require('../scripts/extraer-cms.js');
  const html = '<div class="v-elec"><!-- nota --><script>\n  const a = 1; // nota\n  /* otra */\n  // línea\n  const u = "https://x.com/y";\n</script><p>hola</p></div>';
  const limpio = quitarComentarios(html);
  assert.ok(!/nota|otra|línea/.test(limpio), limpio);
  assert.ok(limpio.includes('https://x.com/y') && limpio.includes('const a = 1;') && limpio.includes('<p>hola</p>'));
  assert.deepEqual(comprobar(limpio).problemas, []);
  assert.equal(comprobar(html).problemas.length, 2);
});
