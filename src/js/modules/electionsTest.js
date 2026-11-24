import { CONFIG } from '../elecciones/config.js';
import { trackNarrativa } from '../elecciones/analitica.js';

/**
 * Carrusel del test. La lógica (qué se guarda, cuándo termina, qué se envía) está en el "app" de
 * electionsApp.js; aquí solo se mueve el carrusel y se le avisa de lo que hace el lector.
 */
export function initElectionsTest(app) {
  const root = document.querySelector('.v-elec-test');
  const carrusel = root?.querySelector('.v-elec-test__list');
  const elemento = root?.querySelector('.v-elec-test__sld');
  const prevBtn = root?.querySelector('#v-elec-test-prev');
  const nextBtn = root?.querySelector('#v-elec-test-next');
  if (!root || !carrusel || !elemento || !prevBtn || !nextBtn || !app) return;

  let moving = false;
  let paso = 0;
  let resizing = false;
  // Analítica: la tarjeta más avanzada ya enviada como "paso" en este intento. Así ir atrás y volver a avanzar
  // no repite el evento y el embudo cuenta cada pregunta una sola vez (ver avisarPaso).
  let pasoEnviado = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shell = document.querySelector('.v-elec');

  function slides() {
    return [...carrusel.querySelectorAll(':scope > .v-elec-test__item')];
  }

  function leftOf(item) {
    const start = item.offsetLeft - carrusel.offsetLeft;
    return start - (carrusel.clientWidth - item.offsetWidth) / 2;
  }

  function slideIndex() {
    const items = slides();
    const left = carrusel.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((li, index) => {
      const dist = Math.abs(leftOf(li) - left);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    return best;
  }

  function answered(slide) {
    if (!slide?.querySelector('input[type="radio"]')) return false;
    return Boolean(slide.querySelector('input[type="radio"]:checked'));
  }

  // Primera cartela sin respuesta: no se puede pasar de ahí.
  function maxReachable() {
    const items = slides();
    for (let index = 0; index < items.length; index += 1) {
      const radios = items[index].querySelector('input[type="radio"]');
      if (!radios || !answered(items[index])) return index;
    }
    return items.length - 1;
  }

  /** Guarda en el test (localStorage) la respuesta marcada en una pregunta. */
  function registrar(input) {
    const li = input?.closest('.v-elec-test__item--q');
    if (!li || !input.checked) return;
    app.alResponder(li.dataset.elecQ, Number(input.value));
  }

  function verLogo(behavior) {
    const target = shell?.classList.contains('is-widgets-on')
      ? shell.querySelector('.v-elec-widgets')
      : shell?.classList.contains('is-test-on')
        ? shell.querySelector('.v-elec-test')
        : shell?.querySelector('.v-elec-intro');
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior });
  }

  /** Coloca la cabecera de los resultados a `top` px del borde de la pantalla (donde estaba la del test). */
  function alinearMarca(top) {
    const marca = shell?.querySelector('.v-elec-widgets .v-elec-h__brand');
    if (top == null || !marca) {
      verLogo('auto');
      return;
    }
    window.scrollBy({ top: marca.getBoundingClientRect().top - top, behavior: 'instant' });
  }

  function modo(estado) {
    shell?.classList.remove('is-test-on', 'is-widgets-on');
    if (estado) shell?.classList.add(estado);
  }

  function alColapsarMarca(callback) {
    modo('is-test-on');
    const mark = shell?.querySelector('.v-elec-test .v-elec-h__mark');
    if (!mark || reduce || parseFloat(getComputedStyle(mark).maxHeight) === 0) {
      callback();
      return;
    }
    let listo = false;
    const done = (event) => {
      if (event && (event.target !== mark || event.propertyName !== 'max-height')) return;
      if (listo) return;
      listo = true;
      mark.removeEventListener('transitionend', done);
      callback();
    };
    mark.addEventListener('transitionend', done);
    window.setTimeout(() => done(), 500);
  }

  function saltar(index) {
    const items = slides();
    const next = Math.max(0, Math.min(items.length - 1, index));
    moving = true;
    carrusel.style.scrollSnapType = 'none';
    carrusel.style.transition = 'none';
    carrusel.scrollLeft = leftOf(items[next]);
    moving = false;
    actualizarBotones(next);
    requestAnimationFrame(() => {
      carrusel.style.scrollSnapType = '';
      carrusel.style.transition = '';
    });
  }

  function irA(index) {
    const items = slides();
    const next = Math.max(0, Math.min(items.length - 1, index));
    moving = true;
    actualizarBotones(next);
    carrusel.scrollTo({
      left: leftOf(items[next]),
      behavior: reduce ? 'auto' : 'smooth',
    });
    window.setTimeout(() => {
      if (!moving) return;
      moving = false;
      actualizarBotones();
    }, reduce ? 0 : 700);
  }

  function empezar() {
    // "Empezar" (no "Continuar": el mismo botón cuando el lector vuelve con el test a medias).
    if (!shell?.classList.contains('is-resume')) trackNarrativa('iniciar', 0);
    alColapsarMarca(() => {
      verLogo(reduce ? 'auto' : 'smooth');
      saltar(maxReachable()); // si vuelve a medias, a la primera sin contestar
    });
    actualizarBotones(0);
  }

  /**
   * Solo en desarrollo: contesta las preguntas al azar por el mismo camino que un lector y deja el test en la
   * pregunta de partido. Al elegir partido se termina y se envía a preproducción como cualquier otro voto.
   */
  function rellenar() {
    alColapsarMarca(() => verLogo(reduce ? 'auto' : 'smooth'));

    slides()
      .filter((li) => li.classList.contains('v-elec-test__item--q'))
      .forEach((li) => {
        const opciones = li.querySelectorAll('input[type="radio"]');
        const input = opciones[Math.floor(Math.random() * opciones.length)];
        if (!input) return;
        input.checked = true;
        registrar(input);
      });

    root.querySelectorAll('input[name="elec-p"]').forEach((input) => {
      input.checked = false;
    });

    const partyIndex = slides().findIndex((li) => li.classList.contains('v-elec-test__item--party'));
    pasoEnviado = partyIndex; // las pruebas no cuentan en la analítica
    irA(partyIndex);
  }

  function reiniciar() {
    if (!app.alReiniciar()) return; // sin intentos o IP bloqueada (el botón ya no se muestra)
    trackNarrativa('reiniciar', CONFIG.ANALITICA.PASO_REINICIAR);
    pasoEnviado = 0; // intento nuevo: el embudo vuelve a contar desde la primera pregunta
    shell?.classList.remove('is-resume');
    root.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.checked = false;
    });
    modo('is-test-on');
    saltar(0);
    // 'instant' y no 'auto': si la página tiene scroll-behavior: smooth, 'auto' haría un scroll suave
    // largo (desde el final de los resultados) mientras la página encoge.
    verLogo('instant');
    if (window.scrollX) window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' });
  }

  function actualizarBotones(index = paso) {
    const items = slides();
    const current = Math.max(0, Math.min(items.length - 1, index));
    if (current !== paso) app.alVer(current);
    avisarPaso(current);
    paso = current;
    const last = items.length - 1;

    // Las tarjetas que aún no se pueden contestar quedan bloqueadas: sin punto de snap (el navegador vuelve
    // solo a la actual si el lector desliza hacia ellas) e inertes (no reciben foco ni clics: si el tabulador
    // entrara en una, el navegador la desplazaría a la vista).
    const max = maxReachable();
    items.forEach((li, i) => {
      li.classList.toggle('v-elec-test__item--on', i === current);
      const bloqueada = i > max;
      li.classList.toggle('v-elec-test__item--locked', bloqueada);
      li.inert = bloqueada;
    });

    prevBtn.hidden = current === 0;
    nextBtn.hidden = current >= last;
    nextBtn.disabled = nextBtn.hidden || !answered(items[current]);
  }

  /**
   * Analítica, hito "Avance": el lector ha llegado a la tarjeta `indice` (1..N-1 preguntas, N la de partido; N = nº de preguntas).
   * Solo cuenta la primera vez que llega a cada una en este intento.
   */
  function avisarPaso(indice) {
    if (indice <= pasoEnviado) return;
    pasoEnviado = indice;
    trackNarrativa('paso', indice);
  }

  function mover(direccion) {
    const items = slides();
    const current = paso;
    let next = current;

    const ceil = direccion > 0 ? maxReachable() : items.length - 1;
    next = Math.max(0, Math.min(ceil, current + direccion));

    if (next === current) return;

    moving = true;
    actualizarBotones(next);
    carrusel.scrollTo({
      left: leftOf(items[next]),
      behavior: reduce ? 'auto' : 'smooth',
    });
    window.setTimeout(() => {
      if (!moving) return;
      moving = false;
      actualizarBotones();
    }, reduce ? 0 : 700);
  }

  /** Al terminar un desplazamiento (dedo, rueda o programado): se sincroniza la tarjeta actual. */
  function alTerminarScroll() {
    moving = false;
    if (resizing) return;
    const items = slides();
    const max = leftOf(items[maxReachable()]);
    // Red de seguridad: si aun así se quedó más allá de la última tarjeta permitida, se vuelve con suavidad.
    if (carrusel.scrollLeft > max + 1) {
      carrusel.scrollTo({ left: max, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    actualizarBotones(slideIndex());
  }

  // "scrollend" no existe en todos los navegadores (Safari hasta hace poco): ahí se detecta el final del
  // scroll cuando deja de moverse 120 ms.
  const conScrollend = 'onscrollend' in window;
  let finScroll = 0;
  carrusel.addEventListener('scroll', () => {
    // No se toca scrollLeft mientras el lector arrastra: pelear con la inercia y el snap del navegador era lo
    // que provocaba el salto raro y el bloqueo. Las tarjetas bloqueadas ya no tienen snap (ver actualizarBotones).
    if (conScrollend || moving || resizing) return;
    window.clearTimeout(finScroll);
    finScroll = window.setTimeout(alTerminarScroll, 120);
  });
  if (conScrollend) carrusel.addEventListener('scrollend', alTerminarScroll);

  // En la última tarjeta permitida, el gesto hacia delante (hacia una tarjeta bloqueada) ni se empieza:
  // el carrusel no se mueve. Hacia atrás y el scroll vertical de la página funcionan normal.
  function enElLimite() {
    const items = slides();
    return carrusel.scrollLeft >= leftOf(items[maxReachable()]) - 2;
  }

  let toque = null; // { x, y, frenar: null | true | false } del gesto en curso
  carrusel.addEventListener(
    'touchstart',
    (event) => {
      const t = event.touches[0];
      toque = event.touches.length === 1 ? { x: t.clientX, y: t.clientY, frenar: null } : null;
    },
    { passive: true },
  );
  carrusel.addEventListener(
    'touchmove',
    (event) => {
      if (!toque) return;
      if (toque.frenar === null) {
        const t = event.touches[0];
        const dx = t.clientX - toque.x;
        const dy = t.clientY - toque.y;
        if (Math.abs(dx) + Math.abs(dy) < 4) return; // aún no se sabe la dirección
        // dedo hacia la izquierda = contenido hacia delante
        toque.frenar = Math.abs(dx) > Math.abs(dy) && dx < 0 && enElLimite();
      }
      if (toque.frenar && event.cancelable) event.preventDefault();
    },
    { passive: false },
  );
  carrusel.addEventListener('touchend', () => { toque = null; }, { passive: true });
  carrusel.addEventListener('touchcancel', () => { toque = null; }, { passive: true });

  // Trackpad / rueda horizontal en escritorio: lo mismo.
  carrusel.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && event.deltaX > 0 && enElLimite()) event.preventDefault();
    },
    { passive: false },
  );

  window.addEventListener('resize', () => {
    resizing = true;
    saltar(paso);
    window.setTimeout(() => {
      resizing = false;
    }, 250);
  });

  root.querySelectorAll('button[aria-expanded]').forEach((button) => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
    });
  });

  const total = root.querySelectorAll('.v-elec-test__item--q').length;
  root.querySelectorAll('.v-elec-test__prog').forEach((prog) => {
    const step = Number(prog.dataset.elecStep);
    const bar = prog.querySelector('.v-elec-test__prog-val');
    if (!bar || !step || !total) return;
    bar.style.width = `${(step / total) * 100}%`;
  });

  root.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="radio"]')) return;
    if (event.target.name === 'elec-p') {
      // Último paso: se termina el test, se envía y se pintan los resultados. Sin saltos: el resultado se pinta
      // en el acto (sin esperar a la red) y la cabecera "29N Elecciones generales" de los resultados queda
      // exactamente donde estaba la del test.
      const marca = shell?.querySelector('.v-elec-test .v-elec-h__brand')?.getBoundingClientRect().top;
      modo('is-widgets-on');
      app.alElegirPartido(event.target.value);
      alinearMarca(marca);
      return;
    }
    registrar(event.target);
    actualizarBotones();
  });

  root.querySelectorAll('[data-elec-next]').forEach((el) => {
    el.addEventListener('click', () => {
      const inputId = el.getAttribute('for');
      if (inputId) {
        const input = root.querySelector(`#${CSS.escape(inputId)}`);
        if (input && !input.checked) input.checked = true;
        registrar(input);
      }
      if (el === nextBtn && nextBtn.disabled) return;
      requestAnimationFrame(() => mover(1));
    });
  });

  prevBtn.addEventListener('click', () => {
    requestAnimationFrame(() => mover(-1));
  });

  const startBtn = document.getElementById('v-elec-start');
  startBtn?.addEventListener('click', empezar);
  document.getElementById('v-elec-fill')?.addEventListener('click', rellenar);
  document.getElementById('v-elec-restart')?.addEventListener('click', reiniciar);

  // "Rellenar test": solo existe en la versión de pruebas (index-sandbox). En index no está en el HTML.
  const fill = document.querySelector('.v-elec-mock-options');
  if (fill) fill.hidden = false;

  // Al volver a la página: se marca lo que ya contestó y se retoma donde lo dejó.
  const inicial = app.estadoInicial();
  // Al volver a medias, lo que ya avanzó se envió en su visita: no se repite al saltar a donde lo dejó.
  pasoEnviado = inicial.actual || 0;
  inicial.respuestas.forEach(({ idPreg, idResp }) => {
    const li = root.querySelector(`.v-elec-test__item--q[data-elec-q="${CSS.escape(idPreg)}"]`);
    const input = li?.querySelector(`input[value="${idResp}"]`);
    if (input) input.checked = true;
  });
  if (inicial.modo === 'completado' && inicial.candidato) {
    const party = root.querySelector(`input[name="elec-p"][value="${CSS.escape(inicial.candidato)}"]`);
    if (party) party.checked = true;
  }
  // La vista inicial ya la puso el <script> de arranque (elections-boot.hbs) antes de pintar; aquí se confirma
  // con el estado real y se corrige si no acertó (o si el CMS quitó ese script).
  shell?.classList.toggle('is-resume', inicial.modo === 'a-medias'); // "Continuar" en vez de "Empezar"
  if (inicial.modo === 'completado') {
    modo('is-widgets-on');
    app.mostrarGuardado(); // la visual aparece en cuanto pinta
  } else {
    modo(null);
    app.revelar();
  }

  actualizarBotones();
}
