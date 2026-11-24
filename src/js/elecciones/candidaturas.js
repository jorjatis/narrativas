/**
 * Candidaturas por medio (src/data/elecciones/candidaturas-medios.json).
 * ABC y Mujerhoy ven todas; un regional solo ve las nacionales más las que se presentan en su territorio.
 *
 * El filtro se aplica a los datos (datos.partidos) al crear el test: así el cálculo de afinidad, el ranking,
 * la matriz y el texto de compartir solo conocen las candidaturas del medio. La pregunta de partido del HTML
 * viene con todas (la plantilla es la misma para todos): se poda en el navegador (podarPreguntaPartido en
 * src/js/modules/electionsApp.js).
 * El radar y las barras (y sus desplegables) NO se filtran: ahí se puede comparar con cualquier partido.
 *
 * Sin imports de JSON a propósito (como datos.js): el diccionario se pasa como parámetro.
 */

/**
 * Claves de partido que ve el medio, o null si las ve todas
 * (medio marcado "todas", medio desconocido, sin medio o sin diccionario).
 */
export function candidaturasDelMedio(diccionario, idMedio) {
  const lista = diccionario?.medios?.[idMedio];
  if (!idMedio || lista === undefined || lista === 'todas') return null;
  return [...new Set([...(diccionario.nacionales ?? []), ...(Array.isArray(lista) ? lista : [])])];
}

/** Los datos de prepararDatos() solo con las candidaturas permitidas (null = sin tocar). */
export function filtrarDatos(datos, permitidas) {
  if (!permitidas) return datos;
  const partidos = datos.partidos.filter((p) => permitidas.includes(p.id));
  // Nunca un test sin partidos: si el diccionario no casara con los datos, mejor enseñarlos todos.
  if (!partidos.length) return datos;
  return { ...datos, partidos };
}

/** Errores del diccionario (para los tests): medios y partidos que no existen, valores mal formados. */
export function validarCandidaturas(diccionario, { medios = [], catalogo = {} } = {}) {
  const errores = [];
  const esPartido = (k) => k in catalogo;
  for (const k of diccionario?.nacionales ?? []) if (!esPartido(k)) errores.push(`nacionales: "${k}" no está en partidos-visual.json`);
  for (const [medio, lista] of Object.entries(diccionario?.medios ?? {})) {
    if (!medios.includes(medio)) errores.push(`medios.${medio}: no está en ALLOWED_MEDIAS`);
    if (lista === 'todas') continue;
    if (!Array.isArray(lista)) {
      errores.push(`medios.${medio}: debe ser "todas" o una lista`);
      continue;
    }
    for (const k of lista) if (!esPartido(k)) errores.push(`medios.${medio}: "${k}" no está en partidos-visual.json`);
  }
  for (const medio of medios) if (!(medio in (diccionario?.medios ?? {}))) errores.push(`medios.${medio}: falta (vería todas)`);
  return errores;
}
