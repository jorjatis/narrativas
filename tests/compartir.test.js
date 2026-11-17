// "Compartir mi resultado": texto, enlaces de cada red, nombre del medio y enlace del test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nuevo, contestarTodo, comoPartido } from './ayuda.js';
import { textoCompartir, enlacesRedes, nombreDelMedio, enlaceDelTest, datosCompartir, capacidadesImagen } from '../src/js/elecciones/compartir.js';

const ranking = [
  { nombre: 'PSOE', afinidad: 98.4 },
  { nombre: 'ERC', afinidad: 84.5 },
  { nombre: 'BNG', afinidad: 83.4 },
];

/** Documento de mentira con solo lo que miran las funciones. */
const documento = ({ siteName, canonical, href = 'https://www.elcorreo.com/test-electoral?utm=x#res' } = {}) => {
  const url = new URL(href);
  return {
    location: { origin: url.origin, pathname: url.pathname },
    querySelector: (sel) =>
      sel.includes('og:site_name') ? (siteName ? { content: siteName } : null) : sel.includes('canonical') ? (canonical ? { href: canonical } : null) : null,
  };
};

test('el texto lleva el medio, los dos partidos más cercanos con su % redondeado y el enlace', () => {
  assert.equal(
    textoCompartir({ ranking, nombreMedio: 'El Correo', enlace: 'https://www.elcorreo.com/test' }),
    'Mis partidos más cercanos en el test de El Correo son PSOE (98%) y ERC (85%). ¿Coincidimos? Haz tu test en https://www.elcorreo.com/test',
  );
});

test('la plantilla se puede cambiar en config sin tocar código', () => {
  const plantilla = '{partido1} {afinidad1} · {partido2} {afinidad2} · {medio} · {enlace} · {desconocido}';
  assert.equal(textoCompartir({ ranking, nombreMedio: 'Ideal', enlace: 'u', plantilla }), 'PSOE 98 · ERC 85 · Ideal · u · {desconocido}');
});

test('enlaces de cada red, con el texto codificado (tildes, ¿, %, espacios)', () => {
  const texto = '¿Coincidimos? PSOE (98%) https://x.es/t';
  const r = enlacesRedes({ texto, enlace: 'https://x.es/t' });
  assert.equal(r.whatsapp, 'https://wa.me/?text=%C2%BFCoincidimos%3F%20PSOE%20(98%25)%20https%3A%2F%2Fx.es%2Ft');
  assert.equal(new URL(r.twitter).searchParams.get('text'), texto);
  assert.equal(new URL(r.threads).searchParams.get('text'), texto);
  assert.equal(new URL(r.facebook).searchParams.get('u'), 'https://x.es/t'); // Facebook solo admite la URL
  assert.equal(new URL(r.linkedin).searchParams.get('url'), 'https://x.es/t'); // LinkedIn también
  assert.equal(new URL(r.telegram).searchParams.get('url'), 'https://x.es/t');
});

test('nombre del medio: primero og:site_name de la página, si no la tabla, si no el id', () => {
  assert.equal(nombreDelMedio('elcorreo', documento({ siteName: 'El Correo ' })), 'El Correo');
  assert.equal(nombreDelMedio('diariovasco', documento()), 'El Diario Vasco');
  assert.equal(nombreDelMedio('desconocido', documento()), 'desconocido');
});

test('enlace del test: el canonical o, si no hay, la URL sin parámetros ni ancla', () => {
  assert.equal(enlaceDelTest(documento({ canonical: 'https://www.elcorreo.com/canon' })), 'https://www.elcorreo.com/canon');
  assert.equal(enlaceDelTest(documento()), 'https://www.elcorreo.com/test-electoral');
});

test('con un resultado real: los dos primeros del ranking', () => {
  const t = nuevo();
  contestarTodo(t, comoPartido('PSOE'));
  const d = datosCompartir({ resultado: t.calcular(), medio: t.medio, doc: documento() });
  assert.match(d.texto, /^Mis partidos más cercanos en el test de El Correo son PSOE \(100%\) y ERC \(82%\)\./);
  assert.ok(d.texto.endsWith('Haz tu test en https://www.elcorreo.com/test-electoral'));
  assert.ok(d.redes.whatsapp.startsWith('https://wa.me/?text='));
});

test('imagen: "Copiar" y "Compartir" solo aparecen si el navegador los admite', () => {
  const Item = function ClipboardItem() {};
  const Archivo = function File() {};
  const conTodo = { clipboard: { write() {} }, share() {}, canShare: ({ files }) => files.length === 1 };
  assert.deepEqual(capacidadesImagen(conTodo, Item, Archivo), { copiar: true, compartir: true });
  // escritorio típico: copia sí, menú de compartir con archivos no
  assert.deepEqual(capacidadesImagen({ clipboard: { write() {} } }, Item, Archivo), { copiar: true, compartir: false });
  // navegador antiguo sin ClipboardItem
  assert.deepEqual(capacidadesImagen({ clipboard: { writeText() {} } }, undefined, Archivo), { copiar: false, compartir: false });
  // canShare que lanza error
  assert.equal(capacidadesImagen({ share() {}, canShare() { throw new Error('x'); } }, Item, Archivo).compartir, false);
});
