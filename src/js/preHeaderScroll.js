export function initPreHeaderScroll() {
  const section = document.querySelector(".v-n-preh");
  if (!section) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // ---------------------------------------
  // VARIABLES
  // ---------------------------------------
  const gap = 40;

  const silhouette = section.querySelectorAll(".preh-silueta");
  
  const miniSilhouettes = gsap.utils.toArray(".preh-mini-siluetas > .mini");

  const cardBlock1 = gsap.utils.toArray(".preh-cards-1");
  const cardsBlock1 = gsap.utils.toArray(".preh-cards-1 .preh-card");

  const cardBlock2 = gsap.utils.toArray(".preh-cards-2");
  const cardsBlock2 = gsap.utils.toArray(".preh-cards-2 .preh-card");

  // ---------------------------------------
  // SETTERS
  // ---------------------------------------
  // Colocar silueta al centro antes del scroll
  gsap.set(silhouette, { x: 0, scale: 1.2 });

  // Cards del bloque 1 centradas pero invisibles (fuera del flujo)
  gsap.set(cardBlock1, { xPercent: -50, x: 0 });
  gsap.set(cardsBlock1, { opacity: 0, y: 100 });

  // Cards del bloque 2 colocadas
  gsap.set(cardBlock2, { yPercent: 30 });
  gsap.set(cardsBlock2, { opacity: 0, y: 80});

  // Setear posicion de la actualizacion de las normas actuales
  gsap.set(".preh-card .now", { y: 120, opacity: 0 });

  // Setear mini siluetas a opacidad 0 y posicion en el array aleatorio para que cada vez hagan fade in de manera aleatoria
  gsap.set(miniSilhouettes, { opacity: 0 });
  const shuffledMiniSilhouettes = gsap.utils.shuffle(miniSilhouettes);

  // ---------------------------------------
  // TIMELINES (desktop / mobile)
  // ---------------------------------------
  const mm = gsap.matchMedia();

  // ----- DESKTOP (>= 951px) -----
  mm.add("(min-width: 951px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".v-n-preh",
        start: "top top",
        end: "+=800%",
        scrub: true,
        pin: true
      }
    });

    // Movemos la silueta a la derecha
    tl.to(silhouette, {
      xPercent: 50,
      x: gap,
      scale: 1,
      duration: 1,
      ease: "power2.out"
    });

    // Cards se colocan a la izquierda del centro
    tl.to(cardBlock1, {
      xPercent: -100,
      x: -gap,
      duration: 1,
      ease: "power2.out"
    }, "<");

    // Entrada de las primeras cards (vertical)
    tl.to(cardsBlock1, {
      opacity: 1,
      y: 0,
      stagger: 0.3,
      duration: 1,
      ease: "power2.out"
    });

    // Tiempo de espera
    tl.to({}, { duration: 2 });

    // Salida de las primeras cards
    tl.to(cardsBlock1, {
      opacity: 0,
      y: -100,
      stagger: 0.3,
      duration: 1,
      ease: "power2.in"
    });

    // Silueta vuelve al centro
    tl.to(silhouette, {
      xPercent: 0,
      x: 0,
      scale: 1.1,
      duration: 1,
      ease: "power2.out"
    });

    tl.to(silhouette, {
      yPercent: -30,
      scale: .8,
      duration: 1.5,
      ease: "power2.in"
    });

    // Entrada de las segundas cards (horizontales)
    cardsBlock2.forEach((card, i) => {
      tl.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, i === 0 ? ">" : "<0.2");

      // Tiempo de espera
      tl.to({}, { duration: 1.5 });

      tl.to(card.querySelector(".now"), {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out"
      }, ">");
    });

    // Tiempo de espera
    tl.to({}, { duration: 1 });

    // Salida de las segundas cards
    tl.to(cardBlock2, {
      opacity: 0,
      y: -120,
      duration: 1.2,
      ease: "power2.in"
    });

    // Se centra la silueta
    tl.to(silhouette, {
      yPercent: 0,
      scale: 1,
      duration: 1.2,
      ease: "power2.out"
    }, "<");

    // Tiempo de espera
    tl.to({}, { duration: 1 });

    // Aparecen las minisiluetas de manera random (ANTES del final)
    shuffledMiniSilhouettes.forEach((el, i) => {
      tl.to(el, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, i === 0 ? ">" : "<0.2");
    });
  });

  // ----- TABLET / MOBILE MEDIO (640px - 950px) -----
  mm.add("(min-width: 640px) and (max-width: 950px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".v-n-preh",
        start: "top top",
        end: "+=800%",
        scrub: true,
        pin: true
      }
    });

    // Misma intro que desktop: silueta a la derecha + bloque 1
    tl.to(silhouette, {
      xPercent: 50,
      x: gap,
      scale: 1,
      duration: 1,
      ease: "power2.out"
    });

    tl.to(cardBlock1, {
      xPercent: -100,
      x: -gap,
      duration: 1,
      ease: "power2.out"
    }, "<");

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

    // Silueta vuelve al centro y se mantiene con la misma escala
    tl.to(silhouette, {
      xPercent: 0,
      x: 0,
      yPercent: 0,
      scale: 1.1,
      duration: 1.2,
      ease: "power2.out"
    });

    // Bloque 2 en columna:
    // Cada card sube desde abajo hasta el centro, aparece el .now,
    // se queda un rato y luego sigue subiendo hacia arriba mientras
    // la siguiente card ya va entrando desde abajo.
    // Partimos de una posición mucho más baja para que el movimiento
    // vertical sea más exagerado al entrar desde abajo y salir por arriba.
    cardsBlock2.forEach((card, i) => {
      const nowBox = card.querySelector(".now");

      // Solo la primera card tiene animación de entrada explícita aquí.
      // Las siguientes entran solapadas desde la salida de la anterior.
      if (i === 0) {
        tl.fromTo(
          card,
          { opacity: 0, y: 220 }, // más abajo
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
          },
          ">"
        );
      }

      // Pausa con solo el cuadro blanco en el centro
      tl.to({}, { duration: 0.8 });

      // Entrada del .now azul
      tl.to(nowBox, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power2.out"
      });

      // Pausa con el .now visible
      tl.to({}, { duration: 0.8 });

      // Salida hacia arriba del card actual
      if (i < cardsBlock2.length - 1) {
        const nextCard = cardsBlock2[i + 1];

        // La card actual se va hacia arriba (más lejos)
        tl.to(card, {
          opacity: 0,
          y: -220,
          duration: 0.9,
          ease: "power2.in"
        });

        // Mientras tanto, la siguiente card empieza a entrar desde más abajo
        tl.fromTo(
          nextCard,
          { opacity: 0, y: 220 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
          },
          "<0.4"
        );
      } else {
        // La última simplemente sale por arriba al final
        tl.to(card, {
          opacity: 0,
          y: -220,
          duration: 0.9,
          ease: "power2.in"
        });
      }
    });

    // Tiempo de espera final antes de las minisiluetas
    tl.to({}, { duration: 1 });

    // Minisiluetas como en desktop
    shuffledMiniSilhouettes.forEach((el, i) => {
      tl.to(el, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, i === 0 ? ">" : "<0.2");
    });
  });

  // ----- MOBILE PEQUEÑO (< 640px) -----
  mm.add("(max-width: 639px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".v-n-preh",
        start: "top top",
        end: "+=800%",
        scrub: true,
        pin: true
      }
    });

    // La silueta se queda en el centro, solo ajustamos la escala
    tl.to(silhouette, {
      scale: 1,
      duration: 1.2,
      ease: "power2.out"
    });

    // BLOQUE 1: cards una a una, entrando desde abajo al centro y saliendo por arriba
    cardsBlock1.forEach((card, i) => {
      // Primera card entra desde abajo
      if (i === 0) {
        tl.fromTo(
          card,
          { opacity: 0, y: 220 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
          },
          ">"
        );
      }

      // Pausa con la card en el centro
      tl.to({}, { duration: 1 });

      if (i < cardsBlock1.length - 1) {
        const nextCard = cardsBlock1[i + 1];

        // Card actual se va hacia arriba
        tl.to(card, {
          opacity: 0,
          y: -220,
          duration: 0.9,
          ease: "power2.in"
        });

        // La siguiente entra desde abajo mientras la anterior aún se va
        tl.fromTo(
          nextCard,
          { opacity: 0, y: 220 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
          },
          "<0.4"
        );
      } else {
        // Última card del bloque 1 sale por arriba
        tl.to(card, {
          opacity: 0,
          y: -220,
          duration: 0.9,
          ease: "power2.in"
        });
      }
    });

    // Pequeña pausa entre bloques
    tl.to({}, { duration: 0.8 });

    // BLOQUE 2: mismo patrón que en tablet/mobile medio (cards secuenciales)
    cardsBlock2.forEach((card, i) => {
      const nowBox = card.querySelector(".now");

      if (i === 0) {
        tl.fromTo(
          card,
          { opacity: 0, y: 220 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
          },
          ">"
        );
      }

      tl.to({}, { duration: 0.8 });

      tl.to(nowBox, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power2.out"
      });

      tl.to({}, { duration: 0.8 });

      if (i < cardsBlock2.length - 1) {
        const nextCard = cardsBlock2[i + 1];

        tl.to(card, {
          opacity: 0,
          y: -220,
          duration: 0.9,
          ease: "power2.in"
        });

        tl.fromTo(
          nextCard,
          { opacity: 0, y: 220 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
          },
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

    // Minisiluetas al final
    tl.to({}, { duration: 1 });

    shuffledMiniSilhouettes.forEach((el, i) => {
      tl.to(el, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, i === 0 ? ">" : "<0.2");
    });
  });
}