export default function syncNarrativeData() {
  const sourceTitle = document.querySelector(".v-a--d-s-1 .v-a-inf-c .v-a-t");
  const targetTitle = document.querySelector(".v-n-preh__t");

  if (!sourceTitle || !targetTitle) return;

  targetTitle.innerHTML = sourceTitle.innerHTML;
}