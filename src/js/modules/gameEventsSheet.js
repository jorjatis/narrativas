import gameEvents, { DEFAULT_EVENTS } from './gameEvents';

/**
 * Columnas esperadas en el Google Sheet (fila de cabecera):
 * | id | description | image | alt | marker | markerAlt | correctTime |
 *
 * Ejemplo de URL pública (sheet publicado como "Cualquier persona con el enlace"):
 * https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
 */
export const SHEET_COLUMNS = [
  'id',
  'description',
  'image',
  'alt',
  'marker',
  'markerAlt',
  'correctTime',
];

/** ID de ejemplo — sustituir por el sheet real en producción. */
export const MOCK_SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

function flattenEvent(event) {
  return {
    id: event.id,
    description: event.description,
    image: event.image.src,
    alt: event.image.alt,
    marker: event.marker?.src ?? event.image.src,
    markerAlt: event.marker?.alt ?? event.image.alt,
    correctTime: event.correctTime,
  };
}

/** Filas mock con la misma forma que devolvería el Google Sheet. */
export const MOCK_SHEET_ROWS = DEFAULT_EVENTS.map(flattenEvent);

function normalizeColumnKey(label) {
  return String(label ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function rowToEvent(row) {
  const get = (...keys) => {
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  };

  const image = {
    src: String(get('image')),
    alt: String(get('alt')),
  };

  const markerSrc = String(get('marker', 'markerimage', 'markerImage'));
  const markerAlt = String(get('markeralt', 'markerAlt'));

  return {
    id: String(get('id')),
    description: String(get('description')),
    image,
    marker: {
      src: markerSrc || image.src,
      alt: markerAlt || image.alt,
    },
    correctTime: Number(get('correcttime', 'correctTime')),
  };
}

function buildGvizUrl(spreadsheetId, sheetName) {
  const params = new URLSearchParams({
    tqx: 'out:json',
    sheet: sheetName,
  });

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${params}`;
}

function parseGvizResponse(text) {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('Respuesta del Google Sheet no válida');
  }

  const payload = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  const table = payload.table;

  if (!table?.rows?.length) return [];

  const columns = table.cols.map((col) => normalizeColumnKey(col.label));

  return table.rows.map((row) => {
    const record = {};

    columns.forEach((column, index) => {
      record[column] = row.c[index]?.v ?? '';
    });

    return record;
  });
}

/**
 * Obtiene eventos desde un Google Sheet o desde el mock local.
 *
 * @param {Object} options
 * @param {string} [options.spreadsheetId]
 * @param {string} [options.sheetName='Sheet1']
 * @param {boolean} [options.useMock=true]
 * @param {Array} [options.mockRows=MOCK_SHEET_ROWS]
 */
export async function fetchEventsFromSheet({
  spreadsheetId = MOCK_SPREADSHEET_ID,
  sheetName = 'Sheet1',
  useMock = true,
  mockRows = MOCK_SHEET_ROWS,
} = {}) {
  if (useMock) {
    return mockRows.map(rowToEvent).filter((event) => event.id && event.description);
  }

  if (!spreadsheetId) {
    throw new Error('[gameEventsSheet] spreadsheetId es obligatorio cuando useMock es false');
  }

  const response = await fetch(buildGvizUrl(spreadsheetId, sheetName));

  if (!response.ok) {
    throw new Error(`[gameEventsSheet] Error al cargar el sheet (${response.status})`);
  }

  const rows = parseGvizResponse(await response.text());

  return rows.map(rowToEvent).filter((event) => event.id && event.description);
}

function setLoadingState(root, isLoading) {
  if (!root) return;

  root.classList.toggle('is-loading', isLoading);
  root.setAttribute('aria-busy', isLoading ? 'true' : 'false');
}

/**
 * Extensión de gameEvents que carga los eventos desde un Google Sheet.
 * Mismas opciones que gameEvents, más:
 *
 * @param {string} [options.spreadsheetId]
 * @param {string} [options.sheetName='Sheet1']
 * @param {boolean} [options.useMock=true] — true: usa MOCK_SHEET_ROWS; false: fetch real
 * @param {Array} [options.mockRows]
 * @param {(error: Error) => void} [options.onError]
 */
export default async function gameEventsFromSheet(options = {}) {
  const {
    spreadsheetId,
    sheetName = 'Sheet1',
    useMock = true,
    mockRows,
    onError,
    selector = '.events-roll',
    ...gameOptions
  } = options;

  const root = document.querySelector(selector);

  setLoadingState(root, true);

  try {
    const events = await fetchEventsFromSheet({
      spreadsheetId,
      sheetName,
      useMock,
      mockRows,
    });

    if (events.length === 0) {
      throw new Error('[gameEventsSheet] El sheet no devolvió eventos válidos');
    }

    gameEvents({ selector, ...gameOptions, events });
  } catch (error) {
    console.error(error);
    onError?.(error);
    gameEvents({ selector, ...gameOptions, events: DEFAULT_EVENTS });
  } finally {
    setLoadingState(root, false);
  }
}
