module.exports = function(array, separator) {
  if (!Array.isArray(array)) return '';
  return array.join(separator);
};