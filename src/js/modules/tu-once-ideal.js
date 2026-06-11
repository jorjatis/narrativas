import data from './tu-once-ideal-data.json' assert { type: 'json' };

const GENERAL_PLAYER_POSITIONS = {
  'portero': 'portero',
  'lateral-derecho': 'interior',
  'central-derecho': 'interior',
  'central-izquierdo': 'interior',
  'lateral-izquierdo': 'interior',
  'interior-derecho': 'centro',
  'pivote': 'centro',
  'interior-izquierdo': 'centro',
  'centro-derecho': 'centro',
  'centro-izquierdo': 'centro',
  'mediapunta': 'centro',
  'extremo-derecho': 'centro',
  'delantero-centro': 'delantero',
  'extremo-izquierdo': 'centro',
  'delantero-derecho': 'delantero',
  'delantero-izquierdo': 'delantero'
};

export default function initTuOnceIdeal() {
  const selectorItems = document.querySelectorAll('.v-n-toi-selector__item');
  const selectedBlock = document.querySelector('.v-n-toi-selected');
  const systemLabel = document.querySelector('[data-system-label]');
  const systemDescription = document.querySelector('[data-system-description]');
  const systemContainer = document.querySelector('.v-n-toi-system');
  const systemBgImg = document.querySelector('.v-n-toi-system__bg img');
  const playersContainer = document.querySelector('.v-n-toi-system__players');
  
  const popup = document.querySelector('.v-n-toi-popup');
  const popupPlayerType = popup?.querySelector('[data-player-type]');
  const popupPlayersList = popup?.querySelector('.v-n-toi-popup__players-list');
  const popupCloseBtn = popup?.querySelector('.v-n-toi-popup__close');

  const downloadBlock = document.querySelector('.v-n-toi-download');
  const downloadBtn = downloadBlock?.querySelector('.v-n-toi-download-btn');
  const resetBtn = downloadBlock?.querySelector('.v-n-toi-reset-btn');
  
  const nextStepBlock = document.querySelector('.v-n-toi-next-step');

  let activePlayerButton = null;
  let checkScrollSpeed = null;

  if (!selectorItems.length || !selectedBlock || !popup) return;

  // ==========================================
  // BOTÓN FLOANTE PARA PRUEBAS (AUTO-RELLENAR)
  // ==========================================
  const testBtn = document.createElement('button');
  testBtn.type = 'button';
  testBtn.innerText = '⚡ Auto-llenar 11';
  testBtn.style.position = 'fixed';
  testBtn.style.bottom = '20px';
  testBtn.style.left = '20px';
  testBtn.style.zIndex = '99999';
  testBtn.style.padding = '10px 14px';
  testBtn.style.background = '#ff0055';
  testBtn.style.color = '#fff';
  testBtn.style.border = 'none';
  testBtn.style.borderRadius = '4px';
  testBtn.style.cursor = 'pointer';
  testBtn.style.fontWeight = 'bold';
  testBtn.style.fontFamily = 'sans-serif';
  testBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  document.body.appendChild(testBtn);

  testBtn.addEventListener('click', () => {
    const currentSystem = document.querySelector('.v-n-toi-selector__item.is-active')?.getAttribute('data-system');
    if (!currentSystem) {
      alert('Primero selecciona un sistema táctico (4/3/3, etc.) arriba.');
      return;
    }

    const playersButtons = document.querySelectorAll('.v-n-toi-player');
    if (!playersButtons.length) return;

    playersButtons.forEach((btn) => {
      const positionKey = btn.getAttribute('data-player-position');
      const playersIds = data.formations[currentSystem]?.positions[positionKey] || [];
      const mockPlayerId = playersIds[0]; // Cogemos el primer jugador disponible para esa posición

      if (mockPlayerId && data.players[mockPlayerId]) {
        const playerData = data.players[mockPlayerId];
        const playerImgElement = btn.querySelector('.v-n-toi-player__img');
        if (playerImgElement) {
          playerImgElement.src = playerData.image;
          playerImgElement.alt = `Foto de ${playerData.name}`;
        }
        btn.setAttribute('data-selected-player-id', mockPlayerId);
      }
    });
    
    closePopup();
    console.log('⚡ Los 11 jugadores han sido rellenados con éxito.');
  });
  // ==========================================

  selectorItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectorItems.forEach(i => i.classList.remove('is-active'));
      btn.classList.add('is-active');

      const system = btn.getAttribute('data-system');
      const systemData = data.formations[system];

      if (!systemData) return;

      const systemClassForCss = system.replace(/\//g, '-');

      systemLabel.textContent = system;
      systemDescription.textContent = systemData.description;
      systemBgImg.setAttribute('alt', `system táctico ${system}`);
      systemContainer.className = 'v-n-toi-system'; 
      systemContainer.classList.add(`v-n-toi-system--${systemClassForCss}`);

      closePopup();
      generatePlayers(systemData.positions, playersContainer, system);

      if (nextStepBlock) {
        nextStepBlock.classList.add('is-hidden');
      }

      selectedBlock.classList.remove('is-visible');
      selectedBlock.classList.add('is-active');

      if (downloadBlock) {
        downloadBlock.classList.add('is-active');
      }

      setTimeout(() => { 
        selectedBlock.classList.add('is-visible'); 
        
        const selectedBlockTop = selectedBlock.getBoundingClientRect().top + window.scrollY;
        
        window.scrollTo({
          top: selectedBlockTop,
          behavior: 'smooth'
        });
      }, 50);
    });
  });

  playersContainer.addEventListener('click', (e) => {
    const playerBtn = e.target.closest('.v-n-toi-player');
    if (!playerBtn) return;

    e.stopPropagation();

    clearInterval(checkScrollSpeed);

    const isAnotherPopupOpen = popup.classList.contains('is-active') && activePlayerButton !== playerBtn;

    document.querySelectorAll('.v-n-toi-player').forEach(p => {
      p.classList.remove('is-active');
      p.setAttribute('aria-expanded', 'false');
    });

    playerBtn.classList.add('is-active');
    playerBtn.setAttribute('aria-expanded', 'true');
    activePlayerButton = playerBtn;

    const positionKey = playerBtn.getAttribute('data-player-position');
    const currentSystem = document.querySelector('.v-n-toi-selector__item.is-active')?.getAttribute('data-system');
    
    if (!positionKey || !currentSystem) return;

    const playersIds = data.formations[currentSystem]?.positions[positionKey] || [];
    
    openPopup(positionKey, playersIds);

    if (systemContainer) {
      const headerElement = document.querySelector('.v-h--t3');
      const headerHeight = headerElement ? headerElement.offsetHeight : 0;

      const systemTop = systemContainer.getBoundingClientRect().top + window.scrollY;
      const systemHeight = systemContainer.offsetHeight;
      const windowHeight = window.innerHeight;

      const targetScrollY = systemTop - (windowHeight / 2) + (systemHeight / 2) - (headerHeight / 2);

      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });
    }

    requestAnimationFrame(() => {
      placePopup(playerBtn);
      popup.classList.add('is-visible');
    });

    if (!isAnotherPopupOpen) {
      checkScrollSpeed = setInterval(() => {
        placePopup(playerBtn);
      }, 16);

      setTimeout(() => {
        clearInterval(checkScrollSpeed);
        placePopup(playerBtn);
      }, 350);
    }
  });

  popupCloseBtn.addEventListener('click', closePopup);

  document.addEventListener('click', (e) => {
    if (!popup.classList.contains('is-active')) return;
    if (!popup.contains(e.target) && !e.target.closest('.v-n-toi-player')) {
      closePopup();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('is-active')) {
      closePopup();
    }
  });

  window.addEventListener('resize', () => {
    if (popup.classList.contains('is-active') && activePlayerButton) {
      placePopup(activePlayerButton);
    }
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', async (e) => {
      const totalPlayersSelected = document.querySelectorAll('.v-n-toi-player').length;
      const playersCompleted = document.querySelectorAll('.v-n-toi-player[data-selected-player-id]').length;
      const leftPlayersToSelect = totalPlayersSelected - playersCompleted;

      if (leftPlayersToSelect > 0) {
        e.preventDefault();
        
        if (leftPlayersToSelect === 1) {
          showErrorMessage('Te falta 1 jugador para descargar tu once ideal');
        } else {
          showErrorMessage(`Te faltan ${leftPlayersToSelect} jugadores para descargar tu once ideal`);
        }
        
      } else {
        if (!systemContainer) return;

        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span>Generando imagen...</span>';
        downloadBtn.style.pointerEvents = 'none';

        // Salvaguarda los estilos en vivo antes de la foto para evitar cambiar tu archivo .css
        const originalOverflow = systemContainer.style.overflow;
        const originalBgImgFit = systemBgImg ? systemBgImg.style.objectFit : '';

        try {
          if (!window.html2canvas) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
              script.async = true;
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          const canvas = await window.html2canvas(systemContainer, {
            useCORS: true,
            allowTaint: false,
            scale: 2,
            backgroundColor: null
          });

          const imageURL = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = imageURL;
          downloadLink.download = 'mi-once-ideal.png';
          
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

        } catch (error) {
          console.error('Error al generar o cargar html2canvas:', error);
        } finally {
          downloadBtn.innerHTML = originalText;
          downloadBtn.style.pointerEvents = '';
        }
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      closePopup();
      
      const players = document.querySelectorAll('.v-n-toi-player');
      players.forEach(player => {
        player.removeAttribute('data-selected-player-id');
        const img = player.querySelector('.v-n-toi-player__img');
        const type = player.getAttribute('data-player-type') || 'centro';
        if (img) {
          img.src = `assets/images/toi-icon-${type}.webp`;
          img.alt = '';
        }
      });

      selectorItems.forEach(i => i.classList.remove('is-active'));

      if (nextStepBlock) {
        nextStepBlock.classList.remove('is-hidden');
      }

      selectedBlock.classList.remove('is-active', 'is-visible');
      if (downloadBlock) {
        downloadBlock.classList.remove('is-active');
      }

      const firstSelector = selectorItems[0];
      if (firstSelector) {
        firstSelector.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  }

  function openPopup(positionKey, playersIds) {
    popupPlayerType.textContent = positionKey.replace(/-/g, ' ');
    popupPlayersList.innerHTML = '';

    playersIds.forEach((id) => {
      const playerData = data.players[id];
      if (!playerData) return;

      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'v-n-toi-popup__player';
      button.setAttribute('data-player-img-url', playerData.image);

      if (activePlayerButton?.getAttribute('data-selected-player-id') === id) {
        button.classList.add('is-active');
      }

      button.innerHTML = `
        <div class="v-n-toi-popup__player-img-c">
          <img src="${playerData.image}" alt="${playerData.name}" class="v-n-toi-popup__player-img">
        </div>
        <div class="v-n-toi-popup__player-info">
          <span class="v-n-toi-popup__player-name">${playerData.name}</span>
          <span class="v-n-toi-popup__player-team">${playerData.team}</span>
          <span class="v-n-toi-popup__player-age">${playerData.age}</span>
          <span class="v-n-toi-popup__player-inter">${playerData.caps}</span>
        </div>
      `;

      const img = button.querySelector('.v-n-toi-popup__player-img');
      if (img) {
        if (img.complete) {
          img.classList.add('is-loaded');
        } else {
          img.addEventListener('load', () => {
            img.classList.add('is-loaded');
          });
        }
      }

      button.addEventListener('click', () => {
        selectPlayerForButton(id, playerData.image, playerData.name);
      });

      li.appendChild(button);
      popupPlayersList.appendChild(li);
    });

    popup.classList.add('is-active');

    const firstInteractive = popupPlayersList.querySelector('.v-n-toi-popup__player') || popupCloseBtn;
    if (firstInteractive) firstInteractive.focus({ preventScroll: true }); 
  }

  function placePopup(targetBtn) {
    if (window.innerWidth < 699) {
      popup.style.position = '';
      popup.style.top = '';
      popup.style.left = '';
      return;
    }

    popup.style.position = 'absolute';
    
    const gap = 10;
    const targetRect = targetBtn.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const containerRect = systemContainer.getBoundingClientRect();

    let topOffset = (targetRect.top - containerRect.top) + (targetRect.height / 2) - (popupRect.height / 2);
    let leftOffset = (targetRect.left - containerRect.left) + targetRect.width + gap;

    if ((targetRect.left + targetRect.width + gap + popupRect.width) > window.innerWidth) {
      leftOffset = (targetRect.left - containerRect.left) - popupRect.width - gap;
    }

    if (leftOffset < 0) {
      leftOffset = gap;
    }

    const absoluteTopInWindow = containerRect.top + topOffset;
    if (absoluteTopInWindow + popupRect.height > window.innerHeight) {
      topOffset = (targetRect.bottom - containerRect.top) - popupRect.height;
    }
    if (containerRect.top + topOffset < 0) {
      topOffset = (targetRect.top - containerRect.top);
    }

    popup.style.top = `${topOffset}px`;
    popup.style.left = `${leftOffset}px`;
  }

  function closePopup() {
    if (!popup.classList.contains('is-active')) return;
    
    clearInterval(checkScrollSpeed);
    popup.classList.remove('is-visible');
    setTimeout(() => {
      popup.classList.remove('is-active');
      popup.style.left = '';
      popup.style.top = '';
    }, 250);

    if (activePlayerButton) {
      activePlayerButton.classList.remove('is-active');
      activePlayerButton.setAttribute('aria-expanded', 'false');
      activePlayerButton.focus({ preventScroll: true });
      activePlayerButton = null;
    }
  }

  function selectPlayerForButton(id, imageUrl, name) {
    if (!activePlayerButton) return;

    const playerImgElement = activePlayerButton.querySelector('.v-n-toi-player__img');
    if (playerImgElement) {
      playerImgElement.src = imageUrl;
      playerImgElement.alt = `Foto de ${name}`;
    }

    activePlayerButton.setAttribute('data-selected-player-id', id);
    closePopup();
  }

  function showErrorMessage(texto) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'v-n-toi-alert-toast';
    alertContainer.textContent = texto;
    document.body.appendChild(alertContainer);

    requestAnimationFrame(() => {
      alertContainer.classList.add('is-visible');
    });

    setTimeout(() => {
      alertContainer.classList.remove('is-visible');

      alertContainer.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
          alertContainer.removeEventListener('transitionend', handler);
          alertContainer.remove();
        }
      });
    }, 3000);
  }
}

function generatePlayers(positions, container, currentSystem) {
  container.innerHTML = '';

  let playerIndex = 1;

  for (const positionKey in positions) {
    if (Object.prototype.hasOwnProperty.call(positions, positionKey)) {
      
      let positionGeneral = GENERAL_PLAYER_POSITIONS[positionKey] || 'centro';
      
      if (currentSystem === '4/3/3' && (positionKey === 'extremo-derecho' || positionKey === 'extremo-izquierdo')) {
        positionGeneral = 'delantero';
      }

      const classIndex = String(playerIndex).padStart(2, '0');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `v-n-toi-player v-n-toi-player--${classIndex}`;
      button.setAttribute('data-player-type', positionGeneral);
      button.setAttribute('data-player-position', positionKey);
      button.setAttribute('aria-label', `Seleccionar ${positionKey}`);
      button.setAttribute('aria-expanded', 'false');

      const img = document.createElement('img');
      img.src = `assets/images/toi-icon-${positionGeneral}.webp`;
      img.className = 'v-n-toi-player__img';
      img.alt = '';

      button.appendChild(img);
      container.appendChild(button);

      playerIndex++;
    }
  }
}