import { ALLOWED_MEDIAS, CONFIG } from './config.js';

export const esMedioPermitido = (medio) =>
  typeof medio === 'string' && ALLOWED_MEDIAS.includes(medio);

/**
 * Saca el medio de un hostname.
 * Se mira el dominio registrable (la penúltima etiqueta), no un "contiene":
 *   www.elcorreo.com      -> elcorreo
 *   pre.elcorreo.com      -> elcorreo
 *   www.hoy.es            -> hoy
 *   www.salamancahoy.es   -> salamancahoy   (no "hoy")
 *   abc.otrodominio.com   -> null           (no "abc")
 */
export function medioDesdeHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/\.$/, '');
  if (CONFIG.HOSTS_EXTRA[host]) return CONFIG.HOSTS_EXTRA[host];

  const etiquetas = host.split('.');
  if (etiquetas.length < 2) return null;

  const dominio = etiquetas[etiquetas.length - 2];
  return esMedioPermitido(dominio) ? dominio : null;
}

const esHostDev = (host) => CONFIG.HOSTS_DEV.includes(host) || CONFIG.SUFIJOS_DEV.some((s) => host.endsWith(s));

/**
 * Decide en qué medio está el lector. Orden:
 *  1. hostname de la página (el caso normal: el test vive en www.elcorreo.com).
 *  2. medio explícito (p. ej. data-medio del embed) si el host no es un medio.
 *  3. referrer, si el test va dentro de un iframe servido desde un dominio común.
 *  4. en local: ?medio=xxx o CONFIG.MEDIO_DEV.
 * Si nada encaja: { id: null, permitido: false } -> se puede hacer el test, pero no se envía ni se lee.
 *
 * Ojo: esta comprobación es de cliente. La protección real es la lista ALLOWED_MEDIAS del backend.
 */
export function detectarMedio({ hostname = '', search = '', referrer = '', enIframe = false, explicito = null } = {}) {
  const host = String(hostname).toLowerCase();
  const dev = esHostDev(host);

  const porHost = medioDesdeHost(host);
  if (porHost) return { id: porHost, permitido: true, origen: 'hostname', dev: false };

  if (esMedioPermitido(explicito)) return { id: explicito, permitido: true, origen: 'explicito', dev };

  if (enIframe && referrer) {
    try {
      const porReferrer = medioDesdeHost(new URL(referrer).hostname);
      if (porReferrer) return { id: porReferrer, permitido: true, origen: 'referrer', dev: false };
    } catch {
      /* referrer no válido */
    }
  }

  if (dev) {
    const pedido = new URLSearchParams(search).get('medio');
    const id = esMedioPermitido(pedido) ? pedido : CONFIG.MEDIO_DEV;
    return { id, permitido: true, origen: 'dev', dev: true };
  }

  return { id: null, permitido: false, origen: null, dev: false };
}
