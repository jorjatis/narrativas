/**
 * Datos del test, tal cual los entrega el equipo de datos (src/data/elecciones/):
 *   preguntas_29N.json     { p1: { claim, familia, tipo, peso_x, peso_y, contexto?, PP: 2, ... }, ... }
 *   partidos_29N.json      { PP: { x, y }, ... }
 *   partidos-visual.json   { PP: { slug: 'pp', nombre: 'PP', titulo: 'Partido Popular' }, ... }
 *                          (cómo se llama cada partido en pantalla y su clase de color is-<slug>)
 *
 * Para cambiar de preguntas o de partidos basta con sustituir los JSON. Aquí se validan (si algo no
 * cuadra, falla al cargar con la lista de errores) y se pasan al formato interno.
 *
 * Las respuestas de los partidos en preguntas_29N.json vienen YA ORIENTADAS: negativo = izquierda /
 * progresista, positivo = derecha / conservador. Lo que marca el lector se orienta con `tipo` en calculo.js.
 * Si el equipo de datos cambiara el formato, el test "DATOS: partidos_29N.json coincide…" falla.
 *
 * Sin imports de JSON a propósito: lo usan el navegador (src/js/elecciones/index.js), la compilación de
 * las plantillas (src/data/index.js) y los tests de Node, y cada uno carga los JSON a su manera.
 */

const CAMPOS_PREGUNTA = new Set(['claim', 'familia', 'tipo', 'peso_x', 'peso_y', 'contexto']);

/**
 * Devuelve:
 *   preguntas  [{ id: 'p1', claim, familia, contexto, tipo, pesoX, pesoY, partidos: { PP: 2, ... } }]
 *   partidos   [{ id: 'Frente Amplio', slug: 'frente-amplio', nombre: 'F. Amplio', titulo, colorClass, x, y }]
 *   familias   ['Inmigración', 'Vivienda', ...]  (orden de aparición: el del radar)
 *   limites    { x, y }: hasta dónde puede llegar un punto en cada eje
 */
export function prepararDatos(preguntasJson, partidosJson, visualJson = {}) {
  const errores = [];
  const nombres = Object.keys(partidosJson ?? {});
  if (!nombres.length) errores.push('partidos: no hay ningún partido');

  const partidos = nombres.map((nombre) => {
    const { x, y } = partidosJson[nombre] ?? {};
    if (!Number.isFinite(x) || !Number.isFinite(y)) errores.push(`partidos.${nombre}: x e y deben ser números`);
    const visual = visualJson[nombre];
    if (!visual?.slug || !visual?.nombre) errores.push(`partidos-visual.${nombre}: falta slug o nombre`);
    const slug = visual?.slug ?? nombre;
    return {
      id: nombre,
      slug,
      nombre: visual?.nombre ?? nombre,
      titulo: visual?.titulo ?? visual?.nombre ?? nombre,
      colorClass: `is-${slug}`,
      x,
      y,
    };
  });
  for (const clave of Object.keys(visualJson)) {
    if (!nombres.includes(clave)) errores.push(`partidos-visual.${clave}: partido que no está en partidos_29N.json`);
  }

  const entradas = Object.entries(preguntasJson ?? {});
  if (!entradas.length) errores.push('preguntas: no hay ninguna pregunta');

  const preguntas = entradas.map(([id, p]) => {
    const ref = `preguntas.${id}`;
    if (typeof p?.claim !== 'string' || !p.claim.trim()) errores.push(`${ref}: falta "claim"`);
    if (typeof p?.familia !== 'string' || !p.familia.trim()) errores.push(`${ref}: falta "familia"`);
    if (p?.tipo !== 1 && p?.tipo !== -1) errores.push(`${ref}: "tipo" debe ser 1 o -1`);
    for (const c of ['peso_x', 'peso_y']) {
      if (!Number.isFinite(p?.[c]) || p[c] < 0) errores.push(`${ref}: "${c}" debe ser un número >= 0`);
    }
    if (p?.peso_x === 0 && p?.peso_y === 0) errores.push(`${ref}: peso_x y peso_y no pueden ser ambos 0`);
    if (p?.contexto !== undefined && typeof p.contexto !== 'string') errores.push(`${ref}: "contexto" debe ser texto`);

    const respuestas = {};
    for (const nombre of nombres) {
      const v = p?.[nombre];
      if (!Number.isInteger(v) || v < -2 || v > 2) errores.push(`${ref}.${nombre}: debe ser un entero de -2 a 2`);
      respuestas[nombre] = v;
    }
    for (const clave of Object.keys(p ?? {})) {
      if (!CAMPOS_PREGUNTA.has(clave) && !nombres.includes(clave)) {
        errores.push(`${ref}.${clave}: partido que no está en partidos_29N.json`);
      }
    }
    return {
      id,
      claim: p?.claim,
      familia: p?.familia,
      contexto: typeof p?.contexto === 'string' ? p.contexto.trim() || null : null, // texto de "Necesito saber más"
      tipo: p?.tipo,
      pesoX: p?.peso_x,
      pesoY: p?.peso_y,
      partidos: respuestas,
    };
  });

  const suma = (k) => preguntas.reduce((s, p) => s + (p[k] || 0), 0);
  for (const [k, eje] of [['pesoX', 'x'], ['pesoY', 'y']]) {
    if (preguntas.length && !(suma(k) > 0)) errores.push(`preguntas: ninguna pregunta pesa en el eje ${eje} (no se puede dividir entre 0)`);
  }
  if (errores.length) throw new Error(`Datos del test no válidos:\n- ${errores.join('\n- ')}`);

  // El lector se divide entre la suma de pesos de cada eje, así que no pasa de ±2. Los partidos tampoco
  // deberían; si alguno se sale, el plano se amplía para que quepa.
  const maxAbs = (k) => Math.max(0, ...partidos.map((pt) => Math.abs(pt[k])));
  const limites = { x: Math.max(2, maxAbs('x')), y: Math.max(2, maxAbs('y')) };

  const familias = [...new Set(preguntas.map((p) => p.familia))];
  return { preguntas, partidos, familias, limites };
}
