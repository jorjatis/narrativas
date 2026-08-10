import { refreshThemeLabels } from './i18n';

function syncThemeMeta(theme) {
  const meta = document.getElementById('theme-color-meta');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#202020' : '#ffffff');
  }

  document.documentElement.style.colorScheme = theme;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  syncThemeMeta(theme);
}

export function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) {
    return;
  }

  const currentTheme = localStorage.getItem('theme');
  const initialTheme = currentTheme === 'dark' ? 'dark' : 'light';

  applyTheme(initialTheme);

  toggleBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    refreshThemeLabels();
  });
}
