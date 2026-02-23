// Convierte un texto a minúsculas
// Uso:
// {{lowercase name}}
// "Almudena" → "almudena"

module.exports = function(value) {
  if (!value) return '';
  return value.toString().toLowerCase();
};