/**
 * Datos de index-test.hbs. Webpack (HtmlWebpackPlugin) usa este fichero en lugar de index-test.json cuando existe:
 * se mantienen los metadatos de index-test.json y se añaden las preguntas y los partidos del test.
 */
const { datosPagina } = require('./lib/elecciones');

module.exports = datosPagina('index-test.json');
