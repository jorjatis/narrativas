export default function modal() {
  
  // Función auxiliar para limpiar los estados activos de la escena de las estatuas
  const clearActiveStatues = () => {
    const hotspotsContainer = document.getElementById('sf-statues-scene-hotspots');
    if (hotspotsContainer) {
      hotspotsContainer.querySelectorAll('.sf-statue-item').forEach(item => item.classList.remove('is-active'));
      hotspotsContainer.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('is-active'));
    }
  };

  // 1. ESCUCHA GLOBAL DE CLICKS
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-modal-target]');
    const closeBtn = e.target.closest('[data-close-modal]');

    // --- FLUJO A: APERTURA DE MODAL ---
    if (openBtn) {
      e.preventDefault();

      const targetModalId = openBtn.getAttribute('data-modal-target');
      const targetModal = document.getElementById(targetModalId);

      if (!targetModal) return;

      const groupContainer = openBtn.closest('[data-modal-group="true"]');
      if (groupContainer) {
        groupContainer.querySelectorAll('[data-modal-target]').forEach(btn => {
          if (btn !== openBtn) btn.classList.remove('is-active');
        });
      }

      openBtn.classList.add('is-active');
      targetModal.classList.add('is-open');
      document.body.classList.add('modal-open');

      const position = openBtn.getAttribute('data-modal-position');
      if (position === 'center') {
        setTimeout(() => {
          const isMobile = window.innerWidth <= 699;
          const headerOffset = isMobile ? 52 : 60; 
          
          const viewportHeight = window.innerHeight;
          const elementHeight = targetModal.offsetHeight;
          const availableHeight = viewportHeight - headerOffset;
          const elementTopInPage = targetModal.getBoundingClientRect().top + window.scrollY;

          let offsetPosition;

          if (elementHeight <= availableHeight) {
            offsetPosition = elementTopInPage - headerOffset - ((availableHeight - elementHeight) / 2);
          } else {
            offsetPosition = elementTopInPage - headerOffset;
          }

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 50);
      }
    }

    // --- FLUJO B: CIERRE DE MODAL ---
    if (closeBtn) {
      e.preventDefault();
      const activeModal = closeBtn.closest('.v-n-modal.is-open');
      
      if (activeModal) {
        // Si cerramos el mural general o el popup de la estatua directamente...
        if (activeModal.id === 'modal-sf-mural') {
          const innerStatueModal = activeModal.querySelector('#modal-sf-info-statue');
          if (innerStatueModal) {
            innerStatueModal.classList.remove('is-open'); 
          }
          clearActiveStatues();
        }

        // 🔄 NUEVO: Si cerramos explícitamente el de la estatua
        if (activeModal.id === 'modal-sf-info-statue') {
          clearActiveStatues();
        }

        activeModal.classList.remove('is-open');

        const modalId = activeModal.getAttribute('id');
        const triggerBtn = document.querySelector(`[data-modal-target="${modalId}"].is-active`);
        if (triggerBtn) {
          triggerBtn.classList.remove('is-active');
        }
      }

      const remainingOpenModals = document.querySelectorAll('.v-n-modal.is-open');
      if (remainingOpenModals.length === 0) {
        document.body.classList.remove('modal-open');
      }
    }
  });

  // 2. ESCUCHA DE LA TECLA ESCAPE
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.v-n-modal.is-open');
      if (activeModals.length === 0) return;

      const topModal = activeModals[activeModals.length - 1];
      
      if (topModal.id === 'modal-sf-mural') {
        const innerStatueModal = topModal.querySelector('#modal-sf-info-statue');
        if (innerStatueModal) innerStatueModal.classList.remove('is-open');
        clearActiveStatues();
      }

      // 🔄 NUEVO: Si se sale con ESC estando el popup de la estatua al frente
      if (topModal.id === 'modal-sf-info-statue') {
        clearActiveStatues();
      }

      topModal.classList.remove('is-open');

      const modalId = topModal.getAttribute('id');
      const triggerBtn = document.querySelector(`[data-modal-target="${modalId}"].is-active`);
      if (triggerBtn) {
        triggerBtn.classList.remove('is-active');
      }

      if (activeModals.length === 1) {
        document.body.classList.remove('modal-open');
      }
    }
  });
}