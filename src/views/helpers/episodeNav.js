module.exports = function(episodes, currentIndex, direction, field) {
  const index = parseInt(currentIndex, 10) + (direction === "prev" ? -1 : 1);

  if (!episodes || !episodes[index]) return "";

  return episodes[index][field] || "";
};
