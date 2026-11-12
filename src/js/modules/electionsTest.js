import { applyUserAnswers, setMatrixChosen, setTestAnswers, setTestParty } from './mockData';

const TOTAL = 24;

export function initElectionsTest() {
  const root = document.querySelector('.v-elec-test');
  const carrusel = root?.querySelector('.v-elec-test__list');
  const elemento = root?.querySelector('.v-elec-test__sld');
  const prevBtn = root?.querySelector('#v-elec-test-prev');
  const nextBtn = root?.querySelector('#v-elec-test-next');
  if (!root || !carrusel || !elemento || !prevBtn || !nextBtn) return;

  let moving = false;
  let paso = 0;
  let resizing = false;
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

  function guardar() {
    const answers = slides()
      .filter((li) => li.classList.contains('v-elec-test__item--q'))
      .map((li) => {
        const checked = li.querySelector('input[type="radio"]:checked');
        return checked ? Number(checked.value) : null;
      });
    const party = root.querySelector('input[name="elec-p"]:checked');
    setTestAnswers(answers);
    setTestParty(party ? party.value : null);
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

  function puntuar() {
    const scores = slides()
      .filter((li) => li.classList.contains('v-elec-test__item--q'))
      .map((li) => {
        const checked = li.querySelector('input[type="radio"]:checked');
        return checked ? Number(checked.value) : null;
      })
      .filter((value) => value != null);
    if (scores.length) applyUserAnswers(scores);
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
    alColapsarMarca(() => verLogo(reduce ? 'auto' : 'smooth'));
    actualizarBotones(0);
  }

  function rellenar() {
    alColapsarMarca(() => verLogo(reduce ? 'auto' : 'smooth'));

    const scores = slides()
      .filter((li) => li.classList.contains('v-elec-test__item--q'))
      .map((li) => {
        const value = 1 + Math.floor(Math.random() * 5);
        const input = li.querySelector(`input[value="${value}"]`);
        if (input) input.checked = true;
        return value;
      });

    root.querySelectorAll('input[name="elec-p"]').forEach((input) => {
      input.checked = false;
    });
    setTestAnswers(scores);
    setTestParty(null);
    applyUserAnswers(scores);

    const partyIndex = slides().findIndex((li) => li.classList.contains('v-elec-test__item--party'));
    irA(partyIndex);
  }

  function reiniciar() {
    root.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.checked = false;
    });
    setTestAnswers([]);
    setTestParty(null);
    modo('is-test-on');
    saltar(0);
    verLogo('auto');
  }

  function actualizarBotones(index = paso) {
    const items = slides();
    const current = Math.max(0, Math.min(items.length - 1, index));
    paso = current;
    const last = items.length - 1;

    items.forEach((li, i) => {
      li.classList.toggle('v-elec-test__item--on', i === current);
    });

    prevBtn.hidden = current === 0;
    nextBtn.hidden = current >= last;
    nextBtn.disabled = nextBtn.hidden || !answered(items[current]);
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

  let clamping = false;

  carrusel.addEventListener('scroll', () => {
    if (moving || resizing || clamping) return;
    const items = slides();
    const max = leftOf(items[maxReachable()]);
    const left = carrusel.scrollLeft;
    if (left > max + 1) {
      clamping = true;
      carrusel.scrollLeft = max;
      clamping = false;
    }
    actualizarBotones(paso);
  });
  carrusel.addEventListener('scrollend', () => {
    moving = false;
    if (resizing) return;
    const items = slides();
    const max = leftOf(items[maxReachable()]);
    if (carrusel.scrollLeft > max + 1) carrusel.scrollTo({ left: max });
    actualizarBotones(slideIndex());
  });
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

  root.querySelectorAll('.v-elec-test__prog').forEach((prog) => {
    const step = Number(prog.dataset.elecStep);
    const bar = prog.querySelector('.v-elec-test__prog-val');
    if (!bar || !step) return;
    bar.style.width = `${(step / TOTAL) * 100}%`;
  });

  root.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="radio"]')) return;
    guardar();
    if (event.target.name === 'elec-p') {
      setMatrixChosen(event.target.value);
      puntuar();
      modo('is-widgets-on');
      verLogo('auto');
      return;
    }
    actualizarBotones();
  });

  root.querySelectorAll('[data-elec-next]').forEach((el) => {
    el.addEventListener('click', () => {
      const inputId = el.getAttribute('for');
      if (inputId) {
        const input = root.querySelector(`#${CSS.escape(inputId)}`);
        if (input && !input.checked) input.checked = true;
        guardar();
      }
      if (el === nextBtn && nextBtn.disabled) return;
      requestAnimationFrame(() => mover(1));
    });
  });

  prevBtn.addEventListener('click', () => {
    requestAnimationFrame(() => mover(-1));
  });

  document.getElementById('v-elec-start')?.addEventListener('click', empezar);
  document.getElementById('v-elec-fill')?.addEventListener('click', rellenar);
  document.getElementById('v-elec-restart')?.addEventListener('click', reiniciar);

  actualizarBotones();
}
