/**
 * "Compartir mi resultado": texto, enlaces a redes, nombre del medio y qué admite el navegador con la imagen.
 * Funciones puras (salvo copiarAlPortapapeles); el modal y la imagen están en src/js/modules/electionsShare.js.
 */
import { CONFIG, DOMINIOS_MEDIOS, NOMBRES_MEDIOS } from './config.js';

// ---------- texto y enlaces (funciones puras) ----------

/** Rellena la plantilla: {medio} {partido1} {afinidad1} {partido2} {afinidad2} {enlace}. */
export function textoCompartir({ ranking, nombreMedio, enlace, plantilla = CONFIG.COMPARTIR.plantilla }) {
  const [a, b] = ranking;
  const valores = {
    medio: nombreMedio,
    partido1: a?.nombre ?? '',
    afinidad1: a ? Math.round(a.afinidad) : '',
    partido2: b?.nombre ?? '',
    afinidad2: b ? Math.round(b.afinidad) : '',
    enlace,
  };
  return plantilla.replace(/\{(\w+)\}/g, (todo, clave) => (clave in valores ? String(valores[clave]) : todo));
}

const enc = encodeURIComponent;

/**
 * URL de cada red. `texto` ya lleva el enlace dentro (WhatsApp, X, Threads lo usan tal cual).
 * Facebook y LinkedIn solo aceptan la URL: el texto no se puede precargar, y la tarjeta que enseñan sale de
 * las etiquetas og: de la página del test (no del resultado del lector).
 */
export function enlacesRedes({ texto, enlace }) {
  return {
    whatsapp: `https://wa.me/?text=${enc(texto)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(enlace)}`,
    twitter: `https://twitter.com/intent/tweet?text=${enc(texto)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(enlace)}`,
    telegram: `https://t.me/share/url?url=${enc(enlace)}&text=${enc(texto)}`,
    threads: `https://www.threads.net/intent/post?text=${enc(texto)}`,
  };
}

/** Nombre del medio para el texto: og:site_name de la página; si no hay, la tabla NOMBRES_MEDIOS. */
export function nombreDelMedio(idMedio, doc = globalThis.document) {
  const og = doc?.querySelector?.('meta[property="og:site_name"]')?.content?.trim();
  return og || NOMBRES_MEDIOS[idMedio] || idMedio || '';
}

/**
 * Enlace al test en el medio del lector: https://{dominio del medio}{CONFIG.COMPARTIR.ruta}
 * (www.abc.es/elecciones/generales/..., www.hoy.es/elecciones/generales/...).
 * No se usa el canonical: en los regionales apunta a la noticia de El Correo.
 * Solo si el medio no está en DOMINIOS_MEDIOS (no debería pasar): el canonical o la URL actual sin
 * parámetros ni ancla.
 */
export function enlaceDelTest(idMedio, doc = globalThis.document) {
  const dominio = DOMINIOS_MEDIOS[idMedio];
  if (dominio) return `https://${dominio}${CONFIG.COMPARTIR.ruta}`;
  const canonical = doc?.querySelector?.('link[rel="canonical"]')?.href;
  if (canonical) return canonical;
  const loc = doc?.location;
  return loc ? `${loc.origin}${loc.pathname}` : '';
}

/** Todo lo que necesita el modal, a partir del resultado de test.calcular() / finalizar(). */
export function datosCompartir({ resultado, medio, doc = globalThis.document, enlace = enlaceDelTest(medio?.id, doc) }) {
  const nombreMedio = nombreDelMedio(medio?.id, doc);
  const texto = textoCompartir({ ranking: resultado.ranking, nombreMedio, enlace });
  return { texto, enlace, nombreMedio, redes: enlacesRedes({ texto, enlace }) };
}

// ---------- imagen: qué admite el navegador ----------

/**
 * copiar:    Clipboard API con imágenes (Chrome 76+, Edge 79+, Firefox 127+, Safari 13.1+). Solo PNG.
 * compartir: menú de compartir del sistema con archivos (sobre todo móvil: WhatsApp, Instagram...).
 * Descargar funciona siempre.
 */
export function capacidadesImagen(nav = globalThis.navigator, Item = globalThis.ClipboardItem, Archivo = globalThis.File) {
  const copiar = typeof Item === 'function' && typeof nav?.clipboard?.write === 'function';
  let compartir = false;
  try {
    compartir =
      typeof nav?.share === 'function' &&
      typeof Archivo === 'function' &&
      Boolean(nav.canShare?.({ files: [new Archivo([''], 'resultado.png', { type: 'image/png' })] }));
  } catch {
    compartir = false;
  }
  return { copiar, compartir };
}

// ---------- portapapeles ----------

export async function copiarAlPortapapeles(texto, doc = globalThis.document) {
  try {
    await navigator.clipboard.writeText(texto); // https o localhost
    return true;
  } catch {
    // Navegadores antiguos o sin permiso: textarea + execCommand.
    try {
      const ta = doc.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      doc.body.append(ta);
      ta.select();
      const ok = doc.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
