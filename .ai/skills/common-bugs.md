# Common Bugs – Scroll Narratives

---

## 1. Animación que se dispara varias veces

Causa:
- Observer sin unobserve()
- Lógica sin guard clause

Solución:
- Desconectar observer si solo debe ejecutarse una vez
- Añadir flag interno

---

## 2. Saltos de layout al iniciar animación

Causa:
- Elementos ocultos con display: none
- Cambios de altura inesperados

Solución:
- Usar opacity + transform
- Mantener espacio reservado

---

## 3. Parpadeo en móviles

Causa:
- Reflows repetidos
- Animaciones simultáneas
- Uso excesivo de will-change

Solución:
- Simplificar animaciones
- Reducir simultaneidad
- Quitar will-change innecesario

---

## 4. Scroll rápido rompe animación

Causa:
- Lógica dependiente de estado intermedio
- Falta de control de progreso

Solución:
- Basar animaciones en estado absoluto
- No depender de transiciones intermedias

---

## 5. Sticky que se comporta raro

Causa:
- Contenedor con overflow oculto
- Altura mal calculada

Solución:
- Revisar contexto de stacking
- Confirmar altura real del contenedor