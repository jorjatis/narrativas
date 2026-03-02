# Block Architecture Skill

Todo bloque narrativo debe seguir esta estructura:

## HTML

- Clase raíz única (.n-block-name)
- Estructura semántica mínima
- No profundidad innecesaria
- Sub-elementos con BEM ligero

## SCSS

- Todo scopeado a la clase raíz
- No estilos globales
- Mobile-first
- Evitar especificidad alta

## JS

Patrón base:

function initBlockName() {
  const block = document.querySelector('.n-block-name');
  if (!block) return;

  // lógica aquí
}

initBlockName();

El bloque debe poder eliminarse del DOM sin romper otros.