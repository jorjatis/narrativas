export default function modal() {
  const openModalButtons = document.querySelectorAll('[data-modal-target]');
  const closeModalElements = document.querySelectorAll('[data-close-modal]');

  if (openModalButtons.length === 0 && closeModalElements.length === 0) return;

  const handleOverlay = (modal, action) => {
    const modalType = modal.getAttribute('data-modal-type') || 'modal';
    if (modalType !== 'modal') return;

    if (action === 'create') {
      const overlay = document.createElement('div');
      overlay.classList.add('v-n-modal__overlay');
      overlay.setAttribute('data-close-modal', '');
      
      overlay.addEventListener('click', () => closeModal(modal));
      modal.insertBefore(overlay, modal.firstChild);
    } 
    else if (action === 'remove') {
      const overlay = modal.querySelector('.v-n-modal__overlay');
      if (overlay) {
        setTimeout(() => overlay.remove(), 300);
      }
    }
  };

  const openModal = (modal) => {
    if (!modal) return;
    
    handleOverlay(modal, 'create');
    modal.classList.add('is-open');
    
    const modalType = modal.getAttribute('data-modal-type') || 'modal';
    if (modalType === 'modal') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = (modal) => {
    if (!modal) return;
    
    modal.classList.remove('is-open');
    handleOverlay(modal, 'remove');
    document.body.style.overflow = '';
  };

  openModalButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const modalId = button.getAttribute('data-modal-target');
      const modal = document.getElementById(modalId);
      openModal(modal);

      const positionSetting = button.getAttribute('data-modal-position');
      if (positionSetting === 'center') {
        button.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    });
  });

  closeModalElements.forEach(element => {
    element.addEventListener('click', () => {
      const modal = element.closest('.v-n-modal');
      closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.v-n-modal.is-open');
      if (activeModal) closeModal(activeModal);
    }
  });
}