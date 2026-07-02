import html2canvas from 'html2canvas';

let data = {
  formations: {},
  players: {}
};

const SHEETS = {
  players: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZ2C1mwWMk3JLl_oQX7NBxioG5qQ5FDfhRJxhKPnpZQ4BGrH2xj_KMMPpysVtj0L1go4UjhMbCgpTD/pub?gid=0&single=true&output=csv',
  formations: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZ2C1mwWMk3JLl_oQX7NBxioG5qQ5FDfhRJxhKPnpZQ4BGrH2xj_KMMPpysVtj0L1go4UjhMbCgpTD/pub?gid=936098290&single=true&output=csv',
  descriptions: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZ2C1mwWMk3JLl_oQX7NBxioG5qQ5FDfhRJxhKPnpZQ4BGrH2xj_KMMPpysVtj0L1go4UjhMbCgpTD/pub?gid=357572194&single=true&output=csv'
};

async function getCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.split(/\r?\n/);

  const headers = rows[0]
    .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
    .map(h => h.replace(/^"|"$/g, ''));

  return rows.slice(1).filter(Boolean).map(row => {

    const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];

    return headers.reduce((obj, key, i) => {
      obj[key] = (values[i] || '')
        .replace(/^"|"$/g, '');
      return obj;
    }, {});
  });
}

async function loadData() {
  const [
    playersRows,
    formationsRows,
    descriptionsRows
  ] = await Promise.all([
    getCSV(SHEETS.players),
    getCSV(SHEETS.formations),
    getCSV(SHEETS.descriptions)
  ]);

  data = {
    players: {},
    formations: {}
  };

  playersRows.forEach(row => {
    data.players[row.id] = {
      name: row.name,
      team: row.team,
      age: row.age,
      caps: row.caps,
      image: row.image,
      injured: String(row.injured).toLowerCase() === 'true',
      timePlayed: parseFloat(String(row.timePlayed).replace(',', '.')) || 0
    };

  });

  descriptionsRows.forEach(row => {
    data.formations[row.formation] = {
      description: row.description,
      positions: {}
    };
  });

  formationsRows.forEach(row => {
    if (
      !data.formations[row.formation]
    ) {
      data.formations[row.formation] = {
        description: '',
        positions: {}
      };
    }

    if (
      !data.formations[row.formation]
        .positions[row.position]
    ) {
      data.formations[row.formation]
        .positions[row.position] = [];
    }

    data.formations[row.formation]
      .positions[row.position]
      .push(row.player_id);
  });

  console.log('DATA CARGADA', data);
}

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

export default async function initTuOnceIdeal() {
  await loadData();

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

  function initFooterSiteName() {
    const domainSpan = document.querySelector(
      '.v-n-toi-system-footer__domain'
    );

    if (!domainSpan) return;

    domainSpan.textContent = window.location.hostname
      .replace(/^www\./, '')
      .toLowerCase();
  }

  initFooterSiteName();

  let activePlayerButton = null;
  let checkScrollSpeed = null;

  if (!selectorItems.length || !selectedBlock || !popup) return;

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
      if (systemBgImg) systemBgImg.setAttribute('alt', `Esquema táctico ${system}`);
      
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

  if (popupCloseBtn) popupCloseBtn.addEventListener('click', closePopup);

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
    downloadBtn.addEventListener('click', handleDownload);
  }

  async function handleDownload(e) {
    const leftPlayersToSelect = getMissingPlayers();

    if (leftPlayersToSelect > 0) {
      e.preventDefault();
      showErrorMessage(`Te faltan ${leftPlayersToSelect} ${leftPlayersToSelect === 1 ? 'jugador' : 'jugadores'} para descargar tu once ideal`);
      return;
    }

    setDownloadLoading(true);

    try {
      const canvas = await generateLineupCanvas();
      downloadCanvas(canvas);
    } catch (error) {
      console.error('Error al generar la imagen:', error);
    } finally {
      setDownloadLoading(false);
    }
  }

  function getMissingPlayers() {
    const totalPlayers = document.querySelectorAll('.v-n-toi-player').length;
    const selectedPlayers = document.querySelectorAll('.v-n-toi-player[data-selected-player-id]').length;
    return totalPlayers - selectedPlayers;
  }

  let originalDownloadText = '';
  function setDownloadLoading(isLoading) {
    if (!downloadBtn) return;

    if (isLoading) {
      originalDownloadText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '<span>Generando imagen...</span>';
      downloadBtn.style.pointerEvents = 'none';
    } else {
      downloadBtn.innerHTML = originalDownloadText;
      downloadBtn.style.pointerEvents = '';
    }
  }

  async function generateLineupCanvas() {
    await document.fonts.ready;

    return html2canvas(systemContainer, {
      useCORS: true,
      allowTaint: false,
      scale: 1,
      backgroundColor: '#ffffff',
      onclone: customizeClonedDocument
    });
  }

  function customizeClonedDocument(clonedDocument) {
    const clonedContainer = clonedDocument.querySelector('.v-n-toi-system');
    
    if (clonedContainer) {
      Object.assign(clonedContainer.style, {
        width: '600px',
        height: '900px',
        containerType: 'unset',
        aspectRatio: 'unset',
        maxWidth: 'unset',
        maxHeight: 'unset',
        padding: '20px 0 120px',
        backgroundColor: '#ffffff'
      });
    }

    const clonedBg = clonedDocument.querySelector('.v-n-toi-system__bg');
    if (clonedBg) {
      clonedBg.style.width = '600px';
      clonedBg.style.height = '790px';
    }

    const clonedBgImg = clonedDocument.querySelector('.v-n-toi-system__bg img');
    if (clonedBgImg) {
      clonedBgImg.style.width = '484px';
      clonedBgImg.style.height = '790px';
    }

    const clonedPlayersContainer = clonedDocument.querySelector('.v-n-toi-system__players');
    if (clonedPlayersContainer) {
      clonedPlayersContainer.style.width = '600px';
      clonedPlayersContainer.style.height = '790px';
      clonedPlayersContainer.style.marginTop = '12px';
    }

    clonedDocument.querySelectorAll('.v-n-toi-player').forEach((player) => {
      player.style.width = '90px';
    });

    clonedDocument.querySelectorAll('.v-n-toi-player__name').forEach((name) => {
      Object.assign(name.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        paddingTop: '0',
        paddingBottom: '10px'
      });
    });

    const clonedFooter = clonedDocument.querySelector('.v-n-toi-system-footer');
    if (clonedFooter) {
      clonedFooter.style.display = 'block';
    }
  }

  function downloadCanvas(canvas) {
    canvas.toBlob(blob => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = getDownloadFilename();

      document.body.appendChild(link);

      try {
        link.click();
      } catch (err) {
        window.open(url, '_blank');
      }

      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/jpeg', 0.85);
  }

  function getDownloadFilename() {
    return `mi-once-ideal-${Date.now()}.jpg`;
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      closePopup();
      
      document.querySelectorAll('.v-n-toi-player').forEach(player => {
        player.removeAttribute('data-selected-player-id');
        const img = player.querySelector('img');
        const type = player.getAttribute('data-player-type') || 'centro';
        if (img) {
          img.src = `https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/15/tu-once-ideal/images/toi-icon-${type}.webp`;
          img.alt = '';
        }
        const nameSpan = player.querySelector('.v-n-toi-player__name');
        if (nameSpan) nameSpan.textContent = '';
      });

      selectorItems.forEach(i => i.classList.remove('is-active'));
      if (nextStepBlock) nextStepBlock.classList.remove('is-hidden');

      selectedBlock.classList.remove('is-active', 'is-visible');
      if (downloadBlock) downloadBlock.classList.remove('is-active');

      const firstSelector = selectorItems[0];
      if (firstSelector) {
        firstSelector.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      if (playerData.injured && playerData.injured !== "false") button.classList.add('is-injured');
      button.setAttribute('data-player-img-url', playerData.image);

      if (activePlayerButton?.getAttribute('data-selected-player-id') === id) {
        button.classList.add('is-active');
      }

      button.innerHTML = `
        <div class="v-n-toi-popup__player-left-c">
          <div class="v-n-toi-popup__player-img-c ${playerData.injured ? 'is-injured' : ''}" style="--played:${playerData.timePlayed || 0}">
            <img src="${playerData.image}" alt="${playerData.name}" class="v-n-toi-popup__player-img">
          </div>
          ${ playerData.injured ? 
            `<span class="v-n-toi-popup__player-injured">Lesionado</span>` :
            `<span class="v-n-toi-popup__player-time">${playerData.timePlayed}% disputado</span>`
          }
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
        if (img.complete) img.classList.add('is-loaded');
        else img.addEventListener('load', () => img.classList.add('is-loaded'));
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
      Object.assign(popup.style, { position: '', top: '', left: '' });
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
    if (leftOffset < 0) leftOffset = gap;

    if ((containerRect.top + topOffset + popupRect.height) > window.innerHeight) {
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

    const playerImgElement = activePlayerButton.querySelector('img');
    if (playerImgElement) {
      playerImgElement.crossOrigin = 'anonymous';
      playerImgElement.src = imageUrl;
      playerImgElement.alt = `Foto de ${name}`;
    }

    const playerNameElement = activePlayerButton.querySelector('.v-n-toi-player__name');
    if (playerNameElement) {
      playerNameElement.textContent = name;
    }

    activePlayerButton.setAttribute('data-selected-player-id', id);
    closePopup();
  }

  function showErrorMessage(texto) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'v-n-toi-alert-toast';
    alertContainer.textContent = texto;
    document.body.appendChild(alertContainer);

    requestAnimationFrame(() => alertContainer.classList.add('is-visible'));

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
      img.crossOrigin = 'anonymous';
      img.src = `https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/15/tu-once-ideal/images/toi-icon-${positionGeneral}.webp`;
      img.alt = '';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'v-n-toi-player__name';

      button.appendChild(img);
      button.appendChild(nameSpan);
      container.appendChild(button);

      playerIndex++;
    }
  }
}