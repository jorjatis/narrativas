/**
 * Después de `npm run build` (se lanza solo como "postbuild"): saca de dist/index.html el bloque
 * <div class="v-elec">…</div>, que es lo que se pega en el CMS, a dist/cms/v-elec.html.
 *
 * Comprueba además que el bloque es autocontenido: que todos los iconos que usa (<use href="#…">) están
 * definidos dentro, y que no lleva nada de la versión de pruebas.
 *
 * El fichero sale listo para pegar: lleva también el <link> del CSS y el <script> del JS, con su ?v= para que
 * cada subida rompa la caché (cambia solo si cambia el fichero).
 *
 *   node scripts/extraer-cms.js                                   -> rutas con RUTA_DIST, para cambiar a mano
 *   CMS_RUTA=https://static.ejemplo.com/test-29n npm run build    -> rutas ya puestas
 *
 * CMS_RUTA (o RUTA_DIST) = la URL de la carpeta subida al FTP: la que contiene assets/ y js/.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RUTA = (process.env.CMS_RUTA || 'RUTA_DIST').replace(/\/+$/, '');
const RECURSOS = { css: 'assets/styles/main.css', js: 'js/main.js' };

const DIST = path.resolve(__dirname, '..', 'dist');
const ORIGEN = path.join(DIST, 'index.html');
const DESTINO = path.join(DIST, 'cms', 'v-elec.html');
const APERTURA = '<div class="v-elec">';

/** Devuelve el <div class="v-elec">…</div> completo, contando aperturas y cierres de <div>. */
function extraerBloque(html) {
  const inicio = html.indexOf(APERTURA);
  if (inicio === -1) throw new Error(`No se encuentra ${APERTURA} en ${path.basename(ORIGEN)}`);
  const etiquetas = /<div\b|<\/div\s*>/g;
  etiquetas.lastIndex = inicio;
  let nivel = 0;
  let m;
  while ((m = etiquetas.exec(html))) {
    nivel += m[0].startsWith('</') ? -1 : 1;
    if (nivel === 0) return html.slice(inicio, m.index + m[0].length);
  }
  throw new Error('El bloque .v-elec no se cierra');
}

/**
 * El bloque va al CMS sin comentarios: ni <!-- --> de HTML ni // o /* *\/ dentro de los <script>.
 * (Los // de las URL no cuentan: solo los que empiezan línea o van tras un espacio o ';'.)
 */
function quitarComentarios(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (_, abre, js, cierra) => abre
      + js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[\s;{}])\/\/[^\n]*/g, '$1').replace(/\n\s*\n/g, '\n')
      + cierra);
}

function comprobar(bloque) {
  const problemas = [];
  if (/<!--/.test(bloque)) problemas.push('lleva comentarios HTML (<!-- -->)');
  for (const [, js] of bloque.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    if (/\/\*|(^|[\s;{}])\/\//.test(js)) problemas.push('lleva comentarios dentro de un <script>');
  }
  const usados = new Set([...bloque.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]));
  const definidos = new Set([...bloque.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const sinDefinir = [...usados].filter((id) => !definidos.has(id));
  if (sinDefinir.length) problemas.push(`iconos usados pero no definidos dentro del bloque: ${sinDefinir.join(', ')}`);
  for (const [texto, motivo] of [
    ['v-elec-fill', 'lleva el botón "Rellenar test"'],
    ['Contexto pendiente', 'lleva avisos de "Contexto pendiente"'],
    ['Metodología pendiente', 'lleva el aviso de "Metodología pendiente"'],
  ]) {
    if (bloque.includes(texto)) problemas.push(motivo);
  }
  const contextosDeEjemplo = (bloque.match(/data-elec-pendiente/g) || []).length;
  return { problemas, iconos: usados.size, contextosDeEjemplo };
}

/** ?v= con el contenido del fichero: la caché se rompe sola cuando cambia, y no se rompe si no cambia. */
function version(fichero) {
  try {
    return crypto.createHash('md5').update(fs.readFileSync(path.join(DIST, fichero))).digest('hex').slice(0, 8);
  } catch {
    return String(Date.now());
  }
}

/** El bloque con el CSS delante y el JS detrás: es lo que se pega tal cual en el CMS. */
function envolver(bloque, { ruta = RUTA, v = version } = {}) {
  return [
    `<link rel="stylesheet" href="${ruta}/${RECURSOS.css}?v=${v(RECURSOS.css)}">`,
    bloque,
    `<script src="${ruta}/${RECURSOS.js}?v=${v(RECURSOS.js)}" defer></script>`,
    '',
  ].join('\n');
}

/** Lo que se sube a producción no debe llevar nada de desarrollo (hosts locales, Netlify...). */
const RASTROS_DEV = /localhost|127\.0\.0\.1|0\.0\.0\.0|netlify|\.local\b|Rellenar test/;
const FICHEROS_PRODUCCION = ['js/main.js', 'js/vendors.js', 'assets/styles/main.css', 'index.html'];

function rastrosDeDesarrollo(dist = DIST) {
  return FICHEROS_PRODUCCION.filter((f) => {
    try {
      return RASTROS_DEV.test(fs.readFileSync(path.join(dist, f), 'utf8'));
    } catch {
      return false;
    }
  });
}

function main() {
  if (!fs.existsSync(ORIGEN)) throw new Error(`No existe ${ORIGEN}: lanza antes "npm run build"`);
  const bloque = quitarComentarios(extraerBloque(fs.readFileSync(ORIGEN, 'utf8')));
  const { problemas, iconos, contextosDeEjemplo } = comprobar(bloque);
  if (RASTROS_DEV.test(bloque)) problemas.push('el bloque lleva cosas de desarrollo (localhost, Netlify, Rellenar...)');
  const conRastros = rastrosDeDesarrollo();
  if (conRastros.length) problemas.push(`llevan cosas de desarrollo: ${conRastros.join(', ')} (¿se compiló con build:pruebas?)`);
  fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
  fs.writeFileSync(DESTINO, envolver(bloque));

  console.log(`\n[cms] ${path.relative(process.cwd(), DESTINO)}: listo para pegar (${Math.round(bloque.length / 1024)} KB, ${iconos} iconos incluidos, con el CSS y el JS)`);
  if (RUTA === 'RUTA_DIST') console.log('[cms] Cambia RUTA_DIST (2 veces) por la URL de la carpeta del FTP (o lanza el build con CMS_RUTA=https://...)');
  else console.log(`[cms] CSS y JS desde ${RUTA}/`);
  console.log('[cms] Sube la carpeta dist entera: js/vendors.js (html2canvas) se busca junto a js/main.js');
  if (contextosDeEjemplo) {
    console.warn(`[cms] Aviso: ${contextosDeEjemplo} preguntas con contexto DE EJEMPLO (falta "contexto" en preguntas_29N.json).`);
  }
  if (problemas.length) {
    console.error(`[cms] ATENCIÓN:\n${problemas.map((p) => `[cms]   - ${p}`).join('\n')}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports = { extraerBloque, comprobar, envolver, quitarComentarios, rastrosDeDesarrollo, RASTROS_DEV };
