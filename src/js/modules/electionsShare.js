// html2canvas (~190 KB) solo se descarga cuando hace falta: al abrir el modal de compartir.
let html2canvasCargado = null;
const cargarHtml2canvas = () =>
  (html2canvasCargado ??= import(/* webpackChunkName: "html2canvas" */ 'html2canvas').then((m) => m.default));
import { capacidadesImagen, copiarAlPortapapeles, datosCompartir, nombreDelMedio } from '../elecciones/compartir';
import { logoDelMedio } from '../elecciones/logos';

const IMAGE_NAME = 'elecciones-resultado.jpg';
// Ancho máximo de la imagen, en px CSS (con scale: 2, el fichero mide el doble).
const ANCHO_MAX_CAPTURA = 920;

function appleTouchIcon() {
  const icon = document.querySelector('link[rel="apple-touch-icon"][sizes="57x57"]')
    || document.querySelector('link[rel="apple-touch-icon"]');
  return icon ? icon.href : '';
}

function pageTitle() {
  return (document.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
}

/** Texto y enlaces del resultado actual (src/js/elecciones/compartir.js), o null si aún no hay resultado. */
function datosActuales(app) {
  const resultado = app?.resultadoActual();
  return resultado ? datosCompartir({ resultado, medio: app.test.medio }) : null;
}

function avisar(modal, texto) {
  const estado = modal.querySelector('.v-elec-share-img__estado');
  if (estado) estado.textContent = texto;
}

function fillShareModal(modal, app) {
  const datos = datosActuales(app);
  const texto = datos?.texto ?? '';

  // El campo enseña lo mismo que se copia (texto + enlace). La etiqueta va vacía, como en el compartidor
  // de Vocento: si se rellenan las dos, su CSS las pinta una encima de otra.
  const input = modal.querySelector('.v-frm__i');
  if (input) input.value = texto;

  const logo = modal.querySelector('.v-mdl__h .v-log__i');
  const icon = appleTouchIcon();
  if (logo && icon) logo.src = icon;

  const heading = modal.querySelector('.v-mdl__p');
  if (heading) heading.textContent = pageTitle();

  avisar(modal, '');
  return datos;
}

function bindCopy(modal, app) {
  modal.querySelectorAll('[data-elec-copiar]').forEach((button) => {
    button.addEventListener('click', async () => {
      const datos = fillShareModal(modal, app);
      if (!datos) return;
      const ok = await copiarAlPortapapeles(datos.texto);
      if (!ok) {
        avisar(modal, 'No se ha podido copiar: selecciona el texto a mano');
        return;
      }
      button.classList.add('is-active'); // icono de check (sin texto de aviso)
      window.clearTimeout(Number(button.dataset.elecTimer));
      button.dataset.elecTimer = String(window.setTimeout(() => {
        button.classList.remove('is-active');
      }, 2500));
    });
  });
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('No se pudo crear la imagen'));
    }, type, quality);
  });
}

function chartSpan(chart) {
  const box = chart.getBoundingClientRect();
  let left = box.left;
  let right = box.right;
  chart.querySelectorAll('.v-elec-matriz__axis, .v-elec-matriz__frame').forEach((el) => {
    const rect = el.getBoundingClientRect();
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
  });
  return Math.ceil(right - left);
}

const ESTILOS = 'link[rel~="stylesheet"], style';

/** Logo del medio (SVG en línea, sin red) o, si no lo tenemos, su nombre en texto. */
function cabeceraMedio(app) {
  const caja = document.createElement('div');
  caja.className = 'v-elec-capture__logo';
  const svg = logoDelMedio(app?.test?.medio?.id);
  if (svg) {
    caja.innerHTML = svg;
  } else {
    const nombre = nombreDelMedio(app?.test?.medio?.id);
    if (!nombre) return null;
    const texto = document.createElement('span');
    texto.className = 'v-elec-capture__medio';
    texto.textContent = nombre;
    caja.append(texto);
  }
  return caja;
}

function captureCanvas(app) {
  const header = document.querySelector('.v-elec-h');
  const matriz = document.querySelector('.v-elec-matriz');
  const widgets = document.querySelector('.v-elec-widgets');
  if (!header || !matriz) return Promise.reject(new Error('No hay resultado para capturar'));

  const chart = matriz.querySelector('.v-elec-matriz__chart');
  const liveWidth = widgets?.clientWidth || matriz.clientWidth;
  const chartWidth = chart ? chartSpan(chart) : liveWidth;

  const stage = document.createElement('div');
  stage.className = 'v-elec-capture';
  stage.setAttribute('aria-hidden', 'true');
  stage.style.boxSizing = 'content-box';
  stage.style.width = `${Math.max(liveWidth, chartWidth)}px`;
  stage.style.padding = '8px 32px 24px';

  const matrizClone = matriz.cloneNode(true);
  matrizClone.querySelector('#shareResults')?.remove();
  matrizClone.querySelector('.v-bdp')?.remove();
  matrizClone.querySelector('[popovertarget="shareResults"]')?.closest('.v-btn-c')?.remove();
  matrizClone.querySelector('.v-elec-matriz__toggle')?.remove();
  matrizClone.querySelector('.v-elec-matriz__readers')?.remove();
  matrizClone.querySelector('.v-elec-matriz__callout')?.remove();

  const chartClone = matrizClone.querySelector('.v-elec-matriz__chart');
  if (chartClone) {
    chartClone.style.transform = 'none';
    chartClone.style.width = 'max-content';
    chartClone.style.marginLeft = 'auto';
    chartClone.style.marginRight = 'auto';
  }

  // Arriba, el logo del medio en lugar de la mini-matriz decorativa de la cabecera.
  const headerClone = header.cloneNode(true);
  headerClone.querySelector('.v-elec-h__mark')?.remove();
  const logo = cabeceraMedio(app);
  if (logo) stage.append(logo);
  stage.append(headerClone, matrizClone);
  document.body.append(stage);

  // En pantallas anchas el escenario puede medir más de ANCHO_MAX_CAPTURA, pero el contenido va centrado
  // y nunca lo supera: se recorta lo que sobra por los laterales, a partes iguales.
  const stageWidth = Math.ceil(stage.getBoundingClientRect().width);
  const width = Math.min(stageWidth, ANCHO_MAX_CAPTURA);
  const x = Math.floor((stageWidth - width) / 2);

  return cargarHtml2canvas().then((html2canvas) => html2canvas(stage, {
    x, // desplazamiento desde el borde izquierdo del escenario (html2canvas 1.4 le suma su posición)
    width,
    backgroundColor: '#F9F6EE',
    scale: 2,
    logging: false,
    useCORS: true,
    imageTimeout: 4000,
    // html2canvas copia TODA la página en un iframe y espera a que carguen todas sus imágenes
    // (en un artículo del CMS: fotos, lazy-loads, anuncios…). Solo hace falta la captura:
    // se descarta todo lo del <body> que no sea la captura o uno de sus contenedores, SALVO las hojas
    // de estilo: en el CMS el <link> de main.css va dentro del cuerpo de la noticia y, sin él, la
    // captura salía sin nuestros estilos.
    ignoreElements: (el) => document.body.contains(el)
      && el !== stage && !el.contains(stage) && !stage.contains(el)
      && !el.matches(ESTILOS) && !el.querySelector(ESTILOS),
  })).finally(() => stage.remove());
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = IMAGE_NAME;
  document.body.append(link);
  link.click();
  link.remove();
  // Revocar en el mismo instante cancela la descarga en algunos navegadores (Firefox, Safari).
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function showImageFeedback(button) {
  const label = button.querySelector('.v-elec-share-img__t');
  const done = button.getAttribute('data-elec-done');
  if (!label || !done) return;

  if (!button.dataset.elecLabel) button.dataset.elecLabel = label.textContent;
  label.textContent = done;
  button.classList.add('is-active');
  window.clearTimeout(Number(button.dataset.elecTimer));
  button.dataset.elecTimer = String(window.setTimeout(() => {
    button.classList.remove('is-active');
    label.textContent = button.dataset.elecLabel;
  }, 2000));
}

function bindImageActions(modal, app) {
  // Copiar y compartir la imagen solo si el navegador lo admite (descargar funciona siempre).
  const puede = capacidadesImagen();
  const copyBtn = modal.querySelector('[data-elec-share="copy"]');
  const shareBtn = modal.querySelector('[data-elec-share="share"]');
  if (copyBtn) copyBtn.hidden = !puede.copiar;
  if (shareBtn) shareBtn.hidden = !puede.compartir;

  // Una captura por apertura del modal: se genera nada más abrirlo (mientras el lector elige)
  // y los botones reutilizan el mismo canvas y los mismos ficheros PNG/JPG.
  let cache = null;
  function captura() {
    if (!cache) {
      const shot = captureCanvas(app);
      const actual = { shot, png: null, jpeg: null };
      cache = actual;
      shot.catch(() => { if (cache === actual) cache = null; }); // si falla, el siguiente clic lo reintenta
    }
    return cache;
  }
  function imagen(tipo) {
    const c = captura();
    const clave = tipo === 'image/png' ? 'png' : 'jpeg';
    c[clave] ??= c.shot.then((shot) => toBlob(shot, tipo, tipo === 'image/jpeg' ? 0.92 : undefined));
    return c[clave];
  }
  function precalentar() {
    cache = null; // el resultado puede haber cambiado desde la última vez
    const lanzar = () => {
      if (!modal.matches(':popover-open')) return; // ya lo han cerrado
      imagen('image/jpeg').catch(() => {});
      if (puede.copiar) imagen('image/png').catch(() => {});
    };
    // Tras la animación de apertura, para no entorpecerla.
    if ('requestIdleCallback' in window) window.requestIdleCallback(lanzar, { timeout: 400 });
    else window.setTimeout(lanzar, 200);
  }
  modal.addEventListener('toggle', (event) => {
    if (event.newState === 'open') precalentar();
  });

  modal.querySelectorAll('[data-elec-share]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-elec-share');

      if (action === 'copy') {
        // write() dentro del mismo clic y con la imagen como promesa: es lo que exige Safari.
        navigator.clipboard.write([new ClipboardItem({ 'image/png': imagen('image/png') })])
          .then(() => showImageFeedback(button))
          .catch(() => avisar(modal, 'No se ha podido copiar la imagen: prueba a descargarla'));
        return;
      }

      imagen('image/jpeg').then(async (blob) => {
        if (action === 'download') {
          downloadBlob(blob);
          showImageFeedback(button);
          return;
        }
        const file = new File([blob], IMAGE_NAME, { type: 'image/jpeg' });
        if (!navigator.canShare?.({ files: [file] })) return;
        await navigator.share({ files: [file], title: pageTitle(), text: datosActuales(app)?.texto });
      }).catch((error) => {
        if (error?.name === 'AbortError') return; // el lector cerró el menú de compartir
        avisar(modal, 'No se ha podido generar la imagen');
      });
    });
  });
}

function bindShares(modal, app) {
  modal.querySelectorAll('[data-elec-red]').forEach((button) => {
    button.addEventListener('click', () => {
      const datos = datosActuales(app);
      const url = datos?.redes[button.getAttribute('data-elec-red')];
      if (url) window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    });
  });
}

export function initElectionsShare(app) {
  const modal = document.getElementById('shareResults');
  if (!modal || !app) return;

  const fill = () => fillShareModal(modal, app);
  fill();
  bindCopy(modal, app);
  bindShares(modal, app);
  bindImageActions(modal, app);
  document.querySelectorAll('[popovertarget="shareResults"]').forEach((button) => {
    button.addEventListener('click', fill);
  });
  modal.addEventListener('toggle', (event) => {
    if (event.newState === 'open') fill();
  });
  // Se adelanta la descarga de html2canvas en cuanto el lector va a compartir.
  document.querySelectorAll('[popovertarget="shareResults"]').forEach((button) => {
    button.addEventListener('click', () => cargarHtml2canvas().catch(() => {}), { once: true });
  });
}
