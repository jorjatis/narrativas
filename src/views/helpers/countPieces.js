/**
 * Count total cards across months, or cards in a single month object.
 * Uso:
 *   {{countPieces months}}
 *   {{countPieces cards}}
 */
module.exports = function countPieces(collection) {
  if (!Array.isArray(collection)) {
    return 0;
  }

  if (collection.length && Array.isArray(collection[0]?.cards)) {
    return collection.reduce((total, month) => {
      return total + (Array.isArray(month.cards) ? month.cards.length : 0);
    }, 0);
  }

  return collection.length;
};
