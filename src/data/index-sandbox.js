/**
 * Datos de index-sandbox.hbs: VERSIÓN DE PRUEBAS. Lleva el botón "Rellenar test" y avisa de lo que falta
 * (contexto de las preguntas, metodología). La versión limpia es index-ok.
 */
const { datosPagina } = require('./lib/elecciones');

module.exports = datosPagina('index-sandbox.json', { pruebas: true });
