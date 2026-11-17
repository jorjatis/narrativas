/**
 * Lógica matemática del test: port a JS de backup_afinidad_parte2.ipynb (celda FUNCIONES).
 * Funciones puras: sin DOM, sin storage, sin red.
 *
 * Ejes:  X = económico (negativo izquierda ... positivo derecha)
 *        Y = social    (negativo progresista ... positivo conservador)
 *
 *  1. Respuesta orientada del lector = lo que marca (-2..2) · tipo         (notebook: respuesta * tipo)
 *     Las de los partidos ya vienen orientadas en preguntas_29N.json (ver datos.js).
 *  2. Coordenadas del lector (coordenadas_afinidad):
 *        x = Σ(orientada · peso_x) / Σ peso_x
 *        y = Σ(orientada · peso_y) / Σ peso_y        -> de -2 a 2 en cada eje
 *     Neutro (0) cuenta como una respuesta más. Las de los partidos son las de partidos_29N.json.
 *     Se guarda y se envía el MISMO punto que se usa para la afinidad y se pinta en el mapa.
 *  3. Afinidad (Manhattan normalizada, coordenadas_afinidad):
 *        ((1 - |dx| / 4) + (1 - |dy| / 4)) / 2 · 100
 *     100 % mismo punto · 50 % igual en un eje y opuesto en el otro · 0 % opuestos en los dos.
 *  4. Pregunta a pregunta (distancia_preguntas): |partido - lector| sobre las orientadas, de 0 a 4.
 *  5. Radar (medias_familia): media de las orientadas por familia + 3, de 1 (centro) a 5 (borde).
 */
import { CONFIG, ESCALA } from './config.js';

const OPCION_POR_ID = new Map(ESCALA.map((o) => [o.idResp, o]));

export const opcionPorId = (idResp) => OPCION_POR_ID.get(Number(idResp)) ?? null;
export const valorDeRespuesta = (idResp) => opcionPorId(idResp)?.valor ?? null;

export const redondear = (n, d = CONFIG.DECIMALES) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

/** Paso 1: lo que marca el lector (-2..2) pasado a izquierda (negativo) / derecha (positivo). */
export const orientar = (pregunta, valor) => valor * pregunta.tipo;

/** Mapa idPreg -> valor marcado (-2..2) a partir de respuestasUser [{ idPreg, valor }]. */
const valoresPorPregunta = (respuestasUser) => new Map(respuestasUser.map((r) => [r.idPreg, r.valor]));

/**
 * Paso 2. Se divide entre la suma de pesos de TODAS las preguntas: con el test a medias, las que faltan
 * no suman nada (solo pasa si se llama antes de terminar).
 */
export function coordenadasUsuario(preguntas, respuestasUser) {
  const valores = valoresPorPregunta(respuestasUser);
  let x = 0;
  let y = 0;
  let pesoX = 0;
  let pesoY = 0;
  for (const p of preguntas) {
    pesoX += p.pesoX;
    pesoY += p.pesoY;
    if (!valores.has(p.id)) continue;
    const o = orientar(p, valores.get(p.id));
    x += o * p.pesoX;
    y += o * p.pesoY;
  }
  return { x: x / pesoX, y: y / pesoY };
}

/**
 * Paso 3. Con los ejes de -2 a 2 ya no puede salir de 0..100; el recorte se queda solo como protección
 * por si un partido de partidos_29N.json se saliera del plano.
 */
export function afinidad(a, b) {
  const ax = 1 - Math.abs(a.x - b.x) / 4;
  const ay = 1 - Math.abs(a.y - b.y) / 4;
  return Math.min(100, Math.max(0, ((ax + ay) / 2) * 100));
}

const media = (ns) => (ns.length ? ns.reduce((s, n) => s + n, 0) / ns.length : null);

/**
 * Todo lo que necesitan las pantallas de resultados:
 *   usuario      { x, y }
 *   partidos     [{ id, nombre, color, posicion: { x, y }, afinidad }]   en el orden de los datos
 *   ranking      los mismos, de más a menos afinidad
 *   masCercano   ranking[0]
 *   candidato    el partido que eligió el lector (candidateSelected) o null
 *   porPregunta  [{ id, claim, familia, tipo, usuario: { valor, orientado },
 *                   partidos: { [id]: { valor, orientado, distancia } } }]
 *                  valor = en la escala de la frase (-2 muy en desacuerdo ... 2 muy de acuerdo), para el
 *                  deslizador; orientado = izquierda/derecha; distancia = |partido - lector| (0..4)
 *   temas        [{ familia, usuario, partidos: { [id]: media } }]  de 1 (centro) a 5 (borde) para el radar
 *   contestadas, neutras
 */
export function calcularResultado({ preguntas, partidos, familias, respuestasUser, candidato = null }) {
  const valores = valoresPorPregunta(respuestasUser);
  const usuario = coordenadasUsuario(preguntas, respuestasUser);
  const r = (n) => redondear(n);

  const conAfinidad = partidos.map((pt) => ({
    id: pt.id,
    nombre: pt.nombre,
    color: pt.color,
    posicion: { x: pt.x, y: pt.y },
    afinidad: redondear(afinidad(usuario, pt), 2), // como el notebook
  }));
  const ranking = conAfinidad.slice().sort((a, b) => b.afinidad - a.afinidad);

  const porPregunta = preguntas.map((p) => {
    const valor = valores.get(p.id) ?? null;
    const orientado = valor === null ? null : orientar(p, valor);
    const deLosPartidos = {};
    for (const pt of partidos) {
      const o = p.partidos[pt.id];
      deLosPartidos[pt.id] = {
        valor: o * p.tipo, // de vuelta a la escala de la frase (tipo es ±1)
        orientado: o,
        distancia: orientado === null ? null : Math.abs(o - orientado),
      };
    }
    return { id: p.id, claim: p.claim, familia: p.familia, tipo: p.tipo, usuario: { valor, orientado }, partidos: deLosPartidos };
  });

  const temas = familias.map((familia) => {
    const ps = preguntas.filter((p) => p.familia === familia);
    const delUsuario = ps.filter((p) => valores.has(p.id)).map((p) => orientar(p, valores.get(p.id)));
    const deLosPartidos = {};
    // + 3: el radar va de 1 (centro) a 5 (borde), como el notebook
    for (const pt of partidos) deLosPartidos[pt.id] = r(media(ps.map((p) => p.partidos[pt.id])) + 3);
    const m = media(delUsuario);
    return { familia, usuario: m === null ? null : r(m + 3), partidos: deLosPartidos };
  });

  return {
    usuario: { x: r(usuario.x), y: r(usuario.y) },
    partidos: conAfinidad,
    ranking,
    masCercano: ranking[0] ?? null,
    candidato: conAfinidad.find((p) => p.id === candidato) ?? null,
    porPregunta,
    temas,
    contestadas: valores.size,
    neutras: respuestasUser.filter((x) => x.valor === 0).length,
  };
}
