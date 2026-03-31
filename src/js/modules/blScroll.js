export default function blScroll() {

  // Constantes
  const navLis = document.querySelectorAll('.v-n-dvd-nav ul li');
  const blWrapper = document.querySelector('.bl-content-wrapper');
  const arrowLeft = document.querySelector('.bl-arrow--left');
  const arrowRight = document.querySelector('.bl-arrow--right');
  const chapterNum = document.querySelector('.bl-chapter__n');
  const chapterTitle = document.querySelector('.bl-txt-blk__t');
  const chapterText = document.querySelector('.bl-txt-blk p');
  const chapterBtnLink = document.querySelector('.bl-txt-blk .v-btn');
  const chapterImagen = document.querySelector('.bl-anim img');

  // IMPORTANTE: evitar errores si no existe el bloque en la página
  if (!navLis.length || !blWrapper) return;

  let tl;
  let activeLi = 0;

    // Objeto para el contenido del scroll
    const elements = {
        0: { 
            imgFile: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_06.jpg',
            title: 'Prólogo',
            text: 'Estas personas habitaron otro mundo, con otras reglas. Fueron Testigos de Jehová. Cuesta creer lo que les ocurrió y a veces puede que también nos resulte difícil entender por qué. Sus historias son duras y tristes, pero antes de escucharlas hay que saber cómo acercarnos a ellas.',
            url: 'https://www.abc.es/sociedad/escucha-20240422100737-nt.html#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada'
        },
        1: {
            imgFile: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_01.jpg',
            title: 'Episodio 1',
            text: 'Los hijos de los Testigos de Jehová se crían en una burbuja, apenas se mezclan con sus compañeros de colegio y tienen prohibido celebrar los cumpleaños. Aprenden desde pequeños que el fin de este mundo puede ocurrir en cualquier momento. Son un grupo de niños diferentes y se sienten los elegidos.',
            url: 'https://www.abc.es/sociedad/primer-desconcierto-20240422100757-nt.html#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada'
        },
        2: {
            imgFile: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_02.jpg',
            title: 'Episodio 2',
            text: 'El bautizo es el momento más importante en la vida de los Testigos de Jehová. Ese día adquieren un compromiso irreversible y, a partir de entonces, cualquier fallo les puede hacer sentir indignos de su dios. Esa culpabilidad acabará silenciando otros pecados.',
            url: 'https://www.abc.es/sociedad/silencios-20240428133246-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada'
        },
        3: {
            imgFile: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_03.jpg',
            title: 'Episodio 3',
            text: 'La presión por vivir como un buen Testigo de Jehová se vuelve insoportable. Los miembros de cada congregación se espían entre ellos y el control ya es total. Las dudas y las contradicciones se agolpan hasta que un rayo de luz se cuela en mitad de la noche.',
            url: 'https://www.abc.es/sociedad/eclipse-dios-20240505181104-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada'
        },
        4: {
            imgFile: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_04.jpg',
            title: 'Episodio 4',
            text: 'Abandonar esta religión implica salir de un mundo y aterrizar de emergencia en otro desconocido. Los exfieles tienen que despedirse de su vida anterior, también de su familia y amigos. Se han quedado solos y ahora les toca volver a nacer.',
            url: 'https://www.abc.es/sociedad/nuevo-mundo-20240512135037-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada'
        },
        5: {
            imgFile: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_05.jpg',
            title: 'Episodio 5',
            text: 'La conciencia colectiva se enciende gracias a la escucha. Conocer experiencias similares les hace ser conscientes de que sus casos no son los únicos. Este grupo de personas necesita un nombre y cuando toca elegirlo siempre gana el mismo: víctimas. Todas muy diferentes, pero víctimas.',
            url: 'https://www.abc.es/sociedad/sociedad-conmovidos-20240519121221-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada'
        },
        6: {
            imgFile: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/04/12/bandaslatinas/images/ABC_ParaQueLlore_06.jpg',
            title: 'Episodio 6',
            text: 'Dos mundos colisionan en una sala de vistas de Torrejón de Ardoz: declaran fieles y pecadores o, lo que es lo mismo, Testigos de Jehová y extestigos. Un juicio extraño y desigual donde la acusación tiene mucho que perder y los acusados muy poco que ganar. ¿Podrán seguir llamándose a sí mismos víctimas?',
            url: 'https://www.abc.es/sociedad/honor-20240526123651-nt.html?#vca=enlace-interno&vso=abc-es&vmc=testigos-jehova&vli=portada'
        }
    };


  function updateContent(activeIndex) {
    if (!elements[activeIndex]) {
      console.warn('Índice inválido:', activeIndex);
      return;
    }

    chapterNum.textContent = activeIndex + 1;
    chapterTitle.textContent = elements[activeIndex].title;
    chapterText.textContent = elements[activeIndex].text;

    if (chapterImagen) {
      chapterImagen.src = elements[activeIndex].imgFile;
      chapterImagen.alt = elements[activeIndex].title; // opcional, para accesibilidad
    }

    blWrapper.classList.forEach(className => {
      if (className.startsWith('active-')) {
        blWrapper.classList.remove(className);
      }
    });

    blWrapper.classList.add('active-' + (activeIndex + 1));

    const allPlayers = document.querySelectorAll('.bl-players .bl-player');
    allPlayers.forEach((player, index) => {
      player.style.display = index === activeIndex ? 'flex' : 'none';
    });

    chapterBtnLink.href = elements[activeIndex].url;
  }

  function updateActiveNavItem(index) {
    navLis.forEach((li, i) => {
      li.classList.toggle('is-active', i === index);
    });
  }

  function displayArrows() {
    arrowLeft.classList.toggle('hidden', activeLi <= 0);
    arrowRight.classList.toggle('hidden', activeLi >= navLis.length - 1);
  }

  // ⚠️ NO vuelvas a usar window.load aquí dentro
  // ya lo controlas desde main.js

  gsap.registerPlugin(ScrollTrigger);

  const endValue = navLis.length * window.innerHeight;
  let previousActiveLi = -1;

  function handleScrollUpdate(self) {
    const totalScroll = self.end - self.start;
    const currentScroll = self.progress * totalScroll;

    const activeIndex = Math.floor(currentScroll / window.innerHeight);

    const clampedIndex = Math.min(Math.max(activeIndex, 0), navLis.length - 1);

    if (clampedIndex !== previousActiveLi) {
      activeLi = clampedIndex;

      updateContent(activeLi);
      updateActiveNavItem(activeLi);
      displayArrows();

      previousActiveLi = clampedIndex;
    }
  }

  tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".bl-scroll",
      pin: true,
      pinType: "transform",
      start: "top top",
      end: `+=${navLis.length * window.innerHeight}`,
      onUpdate: handleScrollUpdate,
      // markers: true
    }
  });

  ScrollTrigger.create({
    trigger: ".v-a--d-s-1",
    start: "bottom top+=58",
    onEnter: () => {
      document.querySelector('.v-n-dvd-nav')?.classList.add('bl-b');
    },
    onLeaveBack: () => {
      document.querySelector('.v-n-dvd-nav')?.classList.remove('bl-b');
    }
  });

  arrowLeft?.addEventListener('click', () => {
    if (activeLi > 0) {
      updateActiveNavItem(--activeLi);
      updateContent(activeLi);
      displayArrows();
      window.scrollTo({ top: tl.scrollTrigger.start + (activeLi * window.innerHeight) });
    }
  });

  arrowRight?.addEventListener('click', () => {
    if (activeLi < navLis.length - 1) {
      updateActiveNavItem(++activeLi);
      updateContent(activeLi);
      displayArrows();
      window.scrollTo({ top: tl.scrollTrigger.start + (activeLi * window.innerHeight) });
    }
  });

  navLis.forEach((li, index) => {
    li.addEventListener('click', () => {
      activeLi = index;
      updateContent(activeLi);
      updateActiveNavItem(activeLi); // 👈 AÑADE ESTO
      displayArrows();

      window.scrollTo({
        top: tl.scrollTrigger.start + (activeLi * window.innerHeight)
      });
    });
  });
}
