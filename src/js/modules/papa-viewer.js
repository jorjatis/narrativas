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
    category: 'vestidos',    
    multiple: true,
    zIndex: 1,
    colors: ['blanco'],
    simbolismo: 'Pureza, santidad y la alegría de la Resurrección.',
    uso: 'Veste talar de base que cubre todo el cuerpo. Es la identidad diaria del Papa. Tiene uso cotidiano: audiencias públicas, viajes oficiales y actos no litúrgicos.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/sotana.webp',
    detailImage: null
  },

  {
    id: 'pelegrina',
    label: 'Pelegrina',
    category: 'vestidos',    
    multiple: true,
    zIndex: 1,
    colors: ['blanco'],
    simbolismo: 'La dignidad del pastor y la protección del rebaño bajo su guía.',
    uso: 'Capa corta, abierta por delante y sujeta al cuello, que cae sobre los hombros y los codos por encima de la sotana. Uso diario sobre la sotana en actos cotidianos y oficiales.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/pelegrina.webp',
    detailImage: null
  },

  {
    id: 'faja',
    label: 'Faja',
    category: 'vestidos',    
    multiple: true,
    zIndex: 1,
    colors: ['blanco'],
    simbolismo: 'Entrega del Pontífice a su misión: la castidad, la pureza y la prontitud para el servicio eclesiástico.',
    uso: 'Banda de seda que ciñe la cintura sobre la sotana y desciende por la pierna izquierda. Uso permanente: cotidiano y bajo los ornamentos litúrgicos.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/faja.webp',
    detailImage: null
  },

  {
    id: 'zapatos',
    label: 'Zapatos',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['negro'],
    simbolismo: 'Los de color burdeos evocaban la sangre de los mártires de la Iglesia, los pies que llevan el Evangelio de la paz y la sumisión a Cristo.',
    uso: 'Calzado del Pontífice. Uso cotidiano, oficial y litúrgico por igual.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/zapatos.webp',
    detailImage: null
  },

  {
    id: 'solideo',
    label: 'Solideo',
    category: 'trajecitos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco'],
    simbolismo: 'Consagración, reserva y sumisión total a Dios.',
    uso: 'Pequeño gorro de seda rojoondo que cubre la cdoradonilla. Se lleva bajo de la mitra. Uso permanente: vida cotidiana, audiencias y ceremonias.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/solideo.webp',
    detailImage: null
  },

  {
    id: 'anillo-pescador',
    label: 'Anillo del pescador',
    category: 'trajecitos',    
    multiple: false,
    zIndex: 1,
    colors: ['dorado', 'plateado'],
    simbolismo: 'Sucesión directa del apóstol San Pedro como pescador de hombres y sello de fidelidad a la Iglesia.',
    uso: 'Anillo oficial del Pontífice colocado en el dedo anular de la mano derecha. Se deforma tras su muerte o renuncia.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/anillo-pescador.webp',
    detailImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp'
  },

  {
    id: 'roquete',
    label: 'Roquete',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco'],
    simbolismo: 'La pureza bautismal y la dignidad del estado clerical.',
    uso: 'Vestidura similar a un alba corta hecha con encajes que se lleva sobre la sotana.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/roquete.webp',
    detailImage: null
  },

  {
    id: 'muceta',
    label: 'Muceta',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['rojo'],
    simbolismo: 'Poder jurisdiccional y función de gobierno universal sobre la Iglesia.',
    uso: 'Capa corta que cubre los hombros y se abotona por delante.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/muceta.webp',
    detailImage: null
  },

  {
    id: 'alba',
    label: 'Alba',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco'],
    simbolismo: 'La pureza del alma lavada por la sangre de Cristo.',
    uso: 'Túnica amplia y larga que cubre desde el cuello hasta los pies.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/alba.webp',
    detailImage: null
  },

  {
    id: 'cingulo',
    label: 'Cíngulo',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco', 'dorado'],
    simbolismo: 'La pureza, la castidad y la presteza para el servicio divino.',
    uso: 'Cordón que se amarra a la cintura para ajustar el alba al cuerpo.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/cingulo.webp',
    detailImage: null
  },

  {
    id: 'cruz-pectoral',
    label: 'Cruz pectoral',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['dorado', 'plateado'],
    simbolismo: 'La fe en la victoria de Cristo y el compromiso público de testimonio evangélico.',
    uso: 'Cruz que cuelga sobre el pecho mediante un cordón o cadena.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/cruz-pectoral.webp',
    detailImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/details/cruz-pectoral.webp'
  },

  {
    id: 'estola',
    label: 'Estola',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco', 'rojo', 'morado', 'verde'],
    simbolismo: 'Su condición sacerdotal y la autoridad espiritual del orden sagrado.',
    uso: 'Banda larga de tela que se cuelga del cuello sobre el pecho.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/estola.webp',
    detailImage: null
  },

  {
    id: 'dalmatica-pontifical',
    label: 'Dalmática pontifical',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco', 'dorado'],
    simbolismo: 'La plenitud del Sacramento del Orden y el espíritu de servicio al prójimo.',
    uso: 'Túnica con mangas que el Papa viste debajo de la casulla.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/dalmatica.webp',
    detailImage: null
  },

  {
    id: 'casulla',
    label: 'Casulla',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco', 'rojo', 'verde', 'morado'],
    simbolismo: 'Simboliza revestirse de Cristo.',
    uso: 'Vestidura exterior principal abierta por los lados y sin mangas.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/casulla.webp',
    detailImage: null
  },

  {
    id: 'capa-pluvial',
    label: 'Capa pluvial',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco', 'rojo', 'verde', 'morado'],
    simbolismo: 'El escudo de la gracia y la protección de Dios.',
    uso: 'Capa larga abierta por delante y sujeta por un broche.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/capa-pluvial.webp',
    detailImage: null
  },

  {
    id: 'fanon',
    label: 'Fanón',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco', 'dorado'],
    simbolismo: 'La unidad entre la Iglesia de Oriente y Occidente.',
    uso: 'Pequeña capa doble de seda que se coloca sobre el alba.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/fanon.webp',
    detailImage: null
  },

  {
    id: 'palio',
    label: 'Palio',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco', 'negro', 'rojo'],
    simbolismo: 'Símbolo del obispo como buen pastor.',
    uso: 'Banda de lana colocada sobre los hombros encima de la casulla.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/palio.webp',
    detailImage: null
  },

  {
    id: 'mitra',
    label: 'Mitra',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['blanco', 'dorado'],
    simbolismo: 'El esplendor de la santidad y la cdoradona de gloria.',
    uso: 'Tocado alto de dos picos con cintas que cuelgan sobre la espalda.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/mitra.webp',
    detailImage: null
  },

  {
    id: 'ferula',
    label: 'Férula',
    category: 'vestidos',    
    multiple: false,
    zIndex: 1,
    colors: ['dorado', 'plateado'],
    simbolismo: 'El cayado del pastor y la guía del rebaño de Dios.',
    uso: 'Bastón pastoral que el Papa sostiene con su mano izquierda.',
    thumbImg: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/items/anillo-pescador.webp',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/ferula.webp',
    detailImage: null
  }
]

const POPE_PRESETS = {
  liturgia: {
    label: 'Liturgia',
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

export default function papaViewer() {
  const BASE_ITEM_ID = 'sotana';

  const itemsContainer = document.querySelector('.items-c');

  if (!itemsContainer) return;

  const title = document.querySelector('.item-label--main');

  const colorsContainer = document.querySelector('.item-colors');

  const simbolismoText = document.querySelector(
    '.item-desc__grp--symbolism .item-desc__p'
  );

  const usoText = document.querySelector(
    '.item-desc__grp--usage .item-desc__p'
  );

  const detailImageContainer = document.querySelector(
    '.item-desc__grp--detail-img'
  );

  const papaFigureItems = document.querySelector(
    '.papa-fig-items'
  );

  const presetButtons = document.querySelectorAll(
    '.presets-btn'
  );

  const resetButton = document.querySelector(
    '.papa-reset'
  );

  const state = {
    activePreset: null,

    selectedItems: [
      getItemById(BASE_ITEM_ID)
    ],

    focusedItem: getItemById(BASE_ITEM_ID)
  };

  function capitalize(text) {
    return text.replace(/\b\w/g, l => l.toUpperCase());
  }

  function getItemById(id) {
    return POPE_ITEMS.find(item => item.id === id);
  }

  function sortItemsByCategory(items) {
    return [...items].sort((a, b) => {
      return a.category.localeCompare(b.category);
    });
  }

  function renderItemsGrid() {
    itemsContainer.innerHTML = '';

    const sortedItems = sortItemsByCategory(
      POPE_ITEMS
    );

    sortedItems.forEach(item => {
      const li = document.createElement('li');

      li.className = 'item';

      li.innerHTML = `
        <button
          class="item-btn"
          type="button"
          data-item="${item.id}"
          data-item-category="${item.category}"
        >
          <div class="item-img-c">
            <img
              src="${item.thumbImg}"
              alt=""
              loading="lazy"
            >
          </div>

          <span class="item-label">
            ${item.label}
          </span>
        </button>
      `;

      const button = li.querySelector(
        '.item-btn'
      );

      button.addEventListener('click', () => {
        handleItemClick(item.id);
      });

      itemsContainer.append(li);
    });
  }

  function renderGridState() {
    const items =
      itemsContainer.querySelectorAll('.item');

    items.forEach(itemEl => {
      const button =
        itemEl.querySelector('.item-btn');

      const id = button.dataset.item;

      const item = getItemById(id);

      const isActive =
        state.selectedItems.some(
          selected => selected.id === id
        );

      button.classList.toggle(
        'is-active',
        isActive
      );

      if (isActive) {
        button.setAttribute(
          'aria-current',
          'true'
        );
      } else {
        button.removeAttribute(
          'aria-current'
        );
      }

      const existingRemove =
        itemEl.querySelector('.item-remove');

      const canRemove =
        isActive &&
        id !== BASE_ITEM_ID;

      if (canRemove && !existingRemove) {
        const removeBtn =
          document.createElement('button');

        removeBtn.className =
          'item-remove';

        removeBtn.type = 'button';

        removeBtn.setAttribute(
          'aria-label',
          `Quitar ${item.label}`
        );

        removeBtn.innerHTML = '×';

        removeBtn.addEventListener(
          'click',
          event => {
            event.stopPropagation();

            removeItem(id);
          }
        );

        itemEl.append(removeBtn);
      }

      if (!canRemove && existingRemove) {
        existingRemove.remove();
      }
    });
  }

  function renderFigure() {
    papaFigureItems.innerHTML = '';

    const sorted = [
      ...state.selectedItems
    ].sort((a, b) => {
      return a.zIndex - b.zIndex;
    });

    sorted.forEach(item => {
      const wrapper =
        document.createElement('div');

      wrapper.className = 'papa-fig-item';

      wrapper.dataset.itemId = item.id;

      wrapper.style.zIndex = item.zIndex;

      wrapper.innerHTML = `
        <img
          src="${item.figureImage}"
          alt=""
          aria-hidden="true"
        >
      `;

      wrapper.addEventListener('click', () => {
        focusItem(item);
      });

      papaFigureItems.append(wrapper);
    });
  }

  function renderPresetState() {
    presetButtons.forEach(button => {
      const isActive =
        button.dataset.preset ===
        state.activePreset;

      button.classList.toggle(
        'is-active',
        isActive
      );
    });
  }

  function renderResetVisibility() {
    if (!resetButton) return;

    const hasExtraItems =
      state.selectedItems.length > 1;

    resetButton.hidden = !hasExtraItems;
  }

  function renderColors(colors) {
    colorsContainer.innerHTML = '';

    if (!colors?.length) return;

    colors.forEach(color => {
      const label = capitalize(color);

      const item =
        document.createElement('div');

      item.className =
        'item-colors-item';

      item.innerHTML = `
        <span
          class="item-color"
          style="background-color: ${COLOR_MAP[color]}"
          title="${label}"
          aria-hidden="true"
        ></span>

        <span class="item-color-label">
          ${label}
        </span>
      `;

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
    title.textContent =
      data.label ||
      data.title ||
      '';

    simbolismoText.textContent =
      data.simbolismo || '';

    usoText.textContent =
      data.uso || '';

    renderColors(data.colors);

    renderDetailImage(data.detailImage);
  }

  function renderState() {
    renderGridState();

    renderFigure();

    renderPresetState();

    renderResetVisibility();

    if (state.focusedItem) {
      renderDescription(
        state.focusedItem
      );
    }
  }

  function focusItem(item) {
    state.focusedItem = item;

    renderState();
  }

  function removeItem(id) {
    if (id === BASE_ITEM_ID) return;

    const removedIndex =
      state.selectedItems.findIndex(
        item => item.id === id
      );

    state.selectedItems =
      state.selectedItems.filter(
        item => item.id !== id
      );

    state.activePreset = null;

    const removedWasFocused =
      state.focusedItem?.id === id;

    if (removedWasFocused) {
      const previousItem =
        state.selectedItems[
          removedIndex - 1
        ];

      state.focusedItem =
        previousItem ||
        state.selectedItems.at(-1) ||
        getItemById(BASE_ITEM_ID);
    }

    renderState();
  }

  function addItem(item) {
    const categoryItems =
      state.selectedItems.filter(
        selected =>
          selected.category ===
          item.category
      );

    if (!item.multiple) {
      categoryItems.forEach(existing => {
        removeItem(existing.id);
      });
    } else {
      categoryItems
        .filter(
          existing => !existing.multiple
        )
        .forEach(existing => {
          removeItem(existing.id);
        });
    }

    const alreadyExists =
      state.selectedItems.some(
        selected => selected.id === item.id
      );

    if (!alreadyExists) {
      state.selectedItems.push(item);
    }

    state.focusedItem = item;

    state.activePreset = null;

    renderState();
  }

  function handleItemClick(id) {
    const item = getItemById(id);

    if (!item) return;

    const alreadySelected =
      state.selectedItems.some(
        selected => selected.id === item.id
      );

    if (alreadySelected) {
      focusItem(item);

      return;
    }

    addItem(item);
  }

  function activatePreset(presetId) {
    const preset = POPE_PRESETS[presetId];

    if (!preset) return;

    state.activePreset = presetId;

    state.selectedItems = [
      getItemById(BASE_ITEM_ID),

      ...preset.items
        .filter(id => id !== BASE_ITEM_ID)
        .map(getItemById)
        .filter(Boolean)
    ];

    state.focusedItem = {
      ...preset.description,

      colors: [],

      detailImage: null
    };

    renderState();
  }

  function initPresets() {
    presetButtons.forEach(button => {
      button.addEventListener(
        'click',
        () => {
          const presetId =
            button.dataset.preset;

          const preset =
            POPE_PRESETS[presetId];

          if (!preset) return;

          if (
            state.activePreset ===
            presetId
          ) {
            state.focusedItem = {
              ...preset.description,

              colors: [],

              detailImage: null
            };

            renderState();

            return;
          }

          activatePreset(presetId);
        }
      );
    });
  }

  function resetState() {
    state.selectedItems = [
      getItemById(BASE_ITEM_ID)
    ];

    state.focusedItem =
      getItemById(BASE_ITEM_ID);

    state.activePreset = null;

    renderState();
  }

  function initReset() {
    if (!resetButton) return;

    resetButton.addEventListener(
      'click',
      resetState
    );
  }

  renderItemsGrid();

  renderState();

  initPresets();

  initReset();
}