import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScrollyInstance } from "./scrolly";
import { motionDuration } from "../helpers/prefersReducedMotion";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

export default function episodesModal(scrollyInstances) {
  const overlay = document.querySelector(".episodes-modal-overlay");
  const modals = [...document.querySelectorAll(".episodes-modal")];
  const openButtons = [...document.querySelectorAll(".open-modal")];
  const main = document.querySelector("main");
  const pageScrInd =
    document.querySelector(".v-a-img-c > .scr-ind") ||
    document.querySelector(".v-a-preh + .scr-ind");

  if (!overlay || !modals.length) return;

  function portalModalLayer() {
    if (overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }

    modals.forEach((modal) => {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
    });
  }

  portalModalLayer();

  gsap.registerPlugin(ScrollTrigger);

  let currentEpisodeId = null;
  let isSwitching = false;
  let triggerElement = null;
  let focusTrapHandler = null;
  let audioAutoplayEnabled = false;
  let audioAutoplayPaused = false;
  let scrollIndicatorHandler = null;
  let scrollIndicatorScroller = null;
  let scrollIndicatorEl = null;
  let scrollIndicatorOrigin = 0;

  const SCROLL_IND_THRESHOLD = 50;

  function enableAutoplayOnAllInstances() {
    audioAutoplayEnabled = true;
    audioAutoplayPaused = false;

    if (scrollyInstances) {
      scrollyInstances.forEach((instance) => {
        instance.enableAutoplay();
        instance.resumeAutoplay();
      });
    }
  }

  function disableAutoplayOnAllInstances() {
    audioAutoplayEnabled = false;
    audioAutoplayPaused = false;

    if (scrollyInstances) {
      scrollyInstances.forEach((instance) => instance.disableAutoplay());
    }
  }

  function deactivateAllScrollTriggers() {
    if (scrollyInstances) {
      scrollyInstances.forEach((instance) => instance.deactivateScrollTriggers());
    }
  }

  function pauseAutoplayOnAllInstances() {
    audioAutoplayPaused = true;

    if (scrollyInstances) {
      scrollyInstances.forEach((instance) => instance.pauseAutoplay());
    }
  }

  function updateScrollIndicatorVisibility() {
    if (!scrollIndicatorEl || !scrollIndicatorScroller) return;

    const hasScrolled =
      scrollIndicatorScroller.scrollTop >
      scrollIndicatorOrigin + SCROLL_IND_THRESHOLD;

    scrollIndicatorEl.classList.toggle("is-visible", !hasScrolled);
    scrollIndicatorEl.setAttribute("aria-hidden", String(hasScrolled));
  }

  function bindScrollIndicator(modal) {
    releaseScrollIndicator();

    scrollIndicatorScroller = modal.querySelector(".episodes-modal__scroll");
    scrollIndicatorEl = modal.querySelector(".scr-ind");

    if (!scrollIndicatorEl || !scrollIndicatorScroller) return;

    const instance = getScrollyInstance(
      scrollyInstances,
      modal.dataset.episode
    );

    scrollIndicatorOrigin =
      instance?.getMinScrollTop() ?? scrollIndicatorScroller.scrollTop;

    scrollIndicatorHandler = () => updateScrollIndicatorVisibility();
    scrollIndicatorScroller.addEventListener("scroll", scrollIndicatorHandler, {
      passive: true
    });

    updateScrollIndicatorVisibility();
  }

  function releaseScrollIndicator() {
    if (scrollIndicatorScroller && scrollIndicatorHandler) {
      scrollIndicatorScroller.removeEventListener("scroll", scrollIndicatorHandler);
    }

    if (scrollIndicatorEl) {
      scrollIndicatorEl.classList.remove("is-visible");
      scrollIndicatorEl.setAttribute("aria-hidden", "true");
    }

    scrollIndicatorScroller = null;
    scrollIndicatorHandler = null;
    scrollIndicatorEl = null;
    scrollIndicatorOrigin = 0;

    if (pageScrInd) {
      pageScrInd.classList.toggle("is-visible", window.scrollY < SCROLL_IND_THRESHOLD);
    }
  }

  function prepareModalView(modal) {
    const instance = getScrollyInstance(scrollyInstances, modal.dataset.episode);

    pageScrInd?.classList.remove("is-visible");
    deactivateAllScrollTriggers();

    requestAnimationFrame(() => {
      instance?.activateScrollTriggers();
      ScrollTrigger.refresh(true);
      instance?.goToStep(0, { behavior: "auto" });

      if (audioAutoplayEnabled) {
        instance?.enableAutoplay();

        if (audioAutoplayPaused) {
          instance?.pauseAutoplay();
        }
      }

      requestAnimationFrame(() => {
        instance?.syncMinScrollTop();
        ScrollTrigger.refresh(true);
        bindScrollIndicator(modal);
      });
    });
  }

  function getModalById(id) {
    return modals.find((modal) => modal.dataset.episode === String(id));
  }

  function getFocusableElements(container) {
    return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
      (element) => element.getClientRects().length > 0
    );
  }

  function trapFocus(modal) {
    releaseFocusTrap();

    focusTrapHandler = (event) => {
      if (event.key !== "Tab" || !overlay.classList.contains("is-open")) return;

      const focusable = getFocusableElements(modal);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", focusTrapHandler);
  }

  function releaseFocusTrap() {
    if (focusTrapHandler) {
      document.removeEventListener("keydown", focusTrapHandler);
      focusTrapHandler = null;
    }
  }

  function setBackgroundInert(inert) {
    if (!main) return;

    if (inert) {
      main.setAttribute("inert", "");
      main.setAttribute("aria-hidden", "true");
    } else {
      main.removeAttribute("inert");
      main.removeAttribute("aria-hidden");
    }
  }

  function resetModal(modal) {
    const episodeId = modal.dataset.episode;

    if (scrollyInstances) {
      const instance = getScrollyInstance(scrollyInstances, episodeId);
      instance?.resetScrollState();
      instance?.resetAudio();
    }
  }

  function activateModal(modal, animate = true) {
    modals.forEach((m) => {
      m.classList.remove("is-active");
      m.setAttribute("aria-hidden", "true");
    });

    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");

    const duration = animate ? motionDuration(0.3) : 0;

    if (animate && duration > 0) {
      gsap.fromTo(
        modal,
        { opacity: 0 },
        { opacity: 1, duration, ease: "power1.out" }
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
    document.body.classList.add("is-overflow");
    setBackgroundInert(true);

    activateModal(modal, false);
    ScrollTrigger.refresh();
    prepareModalView(modal);

    const closeBtn = modal.querySelector(".modal-close");
    closeBtn?.focus();
    trapFocus(modal);
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
      prepareModalView(nextModal);
      trapFocus(nextModal);
      isSwitching = false;
    };

    const duration = motionDuration(0.3);

    if (currentModal && duration > 0) {
      gsap.to(currentModal, {
        opacity: 0,
        duration,
        ease: "power1.in",
        onComplete
      });
    } else {
      if (currentModal) {
        gsap.set(currentModal, { opacity: 0 });
      }
      onComplete();
    }
  }

  function clearTriggerInteractionState() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!(triggerElement instanceof HTMLElement)) return;

    triggerElement.blur();

    const introImg = triggerElement.closest(".intro-img");

    if (!(introImg instanceof HTMLElement)) return;

    introImg.style.pointerEvents = "none";

    requestAnimationFrame(() => {
      introImg.style.pointerEvents = "";
    });
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
    document.body.classList.remove("is-overflow");
    setBackgroundInert(false);
    releaseFocusTrap();
    releaseScrollIndicator();
    disableAutoplayOnAllInstances();
    deactivateAllScrollTriggers();
    clearTriggerInteractionState();

    triggerElement?.focus();
    triggerElement = null;
    currentEpisodeId = null;
    ScrollTrigger.refresh();
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const episodeId = button.dataset.episode;

      if (episodeId) {
        triggerElement = button;
        openEpisode(episodeId);
      }
    });
  });

  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".modal-close");
    const prevBtn = modal.querySelector(".episode-btn--prev");
    const nextBtn = modal.querySelector(".episode-btn--next");
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
  });

  overlay.addEventListener("click", closeAll);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeAll();
    }
  });

  document.addEventListener("scrolly:audio-enabled", enableAutoplayOnAllInstances);
  document.addEventListener("scrolly:audio-paused", pauseAutoplayOnAllInstances);
}
