/**
 * Datos de index.hbs. Webpack (HtmlWebpackPlugin) usa este fichero en lugar de index.json cuando existe:
 * se mantienen los metadatos de index.json y se añaden las preguntas y los partidos del test.
 */
const { datosPagina } = require('./lib/elecciones');

module.exports = datosPagina('index.json');
