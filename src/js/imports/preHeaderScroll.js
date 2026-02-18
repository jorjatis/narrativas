export function initPreHeaderScroll() {
  const section = document.querySelector(".v-n-preh");
  if (!section) return;

  const gap = 40;

  const silhouette = section.querySelector(".preh-silueta");

  const miniSilhouettes = gsap.utils.toArray(
    section.querySelectorAll(".preh-mini-siluetas > .mini")
  );

  const cardBlock1 = gsap.utils.toArray(
    section.querySelectorAll(".preh-cards-1")
  );

  const cardsBlock1 = gsap.utils.toArray(
    section.querySelectorAll(".preh-cards-1 .preh-card")
  );

  const cardBlock2 = gsap.utils.toArray(
    section.querySelectorAll(".preh-cards-2")
  );

  const cardsBlock2 = gsap.utils.toArray(
    section.querySelectorAll(".preh-cards-2 .preh-card")
  );

  /* ---------- SET INITIAL STATES ---------- */

  gsap.set(silhouette, { x: 0, scale: 1.2 });
  gsap.set(cardBlock1, { xPercent: -50, x: 0 });
  gsap.set(cardsBlock1, { opacity: 0, y: 220 });

  gsap.set(cardBlock2, { yPercent: 30 });
  gsap.set(cardsBlock2, { opacity: 0, y: 220 });

  gsap.set(section.querySelectorAll(".preh-card .now"), {
    y: 120,
    opacity: 0
  });

  gsap.set(miniSilhouettes, { opacity: 0 });

  const shuffledMiniSilhouettes = gsap.utils.shuffle(miniSilhouettes);

  const mm = gsap.matchMedia();

  /* ================= DESKTOP ================= */
  mm.add("(min-width: 951px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=800%",
        scrub: 0.8,
        pin: true
      }
    });

    tl.to(silhouette, {
      xPercent: 50,
      x: gap,
      scale: 1,
      duration: 1,
      ease: "power2.out"
    });

    tl.to(
      cardBlock1,
      {
        xPercent: -100,
        x: -gap,
        duration: 1,
        ease: "power2.out"
      },
      "<"
    );

    tl.to(cardsBlock1, {
      opacity: 1,
      y: 0,
      stagger: 0.3,
      duration: 1,
      ease: "power2.out"
    });

    tl.to({}, { duration: 2 });

    tl.to(cardsBlock1, {
      opacity: 0,
      y: -100,
      stagger: 0.3,
      duration: 1,
      ease: "power2.in"
    });

    tl.to(silhouette, {
      xPercent: 0,
      x: 0,
      scale: 1.1,
      duration: 1,
      ease: "power2.out"
    });

    tl.to(silhouette, {
      yPercent: -30,
      scale: 0.8,
      duration: 1.5,
      ease: "power2.in"
    });

    cardsBlock2.forEach((card, i) => {
      tl.to(
        card,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        },
        i === 0 ? ">" : "<0.2"
      );

      tl.to({}, { duration: 1.5 });

      tl.to(
        card.querySelector(".now"),
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out"
        },
        ">"
      );
    });

    tl.to({}, { duration: 1 });

    tl.to(cardBlock2, {
      opacity: 0,
      y: -120,
      duration: 1.2,
      ease: "power2.in"
    });

    tl.to(
      silhouette,
      {
        yPercent: 0,
        scale: 1,
        duration: 1.2,
        ease: "power2.out"
      },
      "<"
    );

    tl.to({}, { duration: 1 });

    shuffledMiniSilhouettes.forEach((el, i) => {
      tl.to(
        el,
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        i === 0 ? ">" : "<0.2"
      );
    });
  });

  /* ================= TABLET ================= */
  mm.add("(min-width: 640px) and (max-width: 950px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=800%",
        scrub: true,
        pin: true
      }
    });

    tl.to(silhouette, {
      xPercent: 50,
      x: gap,
      scale: 1,
      duration: 1,
      ease: "power2.out"
    });

    tl.to(
      cardBlock1,
      {
        xPercent: -100,
        x: -gap,
        duration: 1,
        ease: "power2.out"
      },
      "<"
    );

    tl.to(cardsBlock1, {
      opacity: 1,
      y: 0,
      stagger: 0.3,
      duration: 1,
      ease: "power2.out"
    });

    tl.to({}, { duration: 2 });

    tl.to(cardsBlock1, {
      opacity: 0,
      y: -100,
      stagger: 0.3,
      duration: 1,
      ease: "power2.in"
    });

    tl.to(silhouette, {
      xPercent: 0,
      x: 0,
      scale: 1.1,
      duration: 1.2,
      ease: "power2.out"
    });

    animateSequentialCards(tl, cardsBlock2);

    tl.to({}, { duration: 1 });

    shuffledMiniSilhouettes.forEach((el, i) => {
      tl.to(
        el,
        { opacity: 1, duration: 0.8, ease: "power2.out" },
        i === 0 ? ">" : "<0.2"
      );
    });
  });

  /* ================= MOBILE ================= */
  mm.add("(max-width: 639px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=800%",
        scrub: true,
        pin: true
      }
    });

    tl.to(silhouette, {
      scale: 1,
      duration: 1.2,
      ease: "power2.out"
    });

    animateSequentialCards(tl, cardsBlock1);

    tl.to({}, { duration: 0.8 });

    animateSequentialCards(tl, cardsBlock2, true);

    tl.to({}, { duration: 1 });

    shuffledMiniSilhouettes.forEach((el, i) => {
      tl.to(
        el,
        { opacity: 1, duration: 0.8, ease: "power2.out" },
        i === 0 ? ">" : "<0.2"
      );
    });
  });
}

function animateSequentialCards(tl, cards, withNow = false) {
  cards.forEach((card, i) => {
    const nowBox = card.querySelector(".now");

    if (i === 0) {
      tl.fromTo(
        card,
        { opacity: 0, y: 220 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
        ">"
      );
    }

    tl.to({}, { duration: 0.8 });

    if (withNow && nowBox) {
      tl.to(nowBox, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      });
      tl.to({}, { duration: 0.8 });
    }

    if (i < cards.length - 1) {
      const nextCard = cards[i + 1];

      tl.to(card, {
        opacity: 0,
        y: -220,
        duration: 0.9,
        ease: "power2.in"
      });

      tl.fromTo(
        nextCard,
        { opacity: 0, y: 220 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
        "<0.4"
      );
    } else {
      tl.to(card, {
        opacity: 0,
        y: -220,
        duration: 0.9,
        ease: "power2.in"
      });
    }
  });
}