import { getSSDay } from './ssUtils';

export default function ssMap(DATA) {
  const root = document.querySelector('.v-n-ss-map');
  if (!root) return;

  const acc = root.querySelector('.v-n-acc');
  const points = root.querySelectorAll('.v-n-ss-map-point');
  const title = root.querySelector('.v-n-ss-map__t');

  function renderPoint(pointName) {
    const data = DATA[pointName];
    if (!data) return;

    acc.innerHTML = '';

    // Estado inicial: Obtenemos el día actual desde el utils
    const currentDayName = getSSDay().name;
    const days = Object.keys(data);
    
    let openedIndex = days.indexOf(currentDayName);
    if (openedIndex === -1) openedIndex = 0;

    days.forEach((day, i) => {
      const isOpened = i === openedIndex;
      const item = document.createElement('div');
      item.className = `v-n-acc__i v-n-acc__i--${i + 1}`;

      item.innerHTML = `
        <button 
          class="v-n-acc__trg" 
          aria-expanded="${isOpened}" 
          aria-controls="acc-pnl-${pointName.replace(/\s+/g, '')}-${i}"
          id="acc-trg-${pointName.replace(/\s+/g, '')}-${i}"
        >
          <span class="v-n-acc__trg-t">${day}</span>
          <span class="v-n-i"><svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><path d="M4.2905 6.0005L0.21725 1.9275C0.0789167 1.789 0.00808339 1.61492 0.00475006 1.40525C0.00158339 1.19575 0.0724167 1.0185 0.21725 0.8735C0.36225 0.728667 0.537916 0.65625 0.74425 0.65625C0.950583 0.65625 1.12625 0.728667 1.27125 0.8735L5.7655 5.36775C5.859 5.46142 5.925 5.56017 5.9635 5.664C6.002 5.76783 6.02125 5.88 6.02125 6.0005C6.02125 6.121 6.002 6.23317 5.9635 6.337C5.925 6.44083 5.859 6.53958 5.7655 6.63325L1.27125 11.1275C1.13275 11.2658 0.958666 11.3367 0.749 11.34C0.5395 11.3432 0.36225 11.2723 0.21725 11.1275C0.0724167 10.9825 0 10.8068 0 10.6005C0 10.3942 0.0724167 10.2185 0.21725 10.0735L4.2905 6.0005Z"></path></svg></span>
        </button>
        <div 
          id="acc-pnl-${pointName.replace(/\s+/g, '')}-${i}" 
          class="v-n-acc__pnl" 
          role="region" 
          aria-labelledby="acc-trg-${pointName.replace(/\s+/g, '')}-${i}"
        >
          <table class="v-n-ss-sch">
            <thead>
              <tr><th>Hora</th><th>Hermandad</th><th></th></tr>
            </thead>
            <tbody>
              ${data[day].map(row => `
                <tr>
                  <td>${row.hora.replace(' ', '<span class="space"></span>')}</td>
                  <td>${row.hermandad}</td>
                  <td>${row.tipo}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      acc.appendChild(item);
    });

    // Inicializar estados de altura tras el render
    initHeights(acc);
  }

  function initHeights(container) {
    const items = container.querySelectorAll('.v-n-acc__i');
    items.forEach(item => {
      const trg = item.querySelector('.v-n-acc__trg');
      const pnl = item.querySelector('.v-n-acc__pnl');
      const isExpanded = trg.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        // Si está abierto, le damos su altura real para que el cierre sea smooth
        pnl.style.maxHeight = 'none'; 
      } else {
        // Si está cerrado, forzamos el 0
        pnl.style.maxHeight = '0px';
        pnl.style.overflow = 'hidden';
      }
    });
  }

  function bindEvents() {
    points.forEach(btn => {
      btn.addEventListener('click', () => {
        const pointName = btn.dataset.point;
        if (!pointName) return;
        points.forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (title) title.textContent = pointName;
        renderPoint(pointName);
      });
    });
  }

  bindEvents();

  points[0]?.click();
}