import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScrollyInstance } from "./scrolly";

export default function episodesModal(scrollyInstances) {
  const overlay = document.querySelector(".episodes-modal-overlay");
  const modals = [...document.querySelectorAll(".episodes-modal")];
  const openButtons = [...document.querySelectorAll(".open-modal")];

  if (!overlay || !modals.length) return;

  gsap.registerPlugin(ScrollTrigger);

  let currentEpisodeId = null;
  let isSwitching = false;

  function getModalById(id) {
    return modals.find((modal) => modal.dataset.episode === String(id));
  }

  function resetModal(modal) {
    const episodeId = modal.dataset.episode;
    const scroll = modal.querySelector(".episodes-modal__scroll");

    if (scroll) {
      scroll.scrollTop = 0;
    }

    if (scrollyInstances) {
      getScrollyInstance(scrollyInstances, episodeId)?.resetAudio();
    }
  }

  function activateModal(modal, animate = true) {
    modals.forEach((m) => {
      m.classList.remove("is-active");
      m.setAttribute("aria-hidden", "true");
    });

    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");

    if (animate) {
      gsap.fromTo(
        modal,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power1.out" }
      );
    } else {
      gsap.set(modal, { opacity: 1 });
    }

    currentEpisodeId = modal.dataset.episode;
    ScrollTrigger.refresh();
  }

  function openEpisode(id) {
    const modal = getModalById(id);

    if (!modal) return;

    modals.forEach((m) => resetModal(m));

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    activateModal(modal, false);
    ScrollTrigger.refresh();
  }

  function switchEpisode(id) {
    if (isSwitching || String(id) === currentEpisodeId) return;

    const nextModal = getModalById(id);
    const currentModal = getModalById(currentEpisodeId);

    if (!nextModal) return;

    isSwitching = true;

    const onComplete = () => {
      if (currentModal) {
        resetModal(currentModal);
        currentModal.classList.remove("is-active");
        currentModal.setAttribute("aria-hidden", "true");
        gsap.set(currentModal, { opacity: 0 });
      }

      resetModal(nextModal);
      activateModal(nextModal, true);
      isSwitching = false;
    };

    if (currentModal) {
      gsap.to(currentModal, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.in",
        onComplete
      });
    } else {
      onComplete();
    }
  }

  function closeAll() {
    if (currentEpisodeId) {
      const currentModal = getModalById(currentEpisodeId);

      if (currentModal) {
        resetModal(currentModal);
      }
    }

    modals.forEach((modal) => {
      modal.classList.remove("is-active");
      modal.setAttribute("aria-hidden", "true");
      gsap.set(modal, { opacity: 0 });
    });

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    currentEpisodeId = null;
    ScrollTrigger.refresh();
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const episodeId = button.dataset.episode;

      if (episodeId) {
        openEpisode(episodeId);
      }
    });
  });

  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".modal-close");
    const prevBtn = modal.querySelector(".episode-btn--prev");
    const nextBtn = modal.querySelector(".episode-btn--next");
    const content = modal.querySelector(".episodes-modal__c");
    const episodeId = Number(modal.dataset.episode);

    closeBtn?.addEventListener("click", closeAll);

    prevBtn?.addEventListener("click", () => {
      if (!prevBtn.disabled) {
        switchEpisode(episodeId - 1);
      }
    });

    nextBtn?.addEventListener("click", () => {
      if (!nextBtn.disabled) {
        switchEpisode(episodeId + 1);
      }
    });

    content?.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  overlay.addEventListener("click", closeAll);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeAll();
    }
  });
}
