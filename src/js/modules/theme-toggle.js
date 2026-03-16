function updateToggleLabel(toggleBtn, theme) {
  const themeIcon = toggleBtn.querySelector('[data-theme-toggle-icon]');

  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '\u2600' : '\u263E';
  }

  toggleBtn.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  );
}

export function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) {
    return;
  }

  const currentTheme = localStorage.getItem('theme');
  const initialTheme = currentTheme === 'dark' ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', initialTheme);
  updateToggleLabel(toggleBtn, initialTheme);

  toggleBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      updateToggleLabel(toggleBtn, 'light');
      return;
    }

    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    updateToggleLabel(toggleBtn, 'dark');
  });
}
