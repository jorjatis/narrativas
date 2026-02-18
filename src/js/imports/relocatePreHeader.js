export function relocatePreHeader() {
  const preh = document.querySelector(".v-n-preh");
  const articleWrapper = document.querySelector(".v-a.v-a--d.v-a--d-s-1");

  if (!preh || !articleWrapper) return;

  // Insertar antes del bloque contenedor
  articleWrapper.parentNode.insertBefore(preh, articleWrapper);
}