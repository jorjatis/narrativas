// Convierte un texto a MAYÚSCULAS
// Uso:
// {{uppercase name}} 
// Si name = "Almudena" → ALMUDENA
// También útil para labels dinámicos o clases CSS

module.exports = function(value) {
  if (!value) return '';
  return value.toString().toUpperCase();
};