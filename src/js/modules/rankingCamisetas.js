import html2canvas from 'html2canvas';

export default function rankingCamisetas() {
  const camisetasData = [
    { id: 'esp_2026_1', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2026-a.webp', anio: '2026', torneo: 'USA-México-Canadá' },
    { id: 'esp_2026_2', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2026-b.webp', anio: '2026', torneo: 'USA-México-Canadá' },
    { id: 'esp_2022', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2022.webp', anio: '2022', torneo: 'Qatar' },
    { id: 'esp_2014', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2014.webp', anio: '2014', torneo: 'Brasil' },
    { id: 'esp_2010', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2010.webp', anio: '2010', torneo: 'Sudáfrica' },
    { id: 'esp_2006', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2006.webp', anio: '2006', torneo: 'Alemania' },
    { id: 'esp_2002', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-2002.webp', anio: '2002', torneo: 'Corea-Japón' },
    { id: 'esp_1998', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-1998.webp', anio: '1998', torneo: 'Francia' },
    { id: 'esp_1994', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-1994.webp', anio: '1994', torneo: 'EEUU' },
    { id: 'esp_1982', img: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/25/ranking-camisetas-laroja/images/camiseta-1982.webp', anio: '1982', torneo: 'España' }
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
  const btnDownload = document.getElementById('btnDownload');
  const btnReplay = document.getElementById('btnReplay');
  const navLeft = document.getElementById('navLeft');
  const navRight = document.getElementById('navRight');

  // =========================================================================
  // BOTÓN FLOTANTE DE AUTOCOMPLETAR
  // =========================================================================
  function injectAutoFillButton() {
    if (document.getElementById('btnAutoFillDev')) return;

    const btn = document.createElement('button');
    btn.id = 'btnAutoFillDev';
    btn.innerText = '🎲 Auto 10';
    
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
      let vacíos = [];
      slotsData.forEach((slot, index) => {
        if (slot === null) vacíos.push(index);
      });

      if (vacíos.length === 0 || availablePool.length === 0) {
        alert('¡La selección ya está completa!');
        return;
      }

      btn.disabled = true;
      btn.style.opacity = '0.5';

      vacíos.forEach((targetIndex, order) => {
        setTimeout(() => {
          if (availablePool.length > 0) {
            const randomPoolIndex = Math.floor(Math.random() * availablePool.length);
            currentSliderIndex = randomPoolIndex;
            updateCarouselDOM();
            executeAnimatedInteraction('main', targetIndex);
          }

          if (order === vacíos.length - 1) {
            setTimeout(() => {
              btn.disabled = false;
              btn.style.opacity = '1';
            }, 500);
          }
        }, order * 450); 
      });
    });

    rootContainer.appendChild(btn);
  }

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
      item.addEventListener('dragstart', (e) => {
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

        if (availablePool.length === 0 && !isEditingMode) {
          item.setAttribute('draggable', 'false');
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
    
    const placedCount = slotsData.filter(s => s !== null).length;
    rootContainer.classList.remove('phase-selection', 'phase-locked', 'phase-edit');

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

  // =========================================================================
  // ESTADÍSTICAS OPTIMISTAS
  // =========================================================================
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

  // =========================================================================
  // ACCIÓN DEL BOTÓN ENVIAR (CON AUTOCLOSE/LOCK DE EDICIÓN)
  // =========================================================================
  btnShowResults.addEventListener('click', () => {
    // Si estaba editando, forzar el guardado y bloqueo definitivo en UI
    if (isEditingMode) {
      isEditingMode = false;
      btnEditMode.classList.remove('v-btn-g');
      btnEditMode.innerText = "Editar selección";
    }

    // Ocultar contenedores iniciales y botones para evitar manipulación posterior
    thanksContainer.style.display = 'none';
    if (actionGroup) actionGroup.style.display = 'none';
    resultsWrapper.style.display = 'block';
    
    // Forzar redibujado de ranuras sin la clase shaking y deshabilitar draggables
    updateSlotsDOM();
    if (rootContainer) {
      rootContainer.classList.remove('phase-edit', 'phase-selection');
      rootContainer.classList.add('phase-locked');
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
      puesto10: slotsData[9] ? slotsData[9].id : ""
    };

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

  // Helper para reordenar un array en cascada vertical (Izquierda -> Abajo, luego Derecha -> Abajo)
  function ordenarParaCascadaDosColumnas(array) {
    if (window.innerWidth < 768) {
      return array; // En móvil se queda correlativo del 1 al 10 en su columna única
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

    // --- BLOQUE 1: LAS FAVORITAS ---
    let dataFavoritas = dataToUse.map(stat => {
      const infoCamiseta = camisetasData.find(c => c.id === stat.id);
      return { ...infoCamiseta, ...stat };
    }).filter(item => item.id);

    dataFavoritas.sort((a, b) => b.vecesTop - a.vecesTop);
    
    // Inyectamos la propiedad de su posición real en el ranking antes de romper el orden para la cascada
    dataFavoritas = dataFavoritas.map((item, index) => ({ ...item, rankingPos: index + 1 }));
    const dataFavoritasCascada = ordenarParaCascadaDosColumnas(dataFavoritas);

    dataFavoritasCascada.forEach(item => {
      const row = document.createElement('div');
      row.classList.add('stat-row');
      row.innerHTML = `
        <span class="stat-position-badge">${item.rankingPos}</span>
        <img class="stat-shirt-preview" src="${item.img}" alt="${item.anio}">
        <span class="stat-percent">${item.percentTop}%</span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width: 0%; background-color: ${item.id === top1Id ? '#1868FF' : '#111827'}"></div>
        </div>
      `;
      gridFavourite.appendChild(row);

      setTimeout(() => {
        const bar = row.querySelector('.stat-bar-fill');
        if (bar) bar.style.width = `${item.percentTop}%`;
      }, 100);
    });

    // --- BLOQUE 2: LA DE LOS LECTORES ---
    let dataLectores = dataToUse.map(stat => {
      const infoCamiseta = camisetasData.find(c => c.id === stat.id);
      return { ...infoCamiseta, ...stat };
    }).filter(item => item.id);

    dataLectores.sort((a, b) => b.puntos - a.puntos);
    
    // Inyectamos la propiedad de su posición real en el ranking
    dataLectores = dataLectores.map((item, index) => ({ ...item, rankingPos: index + 1 }));
    const maxPuntosActuales = Math.max(...dataLectores.map(d => d.puntos), 1);
    const dataLectoresCascada = ordenarParaCascadaDosColumnas(dataLectores);

    dataLectoresCascada.forEach(item => {
      const row = document.createElement('div');
      row.classList.add('stat-row');

      const anchoProporcionalBarra = Math.round((item.puntos / maxPuntosActuales) * 100);

      row.innerHTML = `
        <span class="stat-position-badge">${item.rankingPos}</span>
        <img class="stat-shirt-preview" src="${item.img}" alt="${item.anio}">
        <span class="stat-percent">${item.puntos} pts</span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width: 0%; background-color: ${item.id === top1Id ? '#1868FF' : '#111827'}"></div>
        </div>
      `;
      gridReaders.appendChild(row);

      setTimeout(() => {
        const bar = row.querySelector('.stat-bar-fill');
        if (bar) bar.style.width = `${anchoProporcionalBarra}%`;
      }, 100);
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