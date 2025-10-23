const chapters = document.querySelectorAll('.voc-d-c-chapter');

chapters.forEach((el, index) => {
  el.id = `zona-${index + 1}`;
});