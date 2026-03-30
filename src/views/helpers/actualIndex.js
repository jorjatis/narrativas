// Por si @index no funciona del todo bien
// Uso:
// <img src="assets/images/doctor-{{actualIndex @index}}.png" alt="">  → Empieza en el 0

module.exports = function(value) {
  return parseInt(value, 10);
};