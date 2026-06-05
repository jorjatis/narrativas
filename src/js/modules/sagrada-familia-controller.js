export default function initSagradaFamilia(jsonData) {
  const muralModal = document.getElementById('modal-sf-mural');
  const muralImg = document.getElementById('sf-statues-scene-bg');
  const hotspotsContainer = document.getElementById('sf-statues-scene-hotspots');
  
  const statueModal = document.getElementById('modal-sf-info-statue');
  const statueTitle = document.getElementById('pop-statue-title');
  const statueDesc = document.getElementById('pop-statue-desc');
  const statueImg = document.querySelector('#pop-statue-img img');

  const sceneButtons = document.querySelectorAll('[data-open-dynamic-scene]');
  
  // Guardamos la escena actual para poder recalcular en el resize
  let currentSceneData = null;
  let resizeObserver = null;

  sceneButtons.forEach(button => {
    button.addEventListener('click', () => {
      const sceneId = button.getAttribute('data-open-dynamic-scene');
      currentSceneData = jsonData[sceneId];

      if (!currentSceneData) return;

      const isMobile = window.innerWidth <= 699;

      // Gestión de visibilidad inicial del popup interior
      if (statueModal) {
        if (isMobile) {
          statueModal.classList.add('is-open');
        } else {
          statueModal.classList.remove('is-open');
        }
      }

      if (muralModal) {
        const classesToRemove = Array.from(muralModal.classList).filter(c => c.startsWith('v-n-modal--mural-'));
        classesToRemove.forEach(c => muralModal.classList.remove(c));
        muralModal.classList.add(`v-n-modal--${sceneId}`);
      }

      if (muralImg) {
        muralImg.src = currentSceneData.backgroundImage;
        muralImg.alt = currentSceneData.altText || "Detalle del mural";
      }

      // Renderizamos los elementos base por primera vez
      renderHotspots(isMobile);

      // 🔄 Iniciamos la escucha reactiva del tamaño de la pantalla
      setupResizeTracking();
    });
  });

  // Función interna para pintar los hotspots/estatuas
  function renderHotspots(isMobile) {
    if (!hotspotsContainer || !currentSceneData) return;

    // Deshacemos cualquier envoltura previa para empezar de cero limpio
    destroyMobileSlider();
    hotspotsContainer.innerHTML = '';

    currentSceneData.hotspots.forEach((hotspot, index) => {
      const itemContainer = document.createElement('div');
      itemContainer.className = `sf-statue-item ${hotspot.className || ''}`;

      if (hotspot.statueImg) {
        const imgStatue = document.createElement('img');
        imgStatue.src = hotspot.statueImg;
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

        if (statueTitle) statueTitle.textContent = hotspot.title;
        if (statueDesc) statueDesc.textContent = hotspot.description;
        
        if (statueImg) {
          if (hotspot.image) {
            statueImg.src = hotspot.image;
            statueImg.alt = `Fotografía en detalle de ${hotspot.title}`;
            statueImg.parentElement.style.display = ''; 
          } else {
            statueImg.parentElement.style.display = 'none'; 
          }
        }
      };

      btn.addEventListener('click', selectStatue);
      itemContainer.appendChild(btn);
      hotspotsContainer.appendChild(itemContainer);

      // Auto-activación del primer ítem en móvil
      if (isMobile && index === 0) {
        selectStatue();
      }
    });

    // Si tras pintar estamos en móvil, activamos el slider dinámico
    if (isMobile) {
      setupMobileSlider();
    }
  }

  // 🎯 DETECTOR REACTIVO DE RESIZE (699px)
  function setupResizeTracking() {
    if (resizeObserver) resizeObserver.disconnect();

    let lastIsMobile = window.innerWidth <= 699;

    // Escuchamos los cambios del body para reaccionar al viewport de forma eficiente
    resizeObserver = new ResizeObserver(() => {
      const currentIsMobile = window.innerWidth <= 699;

      // Solo recalculamos el DOM si cruzamos la frontera de los 699px en cualquier dirección
      if (currentIsMobile !== lastIsMobile) {
        lastIsMobile = currentIsMobile;

        // Cambiar el estado del popup de información según corresponda
        if (statueModal) {
          if (currentIsMobile) {
            statueModal.classList.add('is-open');
          } else {
            statueModal.classList.remove('is-open');
          }
        }

        // Volvemos a renderizar la estructura adaptada al nuevo tamaño
        renderHotspots(currentIsMobile);
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

    // Evaluamos si el contenido desborda el espacio disponible en mobile
    const hasOverflow = hotspotsContainer.scrollWidth > hotspotsContainer.clientWidth;
    if (!hasOverflow) return;
    
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

    const updateSliderControls = () => {
      const scrollLeft = hotspotsContainer.scrollLeft;
      const maxScroll = hotspotsContainer.scrollWidth - hotspotsContainer.clientWidth;

      arrowLeft.style.display = scrollLeft <= 5 ? 'none' : 'flex';
      shadowLeft.style.opacity = scrollLeft <= 5 ? '0' : '1';

      arrowRight.style.display = scrollLeft >= maxScroll - 5 ? 'none' : 'flex';
      shadowRight.style.opacity = scrollLeft >= maxScroll - 5 ? '0' : '1';
    };

    hotspotsContainer.addEventListener('scroll', updateSliderControls);

    arrowLeft.addEventListener('click', () => {
      hotspotsContainer.scrollBy({ left: -150, behavior: 'smooth' });
    });

    arrowRight.addEventListener('click', () => {
      hotspotsContainer.scrollBy({ left: 150, behavior: 'smooth' });
    });

    setTimeout(updateSliderControls, 50);
  }

  function destroyMobileSlider() {
    if (!hotspotsContainer) return;
    const wrapper = hotspotsContainer.closest('.sf-slider-wrapper');
    if (wrapper) {
      wrapper.parentNode.insertBefore(hotspotsContainer, wrapper);
      wrapper.remove();
    }
  }

  // Limpieza global si se cierra el popup de la estatua
  if (statueModal) {
    const closeStatueBtn = statueModal.querySelector('[data-close-modal]');
    if (closeStatueBtn) {
      closeStatueBtn.addEventListener('click', () => {
        if (hotspotsContainer) {
          hotspotsContainer.querySelectorAll('.sf-statue-item').forEach(item => item.classList.remove('is-active'));
          hotspotsContainer.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('is-active'));
        }
      });
    }
  }
}