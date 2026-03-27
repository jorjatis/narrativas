import { getSSDay, SS_CALENDAR } from './ssUtils';

export default function ssRoutes(DATA) {
  const root = document.querySelector('.v-n-ss-routes');
  if (!root) return;

  const mq = window.matchMedia('(min-width: 699px)');
  let currentMode = mq.matches ? 'desktop' : 'mobile';

  // Estado inicial: Obtenemos el día actual desde el utils
  const initialDay = getSSDay();
  let currentDayKey = initialDay.key;

  // Helpers UI
  function updateSelectTrigger(type, text = null) {
    const sel = root.querySelector(`.v-n-drp--${type}`);
    if (!sel) return;

    const trg = sel.querySelector('.v-n-drp__trg');
    if (!trg) return;

    const defaultText = type === 1 ? 'Selecciona un día' : 'Selecciona una hermandad';
    const label = text || defaultText;
    const icon = trg.querySelector('.v-n-i');

    trg.innerHTML = `${label} ${icon ? icon.outerHTML : ''}`;
  }

  function renderHermandades(dayName) {
    const list = root.querySelector('.v-n-nav-hermandad ul');
    const selectList = root.querySelector('.v-n-drp--2 .v-n-drp__opts');
    const items = DATA[dayName];

    if (!list || !selectList || !items) return;

    list.innerHTML = '';
    selectList.innerHTML = '';

    items.forEach((item, index) => {
      const isActive = index === 0;

      // Render Desktop
      const li = document.createElement('li');
      if (isActive) li.classList.add('is-active');
      li.innerHTML = `<button data-hermandad="${item.id}">${item.name}</button>`;
      list.appendChild(li);

      // Render Mobile (Dropdown)
      const liSel = document.createElement('li');
      if (isActive) liSel.classList.add('is-active');
      liSel.innerHTML = `<button role="option" data-hermandad="${item.id}">${item.name}</button>`;
      selectList.appendChild(liSel);
    });

    // Cargar la imagen de la primera hermandad por defecto
    updateImage(items[0]);
    updateLink(items[0]);
    updateSelectTrigger(2, items[0].name);
  }

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
      img.offsetHeight; // Forzar reflow de la imagen
      img.classList.add('is-loaded');
    };
  }

  function changeDay(dayKey) {
    currentDayKey = dayKey;

    // 1. Actualizar Tabs (Desktop)
    root.querySelectorAll('[data-day]').forEach(btn => {
      btn.parentElement.classList.remove('is-active');
      if (btn.dataset.day === dayKey) {
        btn.parentElement.classList.add('is-active');
        // 2. Actualizar Selector (Mobile)
        updateSelectTrigger(1, btn.textContent.trim());
      }
    });

    // 3. Obtener el nombre para el JSON
    let dayName = "";
    if (dayKey === 'madruga') {
      dayName = "Madrugá"; 
    } else {
      const found = Object.values(SS_CALENDAR).find(d => d.key === dayKey);
      dayName = found ? found.name : "Domingo Ramos";
    }

    renderHermandades(dayName);
  }

  function updateLink(item) {
    const linkBtn = root.querySelector('.v-btn-c--c a.v-btn');
    if (!item || !linkBtn) return;

    linkBtn.href = item.url || '#';
  }

  function bindEvents() {
    root.addEventListener('click', e => {
      // Click en DÍA
      const btnDay = e.target.closest('[data-day]');
      if (btnDay) {
        changeDay(btnDay.dataset.day);
        return;
      }

      // Click en HERMANDAD
      const btnHerm = e.target.closest('[data-hermandad]');
      if (btnHerm) {
        const id = btnHerm.dataset.hermandad;

        // Limpiar y activar clases 'is-active'
        root.querySelectorAll('.v-n-nav-hermandad li, .v-n-drp--2 li')
            .forEach(el => el.classList.remove('is-active'));

        root.querySelectorAll(`[data-hermandad="${id}"]`)
            .forEach(btn => btn.parentElement.classList.add('is-active'));

        // Buscar data y actualizar
        const dayName = (currentDayKey === 'madruga') ? "Madrugá" : 
                        Object.values(SS_CALENDAR).find(d => d.key === currentDayKey).name;
        
        const item = DATA[dayName].find(i => i.id === id);
        updateSelectTrigger(2, btnHerm.textContent.trim());
        updateImage(item);
        updateLink(item);
      }
    });

    // Cambio de resolución (Resize/Orientation)
    mq.addEventListener('change', e => {
      currentMode = e.matches ? 'desktop' : 'mobile';
      const activeBtn = root.querySelector('.v-n-nav-hermandad li.is-active button');
      if (!activeBtn) return;

      const dayName = (currentDayKey === 'madruga') ? "Madrugá" : 
                      Object.values(SS_CALENDAR).find(d => d.key === currentDayKey).name;
      
      const item = DATA[dayName].find(i => i.id === activeBtn.dataset.hermandad);
      updateImage(item);
    });
  }

  function init() {
    changeDay(currentDayKey);
    bindEvents();
  }

  init();
}