function normalizeText(value) {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function buildCardSearchModel(card) {
  const tagElements = Array.from(card.querySelectorAll('.card-tag'));
  const tagValues = tagElements.length
    ? tagElements.map((tagElement) => tagElement.dataset.tag || tagElement.textContent || '')
    : (card.dataset.tags || '').split('|');

  const normalizedTags = tagValues
    .map((value) => normalizeText(value))
    .filter(Boolean);

  return {
    card,
    tagElements,
    normalizedTags,
  };
}

export function initTagSearch() {
  const searchRoot = document.getElementById('header-search');
  const searchToggle = document.getElementById('tag-search-toggle');
  const tagVisibilityToggle = document.getElementById('tag-visibility-toggle');
  const searchPanel = document.getElementById('tag-search-panel');
  const searchInput = document.getElementById('tag-search-input');
  const searchClear = document.getElementById('tag-search-clear');
  const searchStatus = document.getElementById('tag-search-status');
  const mainContent = document.getElementById('main-content');

  if (!searchRoot || !searchToggle || !tagVisibilityToggle || !searchPanel || !searchInput || !searchClear || !searchStatus || !mainContent) {
    return;
  }

  const minimumChars = 3;
  const cards = Array.from(document.querySelectorAll('.card')).map(buildCardSearchModel);
  let rafFilterId = null;
  let isManualTagVisibilityEnabled = false;

  const updateTagToggleState = () => {
    tagVisibilityToggle.setAttribute('aria-pressed', String(isManualTagVisibilityEnabled));
    tagVisibilityToggle.setAttribute('title', isManualTagVisibilityEnabled ? 'Ocultar etiquetas' : 'Mostrar etiquetas');
    tagVisibilityToggle.setAttribute('aria-label', isManualTagVisibilityEnabled ? 'Ocultar etiquetas' : 'Mostrar etiquetas');
  };

  const applyFilter = () => {
    const queryRaw = searchInput.value.trim();
    const queryNormalized = normalizeText(queryRaw);
    const hasQuery = queryNormalized.length > 0;
    const isSearching = queryNormalized.length >= minimumChars;
    let visibleCards = 0;

    mainContent.classList.toggle('main--tag-search-active', isSearching);
    mainContent.classList.toggle('main--show-tags', isManualTagVisibilityEnabled || isSearching);

    cards.forEach(({ card, tagElements, normalizedTags }) => {
      const isMatch = !isSearching || normalizedTags.some((tag) => tag.includes(queryNormalized));

      card.hidden = !isMatch;
      if (isMatch) {
        visibleCards += 1;
      }

      tagElements.forEach((tagElement, index) => {
        const tagMatches = isSearching && normalizedTags[index] && normalizedTags[index].includes(queryNormalized);
        tagElement.classList.toggle('card-tag--match', Boolean(tagMatches));
      });
    });

    if (!hasQuery) {
      searchStatus.textContent = '';
      return;
    }

    if (!isSearching) {
      searchStatus.textContent = `Escribe al menos ${minimumChars} letras para filtrar.`;
      return;
    }

    searchStatus.textContent = visibleCards > 0
      ? `${visibleCards} resultado(s) para "${queryRaw}".`
      : `Sin resultados para "${queryRaw}".`;
  };

  const queueFilter = () => {
    if (rafFilterId) {
      cancelAnimationFrame(rafFilterId);
    }

    rafFilterId = requestAnimationFrame(() => {
      rafFilterId = null;
      applyFilter();
    });
  };

  const openSearch = () => {
    searchPanel.hidden = false;
    searchRoot.classList.add('header-search--open');
    searchToggle.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      searchInput.focus();
      searchInput.select();
    });
  };

  const closeSearch = () => {
    searchPanel.hidden = true;
    searchRoot.classList.remove('header-search--open');
    searchToggle.setAttribute('aria-expanded', 'false');
    searchInput.value = '';
    searchStatus.textContent = '';
    queueFilter();
  };

  searchToggle.addEventListener('click', () => {
    if (searchPanel.hidden) {
      openSearch();
      return;
    }

    closeSearch();
    searchToggle.focus();
  });

  tagVisibilityToggle.addEventListener('click', () => {
    isManualTagVisibilityEnabled = !isManualTagVisibilityEnabled;
    updateTagToggleState();
    queueFilter();
  });

  searchClear.addEventListener('click', () => {
    closeSearch();
    searchToggle.focus();
  });

  searchInput.addEventListener('input', () => {
    queueFilter();
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    event.preventDefault();
    closeSearch();
    searchToggle.focus();
  });

  document.addEventListener('click', (event) => {
    if (!searchRoot.contains(event.target) && !searchPanel.hidden) {
      closeSearch();
    }
  });

  updateTagToggleState();
  applyFilter();
}
