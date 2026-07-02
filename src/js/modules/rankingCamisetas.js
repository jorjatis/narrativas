import html2canvas from 'html2canvas';

export default function rankingCamisetas() {
  const camisetasData = [
    { id: 'esp_2026_1', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2026-a.webp', anio: '2026', torneo: 'EE.UU., México y Canadá' },
    { id: 'esp_2026_2', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2026-b.webp', anio: '2026', torneo: 'EE.UU., México y Canadá' },
    { id: 'esp_2022', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2022.webp', anio: '2022', torneo: 'Qatar' },
    { id: 'esp_2014', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2014.webp', anio: '2014', torneo: 'Brasil' },
    { id: 'esp_2010', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2010.webp', anio: '2010', torneo: 'Sudáfrica' },
    { id: 'esp_2006', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2006.webp', anio: '2006', torneo: 'Alemania' },
    { id: 'esp_2002', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2002.webp', anio: '2002', torneo: 'Corea del Sur y Japón' },
    { id: 'esp_1998', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-1998.webp', anio: '1998', torneo: 'Francia' },
    { id: 'esp_1994', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-1994.webp', anio: '1994', torneo: 'EE.UU.' },
    { id: 'esp_1982', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-1982.webp', anio: '1982', torneo: 'España' }
  ];

  const URL_GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbwanyzmEUo1Hk1jCImfdHsXr3_Hxqd8G28sRmGEu4Cg8kIalXGR_-IZBhBNP-yE_NIg/exec';

  let availablePool = [...camisetasData];
  let currentSliderIndex = 0;
  let slotsData = Array(10).fill(null);
  let draggedFrom = null;
  let draggedImg = null;
  let isEditingMode = false;
  let cacheEstadisticasGlobales = null;
  let ultimoVotoId = null;
  let descargaRegistrada = false;
  let estadisticasCargadas = false;
  let votoEnviado = false;
  let dragGhost = null;

  const rootContainer = document.querySelector('.v-n-rcl');
  const carouselWrapper = document.getElementById('carouselWrapper');
  const carouselTrack = document.getElementById('carouselTrack');
  const thanksContainer = document.getElementById('thanksContainer');
  const actionGroup = document.querySelector('.action-group');
  const dropZone = document.getElementById('dropZone');
  const btnEditMode = document.getElementById('btnEditMode');
  const btnShowResults = document.getElementById('btnShowResults');
  btnShowResults.disabled = true;
  btnShowResults.innerText = 'Cargando datos...';
  const resultsWrapper = document.getElementById('resultsWrapper');
  const pyramidContainer = document.getElementById('pyramidContainer');
  const btnDownload = document.getElementById('btnDownload');
  const btnReplay = document.getElementById('btnReplay');
  const navLeft = document.getElementById('navLeft');
  const navRight = document.getElementById('navRight');
  let isAnimating = false;

  const SITE_LOGOS = {
    'elcorreo.com': 'logo-elcorreo.png',
    'larioja.com': 'logo-larioja.png',
    'ideal.es': 'logo-ideal.png',
    'elcomercio.es': 'logo-elcomercio.png',
    'hoy.es': 'logo-hoy.png',
    'diariosur.es': 'logo-diariosur.png',
    'diariovasco.com': 'logo-diariovasco.png',
    'eldiariomontanes.es': 'logo-eldiariomontanes.png',
    'elnortedecastilla.es': 'logo-elnortedecastilla.png',
    'lasprovincias.es': 'logo-lasprovincias.png',
    'laverdad.es': 'logo-laverdad.png',
    'abc.es': 'logo-abc.png',
    'lavozdigital.es': 'logo-lavozdecadiz.png',
    'leonoticias.com': 'logo-leonoticias.png',
    'todoalicante.es': 'logo-todoalicante.png',
    'salamancahoy.es': 'logo-salamancahoy.png',
    'burgosconecta.es': 'logo-burgosconecta.png',
    'canarias7.es': 'logo-canarias7.png',
    'huelva24.com': 'logo-huelva24.png'
  };

  function getCurrentSiteLogo() {
    const hostname = window.location.hostname.replace(/^www\./, '').toLowerCase();
    return SITE_LOGOS[hostname] || 'logo-abc.png';
  }

  function getCurrentSiteName() {
    const hostname = window.location.hostname
      .replace(/^www\./, '')
      .toLowerCase();

    let siteName = hostname
      .replace('.com', '')
      .replace('.es', '');

    const customNames = {
      elcorreo: 'El Correo',
      eldiariocomun: 'El Diario Común',
      elcomercio: 'El Comercio',
      diariosur: 'Diario SUR',
      diariovasco: 'Diario Vasco',
      eldiariomontanes: 'El Diario Montañés',
      elnortedecastilla: 'El Norte de Castilla',
      lasprovincias: 'Las Provincias',
      laverdad: 'La Verdad',
      lavozdigital: 'La Voz de Cádiz',
      larioja: 'La Rioja',
      leonoticias: 'Leonoticias',
      todoalicante: 'TodoAlicante',
      salamancahoy: 'Salamanca Hoy',
      burgosconecta: 'Burgos Conecta',
      canarias7: 'Canarias7',
      huelva24: 'Huelva24',
      abc: 'ABC',
      hoy: 'HOY',
      ideal: 'IDEAL'
    };

    return customNames[siteName] || 'ABC';
  }

  function initGlobalLogos() {
    const baseUrlLogos = 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/logomedios/';
    const logoFileName = getCurrentSiteLogo();
    const finalLogoUrl = `${baseUrlLogos}${logoFileName}`;

    const captureLogoImg = document.querySelector('#captureLogo img');
    if (captureLogoImg) {
      captureLogoImg.src = finalLogoUrl;
    }

    const siteSpan = document.querySelector('#thanksContainer span');
    if (siteSpan) {
      siteSpan.textContent = getCurrentSiteName();
    }
  }

  initGlobalLogos();

  const helpModal = document.getElementById('helpModal');
  const btnOpenHelp = document.getElementById('btnOpenHelp');
  const btnCloseHelp = document.getElementById('btnCloseHelp');

  function openHelpModal() {
    if (helpModal) helpModal.classList.add('is-active');
  }

  function closeHelpModal() {
    if (helpModal) helpModal.classList.remove('is-active');
  }

  if (helpModal && btnOpenHelp && btnCloseHelp) {
    openHelpModal();

    btnOpenHelp.addEventListener('click', (e) => {
      e.preventDefault();
      openHelpModal();
    });

    btnCloseHelp.addEventListener('click', closeHelpModal);

    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        closeHelpModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && helpModal.classList.contains('is-active')) {
        closeHelpModal();
      }
    });
  }

  let touchStartX = 0;
  let touchStartY = 0;
  let isTrackingTouch = false;

  function createGhost(imgSrc, x, y) {
    removeGhost();

    dragGhost = document.createElement('div');
    dragGhost.className = 'drag-ghost';

    dragGhost.innerHTML = `
      <img src="${imgSrc}">
    `;

    document.body.appendChild(dragGhost);

    moveGhost(x, y);
  }

  function moveGhost(x, y) {
    if (!dragGhost) return;

    dragGhost.style.left = `${x}px`;
    dragGhost.style.top = `${y}px`;
  }

  function removeGhost() {
    if (dragGhost) {
      dragGhost.remove();
      dragGhost = null;
    }
  }

  function initSlots() {
    dropZone.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      const slot = document.createElement('div');
      slot.classList.add('slot');
      slot.setAttribute('data-index', i + 1);

      const icon = document.createElement('div');
      icon.classList.add('slot-icon');
      slot.appendChild(icon);

      slot.addEventListener('click', () => handleSlotClick(i));

      slot.addEventListener('pointerdown', (e) => {
        if (!slotsData[i]) return;

        e.preventDefault();

        isTrackingTouch = true;
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        draggedFrom = i;
        draggedImg = slotsData[i].img;

        createGhost(draggedImg, e.clientX, e.clientY);

        if (rootContainer) rootContainer.classList.add('is-dragging');
      });

      dropZone.appendChild(slot);
    }

    carouselTrack.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const item = document.createElement('div');
      item.classList.add('carousel-item');

      item.innerHTML = `
        <div class="shirt-card-info">
          <span class="shirt-anio"></span>
          <span class="shirt-torneo"></span>
        </div>
        <div class="shirt-card-media">
          <img src="" alt="" draggable="false">
        </div>
      `;
      carouselTrack.appendChild(item);
    }

    carouselTrack.querySelectorAll('.carousel-item').forEach(item => {
      item.addEventListener('pointerdown', (e) => {
        if (item.dataset.draggableEnabled !== "true") return;

        e.preventDefault();

        isTrackingTouch = true;
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        draggedFrom = 'main';
        draggedImg = availablePool[currentSliderIndex].img;

        createGhost(availablePool[currentSliderIndex].img, e.clientX, e.clientY);

        if (rootContainer) {
          rootContainer.classList.add('is-dragging');
          rootContainer.classList.add('is-dragging-from-main');
        }
      });
    });

    if (!window.hasPointerDragListeners) {
      window.addEventListener('pointermove', (e) => {
        if (!isTrackingTouch) return;

        moveGhost(e.clientX, e.clientY);

        if (e.cancelable) e.preventDefault();
      }, { passive: false });

      window.addEventListener('pointerup', (e) => {
        if (!isTrackingTouch) return;
        isTrackingTouch = false;

        removeGhost();

        const deltaX = e.clientX - touchStartX;
        const deltaY = e.clientY - touchStartY;

        const SWIPE_THRESHOLD = 40;

        if (
          draggedFrom === 'main' &&
          Math.abs(deltaX) > SWIPE_THRESHOLD &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {

          if (deltaX > 0) {
            currentSliderIndex =
              (currentSliderIndex - 1 + availablePool.length) %
              availablePool.length;
          }

          else {
            currentSliderIndex =
              (currentSliderIndex + 1) %
              availablePool.length;
          }

          updateCarouselDOM();

          if (rootContainer) {
            rootContainer.classList.remove('is-dragging');
            rootContainer.classList.remove('is-dragging-from-main');
          }

          return;
        }

        if (rootContainer) {
          rootContainer.classList.remove('is-dragging');
          rootContainer.classList.remove('is-dragging-from-main');
        }

        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        if (!targetElement) return;

        const closestSlot = targetElement.closest('.slot');
        if (closestSlot) {
          const toIndex = parseInt(closestSlot.getAttribute('data-index')) - 1;

          if (draggedFrom === 'main') {
            executeAnimatedInteraction('main', toIndex);
          } else if (draggedFrom !== toIndex) {
            executeAnimatedInteraction(draggedFrom, toIndex);
          }
        }

      });

      window.hasPointerDragListeners = true;
    }

    updateSlotsDOM();
    updateCarouselDOM();
    checkFaseStatus();
    precargarEstadisticasLectores();
  }

  function updateCarouselDOM() {
    if (availablePool.length <= 1) {
      navLeft.style.display = 'none';
      navRight.style.display = 'none';
    } else {
      navLeft.style.display = 'flex';
      navRight.style.display = 'flex';
    }

    if (availablePool.length === 0) {
      carouselTrack.innerHTML = '';
      return;
    }

    if (currentSliderIndex >= availablePool.length) {
      currentSliderIndex = availablePool.length - 1;
    }

    const offsets = [-2, -1, 0, 1, 2];
    const classes = ['pos-far-left', 'pos-left', 'pos-center', 'pos-right', 'pos-far-right'];
    const items = carouselTrack.querySelectorAll('.carousel-item');

    offsets.forEach((offset, idx) => {
      const item = items[idx];
      if (!item) return;

      item.style.visibility = 'visible';
      item.className = 'carousel-item';

      if (availablePool.length === 1 && offset !== 0) {
        item.style.display = 'none';
        return;
      }
      if (availablePool.length === 2 && (offset === -2 || offset === 2)) {
        item.style.display = 'none';
        return;
      }
      item.style.display = 'flex';

      let poolIdx = (currentSliderIndex + offset) % availablePool.length;
      if (poolIdx < 0) poolIdx += availablePool.length;

      const camiseta = availablePool[poolIdx];

      const anioEl = item.querySelector('.shirt-anio');
      const torneoEl = item.querySelector('.shirt-torneo');
      const imgEl = item.querySelector('.shirt-card-media img');

      if (anioEl) anioEl.innerText = camiseta.anio;
      if (torneoEl) torneoEl.innerText = camiseta.torneo;
      if (imgEl) {
        imgEl.src = camiseta.img;
        imgEl.alt = `Camiseta ${camiseta.anio}`;
      }

      item.classList.add(classes[offset + 2]);

      if (offset === 0) {
        item.setAttribute('draggable', 'true');
        item.dataset.draggableEnabled = "true";
      } else {
        item.setAttribute('draggable', 'false');
        item.dataset.draggableEnabled = "false";
      }
    });
  }

  function updateSlotsDOM() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach((slot, i) => {
      const icon = slot.querySelector('.slot-icon');
      const existingItem = slot.querySelector('.placed-item');
      if (existingItem) existingItem.remove();

      if (slotsData[i]) {
        icon.innerHTML = '<svg width="16" height="22" viewBox="0 0 16 22" aria-hidden="true"><path d="M1.1 15.05C0.733333 14.4167 0.458333 13.7667 0.275 13.1C0.0916667 12.4333 0 11.75 0 11.05C0 8.81667 0.775 6.91667 2.325 5.35C3.875 3.78333 5.76667 3 8 3H8.175L6.575 1.4L7.975 0L11.975 4L7.975 8L6.575 6.6L8.175 5H8C6.33333 5 4.91667 5.5875 3.75 6.7625C2.58333 7.9375 2 9.36667 2 11.05C2 11.4833 2.05 11.9083 2.15 12.325C2.25 12.7417 2.4 13.15 2.6 13.55L1.1 15.05ZM8.025 22L4.025 18L8.025 14L9.425 15.4L7.825 17H8C9.66667 17 11.0833 16.4125 12.25 15.2375C13.4167 14.0625 14 12.6333 14 10.95C14 10.5167 13.95 10.0917 13.85 9.675C13.75 9.25833 13.6 8.85 13.4 8.45L14.9 6.95C15.2667 7.58333 15.5417 8.23333 15.725 8.9C15.9083 9.56667 16 10.25 16 10.95C16 13.1833 15.225 15.0833 13.675 16.65C12.125 18.2167 10.2333 19 8 19H7.825L9.425 20.6L8.025 22Z"/></svg>';
        const item = document.createElement('div');
        item.classList.add('placed-item');

        const camiseta = slotsData[i];
        item.innerHTML = `
          <div class="shirt-card-media">
            <img src="${camiseta.img}" alt="Camiseta ${camiseta.anio}" draggable="false">
          </div>
        `;

        if (isEditingMode) {
          item.classList.add('shaking');
        }

        if (availablePool.length === 0 && !isEditingMode) {
          item.setAttribute('draggable', 'false');
        } else {
          item.setAttribute('draggable', 'true');
        }

        slot.appendChild(item);
      } else {
        icon.innerHTML = '<svg width="19" height="19" viewBox="0 0 19 19" aria-hidden="true"><path d="M8.75 10.25V13.5C8.75 13.7125 8.82192 13.8906 8.96575 14.0343C9.10958 14.1781 9.28775 14.25 9.50025 14.25C9.71292 14.25 9.891 14.1781 10.0345 14.0343C10.1782 13.8906 10.25 13.7125 10.25 13.5V10.25H13.5C13.7125 10.25 13.8906 10.1781 14.0343 10.0343C14.1781 9.89042 14.25 9.71225 14.25 9.49975C14.25 9.28708 14.1781 9.109 14.0343 8.9655C13.8906 8.82183 13.7125 8.75 13.5 8.75H10.25V5.5C10.25 5.2875 10.1781 5.10942 10.0343 4.96575C9.89042 4.82192 9.71225 4.75 9.49975 4.75C9.28708 4.75 9.109 4.82192 8.9655 4.96575C8.82183 5.10942 8.75 5.2875 8.75 5.5V8.75H5.5C5.2875 8.75 5.10942 8.82192 4.96575 8.96575C4.82192 9.10958 4.75 9.28775 4.75 9.50025C4.75 9.71292 4.82192 9.891 4.96575 10.0345C5.10942 10.1782 5.2875 10.25 5.5 10.25H8.75ZM9.50175 19C8.18775 19 6.95267 18.7507 5.7965 18.252C4.64033 17.7533 3.63467 17.0766 2.7795 16.2218C1.92433 15.3669 1.24725 14.3617 0.74825 13.206C0.249417 12.0503 0 10.8156 0 9.50175C0 8.18775 0.249333 6.95267 0.748 5.7965C1.24667 4.64033 1.92342 3.63467 2.77825 2.7795C3.63308 1.92433 4.63833 1.24725 5.794 0.74825C6.94967 0.249417 8.18442 0 9.49825 0C10.8123 0 12.0473 0.249333 13.2035 0.748C14.3597 1.24667 15.3653 1.92342 16.2205 2.77825C17.0757 3.63308 17.7528 4.63833 18.2518 5.794C18.7506 6.94967 19 8.18442 19 9.49825C19 10.8123 18.7507 12.0473 18.252 13.2035C17.7533 14.3597 17.0766 15.3653 16.2218 16.2205C15.3669 17.0757 14.3617 17.7528 13.206 18.2518C12.0503 18.7506 10.8156 19 9.50175 19ZM9.5 17.5C11.7333 17.5 13.625 16.725 15.175 15.175C16.725 13.625 17.5 11.7333 17.5 9.5C17.5 7.26667 16.725 5.375 15.175 3.825C13.625 2.275 11.7333 1.5 9.5 1.5C7.26667 1.5 5.375 2.275 3.825 3.825C2.275 5.375 1.5 7.26667 1.5 9.5C1.5 11.7333 2.275 13.625 3.825 15.175C5.375 16.725 7.26667 17.5 9.5 17.5Z"/></svg>';
      }
    });
  }

  function checkFaseStatus() {
    if (!rootContainer) return;

    const placedCount = slotsData.filter(s => s !== null).length;
    rootContainer.classList.remove('phase-selection', 'phase-locked', 'phase-edit', 'phase-ended');

    if (placedCount === 10) {
      carouselWrapper.style.display = 'none';
      thanksContainer.style.display = 'flex';
      if (actionGroup) actionGroup.style.display = 'flex';

      if (isEditingMode) {
        rootContainer.classList.add('phase-edit');
      } else {
        rootContainer.classList.add('phase-locked');
      }
    } else {
      carouselWrapper.style.display = 'flex';
      thanksContainer.style.display = 'none';
      if (actionGroup) actionGroup.style.display = 'none';

      isEditingMode = false;
      btnEditMode.innerText = "Editar selección";
      rootContainer.classList.add('phase-selection');
    }
  }

  function executeAnimatedInteraction(from, toIndex) {

    if (isAnimating) return;
    isAnimating = true;

    if (typeof from === 'number') {

      if (from === toIndex) {
        isAnimating = false;
        return;
      }

      const temp = slotsData[toIndex];
      slotsData[toIndex] = slotsData[from];
      slotsData[from] = temp;

      updateSlotsDOM();
      checkFaseStatus();

      isAnimating = false;
      return;
    }

    if (from === 'main' && slotsData[toIndex] !== null) {
      isAnimating = false;
      return;
    }

    const slots = document.querySelectorAll('.slot');
    const targetSlot = slots[toIndex];

    const sourceEl = document.querySelector('.carousel-item.pos-center');

    if (!sourceEl || availablePool.length === 0) {
      isAnimating = false;
      return;
    }

    const sourceData = availablePool[currentSliderIndex];

    rootContainer.style.pointerEvents = 'none';

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetSlot.getBoundingClientRect();

    const flyerSrc = createVisualFlyer(
      sourceRect,
      sourceData.img
    );

    void flyerSrc.offsetHeight;

    flyerSrc.style.top = targetRect.top + 'px';
    flyerSrc.style.left = targetRect.left + 'px';
    flyerSrc.style.width = targetRect.width + 'px';
    flyerSrc.style.height = targetRect.height + 'px';

    setTimeout(() => {

      flyerSrc.remove();

      slotsData[toIndex] = sourceData;

      availablePool.splice(currentSliderIndex, 1);

      if (currentSliderIndex >= availablePool.length) {
        currentSliderIndex =
          Math.max(availablePool.length - 1, 0);
      }

      rootContainer.style.pointerEvents = 'auto';

      updateSlotsDOM();
      updateCarouselDOM();
      checkFaseStatus();

      isAnimating = false;

      if (slotsData.filter(s => s !== null).length === 10) {
        thanksContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

    }, 400);
  }

  function createVisualFlyer(rect, imgSrc) {
    const flyer = document.createElement('div');
    flyer.style.position = 'fixed';
    flyer.style.top = rect.top + 'px';
    flyer.style.left = rect.left + 'px';
    flyer.style.width = rect.width + 'px';
    flyer.style.height = rect.height + 'px';
    flyer.style.backgroundColor = 'transparent';
    flyer.style.borderRadius = '0px';
    flyer.style.zIndex = '99999';
    flyer.style.pointerEvents = 'none';
    flyer.style.boxShadow = 'none';
    flyer.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';

    flyer.innerHTML = `<img src="${imgSrc}" style="width:100%; height:100%; object-fit:contain; box-sizing:border-box;">`;

    rootContainer.appendChild(flyer);
    return flyer;
  }

  function handleSlotClick(targetIndex) {
    if (isAnimating) return;

    if (slotsData[targetIndex] !== null) return;

    if (availablePool.length === 0) return;

    executeAnimatedInteraction('main', targetIndex);
  }

  btnEditMode.addEventListener('click', () => {
    isEditingMode = !isEditingMode;
    if (isEditingMode) {
      btnEditMode.classList.add('v-btn-g');
      btnEditMode.innerText = "Guardar cambios";
    } else {
      btnEditMode.classList.remove('v-btn-g');
      btnEditMode.innerText = "Editar selección";
    }
    updateSlotsDOM();
    checkFaseStatus();
  });

  function obtenerEstadisticasOptimizadas(payload) {
    let statsLocales = JSON.parse(JSON.stringify(cacheEstadisticasGlobales || []));

    const puestos = [
      payload.puesto1, payload.puesto2, payload.puesto3, payload.puesto4, payload.puesto5,
      payload.puesto6, payload.puesto7, payload.puesto8, payload.puesto9, payload.puesto10
    ];

    puestos.forEach((idVoto, index) => {
      if (!idVoto) return;

      const puntosASumar = 10 - index;
      const esTop1 = (index === 0);

      let camisetaStat = statsLocales.find(s => s.id === idVoto);

      if (camisetaStat) {
        camisetaStat.puntos = (camisetaStat.puntos || 0) + puntosASumar;
        if (esTop1) {
          camisetaStat.vecesTop = (camisetaStat.vecesTop || 0) + 1;
        }
      } else {
        statsLocales.push({
          id: idVoto,
          puntos: puntosASumar,
          vecesTop: esTop1 ? 1 : 0,
          percentTop: 0
        });
      }
    });

    let nuevoTotalTop1 = statsLocales.reduce((sum, item) => sum + (item.vecesTop || 0), 0);

    statsLocales.forEach(item => {
      item.percentTop = nuevoTotalTop1 > 0
        ? Math.round((item.vecesTop / nuevoTotalTop1) * 100)
        : 0;
    });

    return statsLocales;
  }

  btnShowResults.addEventListener('click', () => {
    if (!estadisticasCargadas) return;

    if (votoEnviado) return;
    votoEnviado = true;

    if (isEditingMode) {
      isEditingMode = false;
      btnEditMode.classList.remove('v-btn-g');
      btnEditMode.innerText = "Editar selección";
    }

    thanksContainer.style.display = 'none';
    if (actionGroup) actionGroup.style.display = 'none';
    resultsWrapper.style.display = 'block';

    updateSlotsDOM();
    if (rootContainer) {
      rootContainer.classList.remove('phase-edit', 'phase-selection', 'phase-locked', 'phase-ended');
      rootContainer.classList.add('phase-ended');
    }

    renderPyramidResults();

    const payload = {
      id: "voto_" + Date.now(),
      fecha: new Date().toISOString(),
      puesto1: slotsData[0] ? slotsData[0].id : "",
      puesto2: slotsData[1] ? slotsData[1].id : "",
      puesto3: slotsData[2] ? slotsData[2].id : "",
      puesto4: slotsData[3] ? slotsData[3].id : "",
      puesto5: slotsData[4] ? slotsData[4].id : "",
      puesto6: slotsData[5] ? slotsData[5].id : "",
      puesto7: slotsData[6] ? slotsData[6].id : "",
      puesto8: slotsData[7] ? slotsData[7].id : "",
      puesto9: slotsData[8] ? slotsData[8].id : "",
      puesto10: slotsData[9] ? slotsData[9].id : "",
      descarga: "NO",
      userAgent: navigator.userAgent,
      origen: window.location.hostname
    };

    ultimoVotoId = payload.id;
    descargaRegistrada = false;

    const statsOptimizadas = obtenerEstadisticasOptimizadas(payload);
    renderizarEstadisticasUnificadas(statsOptimizadas, payload.puesto1);

    resultsWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });

    fetch(URL_GOOGLE_SCRIPT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn("Error enviando datos al Excel (silencioso):", err);
    });
  });

  function ordenarParaCascadaDosColumnas(array) {
    if (window.innerWidth < 768) {
      return array;
    }
    const resultado = [];
    const mitad = Math.ceil(array.length / 2);
    for (let i = 0; i < mitad; i++) {
      if (array[i]) resultado.push(array[i]);
      if (array[i + mitad]) resultado.push(array[i + mitad]);
    }
    return resultado;
  }

  function renderizarEstadisticasUnificadas(serverData, top1Id) {
    const gridFavourite = document.getElementById('statsGridFavourite');
    const gridReaders = document.getElementById('statsGridReaders');

    if (!gridFavourite || !gridReaders) return;

    gridFavourite.innerHTML = '';
    gridReaders.innerHTML = '';

    let dataToUse = serverData;

    if (!Array.isArray(dataToUse) || dataToUse.length === 0) {
      let mockTotalTop1 = 120;
      dataToUse = camisetasData.map((c, i) => {
        const vecesTop = i === 3 ? 45 : i === 5 ? 30 : Math.floor(Math.random() * 8) + 1;
        return {
          id: c.id,
          puntos: 1500 - (i * 120) + Math.floor(Math.random() * 40),
          vecesTop: vecesTop,
          percentTop: Math.round((vecesTop / mockTotalTop1) * 100)
        };
      });
    }

    let dataFavoritas = dataToUse.map(stat => {
      const infoCamiseta = camisetasData.find(c => c.id === stat.id);
      return { ...infoCamiseta, ...stat };
    }).filter(item => item.id);

    dataFavoritas.sort((a, b) => b.vecesTop - a.vecesTop);

    dataFavoritas = dataFavoritas.map((item, index) => ({ ...item, rankingPos: index + 1 }));
    const dataFavoritasCascada = dataFavoritas;

    dataFavoritasCascada.forEach((item, index) => {
      const row = document.createElement('div');
      row.classList.add('stat-row');
      row.innerHTML = `
    <span class="stat-position-badge">${index + 1}</span>
    <img class="stat-shirt-preview" src="${item.img}" alt="${item.anio}">
    <span class="stat-percent">${item.percentTop}%</span>
    <div class="stat-bar-bg">
      <div class="stat-bar-fill" style="width: 0%;"></div>
    </div>
  `;
      gridFavourite.appendChild(row);

      setTimeout(() => {
        const bar = row.querySelector('.stat-bar-fill');
        if (bar) bar.style.width = `${item.percentTop}%`;
      }, 100);
    });

    let dataLectores = dataToUse.map(stat => {
      const infoCamiseta = camisetasData.find(c => c.id === stat.id);
      return { ...infoCamiseta, ...stat };
    }).filter(item => item.id);

    dataLectores.sort((a, b) => b.media - a.media);

    dataLectores = dataLectores.map((item, index) => ({ ...item, rankingPos: index + 1 }));
    const dataLectoresCascada = dataLectores;

    dataLectoresCascada.forEach((item, index) => {
      const row = document.createElement('div');
      row.classList.add('stat-row');

      row.innerHTML = `
  <span class="stat-position-badge">${index + 1}</span>

  <img
    class="stat-shirt-preview"
    src="${item.img}"
    alt="${item.anio}"
  >

  <span class="stat-torneo">
    ${item.torneo.toUpperCase()} '${item.anio.slice(-2)}
  </span>

  <span class="stat-percent">
    ${item.media.toFixed(1).replace('.', ',')}
  </span>
`;
      gridReaders.appendChild(row);
    });
  }

  function renderPyramidResults() {
    pyramidContainer.innerHTML = '';
    const rowDistribution = [
      [0],
      [1, 2],
      [3, 4, 5],
      [6, 7, 8, 9]
    ];

    rowDistribution.forEach((indices) => {
      const row = document.createElement('div');
      row.classList.add('pyramid-row');

      indices.forEach((index) => {
        const pSlot = document.createElement('div');
        pSlot.classList.add('pyramid-slot');

        const camiseta = slotsData[index];

        if (camiseta) {
          pSlot.style.backgroundColor = 'transparent';

          const imgEl = document.createElement('img');
          imgEl.src = camiseta.img;
          imgEl.classList.add('pyramid-shirt-img');
          imgEl.alt = `Camiseta ${camiseta.anio}`;
          pSlot.appendChild(imgEl);
        } else {
          pSlot.style.backgroundColor = '#ffffff';
        }

        const badge = document.createElement('div');
        badge.classList.add('pyramid-badge');
        badge.innerText = index + 1;

        pSlot.appendChild(badge);
        row.appendChild(pSlot);
      });
      pyramidContainer.appendChild(row);
    });
  }

  function precargarEstadisticasLectores() {
    fetch(URL_GOOGLE_SCRIPT)
      .then(response => response.json())
      .then(realData => {
        console.log('Estadísticas precargadas:', realData);

        cacheEstadisticasGlobales = realData;
        estadisticasCargadas = true;

        btnShowResults.disabled = false;
        btnShowResults.innerText = 'Enviar';
      })
      .catch(error => {
        console.error(
          "Error al precargar estadísticas iniciales:",
          error
        );

        estadisticasCargadas = true;

        btnShowResults.disabled = false;
        btnShowResults.innerText = 'Enviar';
      });
  }

  btnDownload.addEventListener('click', () => {
    const textoOriginal = btnDownload.innerText;
    btnDownload.innerText = 'Descargando...';
    btnDownload.disabled = true;

    const captureTarget = document.getElementById('captureArea');
    if (!captureTarget) return;

    html2canvas(captureTarget, {
      scale: 2,
      useCORS: true,
      onclone: (clonedDocument) => {
        const clonedTarget = clonedDocument.getElementById('captureArea');
        const clonedTitle = clonedTarget?.querySelector('.capture-title');
        const clonedPyramid = clonedTarget?.querySelector('.pyramid-container');
        const clonedSlots = clonedTarget?.querySelectorAll('.pyramid-slot');
        const clonedBadges = clonedTarget?.querySelectorAll('.pyramid-badge');
        const clonedLogo = clonedDocument.getElementById('captureLogo');

        if (clonedTarget) {
          clonedTarget.style.width = '610px';
          clonedTarget.style.height = '865px';
          clonedTarget.style.padding = '55px 0 0';
        }

        if (clonedTitle) {
          clonedTitle.style.display = 'block';
          clonedTitle.style.paddingTop = '11px';
          clonedTitle.style.width = '457px';
        }

        if (clonedPyramid) {
          clonedPyramid.style.width = '610px';
          clonedPyramid.style.height = '620px';
        }

        if (clonedSlots) {
          clonedSlots.forEach(slot => {
            slot.style.width = '140px';
          });
        }

        if (clonedBadges) {
          clonedBadges.forEach(badge => {
            badge.style.display = 'block';
            badge.style.paddingTop = '1px';
            badge.style.lineHeight = '16px';
            badge.style.fontSize = '16px';
            badge.style.width = '25px';
            badge.style.height = '25px';
          });
        }

        if (clonedLogo) {
          clonedLogo.style.display = 'block';
        }
      }
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'mis-favoritas-españa.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      if (ultimoVotoId && !descargaRegistrada) {
        fetch(URL_GOOGLE_SCRIPT, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            action: 'download',
            id: ultimoVotoId
          })
        })
          .then(() => {
            descargaRegistrada = true;
          })
          .catch(err => {
            console.warn('Error registrando descarga', err);
          });
      }
      btnDownload.innerText = textoOriginal;
      btnDownload.disabled = false;
    }).catch(err => {
      console.error('Error al generar captura: ', err);
      btnDownload.innerText = textoOriginal;
      btnDownload.disabled = false;
    });
  });

  btnReplay.addEventListener('click', () => {
    availablePool = [...camisetasData];
    slotsData = Array(10).fill(null);
    isEditingMode = false;
    currentSliderIndex = 0;
    votoEnviado = false;
    ultimoVotoId = null;
    descargaRegistrada = false;
    resultsWrapper.style.display = 'none';
    initSlots();
    rootContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  navLeft.addEventListener('click', () => {
    if (availablePool.length === 0) return;
    currentSliderIndex = (currentSliderIndex - 1 + availablePool.length) % availablePool.length;
    updateCarouselDOM();
  });

  navRight.addEventListener('click', () => {
    if (availablePool.length === 0) return;
    currentSliderIndex = (currentSliderIndex + 1) % availablePool.length;
    updateCarouselDOM();
  });

  initSlots();
}