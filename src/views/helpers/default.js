// Devuelve un valor por defecto si el valor es null, undefined o string vacío
// Uso:
// {{default nombre "Sin nombre"}}
// Si nombre no existe → "Sin nombre"
// Mas util que hacer if else

module.exports = function(value, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value;
};