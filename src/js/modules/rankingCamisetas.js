export default function rankingCamisetas() {
  const camisetasData = [
    { id: 'esp_2026_1', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-01.webp', anio: '2026', torneo: 'USA-México-Canadá' },
    { id: 'esp_2026_2', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-02.webp', anio: '2026', torneo: 'USA-México-Canadá' },
    { id: 'esp_2022', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-03.webp', anio: '2022', torneo: 'Qatar' },
    { id: 'esp_2014', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-04.webp', anio: '2014', torneo: 'Brasil' },
    { id: 'esp_2010', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-05.webp', anio: '2010', torneo: 'Sudáfrica' },
    { id: 'esp_2006', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-06.webp', anio: '2006', torneo: 'Alemania' },
    { id: 'esp_2002', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-07.webp', anio: '2002', torneo: 'Corea-Japón' },
    { id: 'esp_1998', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-08.webp', anio: '1998', torneo: 'Francia' },
    { id: 'esp_1994', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-09.webp', anio: '1994', torneo: 'EEUU' },
    { id: 'esp_1982', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/mockup-camiseta-10.webp', anio: '1982', torneo: 'España' }
  ];

  const URL_GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbwanyzmEUo1Hk1jCImfdHsXr3_Hxqd8G28sRmGEu4Cg8kIalXGR_-IZBhBNP-yE_NIg/exec';

  let availablePool = [...camisetasData];
  let currentSliderIndex = 0;
  let slotsData = Array(10).fill(null);
  let draggedFrom = null;
  let isEditingMode = false;
  let cacheEstadisticasGlobales = null;

  const rootContainer = document.querySelector('.v-n-rcl');
  const carouselWrapper = document.getElementById('carouselWrapper');
  const carouselTrack = document.getElementById('carouselTrack');
  const thanksContainer = document.getElementById('thanksContainer');
  const actionGroup = document.querySelector('.action-group');
  const dropZone = document.getElementById('dropZone');
  const btnEditMode = document.getElementById('btnEditMode');
  const btnShowResults = document.getElementById('btnShowResults');
  const resultsWrapper = document.getElementById('resultsWrapper');
  const pyramidContainer = document.getElementById('pyramidContainer');
  const statsGrid = document.getElementById('statsGrid');
  const btnDownload = document.getElementById('btnDownload');
  const btnReplay = document.getElementById('btnReplay');
  const navLeft = document.getElementById('navLeft');
  const navRight = document.getElementById('navRight');

  // =========================================================================
  // BOTÓN FLOTANTE DE AUTOCOMPLETAR (SOLO PARA PRUEBAS / DESARROLLO)
  // =========================================================================
  function injectAutoFillButton() {
    // Evitamos duplicar el botón si ya existe
    if (document.getElementById('btnAutoFillDev')) return;

    const btn = document.createElement('button');
    btn.id = 'btnAutoFillDev';
    btn.innerText = '🎲 Auto 10';
    
    // Estilos inline para dejarlo fijo (fixed) en una esquina
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '999999',
      backgroundColor: '#ff5a5f',
      color: '#ffffff',
      border: 'none',
      borderRadius: '50px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      cursor: 'pointer',
      transition: 'transform 0.2s, background-color 0.2s'
    });

    btn.addEventListener('mouseenter', () => btn.style.backgroundColor = '#e0484c');
    btn.addEventListener('mouseleave', () => btn.style.backgroundColor = '#ff5a5f');

    btn.addEventListener('click', () => {
      // 1. Buscamos qué índices de la pirámide están vacíos actualmente
      let vacíos = [];
      slotsData.forEach((slot, index) => {
        if (slot === null) vacíos.push(index);
      });

      // Si ya está llena la pirámide, no hace falta hacer nada
      if (vacíos.length === 0 || availablePool.length === 0) {
        alert('¡La selección ya está completa!');
        return;
      }

      // Deshabilitamos temporalmente el botón durante el rellenado simultáneo
      btn.disabled = true;
      btn.style.opacity = '0.5';

      // 2. Rellenamos cada hueco vacío de forma secuencial respetando las animaciones
      vacíos.forEach((targetIndex, order) => {
        setTimeout(() => {
          if (availablePool.length > 0) {
            // Elegimos un índice aleatorio de las camisetas que quedan disponibles
            const randomPoolIndex = Math.floor(Math.random() * availablePool.length);
            
            // Movemos el slider del carrusel temporalmente a esa posición para que la animación salga desde ahí
            currentSliderIndex = randomPoolIndex;
            updateCarouselDOM();

            // Lanzamos la interacción animada original hacia el hueco de la pirámide
            executeAnimatedInteraction('main', targetIndex);
          }

          // Si es el último elemento en colocarse, reactivamos el botón
          if (order === vacíos.length - 1) {
            setTimeout(() => {
              btn.disabled = false;
              btn.style.opacity = '1';
            }, 500);
          }
        }, order * 450); // 450ms de delay entre camisetas para que no se pisen las animaciones de 400ms
      });
    });

    rootContainer.appendChild(btn);
  }

  // Ejecutamos la inyección del botón dev
  injectAutoFillButton();

  function initSlots() {
    dropZone.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const slot = document.createElement('div');
      slot.classList.add('slot');
      slot.setAttribute('data-index', i + 1);

      const icon = document.createElement('div');
      icon.classList.add('slot-icon');
      slot.appendChild(icon);

      slot.addEventListener('dragover', (e) => e.preventDefault());
      slot.addEventListener('drop', (e) => handleDrop(e, i));
      slot.addEventListener('click', () => handleSlotClick(i));

      dropZone.appendChild(slot);
    }

    // 1. CREACIÓN ÚNICA DE LA ESTRUCTURA INTERNA
    carouselTrack.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const item = document.createElement('div');
      item.classList.add('carousel-item');
      
      // La estructura se inyecta vacía una sola vez aquí
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

    // 2. LISTENERS DE ARRASTRE ESTABLES (No clonan nodos, evitan el flasheo)
    carouselTrack.querySelectorAll('.carousel-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        // Si no es la tarjeta central (habilitada mediante data-attribute), cancelamos el arrastre
        if (item.dataset.draggableEnabled !== "true") {
          e.preventDefault();
          return;
        }
        draggedFrom = 'main';
        if (rootContainer) rootContainer.classList.add('is-dragging');
      });

      item.addEventListener('dragend', () => {
        if (rootContainer) rootContainer.classList.remove('is-dragging');
      });
    });

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

      // 🔥 SOLUCIÓN AQUÍ: Restauramos la visibilidad que 'executeAnimatedInteraction' ocultó
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
        icon.innerText = '⇄';
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

        if (availablePool.length === 0) {
          item.setAttribute('draggable', isEditingMode ? 'true' : 'false');
        } else {
          item.setAttribute('draggable', 'true');
        }

        item.addEventListener('dragstart', () => {
          draggedFrom = i;
          if (rootContainer) rootContainer.classList.add('is-dragging');
        });
        item.addEventListener('dragend', () => {
          if (rootContainer) rootContainer.classList.remove('is-dragging');
        });

        slot.appendChild(item);
      } else {
        icon.innerText = '[ + ]';
      }
    });
  }

  function checkFaseStatus() {
    if (!rootContainer) return;
    
    const placedCount = slotsData.filter(s => s !== null).length; // 
    rootContainer.classList.remove('phase-selection', 'phase-locked', 'phase-edit'); // 

    if (placedCount === 10) { // 
      carouselWrapper.style.display = 'none'; // 
      thanksContainer.style.display = 'flex'; // 
      if (actionGroup) actionGroup.style.display = 'flex'; // 🔥 Muestra los botones al terminar
      
      if (isEditingMode) { // 
        rootContainer.classList.add('phase-edit'); // 
      } else {
        rootContainer.classList.add('phase-locked'); // 
      }
    } else {
      carouselWrapper.style.display = 'flex'; // 
      thanksContainer.style.display = 'none'; // 
      if (actionGroup) actionGroup.style.display = 'none'; // 🔥 Oculta los botones mientras juega
      
      isEditingMode = false; // 
      btnEditMode.innerText = "Editar selección"; // 
      rootContainer.classList.add('phase-selection'); // 
    }
  }

  function executeAnimatedInteraction(from, toIndex) {
    const slots = document.querySelectorAll('.slot');
    const targetSlot = slots[toIndex];

    let sourceEl = null;
    let sourceData = null;
    let targetData = slotsData[toIndex];

    if (from === 'main') {
      sourceEl = document.querySelector('.carousel-item.pos-center');
      sourceData = availablePool[currentSliderIndex];
    } else if (typeof from === 'number') {
      if (availablePool.length === 0 && !isEditingMode) return;
      sourceEl = slots[from].querySelector('.placed-item');
      sourceData = slotsData[from];
    }

    if (!sourceEl) return;

    rootContainer.style.pointerEvents = 'none';

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetSlot.getBoundingClientRect();

    const flyerSrc = createVisualFlyer(sourceRect, sourceData.img);
    let flyerTgt = null;
    if (targetData) {
      flyerTgt = createVisualFlyer(targetRect, targetData.img);
    }

    sourceEl.style.visibility = 'hidden';
    if (targetSlot.querySelector('.placed-item')) {
      targetSlot.querySelector('.placed-item').style.visibility = 'hidden';
    }

    void flyerSrc.offsetHeight;
    if (flyerTgt) void flyerTgt.offsetHeight;

    flyerSrc.style.top = targetRect.top + 'px';
    flyerSrc.style.left = targetRect.left + 'px';
    flyerSrc.style.width = targetRect.width + 'px';
    flyerSrc.style.height = targetRect.height + 'px';

    if (flyerTgt) {
      flyerTgt.style.top = sourceRect.top + 'px';
      flyerTgt.style.left = sourceRect.left + 'px';
      flyerTgt.style.width = sourceRect.width + 'px';
      flyerTgt.style.height = sourceRect.height + 'px';
    }

    setTimeout(() => {
      flyerSrc.remove();
      if (flyerTgt) flyerTgt.remove();
      rootContainer.style.pointerEvents = 'auto';

      if (from === 'main') {
        if (!slotsData[toIndex]) {
          slotsData[toIndex] = sourceData;
          availablePool.splice(currentSliderIndex, 1);
        } else {
          let temp = slotsData[toIndex];
          slotsData[toIndex] = sourceData;
          availablePool[currentSliderIndex] = temp;
        }
      } else if (typeof from === 'number') {
        let temp = slotsData[toIndex];
        slotsData[toIndex] = slotsData[from];
        slotsData[from] = temp;
      }

      updateSlotsDOM();
      updateCarouselDOM();
      checkFaseStatus();

      if (slotsData.filter(s => s !== null).length === 10 && from === 'main') {
        thanksContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  function handleDrop(e, targetIndex) {
    e.preventDefault();
    if (rootContainer) rootContainer.classList.remove('is-dragging');
    executeAnimatedInteraction(draggedFrom, targetIndex);
  }

  function handleSlotClick(targetIndex) {
    if (availablePool.length > 0) {
      executeAnimatedInteraction('main', targetIndex);
    }
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

  btnShowResults.addEventListener('click', () => {
    thanksContainer.style.display = 'none';
    if (actionGroup) actionGroup.style.display = 'none';
    resultsWrapper.style.display = 'block';
    renderPyramidResults();

    if (cacheEstadisticasGlobales) {
      let estadisticasCombinadas = JSON.parse(JSON.stringify(cacheEstadisticasGlobales));
      let puntosAsignadosPorCamiseta = {};
      
      slotsData.forEach((camiseta, index) => {
        if (camiseta) {
          puntosAsignadosPorCamiseta[camiseta.id] = 10 - index;
        }
      });

      let totalPuntosSimuladosAnteriores = 100;
      let puntosFinalesPorCamiseta = {};
      let sumaTotalPuntosNuevos = 0;

      camisetasData.forEach(cam => {
        let key = cam.id;
        let registroPrevio = estadisticasCombinadas.find(item => item.id === key);
        let porcentajePrevio = registroPrevio ? registroPrevio.percent : 0;

        let ptsPasado = (porcentajePrevio / 100) * totalPuntosSimuladosAnteriores;
        let ptsAhora = puntosAsignadosPorCamiseta[key] || 0;

        puntosFinalesPorCamiseta[key] = ptsPasado + ptsAhora;
        sumaTotalPuntosNuevos += puntosFinalesPorCamiseta[key];
      });

      let datosGraficosFinales = estadisticasCombinadas.map(item => {
        let key = item.id;
        let nuevosPuntos = puntosFinalesPorCamiseta[key];
        let nuevoPorcentaje = sumaTotalPuntosNuevos > 0 ? Math.round((nuevosPuntos / sumaTotalPuntosNuevos) * 100) : 0;
        return {
          id: item.id,
          percent: nuevoPorcentaje
        };
      });

      datosGraficosFinales.sort((a, b) => b.percent - a.percent);
      renderRealStats(datosGraficosFinales);
    } else {
      statsGrid.innerHTML = '<p style="grid-column: span 2; text-align: center; color: #6b7280; padding: 20px 0;">Calculando estadísticas globales en vivo...</p>';
    }

    resultsWrapper.scrollIntoView({ behavior: 'smooth' });

    const datosVotacion = {
      id: "USER_" + Math.floor(Math.random() * 1000000),
      fecha: new Date().toLocaleString('es-ES'),
      puesto1: slotsData[0] ? slotsData[0].id : 'vacío',
      puesto2: slotsData[1] ? slotsData[1].id : 'vacío',
      puesto3: slotsData[2] ? slotsData[2].id : 'vacío',
      puesto4: slotsData[3] ? slotsData[3].id : 'vacío',
      puesto5: slotsData[4] ? slotsData[4].id : 'vacío',
      puesto6: slotsData[5] ? slotsData[5].id : 'vacío',
      puesto7: slotsData[6] ? slotsData[6].id : 'vacío',
      puesto8: slotsData[7] ? slotsData[7].id : 'vacío',
      puesto9: slotsData[8] ? slotsData[8].id : 'vacío',
      puesto10: slotsData[9] ? slotsData[9].id : 'vacío'
    };

    fetch(URL_GOOGLE_SCRIPT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(datosVotacion)
    })
      .then(response => response.text())
      .then(textData => {
        console.log('¡Voto consolidado con éxito en el Excel!');
      })
      .catch(error => {
        console.error('Error al registrar el voto en segundo plano:', error);
      });
  });

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

  function renderRealStats(realData) {
    statsGrid.innerHTML = '';

    realData.forEach((data) => {
      const row = document.createElement('div');
      row.classList.add('stat-row');

      const shirt = document.createElement('div');
      shirt.classList.add('stat-shirt-preview');
      shirt.style.backgroundColor = 'transparent';

      const camisetaOriginal = camisetasData.find(c => c.id === data.id);

      if (camisetaOriginal) {
        shirt.innerHTML = `<img src="${camisetaOriginal.img}" alt="" style="width: 100%; height: 100%; object-fit: contain;">`;
      }

      const label = document.createElement('div');
      label.classList.add('stat-percent');
      label.innerText = `${data.percent}%`;

      const barBg = document.createElement('div');
      barBg.classList.add('stat-bar-bg');

      const barFill = document.createElement('div');
      barFill.classList.add('stat-bar-fill');

      barBg.appendChild(barFill);
      row.appendChild(shirt);
      row.appendChild(label);
      row.appendChild(barBg);
      statsGrid.appendChild(row);

      setTimeout(() => {
        barFill.style.width = `${data.percent}%`;
      }, 100);
    });
  }

  function precargarEstadisticasLectores() {
    fetch(URL_GOOGLE_SCRIPT)
      .then(response => response.json())
      .then(realData => {
        console.log("¡Estadísticas globales precargadas con éxito al iniciar!", realData);
        cacheEstadisticasGlobales = realData;
      })
      .catch(error => {
        console.error("Error al precargar estadísticas iniciales desde Excel:", error);
      });
  }

  btnDownload.addEventListener('click', () => {
    const captureTarget = document.getElementById('captureArea');
    html2canvas(captureTarget, { scale: 2, useCORS: true }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'mis-favoritas-españa.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });

  btnReplay.addEventListener('click', () => {
    availablePool = [...camisetasData];
    slotsData = Array(10).fill(null);
    isEditingMode = false;
    currentSliderIndex = 0;
    resultsWrapper.style.display = 'none';
    initSlots();
    rootContainer.scrollIntoView({ behavior: 'smooth' });
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

  // =========================================================================
  // BOTÓN FLOTANTE DE AUTOCOMPLETAR INSTANTÁNEO (PARA PRUEBAS)
  // =========================================================================
  function injectAutoFillButton() {
    if (document.getElementById('btnAutoFillDev')) return;

    const btn = document.createElement('button');
    btn.id = 'btnAutoFillDev';
    btn.innerText = '⚡ Auto Rápido';
    
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '999999',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '50px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      cursor: 'pointer',
      transition: 'transform 0.2s, background-color 0.2s'
    });

    btn.addEventListener('mouseenter', () => btn.style.backgroundColor = '#059669');
    btn.addEventListener('mouseleave', () => btn.style.backgroundColor = '#10b981');

    btn.addEventListener('click', () => {
      let vacios = [];
      slotsData.forEach((slot, index) => {
        if (slot === null) vacios.push(index);
      });

      if (vacios.length === 0 || availablePool.length === 0) {
        alert('¡La selección ya está completa!');
        return;
      }

      vacios.forEach((targetIndex) => {
        if (availablePool.length > 0) {
          const randomPoolIndex = Math.floor(Math.random() * availablePool.length);
          const camisetaSeleccionada = availablePool[randomPoolIndex];
          slotsData[targetIndex] = camisetaSeleccionada;
          availablePool.splice(randomPoolIndex, 1);
        }
      });

      updateSlotsDOM();
      updateCarouselDOM();
      checkFaseStatus();

      if (slotsData.filter(s => s !== null).length === 10) {
        thanksContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    rootContainer.appendChild(btn);
  }

  injectAutoFillButton();

  initSlots();
}