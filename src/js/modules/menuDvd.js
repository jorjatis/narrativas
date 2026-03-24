import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function menuDvd() {

  const root = document.querySelector('.v-n-dvd');
  if (!root) return;

  window.scrollTo({ top: 0, behavior: 'instant' });

  /* =========================
     DATA
  ========================= */
  const dvdData = [
    { bg: 'red', text: 'Capítulo 1', link: '#1' },
    { bg: 'blue', text: 'Capítulo 2', link: '#2' },
    { bg: 'green', text: 'Capítulo 3', link: '#3' },
    { bg: 'purple', text: 'Capítulo 4', link: '#4' },
    { bg: 'orange', text: 'Capítulo 5', link: '#5' }
  ];

  /* =========================
     SELECTORES
  ========================= */
  const navLis = root.querySelectorAll('.v-n-dvd-nav li');
  const arrowLeft = root.querySelector('.v-n-dvd-arr--l');
  const arrowRight = root.querySelector('.v-n-dvd-arr--r');

  const scn = root.querySelector('.v-n-dvd-scn');
  const img = root.querySelector('.mock-img');
  const txt = root.querySelector('.mock-txt');
  const btn = root.querySelector('.mock-btn');

  const total = navLis.length;

  let active = 0;

  /* =========================
     ALTURA REAL
  ========================= */
  function getSectionHeight() {
    return root.offsetHeight;
  }

  /* =========================
     UPDATE UI
  ========================= */
  function update(index) {
    const data = dvdData[index];

    scn.className = 'v-n-dvd-scn';
    scn.classList.add(`v-n-dvd-scn--0${index + 1}`);

    img.style.background = data.bg;
    txt.textContent = data.text;
    btn.href = data.link;

    navLis.forEach((li, i) => {
      li.classList.toggle('is-active', i === index);
    });

    arrowLeft.classList.toggle('is-hidden', index === 0);
    arrowRight.classList.toggle('is-hidden', index === total - 1);

    active = index;
  }

  /* =========================
     SCROLLTRIGGER
  ========================= */
  let st;

  function initScroll() {
    const sectionHeight = getSectionHeight();

    st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: `+=${sectionHeight * total}`,
      pin: true,
      markers: true,
      onUpdate: (self) => {

        const scroll = self.scroll() - self.start;
        const index = Math.round(scroll / sectionHeight);

        const clamped = Math.max(0, Math.min(index, total - 1));

        if (clamped !== active) {
          update(clamped);
        }
      }
    });
  }

  /* =========================
     NAVEGACIÓN
  ========================= */
  function goTo(index) {
    const sectionHeight = getSectionHeight();

    window.scrollTo({
      top: st.start + (index * sectionHeight),
      behavior: 'instant'
    });

    update(index);
  }

  arrowLeft?.addEventListener('click', () => {
    if (active > 0) goTo(active - 1);
  });

  arrowRight?.addEventListener('click', () => {
    if (active < total - 1) goTo(active + 1);
  });

  navLis.forEach((li, i) => {
    li.querySelector('button')?.addEventListener('click', () => {
      goTo(i);
    });
  });

  /* =========================
     INIT
  ========================= */
  update(0);
  initScroll();

  window.addEventListener('resize', () => {
    st.kill();
    initScroll();
  });
}