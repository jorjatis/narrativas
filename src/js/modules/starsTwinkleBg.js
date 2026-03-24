export default function starsTwinkleBg(count = 150) {
  const starsBg = document.querySelector(".stars-bg");

  if (!starsBg) return;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");

    const type = Math.floor(Math.random() * 3) + 1;
    star.className = "star star--t" + type;

    star.style.top = Math.random() * 100 + "vh";
    star.style.left = Math.random() * 100 + "vw";

    starsBg.appendChild(star);
  }
}