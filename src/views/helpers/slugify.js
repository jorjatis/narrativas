/**
 * Slugify a month title for anchor IDs.
 * Uso: {{slugify title}}
 */
module.exports = function slugify(value) {
  if (value == null) {
    return '';
  }

  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
