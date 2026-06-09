export default function initSagradaFamilia(jsonData) {
  const muralModal = document.getElementById('modal-sf-mural');
  const muralImg = document.getElementById('sf-statues-scene-bg');
  const hotspotsContainer = document.getElementById('sf-statues-scene-hotspots');
  
  // 🎯 ELEMENTOS DEL LOCALIZADOR
  const locatorImg = document.querySelector('.sf-statues-locator img');
  const locatorPoint = document.querySelector('.sf-statues-locator .locator-point');

  const statueModal = document.getElementById('modal-sf-info-statue');
  const statueTitle = document.getElementById('pop-statue-title');
  const statueDesc = document.getElementById('pop-statue-desc');
  const statueImg = document.querySelector('#pop-statue-img img');

  const sceneButtons = document.querySelectorAll('[data-open-dynamic-scene]');
  
  let currentSceneData = null;
  let resizeObserver = null;
  let updateSliderControlsGlobal = null; // 🔄 Referencia global para actualizar el slider al redimensionar

  // FUNCIÓN LOCAL DE LIMPIEZA
  const clearLocatorAndActiveStates = () => {
    if (hotspotsContainer) {
      hotspotsContainer.querySelectorAll('.sf-statue-item').forEach(item => item.classList.remove('is-active'));
      hotspotsContainer.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('is-active'));
    }
    if (locatorPoint) {
      locatorPoint.className = 'locator-point';
      locatorPoint.style.display = 'none';
    }
  };

  sceneButtons.forEach(button => {
    button.addEventListener('click', () => {
      const sceneId = button.getAttribute('data-open-dynamic-scene');
      currentSceneData = jsonData[sceneId];

      if (!currentSceneData) return;

      const isMobile = window.innerWidth <= 699;

      clearLocatorAndActiveStates();

      if (muralImg) {
        muralImg.src = currentSceneData.backgroundImage;
        muralImg.alt = currentSceneData.altText || "Detalle del mural";
      }

      if (locatorImg && currentSceneData.locatorImage) {
        locatorImg.src = currentSceneData.locatorImage;
      }

      renderHotspots(isMobile, true);

      if (muralModal) {
        const classesToRemove = Array.from(muralModal.classList).filter(c => c.startsWith('v-n-modal--mural-'));
        classesToRemove.forEach(c => muralModal.classList.remove(c));
        muralModal.classList.add(`v-n-modal--${sceneId}`);
      }

      if (statueModal) {
        statueModal.classList.add('is-open');
      }

      setupResizeTracking();
    });
  });

  function renderHotspots(isMobile, isInitialOpen = false) {
    if (!hotspotsContainer || !currentSceneData) return;

    destroyMobileSlider();
    hotspotsContainer.innerHTML = '';

    let activateFirstStatue = null;

    currentSceneData.hotspots.forEach((hotspot, index) => {
      const itemContainer = document.createElement('div');
      itemContainer.className = `sf-statue-item ${hotspot.className || ''}`;

      const targetStatueImg = isMobile ? hotspot.statueImgMobile : hotspot.statueImgDesktop;

      if (targetStatueImg) {
        const imgStatue = document.createElement('img');
        imgStatue.src = targetStatueImg;
        imgStatue.className = 'sf-statue-item__img';
        imgStatue.alt = `Silueta de ${hotspot.title}`;
        itemContainer.appendChild(imgStatue);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sf-btn';
      btn.setAttribute('data-modal-target', 'modal-sf-info-statue');
      btn.setAttribute('data-modal-position', isMobile ? 'none' : 'center');

      const selectStatue = () => {
        hotspotsContainer.querySelectorAll('.sf-statue-item').forEach(item => item.classList.remove('is-active'));
        hotspotsContainer.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('is-active'));

        itemContainer.classList.add('is-active');
        btn.classList.add('is-active');

        if (locatorPoint) {
          locatorPoint.className = 'locator-point'; 
          const positionIndex = String(index + 1).padStart(2, '0');
          locatorPoint.classList.add(`is-statue-${positionIndex}`);
          locatorPoint.style.display = 'block'; 
        }

        if (statueTitle) statueTitle.innerHTML = hotspot.title;
        if (statueDesc) statueDesc.innerHTML = hotspot.description;
        
        if (statueImg) {
          const imgContainer = statueImg.parentElement;

          if (hotspot.image) {
            statueImg.src = hotspot.image;
            statueImg.alt = `Fotografía en detalle de ${hotspot.title}`;
            imgContainer.style.display = ''; 

            imgContainer.classList.remove('is-horizontal', 'is-vertical');
            if (hotspot.orientation === 'horizontal') {
              imgContainer.classList.add('is-horizontal');
            } else if (hotspot.orientation === 'vertical') {
              imgContainer.classList.add('is-vertical');
            }

          } else {
            imgContainer.style.display = 'none'; 
            imgContainer.classList.remove('is-horizontal', 'is-vertical');
          }
        }

        if (statueModal) {
          statueModal.classList.add('is-open');
        }
      };

      btn.addEventListener('click', selectStatue);
      itemContainer.appendChild(btn);
      hotspotsContainer.appendChild(itemContainer);

      if (index === 0) {
        activateFirstStatue = selectStatue;
      }
    });

    if (activateFirstStatue) {
      if (isInitialOpen) {
        setTimeout(() => {
          activateFirstStatue();
        }, 100);
      } else {
        activateFirstStatue();
      }
    }

    if (isMobile) {
      setupMobileSlider();
    }
  }

  function setupResizeTracking() {
    if (resizeObserver) resizeObserver.disconnect();
    let lastIsMobile = window.innerWidth <= 699;

    resizeObserver = new ResizeObserver(() => {
      const currentIsMobile = window.innerWidth <= 699;

      if (currentIsMobile !== lastIsMobile) {
        lastIsMobile = currentIsMobile;

        if (statueModal) {
          statueModal.classList.add('is-open');
        }

        renderHotspots(currentIsMobile, false);
      } else if (currentIsMobile) {
        // ⚡ SI SEGUIMOS EN MOBILE PERO CAMBIA EL ANCHO DE PANTALLA: Reevaluamos el desborde
        if (typeof updateSliderControlsGlobal === 'function') {
          updateSliderControlsGlobal();
        }
      }
    });

    resizeObserver.observe(document.body);
  }

  // ==========================================
  // 🎢 MONTAJE DEL SLIDER AUTOMÁTICO
  // ==========================================
  function setupMobileSlider() {
    if (!hotspotsContainer) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'sf-slider-wrapper';

    hotspotsContainer.parentNode.insertBefore(wrapper, hotspotsContainer);
    wrapper.appendChild(hotspotsContainer);
    
    const svgArrowIcon = `<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><path d="M4.2905 6.0005L0.21725 1.9275C0.0789167 1.789 0.00808339 1.61492 0.00475006 1.40525C0.00158339 1.19575 0.0724167 1.0185 0.21725 0.8735C0.36225 0.728667 0.537916 0.65625 0.74425 0.65625C0.950583 0.65625 1.12625 0.728667 1.27125 0.8735L5.7655 5.36775C5.859 5.46142 5.925 5.56017 5.9635 5.664C6.002 5.76783 6.02125 5.88 6.02125 6.0005C6.02125 6.121 6.002 6.23317 5.9635 6.337C5.925 6.44083 5.859 6.53958 5.7655 6.63325L1.27125 11.1275C1.13275 11.2658 0.958666 11.3367 0.749 11.34C0.5395 11.3432 0.36225 11.2723 0.21725 11.1275C0.0724167 10.9825 0 10.8068 0 10.6005C0 10.3942 0.0724167 10.2185 0.21725 10.0735L4.2905 6.0005Z"></path></svg>`;

    const arrowLeft = document.createElement('button');
    arrowLeft.type = 'button';
    arrowLeft.className = 'sf-slider-arrow sf-slider-arrow--left';
    arrowLeft.style.display = 'none';
    arrowLeft.setAttribute('aria-label', 'Anterior');
    arrowLeft.innerHTML = svgArrowIcon;

    const arrowRight = document.createElement('button');
    arrowRight.type = 'button';
    arrowRight.className = 'sf-slider-arrow sf-slider-arrow--right';
    arrowRight.setAttribute('aria-label', 'Siguiente');
    arrowRight.innerHTML = svgArrowIcon;

    const shadowLeft = document.createElement('div');
    shadowLeft.className = 'sf-slider-shadow sf-slider-shadow--left';
    shadowLeft.style.opacity = '0';

    const shadowRight = document.createElement('div');
    shadowRight.className = 'sf-slider-shadow sf-slider-shadow--right';

    wrapper.appendChild(arrowLeft);
    wrapper.appendChild(arrowRight);
    wrapper.appendChild(shadowLeft);
    wrapper.appendChild(shadowRight);

    // 🧠 FUNCIÓN DE CONTROL DINÁMICO E INTELIGENTE
    const updateSliderControls = () => {
      const clientWidth = hotspotsContainer.clientWidth;
      const scrollWidth = hotspotsContainer.scrollWidth;
      const scrollLeft = hotspotsContainer.scrollLeft;
      const maxScroll = scrollWidth - clientWidth;

      if (scrollWidth <= clientWidth || maxScroll <= 0) {
        wrapper.classList.remove('is-scrollable');
        arrowLeft.style.display = 'none';
        shadowLeft.style.opacity = '0';
        arrowRight.style.display = 'none';
        shadowRight.style.opacity = '0';
        return;
      }

      wrapper.classList.add('is-scrollable');

      arrowLeft.style.display = scrollLeft <= 5 ? 'none' : 'flex';
      shadowLeft.style.opacity = scrollLeft <= 5 ? '0' : '1';

      arrowRight.style.display = scrollLeft >= maxScroll - 5 ? 'none' : 'flex';
      shadowRight.style.opacity = scrollLeft >= maxScroll - 5 ? '0' : '1';
    };

    updateSliderControlsGlobal = updateSliderControls;
    hotspotsContainer.addEventListener('scroll', updateSliderControls);

    // 🎯 NUEVA LÓGICA: Navegar secuencialmente por los elementos activos y centrarlos
    const navigateSlider = (direction) => {
      const items = Array.from(hotspotsContainer.querySelectorAll('.sf-statue-item'));
      if (items.length === 0) return;

      const activeIndex = items.findIndex(item => item.classList.contains('is-active'));
      let targetIndex = activeIndex;

      if (direction === 'next') {
        targetIndex = activeIndex + 1 < items.length ? activeIndex + 1 : activeIndex;
      } else if (direction === 'prev') {
        targetIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : activeIndex;
      }

      if (targetIndex !== activeIndex) {
        const targetItem = items[targetIndex];
        const targetBtn = targetItem.querySelector('.sf-btn');
        
        if (targetBtn) {
          targetBtn.click(); // Actualiza textos e imágenes

          // 📐 Cálculo matemático para centrar perfectamente el elemento:
          // (Posición izquierda del elemento con respecto al padre + la mitad de su propio ancho) 
          // menos la mitad del ancho del contenedor visible.
          const containerWidth = hotspotsContainer.clientWidth;
          const itemLeft = targetItem.offsetLeft;
          const itemWidth = targetItem.clientWidth;

          const targetScrollLeft = itemLeft + (itemWidth / 2) - (containerWidth / 2);

          // Hacemos el scroll controlado únicamente dentro de su caja contenedora
          hotspotsContainer.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
          });
        }
      }
    };

    // Reemplazamos los antiguos scrollBy manuales por la navegación inteligente
    arrowLeft.addEventListener('click', () => navigateSlider('prev'));
    arrowRight.addEventListener('click', () => navigateSlider('next'));

    setTimeout(updateSliderControls, 50);
  }

  function destroyMobileSlider() {
    if (!hotspotsContainer) return;
    const wrapper = hotspotsContainer.closest('.sf-slider-wrapper');
    if (wrapper) {
      wrapper.parentNode.insertBefore(hotspotsContainer, wrapper);
      wrapper.remove();
    }
    updateSliderControlsGlobal = null; // Limpieza de la referencia
  }

  // =========================================================================
  // 🕵️‍♂️ OBSERVADORES REACTIVOS DE CIERRE
  // =========================================================================
  const handleModalCloseMutation = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.attributeName === 'class') {
        const target = mutation.target;
        if (!target.classList.contains('is-open')) {
          clearLocatorAndActiveStates();
        }
      }
    }
  };

  const modalObserver = new MutationObserver(handleModalCloseMutation);

  if (muralModal) modalObserver.observe(muralModal, { attributes: true });
  if (statueModal) modalObserver.observe(statueModal, { attributes: true });
}