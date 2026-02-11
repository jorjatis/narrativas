export function initPreHeaderScroll() {
  const section = document.querySelector(".v-n-preh");
  if (!section) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // ---------------------------------------
  // VARIABLES
  // ---------------------------------------
  const gap = 40;

  const silhouette = gsap.utils.toArray(".preh-silueta");
  
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
  // TIMELINE
  // ---------------------------------------
  // Creamos el scrolltrigger
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".v-n-preh",
      start: "top top",
      end: "+=800%",
      scrub: true,
      pin: true,
      anticipatePin: 1, // Evita saltos al refrescar
      invalidateOnRefresh: true, // Evita saltos al refrescar
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

  // Evita saltos al refrescar
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
}