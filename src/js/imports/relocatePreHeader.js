export function relocatePreHeader() {
  const preh = document.querySelector(".v-n-preh");
  const articleWrapper = document.querySelector(".v-a.v-a--d.v-a--d-s-1");

  if (!preh || !articleWrapper) return;

  // Insertar la narrativa antes de donde lo coloca ahora (tienen que cambiarlo)
  articleWrapper.parentNode.insertBefore(preh, articleWrapper);

  // Mostrar el bloque ya recolocado (por css lo ocultamos hasta que lo cambien)
  articleWrapper.classList.add("is-visible");
}