# Debug Protocol – Narrative Blocks

Cuando algo falla:

---

## Paso 1 – Aislar

- ¿Es HTML?
- ¿Es CSS?
- ¿Es JS?
- ¿Es interacción entre bloques?

---

## Paso 2 – Simplificar

- Quitar animaciones
- Quitar observers
- Dejar solo estructura básica
- Reintroducir progresivamente

---

## Paso 3 – Verificar rendimiento

- ¿Se están midiendo elementos repetidamente?
- ¿Hay múltiples observers activos?
- ¿Se crean listeners innecesarios?

---

## Paso 4 – Revisar conflictos

- ¿Hay estilos globales afectando?
- ¿Hay colisiones de clases?
- ¿Hay múltiples inicializaciones?

---

## Paso 5 – Mobile Testing

- Probar scroll rápido
- Probar cambio de orientación
- Probar carga lenta

Siempre buscar simplificación antes que complejidad adicional.