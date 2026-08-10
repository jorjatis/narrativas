/**
 * Spanish plural label for a count.
 * Uso: {{pluralize count "pieza" "piezas"}}
 */
module.exports = function pluralize(count, singular, plural) {
  const n = Number(count) || 0;
  return n === 1 ? singular : plural;
};
