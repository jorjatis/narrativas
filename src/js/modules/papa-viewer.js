const COLOR_MAP = {
  blanco: '#FFFFFF',
  negro: '#1D1D1D',
  rojo: '#B3261E',
  verde: '#2D6A4F',
  morado: '#6A4C93',
  dorado: '#D4A017',
  plateado: '#B7BCC5',
  azul: '#4A90E2'
}

const POPE_ITEMS = [
  {
    id: 'sotana',
    label: 'Sotana',
    colors: ['blanco'],
    simbolismo: 'Pureza, santidad y la alegría de la Resurrección.',
    uso: 'Veste talar de base que cubre todo el cuerpo. Es la identidad diaria del Papa. Tiene uso cotidiano: audiencias públicas, viajes oficiales y actos no litúrgicos.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-sotana.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/sotana.webp',
    detailImage: null
  },

  {
    id: 'pelegrina',
    label: 'Pelegrina',
    colors: ['blanco'],
    simbolismo: 'La dignidad del pastor y la protección del rebaño bajo su guía.',
    uso: 'Capa corta, abierta por delante y sujeta al cuello, que cae sobre los hombros y los codos por encima de la sotana. Uso diario sobre la sotana en actos cotidianos y oficiales.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-pelegrina.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/pelegrina.webp',
    detailImage: null
  },

  {
    id: 'faja',
    label: 'Faja',
    colors: ['blanco'],
    simbolismo: 'Entrega del Pontífice a su misión: la castidad, la pureza y la prontitud para el servicio eclesiástico.',
    uso: 'Banda de seda que ciñe la cintura sobre la sotana y desciende por la pierna izquierda. Uso permanente: cotidiano y bajo los ornamentos litúrgicos.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-faja.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/faja.webp',
    detailImage: null
  },

  {
    id: 'zapatos',
    label: 'Zapatos',
    colors: ['negro'],
    simbolismo: 'Los de color burdeos evocaban la sangre de los mártires de la Iglesia, los pies que llevan el Evangelio de la paz y la sumisión a Cristo.',
    uso: 'Calzado del Pontífice. Uso cotidiano, oficial y litúrgico por igual.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-zapatos.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/zapatos.webp',
    detailImage: null
  },

  {
    id: 'solideo',
    label: 'Solideo',
    colors: ['blanco'],
    simbolismo: 'Consagración, reserva y sumisión total a Dios.',
    uso: 'Pequeño gorro de seda rojoondo que cubre la cdoradonilla. Se lleva bajo de la mitra. Uso permanente: vida cotidiana, audiencias y ceremonias.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-solideo.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/solideo.webp',
    detailImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/details/solideo-detail.webp'
  },

  {
    id: 'anillo-pescador',
    label: 'Anillo del pescador',
    colors: ['dorado', 'plateado'],
    simbolismo: 'Sucesión directa del apóstol San Pedro como pescador de hombres y sello de fidelidad a la Iglesia.',
    uso: 'Anillo oficial del Pontífice colocado en el dedo anular de la mano derecha. Se deforma tras su muerte o renuncia.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-anillo.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/anillo-del-pescador.webp',
    detailImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/details/anillo-del-pescador-detail.webp'
  },

  {
    id: 'roquete',
    label: 'Roquete',
    colors: ['blanco'],
    simbolismo: 'La pureza bautismal y la dignidad del estado clerical.',
    uso: 'Vestidura similar a un alba corta hecha con encajes que se lleva sobre la sotana.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-roquete.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/roquete.webp',
    detailImage: null
  },

  {
    id: 'muceta',
    label: 'Muceta',
    colors: ['rojo'],
    simbolismo: 'Poder jurisdiccional y función de gobierno universal sobre la Iglesia.',
    uso: 'Capa corta que cubre los hombros y se abotona por delante.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-muceta.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/muceta.webp',
    detailImage: null
  },

  {
    id: 'alba',
    label: 'Alba',
    colors: ['blanco'],
    simbolismo: 'La pureza del alma lavada por la sangre de Cristo.',
    uso: 'Túnica amplia y larga que cubre desde el cuello hasta los pies.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-alba.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/alba.webp',
    detailImage: null
  },

  {
    id: 'cingulo',
    label: 'Cíngulo',
    colors: ['blanco', 'dorado'],
    simbolismo: 'La pureza, la castidad y la presteza para el servicio divino.',
    uso: 'Cordón que se amarra a la cintura para ajustar el alba al cuerpo.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-cingulo.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/cingulo.webp',
    detailImage: null
  },

  {
    id: 'cruz-pectoral',
    label: 'Cruz pectoral',
    colors: ['dorado', 'plateado'],
    simbolismo: 'La fe en la victoria de Cristo y el compromiso público de testimonio evangélico.',
    uso: 'Cruz que cuelga sobre el pecho mediante un cordón o cadena.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-crucifijo.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/crucifijo.webp',
    detailImage: null
  },

  {
    id: 'estola',
    label: 'Estola',
    colors: ['blanco', 'rojo', 'morado', 'verde'],
    simbolismo: 'Su condición sacerdotal y la autoridad espiritual del orden sagrado.',
    uso: 'Banda larga de tela que se cuelga del cuello sobre el pecho.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-estola.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/estola.webp',
    detailImage: null
  },

  {
    id: 'dalmatica-pontifical',
    label: 'Dalmática pontifical',
    colors: ['blanco', 'dorado'],
    simbolismo: 'La plenitud del Sacramento del Orden y el espíritu de servicio al prójimo.',
    uso: 'Túnica con mangas que el Papa viste debajo de la casulla.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-dalmatica.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/dalmatica.webp',
    detailImage: null
  },

  {
    id: 'casulla',
    label: 'Casulla',
    colors: ['blanco', 'rojo', 'verde', 'morado'],
    simbolismo: 'Simboliza revestirse de Cristo.',
    uso: 'Vestidura exterior principal abierta por los lados y sin mangas.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-casulla.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/casulla.webp',
    detailImage: null
  },

  {
    id: 'capa-pluvial',
    label: 'Capa pluvial',
    colors: ['blanco', 'rojo', 'verde', 'morado'],
    simbolismo: 'El escudo de la gracia y la protección de Dios.',
    uso: 'Capa larga abierta por delante y sujeta por un broche.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-capa.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/capa-pluvial.webp',
    detailImage: null
  },

  {
    id: 'palio',
    label: 'Palio',
    colors: ['blanco', 'negro', 'rojo'],
    simbolismo: 'Símbolo del obispo como buen pastor.',
    uso: 'Banda de lana colocada sobre los hombros encima de la casulla.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-palio.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/palio.webp',
    detailImage: null
  },

  {
    id: 'mitra',
    label: 'Mitra',
    colors: ['blanco', 'dorado'],
    simbolismo: 'El esplendor de la santidad y la cdoradona de gloria.',
    uso: 'Tocado alto de dos picos con cintas que cuelgan sobre la espalda.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-mitra.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/mitra.webp',
    detailImage: null
  },

  {
    id: 'ferula',
    label: 'Férula',
    colors: ['dorado', 'plateado'],
    simbolismo: 'El cayado del pastor y la guía del rebaño de Dios.',
    uso: 'Bastón pastoral que el Papa sostiene con su mano izquierda.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/icn-ferula.svg',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/ferula.webp',
    detailImage: null
  }
]

const POPE_PRESETS = {
  liturgia: {
    label: 'Liturgia',
    figureImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/presets/liturgia.webp',
    items: [
      'sotana',
      'pelegrina',
      'zapatos',
      'anillo-pescador'
    ],
    description: {
      title: 'Liturgia',
      simbolismo: 'Vestimenta litúrgica papal.',
      uso: 'Ceremonias y celebraciones.'
    }
  },

  oficial: {
    label: 'Oficial',
    figureImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/presets/oficial.webp',
    items: [
      'sotana',
      'zapatos'
    ],
    description: {
      title: 'Oficial',
      simbolismo: 'Representación institucional.',
      uso: 'Audiencias y recepciones.'
    }
  },

  otro: {
    label: 'Otro',
    figureImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/presets/otro.webp',
    items: [
      'pelegrina',
      'anillo-pescador'
    ],
    description: {
      title: 'Otro',
      simbolismo: 'Combinación alternativa.',
      uso: 'Uso personalizado.'
    }
  }
};

import { refreshDescriptionOverflow } from '../utils/descriptionOverflow';

export default function papaViewer() {
  const itemsContainer = document.querySelector('.items-c');
  if (!itemsContainer) return;
  const title = document.querySelector('.item-label--main');
  const colorsContainer = document.querySelector('.item-colors');
  const simbolismoText = document.querySelector('.item-desc__grp--symbolism .item-desc__p');
  const usoText = document.querySelector('.item-desc__grp--usage .item-desc__p');
  const detailImageContainer = document.querySelector('.item-desc__grp--detail-img');
  const presetButtons = document.querySelectorAll('.presets-btn');
  const papaImage = document.querySelector('.papa-img');
  const DEFAULT_PAPA_IMAGE = papaImage?.src || '';
  const sortedItems = [...POPE_ITEMS].sort((a, b) => a.label.localeCompare(b.label));

  function capitalize(text) {
    return text.replace(/\b\w/g, l => l.toUpperCase());
  }

  function getItemById(id) {
    return POPE_ITEMS.find(item => item.id === id);
  }

  const BASE_ITEM = getItemById('sotana');

  const state = {
    activePreset: null,
    selectedItems: [BASE_ITEM],
    focusedItem: BASE_ITEM
  };

  function clearDescription() {
    title.textContent = '';
    simbolismoText.textContent = '';
    usoText.textContent = '';
    colorsContainer.innerHTML = '';
    detailImageContainer.innerHTML = '';
  }

  function renderItemsGrid() {
    itemsContainer.innerHTML = '';
    sortedItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = ` <button class="item-btn" type="button" data-item="${item.id}" > <div class="item-img-c"> <img src="${item.thumbImg}" alt="" loading="lazy" > </div> <span class="item-label"> ${item.label} </span> </button> `;
      const button = li.querySelector('.item-btn');
      button.addEventListener('click', () => {
        handleItemClick(item.id);
      });
      itemsContainer.append(li);
    });
  }

  function renderGridState() {
    const buttons = itemsContainer.querySelectorAll('.item-btn');
    buttons.forEach(button => {
      const id = button.dataset.item;
      const isActive = state.selectedItems.some(item => item.id === id);
      button.parentElement.classList.toggle('is-active', isActive);
      if (isActive) {
        button.parentElement.setAttribute('aria-current', 'true');
      } else {
        button.parentElement.removeAttribute('aria-current');
      }
    });
  }

  function renderPresetState() {
    presetButtons.forEach(button => {
      const isActive = button.dataset.preset === state.activePreset;
      button.parentElement.classList.toggle('is-active', isActive);
    });
  }

  function renderFigure() {
    if (!papaImage) return;
    if (state.activePreset) {
      const preset = POPE_PRESETS[state.activePreset];
      if (preset?.figureImg) {
        papaImage.src =
          preset.figureImg;

        return;
      }
    }
    const item = state.selectedItems[0];
    if (!item) {
      papaImage.src = DEFAULT_PAPA_IMAGE;
      return;
    }
    papaImage.src = item.figureImage;
  }

  function renderColors(colors) {
    colorsContainer.innerHTML = '';
    if (!colors?.length) return;
    colors.forEach(color => {
      const label = capitalize(color);
      const item = document.createElement('div');
      item.className = 'item-colors-item';
      item.innerHTML = ` <span class="item-color" style="background-color: ${COLOR_MAP[color]}" title="${label}" aria-hidden="true" ></span> <span class="item-color-label"> ${label} </span> `;
      colorsContainer.append(item);
    });
  }

  function renderDetailImage(src) {
    detailImageContainer.innerHTML = '';
    if (!src) return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    detailImageContainer.append(img);
  }

  function renderDescription(data) {
    title.textContent = data.label || data.title || '';
    simbolismoText.textContent = data.simbolismo || '';
    usoText.textContent = data.uso || '';
    renderColors(data.colors);
    renderDetailImage(data.detailImage);
  }

  function renderState() {
    renderGridState();
    renderPresetState();
    renderFigure();
    if (state.focusedItem) {
      renderDescription(state.focusedItem);
      refreshDescriptionOverflow(true);
      return;
    }
    clearDescription();
    refreshDescriptionOverflow(true);
  }

  function handleItemClick(id) {
    const item = getItemById(id);
    if (!item) return;
    state.activePreset = null;
    state.selectedItems = [item];
    state.focusedItem = item;
    renderState();
  }

  function activatePreset(presetId) {
    const preset = POPE_PRESETS[presetId];
    if (!preset) return;
    state.activePreset = presetId;
    state.selectedItems = preset.items.map(getItemById).filter(Boolean);
    state.focusedItem = {
      ...preset.description,
      colors: [],
      detailImage: null
    };
    renderState();
  }

  function initPresets() {
    presetButtons.forEach(button => {
      button.addEventListener('click', () => {
        const presetId = button.dataset.preset;
        const preset = POPE_PRESETS[presetId];
        if (!preset) return;
        if (state.activePreset === presetId) {
          state.focusedItem = {
            ...preset.description,
            colors: [],
            detailImage: null
          };
          renderState();
          return;
        }
        activatePreset(presetId);
      });
    });
  }

  renderItemsGrid();
  renderState();
  initPresets();
}