(function () {
  gsap.registerPlugin(ScrollTrigger);

  // NOTE: Mover elementos
  function initMoveEls(source, target, position = 'before') {
    const elSource = document.querySelector(source);
    const elTarget = document.querySelector(target);

    if (!elSource || !elTarget) return;

    switch (position) {
      case 'before':
        elTarget.before(elSource);
        break;
      case 'after':
        elTarget.after(elSource);
        break;
      case 'append':
        elTarget.append(elSource);
        break;
      case 'prepend':
        elTarget.prepend(elSource);
        break;
    }
  }

  // NOTE: Mapa con popovers
  const MAP_DATA = [
    {
      id: 1,
      agrupacion: "Frente Atlético",
      club: "Atlético de Madrid",
      fundacion: 1982,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/2-frente.png",
      fondo: "sur"
    },
    {
      id: 2,
      agrupacion: "Suburbios Firm",
      club: "Atlético de Madrid",
      fundacion: null,
      ubicacion: "",
      ideologia: "Neonazis",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/3-suburbios.png",
      fondo: null
    },
    {
      id: 3,
      agrupacion: "Ultras Sur",
      club: "Real Madrid",
      fundacion: 1980,
      ubicacion: "",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/4-ultrasur.png",
      fondo: null
    },
    {
      id: 4,
      agrupacion: "Frente Bokerón",
      club: "Málaga CF",
      fundacion: 1986,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/5-frente.png",
      fondo: "norte"
    },
    {
      id: 5,
      agrupacion: "Biris Norte",
      club: "Sevilla FC",
      fundacion: 1975,
      ubicacion: "Fondo norte",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/6-birisnorte.png",
      fondo: "norte"
    },
    {
      id: 6,
      agrupacion: "Boixos Nois",
      club: "FC Barcelona",
      fundacion: 1981,
      ubicacion: "Fondo norte",
      ideologia: "Independentistas de extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/7-boixos.png",
      fondo: "norte"
    },
    {
      id: 7,
      agrupacion: "Supporters Gol Sur",
      club: "Real Betis",
      fundacion: 1986,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/8-suporters.png",
      fondo: "sur"
    },
    {
      id: 8,
      agrupacion: "United Family",
      club: "Real Betis",
      fundacion: 2011,
      ubicacion: "Fondo sur",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/9-united.png",
      fondo: "sur"
    },
    {
      id: 9,
      agrupacion: "Tropas de Breogán",
      club: "CD Lugo",
      fundacion: 2016,
      ubicacion: "Curva norte",
      ideologia: "Nacionalistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/10-tropas.png",
      fondo: "norte"
    },
    {
      id: 10,
      agrupacion: "Curva RCDE",
      club: "RCD Espanyol",
      fundacion: 2002,
      ubicacion: "Se sitúan en el gol de Cornellá",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/11-curva.png",
      fondo: null
    },
    {
      id: 11,
      agrupacion: "Bukaneros",
      club: "Rayo Vallecano",
      fundacion: 1992,
      ubicacion: "Se sitúan en el único fondo que hay",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/12-bukaneros.png",
      fondo: "bukaneros"
    },
    {
      id: 12,
      agrupacion: "Symmachiarii",
      club: "Real Oviedo",
      fundacion: 1994,
      ubicacion: "Fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/13-symmachiarii.png",
      fondo: "norte"
    },
    {
      id: 13,
      agrupacion: "Indar Gorri",
      club: "CA Osasuna",
      fundacion: 1987,
      ubicacion: "Grada baja del fondo sur",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/14-indar.png",
      fondo: "sur"
    },
    {
      id: 14,
      agrupacion: "Bultza",
      club: "Real Sociedad",
      fundacion: 2018,
      ubicacion: "Fondo sur",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/15-bultzada.png",
      fondo: "sur"
    },
    {
      id: 15,
      agrupacion: "Herri Norte Taldea",
      club: "Athletic Club",
      fundacion: 1982,
      ubicacion: "Fondo norte",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/16-herri-norte.png",
      fondo: "norte"
    },
    {
      id: 16,
      agrupacion: "Ghetto 28",
      club: "CD Leganés",
      fundacion: 2009,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/17-ghetto.png",
      fondo: "norte"
    },
    {
      id: 17,
      agrupacion: "Riazor Blues",
      club: "RC Deportivo",
      fundacion: 1987,
      ubicacion: "Zona central del fondo norte",
      ideologia: "Nacionalistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/18-riazor.png",
      fondo: "norte"
    },
    {
      id: 18,
      agrupacion: "Ligallo Fondo Norte",
      club: "Real Zaragoza",
      fundacion: 1986,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/19-ligallo.png",
      fondo: "norte"
    },
    {
      id: 19,
      agrupacion: "Avispero Real Zaragoza",
      club: "Real Zaragoza",
      fundacion: 2010,
      ubicacion: "",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/20-avispero.png",
      fondo: null
    },
    {
      id: 20,
      agrupacion: "Ultra Boys",
      club: "Sporting de Gijón",
      fundacion: 1981,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/21-ultraboys.png",
      fondo: "sur"
    },
    {
      id: 21,
      agrupacion: "Curva Sur Granada",
      club: "Granada CF",
      fundacion: 2022,
      ubicacion: "Curva sur del fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/22-curva-sur.png",
      fondo: "sur"
    },
    {
      id: 22,
      agrupacion: "Juventudes Verdiblancas",
      club: "Racing de Santander",
      fundacion: 1986,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/23-juventudes.png",
      fondo: "sur"
    },
    {
      id: 23,
      agrupacion: "Resaca Castellana",
      club: "Burgos CF",
      fundacion: 1997,
      ubicacion: "Fondo sur",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/24-resaca.png",
      fondo: "sur"
    },
    {
      id: 24,
      agrupacion: "Brigadas Amarillas",
      club: "Cádiz CF",
      fundacion: 1982,
      ubicacion: "Fondo sur",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/25-brigadas.png",
      fondo: "sur"
    },
    {
      id: 25,
      agrupacion: "Brigadas Blanquiverdes",
      club: "Córdoba CF",
      fundacion: 1993,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/26-brigadas-blanquiverdes.png",
      fondo: "sur"
    },
    {
      id: 26,
      agrupacion: "Grada Joven",
      club: "UD Almería",
      fundacion: 2009,
      ubicacion: "Fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/27-grada-joven.png",
      fondo: "norte"
    },
    {
      id: 27,
      agrupacion: "Ultra Naciente",
      club: "UD Las Palmas",
      fundacion: 1985,
      ubicacion: "Curva del fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/28-ultra.png",
      fondo: "norte"
    }
  ];
  const MAP_INDEX = Object.fromEntries(
    MAP_DATA.map(i => [i.id, i])
  );

  function initMapPopovers() {
    const map = document.querySelector('.n-map-pop');
    if (!map) return;

    const pop = document.getElementById('map-popover');
    if (!pop) return;
    
    const dotsContainer = map.querySelector('.n-map-pop__dots');

    dotsContainer.innerHTML = MAP_DATA.map(item => `
      <button
        class="n-map-pop__dot n-map-pop__dot--${item.id}"
        type="button"
        aria-expanded="false"
        aria-haspopup="dialog"
        data-id="${item.id}"
        aria-label="Ver información de ${item.agrupacion}">
      </button>
    `).join('');

    const dots = [...dotsContainer.querySelectorAll('.n-map-pop__dot')];
    
    const els = {
      agrupacion: pop.querySelector('#pop-agrupacion'),
      club: pop.querySelector('#pop-club'),
      fundacion: pop.querySelector('#pop-fundacion'),
      ideologia: pop.querySelector('#pop-ideologia'),
      ubicacion: pop.querySelector('#pop-ubicacion'),
      logo: pop.querySelector('#pop-logo'),
      fondo: pop.querySelector('#pop-fondo')
    };

    const SVG_FONDO = {
      norte: `<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" data-name="Capa 2" viewBox="0 0 105.67 127"><defs><style>.cls-1,.cls-2{fill:none;stroke:#000;stroke-miterlimit:10}.cls-2{stroke-width:2px}</style></defs><g id="campos"><path d="M32.1 32.07 22.03 22.01c3.39-3.38 8.06-5.48 13.23-5.48h35.15c5.17 0 9.85 2.1 13.24 5.49L73.6 32.09z" style="fill:#a6a6a6"/><rect width="103.67" height="125" x="1" y="1" class="cls-2" rx="31.76" ry="31.76"/><path d="M16.53 91.73V35.26c0-5.17 2.1-9.86 5.5-13.25 3.39-3.38 8.06-5.48 13.23-5.48h35.15c5.17 0 9.85 2.1 13.24 5.49s5.49 8.07 5.49 13.24v56.47c0 10.34-8.39 18.73-18.73 18.73H35.26c-10.34 0-18.73-8.39-18.73-18.73Z" class="cls-2"/><path d="M32.07 32.07H73.6v62.86H32.07z" class="cls-1"/><path d="M35.4 91.6V35.4h34.87v56.2z" class="cls-1"/><path d="M46.52 91.6v-6.34h12.65v6.34zM46.52 41.74V35.4h12.65v6.34zM32.07 32.07 10.31 10.31M73.6 32.07 95.37 10.3M32.07 94.93 10.3 116.7M73.6 94.93l21.77 21.77M35.4 63.5h34.87" class="cls-1"/></g></svg>`,
      sur: `<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" data-name="Capa 2" viewBox="0 0 105.67 127"><defs><style>.cls-1,.cls-2{fill:none;stroke:#000;stroke-miterlimit:10}.cls-2{stroke-width:2px}</style></defs><g id="campos"><path d="m73.57 94.93 10.07 10.06c-3.39 3.38-8.06 5.48-13.23 5.48H35.26c-5.17 0-9.85-2.1-13.24-5.49l10.05-10.07z" style="fill:#a6a6a6"/><rect width="103.67" height="125" x="1" y="1" class="cls-2" rx="31.76" ry="31.76"/><path d="M89.14 35.27v56.47c0 5.17-2.1 9.86-5.5 13.25-3.39 3.38-8.06 5.48-13.23 5.48H35.26c-5.17 0-9.85-2.1-13.24-5.49a18.67 18.67 0 0 1-5.49-13.24V35.27c0-10.34 8.39-18.73 18.73-18.73h35.15c10.34 0 18.73 8.39 18.73 18.73Z" class="cls-2"/><path d="M73.6 94.93H32.07V32.07H73.6z" class="cls-1"/><path d="M70.28 35.4v56.2H35.41V35.4z" class="cls-1"/><path d="M59.16 35.4v6.34H46.51V35.4zM59.16 85.26v6.34H46.51v-6.34zM73.6 94.93l21.77 21.76M32.07 94.93 10.3 116.7M73.6 32.07 95.37 10.3M32.07 32.07 10.3 10.3M70.27 63.5H35.4" class="cls-1"/></g></svg>`,
      bukaneros: `<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" data-name="Capa 2" viewBox="0 0 105.67 118.11"><defs><style>.cls-1{fill:none;stroke:#000;stroke-miterlimit:10}</style></defs><g id="campos"><path d="M32.1 32.08 22.03 22.02c3.39-3.38 8.06-5.48 13.23-5.48h35.15c5.17 0 9.85 2.1 13.24 5.49L73.6 32.1z" style="fill:#a6a6a6"/><path d="M104.67 32.77v61.47c0 8.77-3.56 16.71-9.3 22.46l-11.72-11.72c3.39-3.39 5.49-8.07 5.49-13.24V35.27c0-5.17-2.1-9.85-5.49-13.24s-8.07-5.49-13.24-5.49H35.26c-5.17 0-9.84 2.1-13.23 5.48-3.4 3.39-5.5 8.08-5.5 13.25v56.47c0 5.17 2.1 9.85 5.49 13.24L10.3 116.7C4.55 110.95 1 103.01 1 94.24V32.77C1 15.22 15.22 1 32.76 1h40.15c17.54 0 31.76 14.22 31.76 31.77Z" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:2px"/><path d="M32.07 32.08H73.6v62.86H32.07z" class="cls-1"/><path d="M35.4 91.6V35.4h34.87v56.2z" class="cls-1"/><path d="M46.51 91.6v-6.34h12.65v6.34zM46.51 41.74V35.4h12.65v6.34zM32.07 32.08 10.3 10.31M73.6 32.08l21.77-21.77M10.3 116.7l11.72-11.72 10.05-10.05M95.37 116.7l-11.72-11.72L73.6 94.93M35.4 63.5h34.87" class="cls-1"/></g></svg>`
    };

    let activeId = null;

    const mqMobile = window.matchMedia("(max-width: 874px)");

    function closePopover() {
      pop.classList.remove('is-open');

      const activeDot = map.querySelector('[aria-expanded="true"]');
      activeDot?.setAttribute('aria-expanded','false');

      document.body.classList.remove("is-overflow");

      activeId = null;
    }

    function fillPopover(data) {
      els.agrupacion.textContent = data.agrupacion || "—";
      els.club.textContent = data.club || "—";
      els.fundacion.textContent = data.fundacion || "—";
      els.ideologia.textContent = data.ideologia || "—";
      els.ubicacion.textContent = data.ubicacion || "—";

      els.logo.src = data.logo;

      const fondo = data.fondo;

      if (fondo && SVG_FONDO[fondo]) {
        els.fondo.innerHTML = SVG_FONDO[fondo];
      } else {
        els.fondo.innerHTML = "";
      }
    }

    function positionPopover(dot) {
      if (mqMobile.matches) {
        pop.style.left = "50%";
        pop.style.top = "50%";
        pop.style.transform = "translate(-50%, -50%)";
        return;
      }

      const gap = 10;

      const dotRect = dot.getBoundingClientRect();

      const top = dot.offsetTop + dot.offsetHeight / 2;
      let left = dot.offsetLeft + dot.offsetWidth + gap;

      pop.style.transform = "translateY(-50%)";
      pop.style.top = `${top}px`;
      pop.style.left = `${left}px`;

      const popWidth = pop.offsetWidth;

      const spaceRight = window.innerWidth - (dotRect.left + dotRect.width);

      if (spaceRight < popWidth + gap) {
        const gapLeft = 20;
        left = dot.offsetLeft - popWidth - gapLeft;
        pop.style.left = `${left}px`;
      }
    }

    function openPopover(dot, id) {
      const data = MAP_INDEX[id];
      if (!data) return;

      fillPopover(data);
      positionPopover(dot);

      pop.classList.add('is-open');
      dot.setAttribute('aria-expanded', 'true');

      activeId = id;

      if (mqMobile.matches) {
        map.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        document.body.classList.add("is-overflow");
      } else {
        pop.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }

    dots.forEach(dot => {
      dot.addEventListener('click', e => {
        e.stopPropagation();

        const id = Number(dot.dataset.id);

        if (activeId === id) {
          closePopover();
          return;
        }

        closePopover();
        openPopover(dot, id);
      });
    });

    pop.querySelector('.n-map-pop__card-close')?.addEventListener('click', closePopover);

    document.addEventListener('click', e => {
      if (!e.target.closest('.n-map-pop__dot') && !e.target.closest('#map-popover')) {
        closePopover();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePopover();
    });

    mqMobile.addEventListener("change", () => {
      closePopover();
    });
  }

  function initMapAnimation() {
    const lines = gsap.utils.toArray('.n-map-pop__line');
    const dots = gsap.utils.toArray('.n-map-pop__dot');

    if (!lines.length) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".n-map-pop",
        start: "top 70%",
        toggleActions: "play none none none"
      }
    });

    tl.from(lines, {
      opacity: 0,
      yPercent: -20,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.15
    })

      .from(dots, {
        scale: 0,
        opacity: 0,
        duration: 0.35,
        ease: "back.out(1.7)",
        stagger: 0.05
      }, "-=1");
  }

  // NOTE: Animacion de los sumarios
  function initSumarioAnimation() {
    const sumarios = gsap.utils.toArray('.sumario');
    sumarios.forEach(sumario => {
      const num = sumario.querySelector('.sumario__num');
      const txt = sumario.querySelector('.sumario__txt');
      const icn = sumario.querySelector('.sumario__icn');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sumario,
          start: "top 70%",
          toggleActions: "play none none none"
        }
      });

      tl.from(sumario, {
        opacity: 0,
        x: -40,
        duration: 0.6,
        ease: "power2.out"
      }).from(txt, {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.3");

      if (num) {
        tl.from(num, {
          scale: 0.6,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(1.7)"
        }, "-=0.6");
      }

      tl.from(icn, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.3");
    });
  }

  // NOTE: Parallax
  function initParallax() {
    const sections = gsap.utils.toArray(".parallax");

    sections.forEach(section => {
      const img = section.querySelector(".parallax__img");

      gsap.set(img, { yPercent: -100 });
      gsap.to(img, {
        yPercent: 100,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }

  // NOTE: Animaciones
  function initImagesAnimations() {
    const blocks = gsap.utils.toArray('.n-anim');
    if (!blocks.length) return;

    blocks.forEach(block => {

      const imgs = block.querySelectorAll('img');

      gsap.from(imgs, {
        opacity: 0,
        y: 60,
        duration: 0.6,
        ease: "power2.out",
        stagger: -0.25, // la siguiente empieza antes de que termine la anterior
        scrollTrigger: {
          trigger: block,
          start: "top 50%",
          toggleActions: "play none none none"
        }
      });

    });
  }

  // NOTE: Mapa de relacions con D3
  function initRelationsChart() {
    let activeNodeId = null;
    let isM = window.innerWidth < 600;

    const DATA = MAP_DATA.map(d => ({
      id: d.id,
      n: d.agrupacion,
      i: d.ideologia || "Neutral",
      img: d.logo
    }));

    const RELS_RAW = `Frente Atlético,Ultra Boys,Afines|Frente Atlético,Supporters Gol Sur,Afines|Frente Atlético,Biris Norte,Enfrentados|Frente Atlético,Riazor Blues,Enfrentados|Frente Atlético,Ultras Sur,Enfrentados|Frente Atlético,Bukaneros,Enfrentados|Ultras Sur,Frente Atlético,Enfrentados|Ultras Sur,Boixos Nois,Enfrentados|Ultras Sur,Biris Norte,Enfrentados|Frente Bokerón,Frente Atlético,Enfrentados|Frente Bokerón,Ligallo Fondo Norte,Afines|Frente Bokerón,Ultra Boys,Afines|Biris Norte,Riazor Blues,Afines|Biris Norte,Supporters Gol Sur,Enfrentados|Biris Norte,Ultras Sur,Enfrentados|Biris Norte,Brigadas Amarillas,Enfrentados|Boixos Nois,Supporters Gol Sur,Afines|Boixos Nois,United Family,Afines|Boixos Nois,Ultras Sur,Enfrentados|Supporters Gol Sur,Frente Atlético,Afines|Supporters Gol Sur,Ultra Boys,Afines|Supporters Gol Sur,Biris Norte,Enfrentados|United Family,Frente Atlético,Afines|United Family,Biris Norte,Enfrentados|Tropas de Breogán,Frente Bokerón,Enfrentados|Tropas de Breogán,Riazor Blues,Enfrentados|Tropas de Breogán,Herri Norte Taldea,Afines|Curva RCDE,Ultras Sur,Afines|Curva RCDE,Boixos Nois,Enfrentados|Bukaneros,Brigadas Amarillas,Afines|Bukaneros,Ultras Sur,Enfrentados|Bukaneros,Frente Atlético,Enfrentados|Symmachiarii,Ultra Boys,Enfrentados|Symmachiarii,Indar Gorri,Enfrentados|Indar Gorri,Ligallo Fondo Norte,Enfrentados|Indar Gorri,Herri Norte Taldea,Afines|Indar Gorri,Bukaneros,Afines|Bultzada,Frente Atlético,Enfrentados|Bultzada,Ultras Sur,Enfrentados|Bultzada,Herri Norte Taldea,Afines|Herri Norte Taldea,Ultra Boys,Enfrentados|Ghetto 28,Ultras Sur,Afines|Ghetto 28,Ultra Naciente,Afines|Riazor Blues,Biris Norte,Afines|Riazor Blues,Ultras Sur,Enfrentados|Ligallo Fondo Norte,Ultra Boys,Afines|Avispero,Ligallo Fondo Norte,Enfrentados|Avispero,Bultzada,Enfrentados|Curva Sur Granada,Frente Bokerón,Afines|Curva Sur Granada,Brigadas Amarillas,Enfrentados|Juventudes Verdiblancas,Ultras Sur,Afines|Juventudes Verdiblancas,Frente Atlético,Afines|Resaca Castellana,Bukaneros,Afines|Resaca Castellana,Riazor Blues,Afines|Brigadas Amarillas,Biris Norte,Afines|Brigadas Amarillas,Bukaneros,Afines|Brigadas Amarillas,Frente Atlético,Enfrentados|Brigadas Amarillas,Ultras Sur,Enfrentados|Brigadas Blanquiverdes,Brigadas Amarillas,Enfrentados|Brigadas Blanquiverdes,Biris Norte,Enfrentados|Grada Joven,Brigadas Amarillas,Enfrentados|Grada Joven,Brigadas Blanquiverdes,Enfrentados|Grada Joven,Ultras Sur,Enfrentados`;

    const LINKS = RELS_RAW.split('|').map(r => {
      const [s, t, type] = r.split(',');
      const findNode = (name) => DATA.find(node =>
        node.n.toLowerCase().trim().includes(name.toLowerCase().trim().substring(0, 6))
      );
      const sNode = findNode(s);
      const tNode = findNode(t);
      return sNode && tNode ? {
        source: sNode.id, target: tNode.id, type: type === 'Afines' ? 'afines' : 'enfrentados'
      } : null;
    }).filter(x => x);

    const svg = d3.select("#chart").append("svg");
    const gLink = svg.append("g").attr("class", "layer-links");
    const gNode = svg.append("g").attr("class", "layer-nodes");
    const gText = svg.append("g").attr("class", "layer-texts");

    function getIdeology(i) {
      const text = i.toLowerCase();
      if (text.includes("derecha") || text.includes("neonazi")) return "D";
      if (text.includes("izquierda") || text.includes("nacionalista") || text.includes("independentista")) return "I";
      return "N";
    }

    const sim = d3.forceSimulation(DATA)
      .force("link", d3.forceLink(LINKS).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("collide", d3.forceCollide());

    function draw() {
      const container = document.getElementById('red-relations-d3');
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      isM = w < 600;

      // Ajuste dinámico de fuerzas según tamaño
      sim.force("link").distance(isM ? 45 : 65);
      sim.force("charge").strength(isM ? -180 : -250);
      sim.force("collide").radius(isM ? 35 : 45);

      const topY = h * 0.15;
      const bottomY = h * 0.75;
      const midX = w / 2;
      const leftX = isM ? w * 0.22 : w * 0.28;
      const rightX = isM ? w * 0.78 : w * 0.72;

      d3.select("#label-n").style("top", "0px").style("left", (midX - 35) + "px");
      d3.select("#label-i").style("bottom", "15px").style("left", "15px");
      d3.select("#label-d").style("bottom", "15px").style("right", "15px");

      svg.attr("width", w).attr("height", h);

      sim.force("x", d3.forceX(d => {
        const ideo = getIdeology(d.i);
        return ideo === "I" ? leftX : (ideo === "D" ? rightX : midX);
      }).strength(2.5));

      sim.force("y", d3.forceY(d => getIdeology(d.i) === "N" ? topY : bottomY).strength(2.5));

      sim.alpha(1).restart();
      for (let i = 0; i < 150; ++i) sim.tick();
      sim.stop();

      const padding = isM ? 35 : 55;
      DATA.forEach(d => {
        d.x = Math.max(padding, Math.min(w - padding, d.x));
        d.y = Math.max(padding, Math.min(h - padding, d.y));
      });

      const l = gLink.selectAll("line").data(LINKS).join("line")
        .attr("class", d => `link ${d.type}`)
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);

      const n = gNode.selectAll(".node-group").data(DATA).join("g")
        .attr("class", "node-group")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("mouseover", (e, d) => { if (!activeNodeId) highlight(d); })
        .on("mouseout", () => { if (!activeNodeId) reset(); })
        .on("click", (e, d) => {
          e.stopPropagation();
          if (activeNodeId === d.id) { activeNodeId = null; reset(); }
          else { activeNodeId = d.id; highlight(d); }
        });

      n.selectAll("circle").data(d => [d]).join("circle")
        .attr("r", isM ? 14 : 18)
        .attr("fill", "#fff")
        .style("stroke", d => {
          const ideo = getIdeology(d.i);
          return ideo === "D" ? "#0056b3" : (ideo === "I" ? "#d90429" : "#2b9348");
        })
        .style("stroke-width", 1.5);

      n.selectAll("image").data(d => [d]).join("image")
        .attr("xlink:href", d => d.img)
        .attr("x", isM ? -11 : -14).attr("y", isM ? -11 : -14)
        .attr("width", isM ? 22 : 28).attr("height", isM ? 22 : 28);

      const texts = gText.selectAll(".node-label").data(DATA).join("text")
        .attr("class", d => `node-label node-label-${d.id}`)
        .attr("x", d => d.x)
        .attr("y", d => {
          const offset = isM ? 24 : 32;
          const extra = (d.id % 2 === 0) ? (isM ? 14 : 18) : 0;
          return d.y + offset + extra;
        })
        .style("text-anchor", "middle")
        .style("paint-order", "stroke")
        .style("stroke", "#fff")
        .style("stroke-width", "3px")
        .text(d => d.n);

      if (activeNodeId) {
        const activeNode = DATA.find(d => d.id === activeNodeId);
        if (activeNode) highlight(activeNode);
      }
    }

    function highlight(d) {
      const neighbors = new Set([d.id]);
      LINKS.forEach(l => {
        if (l.source.id === d.id) neighbors.add(l.target.id);
        if (l.target.id === d.id) neighbors.add(l.source.id);
      });

      d3.selectAll(".label-block").classed("hidden", true);
      gNode.selectAll(".node-group").classed("faint", n => !neighbors.has(n.id));
      gLink.selectAll("line").classed("faint", l => l.source.id !== d.id && l.target.id !== d.id)
        .classed("active-link", l => l.source.id === d.id || l.target.id === d.id);

      gText.selectAll(".node-label")
        .style("opacity", n => neighbors.has(n.id) ? 1 : 0)
        .style("pointer-events", "none");
    }

    function reset() {
      d3.selectAll(".label-block").classed("hidden", false);
      gNode.selectAll(".node-group").classed("faint", false);
      gLink.selectAll("line").classed("faint", false).classed("active-link", false);
      gText.selectAll(".node-label").style("opacity", 0);
    }

    function debounce(func, wait) {
      let timeout;
      return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    }

    const debouncedDraw = debounce(draw, 250);

    window.addEventListener("resize", debouncedDraw);
    window.addEventListener("click", () => {
      activeNodeId = null;
      reset();
    });

    draw();
  }

  function initAll() {
    initMoveEls('.v-a-s-t', '.v-ath--t1');
    initMoveEls('.a-h-inc', '.v-a.v-a--d.v-a--d-s-1', 'before');
    initMapPopovers();
    initMapAnimation();
    initSumarioAnimation();
    initParallax();
    initImagesAnimations();
    initRelationsChart();
  }

  document.addEventListener('DOMContentLoaded', initAll);
})();