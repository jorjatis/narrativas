import html2canvas from 'html2canvas';

// const data = {
//   "formations": {
//     "4/3/3": {
//       "description": "El sistema 4/3/3 es el verdadero ADN de la selección española, un dibujo táctico que ha sabido evolucionar desde el clásico ‘tiki-taka’ de posesión infinita hacia un fútbol moderno, vertical y eléctrico gracias al desborde desde los carriles. Anclado en un centro del campo con un pivote inteligente que equilibra el bloque y complementado hoy por extremos puros de puro desborde, este esquema permite a La Roja adueñarse del ritmo del partido sin renunciar a la pegada ni a una presión tras pérdida asfixiante. En resumen: es la fórmula perfecta donde el control técnico se encuentra con el dinamismo actual.",
//       "positions": {
//         "portero": ["unai-simon", "raya", "joan-garcia"],
//         "lateral-derecho": ["llorente", "porro"],
//         "central-derecho": ["cubarsi", "pubill"],
//         "central-izquierdo": ["laporte", "eric-garcia"],
//         "lateral-izquierdo": ["cucurella", "grimaldo"],
//         "interior-derecho": ["pedri", "merino", "dani-olmo"],
//         "pivote": ["rodri", "zubimendi"],
//         "interior-izquierdo": ["fabian", "gavi", "baena"],
//         "extremo-derecho": ["yamal", "yeremy"],
//         "delantero-centro": ["ferran", "oyarzabal", "iglesias"],
//         "extremo-izquierdo": ["nico", "victor-munoz"]
//       }
//     },
//     "4/2/3/1": {
//       "description": "El esquema 4/2/3/1, muy utilizado por Luis de la Fuente desde su etapa como seleccionador sub-21, es una evolución del clásico 4/3/3. La presencia de Pedri en la medular, junto a un mediocentro al uso, permite introducir en el esquema el concepto de mediapunta, un jugador que ejerza de enganche entre la sala de máquinas y el delantero, con capacidad para el último pase. Ahí encajan futbolistas como Dani Olmo, Álex Baena, Merino o incluso Gavi.",
//       "positions": {
//         "portero": ["unai-simon", "raya", "joan-garcia"],
//         "lateral-derecho": ["llorente", "porro"],
//         "central-derecho": ["cubarsi", "pubill"],
//         "central-izquierdo": ["laporte", "eric-garcia"],
//         "lateral-izquierdo": ["cucurella", "grimaldo"],
//         "centro-derecho": ["pedri", "merino", "gavi"],
//         "centro-izquierdo": ["rodri", "zubimendi", "fabian"],
//         "extremo-derecho": ["yamal", "yeremy"],
//         "mediapunta": ["dani-olmo", "baena"],
//         "extremo-izquierdo": ["nico", "victor-munoz"],
//         "delantero-centro": ["ferran", "oyarzabal", "iglesias"]
//       }
//     },
//     "4/4/2": {
//       "description": "Aunque menos habitual, pues reduce el papel de los extremos, con Lamine Yamal y Nico Williams como estandartes de esta selección española, el dibujo táctico 4/4/2 puede ser una variante útil para determinados partidos o momentos de los mismos. Así, esta opción permite poblar el centro del campo para incrementar todavía más el dominio de los partidos desde el control del balón, un rasgo característico de España, así como introducir dos delanteros en la ecuación, cuando sea necesario redoblar la amenaza ofensiva frente a adversarios muy replegados.",
//       "positions": {
//         "portero": ["unai-simon", "raya", "joan-garcia"],
//         "lateral-derecho": ["llorente", "porro"],
//         "central-derecho": ["cubarsi", "pubill"],
//         "central-izquierdo": ["laporte", "eric-garcia"],
//         "lateral-izquierdo": ["cucurella", "grimaldo"],
//         "extremo-derecho": ["yamal", "yeremy", "baena"],
//         "centro-derecho": ["pedri", "merino", "gavi"],
//         "centro-izquierdo": ["rodri", "zubimendi", "fabian"],
//         "extremo-izquierdo": ["nico", "victor-munoz"],
//         "delantero-derecho": ["ferran", "iglesias"],
//         "delantero-izquierdo": ["oyarzabal", "dani-olmo"]
//       }
//     }
//   },
//   "players": {
//     "baena": { "name": "Baena", "team": "Atlético", "age": "24 años", "caps": "17 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/baena.png", "injured": "false" },
//     "cubarsi": { "name": "Cubarsí", "team": "Barcelona", "age": "19 años", "caps": "12 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/cubarsi.png", "injured": "false" },
//     "cucurella": { "name": "Cucurella", "team": "Chelsea", "age": "27 años", "caps": "24 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/cucurella.png", "injured": "false" },
//     "dani-olmo": { "name": "Dani Olmo", "team": "Barcelona", "age": "28 años", "caps": "50 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/olmo.png", "injured": "false" },
//     "eric-garcia": { "name": "Eric García", "team": "Barcelona", "age": "25 años", "caps": "21 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/eric.png", "injured": "false" },
//     "fabian": { "name": "Fabián", "team": "PSG", "age": "30 años", "caps": "42 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/fabian.png", "injured": "false" },
//     "ferran": { "name": "Ferran", "team": "Barcelona", "age": "26 años", "caps": "57 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/torres.png", "injured": "false" },
//     "gavi": { "name": "Gavi", "team": "Barcelona", "age": "21 años", "caps": "30 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/gavi.png", "injured": "false" },
//     "grimaldo": { "name": "Grimaldo", "team": "Bayer Leverkusen", "age": "30 años", "caps": "14 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/grimaldo.png", "injured": "false" },
//     "iglesias": { "name": "Iglesias", "team": "Celta", "age": "33 años", "caps": "8 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/iglesias.png", "injured": "false" },
//     "joan-garcia": { "name": "Joan García", "team": "Barcelona", "age": "25 años", "caps": "2 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/garcia.png", "injured": "false" },
//     "yamal": { "name": "Yamal", "team": "Barcelona", "age": "18 años", "caps": "25 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/yamal.png", "injured": "false" },
//     "laporte": { "name": "Laporte", "team": "Athletic", "age": "32 años", "caps": "46 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/laporte.png", "injured": "false" },
//     "llorente": { "name": "Llorente", "team": "Atlético", "age": "31 años", "caps": "24 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/llorente.png", "injured": "false" },
//     "merino": { "name": "Merino", "team": "Arsenal", "age": "29 años", "caps": "43 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/merino.png", "injured": "false" },
//     "nico": { "name": "Nico", "team": "Athletic", "age": "23 años", "caps": "30 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/williams.png", "injured": "false" },
//     "oyarzabal": { "name": "Oyarzabal", "team": "Real Sociedad", "age": "29 años", "caps": "53 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/oyarzabal.png", "injured": "false" },
//     "pedri": { "name": "Pedri", "team": "Barcelona", "age": "23 años", "caps": "41 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/pedri.png", "injured": "false" },
//     "porro": { "name": "Porro", "team": "Tottenham", "age": "26 años", "caps": "18 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/porro.png", "injured": "false" },
//     "pubill": { "name": "Pubill", "team": "Atlético", "age": "22 años", "caps": "2 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/pubill.png", "injured": "false" },
//     "raya": { "name": "Raya", "team": "Arsenal", "age": "30 años", "caps": "13 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/raya.png", "injured": "false" },
//     "rodri": { "name": "Rodri", "team": "Manchester City", "age": "29 años", "caps": "62 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/rodri.png", "injured": "false" },
//     "unai-simon": { "name": "Unai Simón", "team": "Athletic", "age": "29 años", "caps": "58 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/unai.png", "injured": "true" },
//     "victor-munoz": { "name": "Víctor Muñoz", "team": "Osasuna", "age": "22 años", "caps": "2 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/munoz.png", "injured": "false" },
//     "yeremy": { "name": "Yéremy", "team": "Crystal Palace", "age": "23 años", "caps": "23 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/pino.png", "injured": "false" },
//     "zubimendi": { "name": "Zubimendi", "team": "Arsenal", "age": "27 años", "caps": "26 internacionalidades", "image": "https://s1.ppllstatics.com/comun/img/2026/seleccion/zubimendi.png" }
//   }
// };

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
  const playersRows =
    await getCSV(SHEETS.players);

  const formationsRows =
    await getCSV(SHEETS.formations);

  const descriptionsRows =
    await getCSV(SHEETS.descriptions);

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
    return SITE_LOGOS[hostname] || SITE_LOGOS['abc.es'];
  }

  function initFooterLogo() {
    const logo = document.querySelector('.v-n-toi-system-footer__site img');

    if (!logo) return;

    logo.src = `https://s1.abcstatics.com/comun/html/2026/tu-once-ideal/images/logomedios/${getCurrentSiteLogo()}`;
  }

  initFooterLogo();

  let activePlayerButton = null;
  let checkScrollSpeed = null;

  if (!selectorItems.length || !selectedBlock || !popup) return;

  const testBtn = document.createElement('button');
  testBtn.type = 'button';
  testBtn.innerText = '⚡ Auto-llenar 11';
  testBtn.style.position = 'fixed';
  testBtn.style.bottom = '20px';
  testBtn.style.left = '20px';
  testBtn.style.zIndex = '99999';
  testBtn.style.padding = '10px 14px';
  testBtn.style.background = 'red';
  testBtn.style.color = '#fff';
  testBtn.style.border = 'none';
  testBtn.style.borderRadius = '4px';
  testBtn.style.cursor = 'pointer';
  testBtn.style.fontWeight = 'bold';
  testBtn.style.fontFamily = 'sans-serif';
  testBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

  document.body.appendChild(testBtn);

  testBtn.addEventListener('click', () => {
    const currentSystem = document
      .querySelector('.v-n-toi-selector__item.is-active')
      ?.getAttribute('data-system');

    if (!currentSystem) {
      alert('Primero selecciona un sistema táctico.');
      return;
    }

    const playerButtons = document.querySelectorAll('.v-n-toi-player');

    playerButtons.forEach((btn) => {
      const positionKey = btn.getAttribute('data-player-position');

      const playersIds =
        data.formations[currentSystem]?.positions[positionKey] || [];

      if (!playersIds.length) return;

      // Jugador aleatorio para pruebas
      const randomPlayerId =
        playersIds[Math.floor(Math.random() * playersIds.length)];

      const playerData = data.players[randomPlayerId];

      if (!playerData) return;

      // Imagen
      const img = btn.querySelector('img');
      if (img) {
        img.src = playerData.image;
        img.alt = `Foto de ${playerData.name}`;
      }

      // Nombre
      const nameEl = btn.querySelector('.v-n-toi-player__name');
      if (nameEl) {
        nameEl.textContent = playerData.name;
      }

      // ID seleccionado
      btn.setAttribute(
        'data-selected-player-id',
        randomPlayerId
      );
    });

    closePopup();

    console.log('⚡ Once rellenado automáticamente');
  });

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

    const clonedFooterLogo = clonedDocument.querySelector('.v-n-toi-system-footer__site img');

    if (clonedFooterLogo) {
      Object.assign(clonedFooterLogo.style, {
        display: 'block',
        width: 'auto',
        height: '40px',
        margin: '12px auto 0',
        objectFit: 'contain'
      });
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