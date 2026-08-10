function syncThemeMeta(theme) {
  const meta = document.getElementById('theme-color-meta');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#202020' : '#ffffff');
  }

  document.documentElement.style.colorScheme = theme;
}

function updateToggleLabel(toggleBtn, theme) {
  const label = toggleBtn.querySelector('[data-theme-toggle-label]');
  const isDark = theme === 'dark';

  if (label) {
    label.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
  }

  toggleBtn.setAttribute(
    'aria-label',
    isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  );
  toggleBtn.setAttribute('aria-pressed', String(isDark));
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
  updateToggleLabel(toggleBtn, initialTheme);

  toggleBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    updateToggleLabel(toggleBtn, nextTheme);
  });
}
