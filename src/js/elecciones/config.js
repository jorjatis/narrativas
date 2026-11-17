/**
 * Configuración general del test electoral.
 * Todo lo que cambie entre ediciones del test (elecciones, entorno, límites) vive aquí.
 */

/** Medios que pueden guardar y leer coordenadas (mismo listado que ALLOWED_MEDIAS del backend). */
export const ALLOWED_MEDIAS = Object.freeze([
  'elcorreo',
  'laverdad',
  'diariovasco',
  'elnortedecastilla',
  'lasprovincias',
  'elcomercio',
  'eldiariomontanes',
  'hoy',
  'ideal',
  'leonoticias',
  'larioja',
  'diariosur',
  'surinenglish',
  'burgosconecta',
  'canarias7',
  'salamancahoy',
  'todoalicante',
  'lagacetadesalamanca',
  'abc',
  'lavozdigital',
  'huelva24',
  'elbierzonoticias',
  'mujerhoy',
]);

/**
 * Nombre de cada medio para el texto de "Compartir mi resultado". Solo se usa si la página no tiene
 * <meta property="og:site_name">, que es lo primero que se mira. REVISAR con cada medio.
 */
export const NOMBRES_MEDIOS = Object.freeze({
  elcorreo: 'El Correo',
  laverdad: 'La Verdad',
  diariovasco: 'El Diario Vasco',
  elnortedecastilla: 'El Norte de Castilla',
  lasprovincias: 'Las Provincias',
  elcomercio: 'El Comercio',
  eldiariomontanes: 'El Diario Montañés',
  hoy: 'Hoy',
  ideal: 'Ideal',
  leonoticias: 'leonoticias',
  larioja: 'La Rioja',
  diariosur: 'Diario Sur',
  surinenglish: 'Sur in English',
  burgosconecta: 'BurgosConecta',
  canarias7: 'Canarias7',
  salamancahoy: 'SalamancaHOY',
  todoalicante: 'TodoAlicante',
  lagacetadesalamanca: 'La Gaceta de Salamanca',
  abc: 'ABC',
  lavozdigital: 'La Voz de Cádiz',
  huelva24: 'Huelva24',
  elbierzonoticias: 'El Bierzo Noticias',
  mujerhoy: 'Mujerhoy',
});

/**
 * Escala Likert fija y universal para todas las preguntas.
 * - idResp: lo que marca el radio button en el formulario (1..5).
 * - valor:  lo que entra en el cálculo (-2..2).
 * El 0 (Depende) es una postura más: cuenta en el cálculo con el mismo peso que el resto
 * y se puede elegir en todas las preguntas (quien conteste todo Depende cae en el centro, 0,0).
 */
export const ESCALA = Object.freeze([
  Object.freeze({ idResp: 1, valor: -2, etiqueta: 'Muy en desacuerdo' }),
  Object.freeze({ idResp: 2, valor: -1, etiqueta: 'En desacuerdo' }),
  Object.freeze({ idResp: 3, valor: 0, etiqueta: 'Depende' }),
  Object.freeze({ idResp: 4, valor: 1, etiqueta: 'De acuerdo' }),
  Object.freeze({ idResp: 5, valor: 2, etiqueta: 'Muy de acuerdo' }),
]);

/**
 * true en `npm start`, `npm run build:pruebas` y en los tests (Node); false en `npm run build` (producción).
 * Webpack sustituye ELEC_DESARROLLO al compilar (DefinePlugin) y el minificador elimina lo de desarrollo.
 */
// eslint-disable-next-line no-undef
const DESARROLLO = typeof ELEC_DESARROLLO === 'undefined' ? true : ELEC_DESARROLLO;

export const CONFIG = Object.freeze({
  /** "Compartir mi resultado" (src/compartir.js). */
  COMPARTIR: Object.freeze({
    plantilla:
      'Mis partidos más cercanos en el test de {medio} son {partido1} ({afinidad1}%) y {partido2} ({afinidad2}%). ' +
      '¿Coincidimos? Haz tu test en {enlace}',
  }),

  /**
   * Margen del plano de la matriz alrededor de los ejes de -2 a 2: con 0,2 se pinta de -2,2 a 2,2, para que
   * los puntos de los extremos (Vox, Podemos...) no queden pegados al borde. No afecta al cálculo ni a la API.
   */
  MARGEN_PLANO: 0.2,

  /** Identificador de esta edición del test. Cambiarlo = clave nueva de localStorage (empiezan de cero). */
  TEST_ID: 'generales-29n',

  /**
   * Analítica (Adobe Tags, plan "Etiquetado Narrativas"): ver src/js/elecciones/analitica.js.
   * CAMPANA es el primer trozo de AEP_customName ("29n-elecciones|paso|04|"). No es TEST_ID: lo fija analítica.
   * PASO_COMPARTIR / PASO_REINICIAR: el nº de paso que se envía en esos hitos (24 preguntas → 01..24; después, 25 y 26).
   */
  ANALITICA: Object.freeze({
    CAMPANA: '29n-elecciones',
    EVENTO: 'narrativa',
    PASO_COMPARTIR: 25,
    PASO_REINICIAR: 26,
  }),

  /** Número máximo de veces que un lector puede completar el test. */
  MAX_INTENTOS: 10,

  /** Se trata como límite por IP un 429 o cualquier error cuyo texto encaje (no está 100 % confirmado el formato). */
  PATRON_LIMITE_IP: /too many attempts/i,

  /** Endpoint de coordenadas. POST a la base, GET a `${API_BASE}/${medio}`. */
  API_BASE: 'https://service-data.vocento.com/api/coordenadas',
  API_TIMEOUT_MS: 12000,


  /** Decimales con los que se calculan y guardan las coordenadas en local. */
  DECIMALES: 3,

  /**
   * Decimales con los que se ENVÍAN al backend. Como el GET agrupa por punto exacto (weight),
   * con 1 decimal hay como mucho 41 x 41 puntos distintos en el plano, en vez de uno por lector.
   */
  DECIMALES_ENVIO: 1,

  /** Máximo de puntos de "otros lectores" que se devuelven para pintar (los de más peso). */
  MAX_PUNTOS_LECTORES: 300,


  /**
   * Desarrollo: en local (y en Netlify) se usa MEDIO_DEV salvo que se pase ?medio=xxx en la URL.
   * Nada de esto llega a producción: `npm run build` lo deja vacío (ver DESARROLLO arriba).
   */
  MEDIO_DEV: DESARROLLO ? 'elcorreo' : null,
  HOSTS_DEV: Object.freeze(DESARROLLO ? ['localhost', '127.0.0.1', '0.0.0.0', ''] : []),
  /** Además de HOSTS_DEV, cualquier subdominio de estos cuenta como desarrollo (p. ej. despliegues de Netlify). */
  SUFIJOS_DEV: Object.freeze(DESARROLLO ? ['.local', '.localhost', '.netlify.app'] : []),

  /**
   * Hosts que no siguen el patrón <medio>.<tld> y hay que mapear a mano
   * (preproducción, CDN propio, etc.). Ej: { 'pre-elcorreo.vocento.net': 'elcorreo' }
   */
  HOSTS_EXTRA: Object.freeze({}),
});
