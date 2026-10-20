export default function initMoveEls() {
  const gridDoctors = document.querySelector('.grid-doctors');
  const lifelineMobile = document.querySelector('.lifeline-mobile');
  const vAth = document.querySelector('.v-ath.v-ath--t1');

  if (!vAth) return;

  if (gridDoctors) {
    vAth.parentNode.insertBefore(gridDoctors, vAth);
  }

  if (lifelineMobile) {
    vAth.after(lifelineMobile);
  }
}
