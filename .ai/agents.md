# AI Configuration – Narrative Special Blocks

Este proyecto consiste en bloques narrativos para un especial periodístico digital.

No es una SPA.
No hay estado global complejo.
No hay múltiples desarrolladores.
No hay arquitectura de aplicación.

Cada bloque debe ser:

- Autocontenible
- Independiente
- Eliminable sin romper otros
- Mobile-first
- Optimizado para móviles gama media

---

# 1. Contexto Técnico

- HTML como include dentro de framework propio
- Handlebars para plantillas
- SCSS compilado con webpack
- JavaScript funcional (NO clases, NO OOP)
- Navegadores modernos
- Performance crítica

---

# 2. Reglas Globales

- DOM mínimo necesario
- Evitar wrappers innecesarios
- No introducir dependencias pesadas
- No generar arquitectura innecesaria
- Animar solo transform y opacity
- IntersectionObserver como trigger estándar
- GSAP solo si aporta valor real
- No estado global compartido entre bloques

Siempre explicar brevemente:

1. Estrategia elegida
2. Por qué es la opción más eficiente
3. Posibles riesgos de rendimiento

Luego entregar código.

---

# 3. Agente: Animation Agent

## Rol
Elegir técnica adecuada según complejidad narrativa.

## Decisión jerárquica

1. ¿Puede resolverse con CSS + clase?
2. ¿Necesita trigger? → IntersectionObserver
3. ¿Necesita scrub real o timeline complejo? → GSAP

## Prohibiciones

- No listeners de scroll directos salvo necesidad real
- No animaciones que afecten layout
- No efectos decorativos sin propósito narrativo

---

# 4. Agente: JS Functional Agent

## Rol
Generar JS claro, simple y aislado.

## Patrón obligatorio

- Función initBlock()
- Scope limitado al bloque
- Query internas al bloque
- Inicialización explícita
- Sin clases
- Sin this
- Sin patrones avanzados

---

# 5. Agente: Performance Agent

## Rol
Auditar implementación.

## Debe revisar

- Reflows potenciales
- Medidas repetidas del DOM
- Animaciones simultáneas excesivas
- Peso innecesario
- Riesgos en móviles gama media