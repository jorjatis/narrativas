export default function ssRoutes(DATA) {

  /* =========================
     0. ROOT
  ========================= */

  const root = document.querySelector('.v-n-ss-routes');
  if (!root) return;

  /* =========================
     1. MAPEO DÍAS
  ========================= */

  const DAY_EQUIV = {
    "domingo-29": "Domingo Ramos",
    "lunes-30": "Lunes Santo",
    "martes-31": "Martes Santo",
    "miercoles-1": "Miércoles Santo",
    "jueves-2": "Jueves Santo",
    "madruga": "Jueves Madrugá",
    "viernes-3": "Viernes Santo",
    "sabado-4": "Sábado Santo",
    "domingo-5": "Domingo Resurrección"
  };

  /* =========================
     2. MEDIA QUERY
  ========================= */

  const mq = window.matchMedia('(min-width: 699px)');
  let currentMode = mq.matches ? 'desktop' : 'mobile';

  /* =========================
     3. ESTADO
  ========================= */

  let currentDay = getCurrentDayKey();

  /* =========================
     4. HELPERS DROPDOWN
  ========================= */

  function updateSelectTrigger(type, text = null) {
    const sel = root.querySelector(`.v-n-drp--${type}`);
    if (!sel) return;

    const trg = sel.querySelector('.v-n-drp__trg');
    if (!trg) return;

    const defaultText = type === 1 
      ? 'Selecciona un día' 
      : 'Selecciona una hermandad';

    const label = text || defaultText;

    const icon = trg.querySelector('.v-n-i');

    trg.innerHTML = `${label} ${icon ? icon.outerHTML : ''}`;
  }

  /* =========================
     5. FECHA → DIA
  ========================= */

  function getCurrentDayKey() {
    const today = new Date();

    const start = new Date(2026, 2, 29);
    const end = new Date(2026, 3, 5);

    if (today < start || today > end) return "domingo-29";

    const map = {
      29: "domingo-29",
      30: "lunes-30",
      31: "martes-31",
      1: "miercoles-1",
      2: "jueves-2",
      3: "viernes-3",
      4: "sabado-4",
      5: "domingo-5"
    };

    const day = today.getDate();

    if (day === 3 && today.getHours() < 7) {
      return "madruga";
    }

    return map[day] || "domingo-29";
  }

  /* =========================
     6. RENDER HERMANDADEs (desktop + mobile)
  ========================= */

  function renderHermandades(dayKey) {
    const list = root.querySelector('.v-n-nav-hermandad ul');
    const selectList = root.querySelector('.v-n-drp--2 .v-n-drp__opts');

    if (!list || !selectList) return;

    const items = DATA[dayKey];
    if (!items) return;

    list.innerHTML = '';
    selectList.innerHTML = '';

    items.forEach((item, index) => {

      // desktop
      const li = document.createElement('li');
      if (index === 0) li.classList.add('is-active');

      li.innerHTML = `
        <button data-hermandad="${item.id}">
          ${item.name}
        </button>
      `;

      list.appendChild(li);

      // mobile
      const liSel = document.createElement('li');
      if (index === 0) liSel.classList.add('is-active');

      liSel.innerHTML = `
        <button role="option" data-hermandad="${item.id}">
          ${item.name}
        </button>
      `;

      selectList.appendChild(liSel);
    });

    updateImage(items[0]);
  }

  /* =========================
     7. IMAGEN
  ========================= */

  function updateImage(item) {
    const img = root.querySelector('.v-n-blk img');
    if (!item || !img) return;

    const src = currentMode === 'desktop' ? item.desktop : item.mobile;

    if (img.dataset.src === src) return;

    img.dataset.src = src;

    img.classList.remove('is-loaded');

    const newImg = new Image();
    newImg.src = src;

    newImg.onload = () => {
      img.src = src;

      // forzar reflow para asegurar animación
      img.offsetHeight;

      img.classList.add('is-loaded');
    };
  }

  /* =========================
     8. CAMBIO DÍA
  ========================= */

  function changeDay(dayKey) {
    currentDay = dayKey;

    // desktop nav
    root.querySelectorAll('[data-day]').forEach(btn => {
      btn.parentElement.classList.remove('is-active');

      if (btn.dataset.day === dayKey) {
        btn.parentElement.classList.add('is-active');
      }
    });

    // mobile trigger día
    const activeDayBtn = root.querySelector(`[data-day="${dayKey}"]`);
    if (activeDayBtn) {
      updateSelectTrigger(1, activeDayBtn.textContent.trim());
    }

    const realDay = DAY_EQUIV[dayKey];
    if (!DATA[realDay]) return;

    renderHermandades(realDay);

    // reset trigger hermandad
    updateSelectTrigger(2);
  }

  /* =========================
     9. EVENTOS
  ========================= */

  function bindEvents() {

    root.addEventListener('click', e => {

      // DÍA
      const btnDay = e.target.closest('[data-day]');
      if (btnDay) {
        changeDay(btnDay.dataset.day);
        return;
      }

      // HERMANDAD
      const btnHerm = e.target.closest('[data-hermandad]');
      if (btnHerm) {

        const id = btnHerm.dataset.hermandad;

        // limpiar active
        root.querySelectorAll('.v-n-nav-hermandad li')
          .forEach(el => el.classList.remove('is-active'));

        root.querySelectorAll('.v-n-drp--2 li')
          .forEach(el => el.classList.remove('is-active'));

        // activar ambos
        root.querySelectorAll(`[data-hermandad="${id}"]`)
          .forEach(btn => btn.parentElement.classList.add('is-active'));

        const items = DATA[DAY_EQUIV[currentDay]];
        if (!items) return;

        const item = items.find(i => i.id === id);

        updateSelectTrigger(2, btnHerm.textContent.trim());
        updateImage(item);
      }
    });

    // matchMedia
    mq.addEventListener('change', (e) => {
      currentMode = e.matches ? 'desktop' : 'mobile';

      const active = root.querySelector('.v-n-nav-hermandad li.is-active button');
      if (!active) return;

      const items = DATA[DAY_EQUIV[currentDay]];
      if (!items) return;

      const item = items.find(i => i.id === active.dataset.hermandad);
      updateImage(item);
    });
  }

  /* =========================
     10. INIT
  ========================= */

  function init() {
    changeDay(currentDay);
    bindEvents();
  }

  init();
}