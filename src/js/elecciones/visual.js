/**
 * Adaptadores: del resultado de calcularResultado() al formato que esperan los módulos de la visual
 * (src/js/modules/electionsMatriz.js, electionsRadial.js, electionsBars.js). Funciones puras.
 *
 *   Matriz  economic / social de 0 a 100 (0 = izquierda / progresista, 100 = derecha / conservador)
 *   Radar   valores de 1 (centro) a 5 (borde) por familia, en el orden de las familias
 *   Barras  distancia de 0 a 100 por pregunta (0 = misma respuesta, 100 = opuestas)
 *
 * El plano se pinta con un margen (CONFIG.MARGEN_PLANO): de -2,2 a 2,2. Usar limitesPlano(datos.limites).
 *
 * En la visual los partidos se identifican por su slug ('frente-amplio'); en los datos, por la clave del
 * JSON ('Frente Amplio'). `partidoPorSlug` / `partidoPorId` hacen la traducción.
 */

import { CONFIG } from './config.js';

/** Límites con los que se pinta el plano: los de los datos más el margen. */
export const limitesPlano = (limites, margen = CONFIG.MARGEN_PLANO) => ({ x: limites.x + margen, y: limites.y + margen });

/** De un eje de -limite..limite a 0..100. */
export const aEscala100 = (v, limite = 2) => Math.min(100, Math.max(0, ((v + limite) / (2 * limite)) * 100));

const punto100 = ({ x, y }, limites) => ({ economic: aEscala100(x, limites.x), social: aEscala100(y, limites.y) });

export const partidoPorSlug = (partidos, slug) => partidos.find((p) => p.slug === slug) ?? null;
export const partidoPorId = (partidos, id) => partidos.find((p) => p.id === id) ?? null;

const lectores100 = (otrosLectores, limites) =>
  otrosLectores.map((l) => ({ ...punto100(l, limites), force: l.peso ?? 1 }));

const partidos100 = (partidos, limites) =>
  partidos.map((p) => ({
    id: p.slug,
    name: p.nombre,
    colorClass: p.colorClass,
    ...punto100({ x: p.posicion?.x ?? p.x, y: p.posicion?.y ?? p.y }, limites),
  }));

/**
 * Modelo de la matriz con un resultado.
 *   resultado      calcularResultado() (con .partidos de datos, para slug/nombre/color)
 *   partidos       DATOS.partidos (slug, nombre, colorClass)
 *   otrosLectores  [{ x, y, peso }] del GET
 */
export function modeloMatriz({ resultado, partidos, otrosLectores = [], limites }) {
  const visual = (r) => ({ ...partidoPorId(partidos, r.id), afinidad: r.afinidad, posicion: r.posicion });
  const masCercano = visual(resultado.masCercano);
  const elegido = resultado.candidato ? visual(resultado.candidato) : masCercano;
  return {
    you: punto100(resultado.usuario, limites),
    parties: partidos100(resultado.partidos.map(visual), limites),
    closest: { id: masCercano.slug, name: masCercano.nombre, colorClass: masCercano.colorClass },
    chosen: { id: elegido.slug, name: elegido.nombre, ...punto100(elegido.posicion, limites) },
    closeness: Math.round(elegido.afinidad),
    readers: lectores100(otrosLectores, limites),
  };
}

/**
 * Modelo de la matriz cuando la IP está bloqueada: sin respuestas del lector.
 *   usuario  { x, y } de su último resultado guardado, o null (se pinta sin su punto: ver `sinUsuario`)
 */
export function modeloMatrizBloqueo({ usuario, partidos, otrosLectores = [], limites }) {
  const centro = { economic: 50, social: 50 };
  const primero = partidos[0];
  return {
    you: usuario ? punto100(usuario, limites) : centro,
    sinUsuario: !usuario,
    parties: partidos100(partidos, limites),
    closest: { name: primero.nombre, colorClass: primero.colorClass },
    chosen: { name: primero.nombre, ...(usuario ? punto100(usuario, limites) : centro) },
    closeness: 0,
    readers: lectores100(otrosLectores, limites),
  };
}

/** Barras: distancia 0..100 en cada pregunta con el partido (slug). Sin resultado, todo 0. */
export function distanciasBarras({ resultado, partidos, preguntas, slug }) {
  const partido = partidoPorSlug(partidos, slug);
  if (!resultado || !partido) return preguntas.map(() => 0);
  return resultado.porPregunta.map((q) => {
    const d = q.partidos[partido.id]?.distancia;
    return d == null ? 0 : Math.round((d / 4) * 100);
  });
}

/** Radar: 1..5 por familia. 'tu' = el lector (3 = el centro mientras no haya resultado). */
export function valoresRadar({ resultado, partidos, familias, temasPartidos, serie }) {
  if (serie === 'tu') {
    if (!resultado) return familias.map(() => 3);
    return resultado.temas.map((t) => t.usuario ?? 3);
  }
  const partido = partidoPorSlug(partidos, serie);
  if (!partido) return null;
  return temasPartidos.map((t) => t.partidos[partido.id]);
}
