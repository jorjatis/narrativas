# Performance Checklist

Antes de validar un bloque:

- ¿Cuántos observers se están creando?
- ¿Se mide el DOM más de una vez?
- ¿Hay layout thrashing?
- ¿Se usa will-change sin motivo?
- ¿Hay animaciones simultáneas masivas?
- ¿El bloque puede destruirse limpiamente?

Si algo no pasa el checklist, simplificar.