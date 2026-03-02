# Anti-Patterns – Narrative Specials

Este documento define lo que NO debe hacerse.

---

## 1. Scroll Listener Global

❌ window.addEventListener('scroll', ...)

Evitar salvo que sea imprescindible.
Siempre priorizar IntersectionObserver.

---

## 2. Un Observer por Elemento

❌ Crear un observer nuevo por cada nodo.

Crear un solo observer para múltiples elementos si comparten comportamiento.

---

## 3. Medir DOM en Cada Frame

❌ getBoundingClientRect() dentro de scroll sin control.

Si se necesita cálculo continuo:
- usar requestAnimationFrame
- cachear valores cuando sea posible

---

## 4. Animar Propiedades de Layout

❌ top, left, width, height

Solo usar:
- transform
- opacity

---

## 5. Sobreanimación

❌ Animar todos los bloques
❌ Efectos innecesarios

Si un bloque funciona estático, dejarlo estático.

---

## 6. Estado Global Compartido

❌ Variables globales que afecten múltiples bloques.

Cada bloque debe ser autónomo.

---

## 7. Dependencias Innecesarias

❌ Añadir librerías para cosas triviales.

Preferir solución nativa siempre que sea viable.