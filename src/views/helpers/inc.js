// Incrementa un valor en 1 (util para los @index) 
// Uso:
// <img src="assets/images/doctor-{{inc @index}}.png" alt="">  → Empezar en el 1, en vez de en el 0

module.exports = function(value) {
  return parseInt(value, 10) + 1;
};