/**
 * Analítica de la narrativa (plan "Etiquetado Narrativas"): avisa a Adobe Tags de cada hito del test con un
 * Direct Call, `_satellite.track(directCall, { AEP_eventName, AEP_customName })`.
 *
 * AEP_customName es un texto con 4 trozos separados por "|" que analítica parte después en CJA:
 *   [id-campaña]|[acción]|[nº de paso con 2 dígitos]|[resultado]
 *   ej.: "29n-elecciones|paso|04|"   "29n-elecciones|compartir|25|Vox"
 *
 * Reglas del plan:
 *   - el paso siempre con 2 dígitos (5 → "05"), para que CJA los ordene bien;
 *   - ningún trozo puede llevar "|" (es el separador): se cambia por "-".
 *
 * `_satellite` lo pone en la página el script de Adobe del medio. Si no está (localhost, bloqueador de
 * anuncios, sin consentimiento...) no se hace nada, y un fallo de la analítica nunca rompe el test.
 */
import { CONFIG } from './config.js';

const { CAMPANA, EVENTO } = CONFIG.ANALITICA;

/** Los Direct Calls que hay creados en Adobe Tags (sección 2.2 del plan). */
export const DIRECT_CALLS = Object.freeze({
  iniciar: 'iniciarNarrativa',
  paso: 'pasoNarrativa',
  compartir: 'compartirResultadoNarrativa',
  reiniciar: 'reiniciarNarrativa',
});

/** Quita el separador de un valor dinámico. */
const limpiar = (valor) => String(valor ?? '').replace(/\|/g, '-');

/** Paso con 2 dígitos: 0 → "00", 5 → "05", 24 → "24". */
export const pasoConCeros = (paso) => String(Math.max(0, Math.trunc(Number(paso) || 0))).padStart(2, '0');

/** El texto de AEP_customName: "29n-elecciones|paso|05|". */
export function payloadNarrativa(accion, paso, resultado = '') {
  return [limpiar(CAMPANA), limpiar(accion), pasoConCeros(paso), limpiar(resultado)].join('|');
}

/**
 * Envía un hito. `accion` es una clave de DIRECT_CALLS ('iniciar', 'paso', 'compartir', 'reiniciar').
 * `satellite` solo se pasa en los tests; en la página se usa window._satellite.
 * Devuelve el payload enviado, o null si no se envió.
 */
export function trackNarrativa(accion, paso, resultado = '', satellite = globalThis._satellite) {
  const directCall = DIRECT_CALLS[accion];
  if (!directCall || typeof satellite?.track !== 'function') return null;
  const payload = { AEP_eventName: EVENTO, AEP_customName: payloadNarrativa(accion, paso, resultado) };
  try {
    satellite.track(directCall, payload);
    return payload;
  } catch {
    return null;
  }
}
