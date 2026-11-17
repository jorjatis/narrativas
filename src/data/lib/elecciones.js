/**
 * Datos del test para las plantillas (las 24 preguntas, la pregunta de partido, las barras y los
 * desplegables), sacados de los mismos JSON que usa el cálculo (src/data/elecciones/).
 * Lo usan src/data/index.js y src/data/index-sandbox.js: cada página añade sus metadatos.
 */
const fs = require('fs');
const path = require('path');

const leer = (archivo) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', archivo), 'utf8'));

/** Versión de pruebas: texto de "Necesito saber más" mientras la pregunta no traiga "contexto" en el JSON. */
const CONTEXTO_PENDIENTE = 'Contexto pendiente: añadir el campo "contexto" a esta pregunta en preguntas_29N.json.';

/**
 * Versión limpia (index-ok / CMS): texto de ejemplo mientras la pregunta no traiga "contexto", para ver cómo
 * se pinta "Necesito saber más". Lleva data-elec-pendiente y el build avisa de cuántas quedan.
 */
const CONTEXTO_EJEMPLO =
  'Contexto de ejemplo: aquí irá una explicación breve, con los datos necesarios para entender la afirmación antes de contestar.';

/** Versión de pruebas: texto de la metodología mientras la página no traiga el suyo. */
const METODOLOGIA_PENDIENTE =
  'Metodología pendiente: añadir el campo "metodologia" al JSON de la página (src/data/index-ok.json).';

/**
 * Las cinco respuestas en el orden del diseño (de "Muy de acuerdo" a "Muy en desacuerdo").
 * `valor` es el idResp de src/js/elecciones/config.js (ESCALA): 5 = Muy de acuerdo ... 1 = Muy en desacuerdo.
 * (Un test comprueba que coinciden.)
 */
const OPCIONES = [
  { valor: 5, etiqueta: 'Muy de acuerdo', icono: 1, ancho: 28, alto: 16 },
  { valor: 4, etiqueta: 'De acuerdo', icono: 2, ancho: 25, alto: 16 },
  { valor: 3, etiqueta: 'Depende', icono: 3, ancho: 25, alto: 19 },
  { valor: 2, etiqueta: 'En desacuerdo', icono: 4, ancho: 26, alto: 16 },
  { valor: 1, etiqueta: 'Muy en desacuerdo', icono: 5, ancho: 27, alto: 16 },
];

/**
 * pruebas = true  -> versión de pruebas (index-sandbox): botón "Rellenar test" y avisos de lo que falta.
 * pruebas = false -> versión limpia (index-ok): sin "Rellenar test"; el contexto que falta, con texto de ejemplo.
 */
function datosElecciones({ pruebas = true, metodologia = null } = {}) {
  // Se leen en cada compilación: con `npm start`, al guardar los JSON se ve el cambio.
  const preguntasJson = leer('elecciones/preguntas_29N.json');
  const partidosVisual = leer('elecciones/partidos-visual.json');
  const ids = Object.keys(preguntasJson);
  const total = ids.length;

  const preguntas = ids.map((id, i) => {
    const contexto = (preguntasJson[id].contexto || '').trim();
    return {
      id,
      n: i + 1,
      total,
      claim: preguntasJson[id].claim,
      familia: preguntasJson[id].familia,
      // Sin contexto: en pruebas, aviso de lo que falta; en la versión limpia, un texto de ejemplo.
      contexto: contexto || (pruebas ? CONTEXTO_PENDIENTE : CONTEXTO_EJEMPLO),
      contextoPendiente: !contexto,
      opciones: OPCIONES.map((o) => ({ ...o, idInput: `elec-q-${i + 1}-${o.valor}` })),
    };
  });

  const partidos = Object.keys(partidosVisual).map((clave) => ({ clave, ...partidosVisual[clave] }));
  const textoMetodologia = (metodologia || '').trim() || (pruebas ? METODOLOGIA_PENDIENTE : null);
  return { preguntas, partidos, total, OPCIONES, rellenar: pruebas, metodologia: textoMetodologia };
}

/**
 * Metadatos de una página (su .json) + los datos del test. Si el JSON de la página trae "metodologia",
 * es el texto de "La metodología" del pie.
 */
function datosPagina(nombreJson, { pruebas = true } = {}) {
  const pagina = leer(nombreJson);
  return { ...pagina, elecciones: datosElecciones({ pruebas, metodologia: pagina.metodologia }) };
}

module.exports = { datosElecciones, datosPagina, OPCIONES, CONTEXTO_PENDIENTE, CONTEXTO_EJEMPLO, METODOLOGIA_PENDIENTE };
