/**
 * Count months in the archive.
 * Uso: {{countMonths months}}
 */
module.exports = function countMonths(months) {
  return Array.isArray(months) ? months.length : 0;
};
