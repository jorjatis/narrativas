# Mobile Constraints – Editorial Specials

Pensar siempre en móviles gama media.

---

## CPU

- Evitar cálculos continuos pesados
- No animaciones masivas simultáneas
- Reducir JS al mínimo viable

---

## Memoria

- No crear estructuras grandes innecesarias
- Evitar almacenar nodos duplicados

---

## Scroll

- El scroll puede ser muy rápido
- No depender de estados intermedios
- Las animaciones deben soportar skip

---

## GPU

- Animar solo transform y opacity
- No abusar de filtros pesados (blur grande, backdrop-filter)

---

## Red

- Evitar imágenes gigantes en bloques animados
- Lazy-load cuando sea posible