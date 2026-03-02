export default function initMoveEls() {
  const gridDoctors = document.querySelector('.grid-doctors');
  const vAth = document.querySelector('.v-ath.v-ath--t1');

  if (gridDoctors && vAth) {
      vAth.parentNode.insertBefore(gridDoctors, vAth);
  }
}