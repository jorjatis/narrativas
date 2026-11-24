/**
 * Datos de index.hbs: VERSIÓN LIMPIA, la que va al CMS. Sin "Rellenar test". Si una pregunta no tiene
 * "contexto" en el JSON, "Necesito saber más" enseña un texto de ejemplo (el build avisa); sin metodología
 * no sale ese bloque.
 * La metodología va en index.json, campo "metodologia" (admite HTML).
 */
const { datosPagina } = require('./lib/elecciones');

module.exports = datosPagina('index.json', { pruebas: false });
