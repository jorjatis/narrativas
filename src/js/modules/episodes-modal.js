import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function episodesModal() {
  const modal = document.querySelector(".episodes-modal");

  if (!modal) return;

  const scroll = modal.querySelector(".episodes-modal__scroll");
  const episodes = [...modal.querySelectorAll(".episode")];
  const openButtons = [...document.querySelectorAll(".open-modal")];
  const close = modal.querySelector(".modal-close");
  const prev = modal.querySelector(".episode-prev");
  const next = modal.querySelector(".episode-next");

  let currentEpisode = 0;

  function showEpisode(index) {
    if (index < 0 || index >= episodes.length) return;

    episodes.forEach((ep) => ep.classList.remove("active"));

    episodes[index].classList.add("active");

    currentEpisode = index;

    scroll.scrollTop = 0;

    ScrollTrigger.refresh();

    updateButtons();
  }

  function updateButtons() {
    prev.disabled = currentEpisode === 0;

    next.disabled = currentEpisode === episodes.length - 1;
  }

  function open(index = 0) {
    modal.classList.add("is-open");

    document.body.classList.add("modal-open");

    showEpisode(index);

    ScrollTrigger.refresh();
  }

  function closeModal() {
    modal.classList.remove("is-open");

    document.body.classList.remove("modal-open");
  }

  openButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      open(index);
    });
  });

  close.addEventListener("click", closeModal);

  next.addEventListener("click", () => {
    showEpisode(currentEpisode + 1);
  });

  prev.addEventListener("click", () => {
    showEpisode(currentEpisode - 1);
  });

  updateButtons();
}