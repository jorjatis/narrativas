const STRINGS = {
  es: {
    docTitle: 'Narrativas visuales | Portfolio ABC',
    docDescription:
      'Selección de narrativas visuales publicadas en ABC. Cada pieza enlaza al reportaje original y a un mockup de archivo.',
    skipLink: 'Saltar al contenido',
    brandTitle: 'Narrativas visuales',
    logoLabel: 'Ir a ABC',
    monthsNav: 'Índice de meses',
    langSwitch: 'Cambiar a inglés',
    themeToDark: 'Cambiar a modo oscuro',
    themeToLight: 'Cambiar a modo claro',
    pieceOne: 'pieza',
    pieceMany: 'piezas',
    readAbc: 'Leer en ABC',
    viewMockup: 'Ver mockup',
    openArticle: 'Abrir',
    readAbcAria: 'Leer {title} en ABC',
    viewMockupAria: 'Ver mockup de archivo de {title}',
  },
  en: {
    docTitle: 'Visual narratives | ABC Portfolio',
    docDescription:
      'A selection of visual narratives published in ABC. Each piece links to the original report and an archive mockup.',
    skipLink: 'Skip to content',
    brandTitle: 'Visual narratives',
    logoLabel: 'Go to ABC',
    monthsNav: 'Months index',
    langSwitch: 'Switch to Spanish',
    themeToDark: 'Switch to dark mode',
    themeToLight: 'Switch to light mode',
    pieceOne: 'piece',
    pieceMany: 'pieces',
    readAbc: 'Read on ABC',
    viewMockup: 'View mockup',
    openArticle: 'Open',
    readAbcAria: 'Read {title} on ABC',
    viewMockupAria: 'View archive mockup of {title}',
  },
};

function normalizeLang(value) {
  return value === 'en' ? 'en' : 'es';
}

function detectPreferredLang() {
  const stored = localStorage.getItem('lang');
  if (stored === 'en' || stored === 'es') {
    return stored;
  }

  const candidates = [
    ...(navigator.languages || []),
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().locale,
  ].filter(Boolean);

  const prefersSpanish = candidates.some((locale) =>
    String(locale).toLowerCase().startsWith('es')
  );

  return prefersSpanish ? 'es' : 'en';
}

export function getLang() {
  return normalizeLang(document.documentElement.getAttribute('lang'));
}

function t(key, lang = getLang()) {
  return STRINGS[lang][key] ?? STRINGS.es[key] ?? key;
}

function plural(count, oneKey, manyKey, lang = getLang()) {
  return Number(count) === 1 ? t(oneKey, lang) : t(manyKey, lang);
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

function syncLangSwitch(lang) {
  const switchBtn = document.querySelector('[data-lang-switch]');
  if (!switchBtn) {
    return;
  }

  const label = switchBtn.querySelector('[data-lang-switch-label]');
  const nextLang = lang === 'en' ? 'es' : 'en';

  if (label) {
    label.textContent = nextLang.toUpperCase();
  }

  switchBtn.setAttribute('aria-label', t('langSwitch', lang));
  switchBtn.setAttribute('data-lang-next', nextLang);
}

function syncThemeLabels(lang) {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) {
    return;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  toggleBtn.setAttribute(
    'aria-label',
    isDark ? t('themeToLight', lang) : t('themeToDark', lang)
  );
  toggleBtn.setAttribute('aria-pressed', String(isDark));
}

function syncStaticCopy(lang) {
  document.title = t('docTitle', lang);

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', t('docDescription', lang));
  }

  const skip = document.querySelector('.skip-link');
  if (skip) {
    skip.textContent = t('skipLink', lang);
  }

  const brand = document.querySelector('.site-header__title');
  if (brand) {
    brand.textContent = t('brandTitle', lang);
  }

  const logo = document.querySelector('.site-header__logo-link');
  if (logo) {
    logo.setAttribute('aria-label', t('logoLabel', lang));
  }

  const monthsNav = document.querySelector('[data-months-nav]');
  if (monthsNav) {
    monthsNav.setAttribute('aria-label', t('monthsNav', lang));
  }
}

function syncMeta(lang) {
  const meta = document.querySelector('[data-archive-meta]');
  if (!meta) {
    return;
  }

  const pieces = Number(meta.getAttribute('data-pieces')) || 0;
  meta.textContent = `${pieces} ${plural(pieces, 'pieceOne', 'pieceMany', lang)}`;
}

function syncCards(lang) {
  document.querySelectorAll('.card').forEach((card) => {
    const titleEs = card.querySelector('.card-title__lang--es')?.textContent?.trim() || '';

    const media = card.querySelector('.card-media');
    if (media) {
      media.setAttribute('aria-label', `${t('openArticle', lang)} ${titleEs}`);
    }

    const readBtn = card.querySelector('[data-i18n="readAbc"]');
    if (readBtn) {
      readBtn.textContent = t('readAbc', lang);
      readBtn.setAttribute('aria-label', fill(t('readAbcAria', lang), { title: titleEs }));
    }

    const mockupBtn = card.querySelector('[data-i18n="viewMockup"]');
    if (mockupBtn) {
      mockupBtn.textContent = t('viewMockup', lang);
      mockupBtn.setAttribute('aria-label', fill(t('viewMockupAria', lang), { title: titleEs }));
    }
  });
}

function applyLanguage(lang) {
  const next = normalizeLang(lang);
  document.documentElement.setAttribute('lang', next);
  localStorage.setItem('lang', next);
  syncLangSwitch(next);
  syncStaticCopy(next);
  syncMeta(next);
  syncThemeLabels(next);
  syncCards(next);
}

export function initI18n() {
  applyLanguage(detectPreferredLang());

  const switchBtn = document.querySelector('[data-lang-switch]');
  if (!switchBtn) {
    return;
  }

  switchBtn.addEventListener('click', () => {
    const next = switchBtn.getAttribute('data-lang-next') || (getLang() === 'en' ? 'es' : 'en');
    applyLanguage(next);
  });
}

export function refreshThemeLabels() {
  syncThemeLabels(getLang());
}
