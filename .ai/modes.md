# AI Work Modes – Narrative Specials

Este documento define modos operativos.
Cada modo activa una combinación de criterios y skills.

No todos los skills deben usarse siempre.
Elegir el modo adecuado según la tarea.

---

# 🟢 MODE: NEW BLOCK

## Cuándo usarlo

- Crear un bloque narrativo desde cero
- Implementar una sección nueva
- Traducir una idea a código

## Activa implícitamente

- agents.md (base siempre activo)
- block-architecture.md
- scroll-patterns.md
- performance-checklist.md

## Prioridades

1. HTML mínimo y semántico
2. SCSS encapsulado
3. JS funcional aislado
4. Animación solo si aporta valor
5. Mobile-first

Siempre explicar:

- Estrategia elegida
- Nivel de complejidad (1–4)
- Por qué no se eligió una solución más compleja

---

# 🟡 MODE: OPTIMIZE

## Cuándo usarlo

- Mejorar rendimiento
- Reducir peso JS
- Simplificar lógica
- Revisar animaciones existentes

## Activa

- performance-checklist.md
- anti-patterns.md
- mobile-constraints.md

## Prioridades

1. Simplificar antes que añadir
2. Reducir cálculos
3. Reducir observers
4. Eliminar animaciones innecesarias

Siempre indicar:

- Qué se ha eliminado
- Qué se ha simplificado
- Qué impacto tendrá en móviles

---

# 🔵 MODE: DEBUG

## Cuándo usarlo

- Algo no funciona
- Animación inconsistente
- Comportamiento raro en móvil
- Sticky extraño
- Scroll roto

## Activa

- debug-protocol.md
- common-bugs.md
- anti-patterns.md

## Proceso obligatorio

1. Aislar problema
2. Simplificar
3. Identificar causa raíz
4. Proponer solución mínima viable

Nunca proponer reescritura completa sin justificar.

---

# 🟣 MODE: ADVANCED ANIMATION

## Cuándo usarlo

- Scroll scrub real
- Timeline coordinado
- Secuencia compleja
- Interacción fuerte narrativa

## Activa

- scroll-patterns.md
- performance-checklist.md
- mobile-constraints.md

## Reglas adicionales

- Justificar uso de GSAP
- Explicar coste en rendimiento
- Garantizar fallback estable
- No romper experiencia si el usuario hace scroll rápido

---

# ⚪ MODE: REVIEW

## Cuándo usarlo

- Antes de cerrar bloque
- Antes de pasar a producción
- Antes de publicar especial

## Activa

- performance-checklist.md
- anti-patterns.md
- block-architecture.md

## Debe verificar

- Autonomía del bloque
- Limpieza del DOM
- Ausencia de estado global
- Observers controlados
- Animaciones no excesivas