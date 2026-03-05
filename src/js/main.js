(function () {
  gsap.registerPlugin(ScrollTrigger);

  // NOTE: Mover elementos
  function initMoveEls(source, target) {
    const elSource = document.querySelector(source);
    const elTarget = document.querySelector(target);

    elTarget?.before(elSource);
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
      stadium: ""
    },
    {
      id: 2,
      agrupacion: "Suburbios Firm",
      club: "Atlético de Madrid",
      fundacion: null,
      ubicacion: "",
      ideologia: "Neonazis",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/3-suburbios.png",
      stadium: ""
    },
    {
      id: 3,
      agrupacion: "Ultras Sur",
      club: "Real Madrid",
      fundacion: 1980,
      ubicacion: "",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/4-ultrasur.png",
      stadium: ""
    },
    {
      id: 4,
      agrupacion: "Frente Bokerón",
      club: "Málaga CF",
      fundacion: 1986,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/5-frente.png",
      stadium: ""
    },
    {
      id: 5,
      agrupacion: "Biris Norte",
      club: "Sevilla FC",
      fundacion: 1975,
      ubicacion: "Fondo norte",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/6-birisnorte.png",
      stadium: ""
    },
    {
      id: 6,
      agrupacion: "Boixos Nois",
      club: "FC Barcelona",
      fundacion: 1981,
      ubicacion: "Fondo norte",
      ideologia: "Independentistas de extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/7-boixos.png",
      stadium: ""
    },
    {
      id: 7,
      agrupacion: "Supporters Gol Sur",
      club: "Real Betis",
      fundacion: 1986,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/8-suporters.png",
      stadium: ""
    },
    {
      id: 8,
      agrupacion: "United Family",
      club: "Real Betis",
      fundacion: 2011,
      ubicacion: "Fondo sur",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/9-united.png",
      stadium: ""
    },
    {
      id: 9,
      agrupacion: "Tropas de Breogán",
      club: "CD Lugo",
      fundacion: 2016,
      ubicacion: "Curva norte",
      ideologia: "Nacionalistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/10-tropas.png",
      stadium: ""
    },
    {
      id: 10,
      agrupacion: "Curva RCDE",
      club: "RCD Espanyol",
      fundacion: 2002,
      ubicacion: "Se sitúan en el gol de Cornellá",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/11-curva.png",
      stadium: ""
    },
    {
      id: 11,
      agrupacion: "Bukaneros",
      club: "Rayo Vallecano",
      fundacion: 1992,
      ubicacion: "Se sitúan en el único fondo que hay",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/12-bukaneros.png",
      stadium: ""
    },
    {
      id: 12,
      agrupacion: "Symmachiarii",
      club: "Real Oviedo",
      fundacion: 1994,
      ubicacion: "Fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/13-symmachiarii.png",
      stadium: ""
    },
    {
      id: 13,
      agrupacion: "Indar Gorri",
      club: "CA Osasuna",
      fundacion: 1987,
      ubicacion: "Grada baja del fondo sur",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/14-indar.png",
      stadium: ""
    },
    {
      id: 14,
      agrupacion: "Bultza",
      club: "Real Sociedad",
      fundacion: 2018,
      ubicacion: "Fondo sur",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/15-bultzada.png",
      stadium: ""
    },
    {
      id: 15,
      agrupacion: "Herri Norte Taldea",
      club: "Athletic Club",
      fundacion: 1982,
      ubicacion: "Fondo norte",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/16-herri-norte.png",
      stadium: ""
    },
    {
      id: 16,
      agrupacion: "Ghetto 28",
      club: "CD Leganés",
      fundacion: 2009,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/17-ghetto.png",
      stadium: ""
    },
    {
      id: 17,
      agrupacion: "Riazor Blues",
      club: "RC Deportivo",
      fundacion: 1987,
      ubicacion: "Zona central del fondo norte",
      ideologia: "Nacionalistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/18-riazor.png",
      stadium: ""
    },
    {
      id: 18,
      agrupacion: "Ligallo Fondo Norte",
      club: "Real Zaragoza",
      fundacion: 1986,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/19-ligallo.png",
      stadium: ""
    },
    {
      id: 19,
      agrupacion: "Avispero Real Zaragoza",
      club: "Real Zaragoza",
      fundacion: 2010,
      ubicacion: "",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/20-avispero.png",
      stadium: ""
    },
    {
      id: 20,
      agrupacion: "Ultra Boys",
      club: "Sporting de Gijón",
      fundacion: 1981,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/21-ultraboys.png",
      stadium: ""
    },
    {
      id: 21,
      agrupacion: "Curva Sur Granada",
      club: "Granada CF",
      fundacion: 2022,
      ubicacion: "Curva sur del fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/22-curva-sur.png",
      stadium: ""
    },
    {
      id: 22,
      agrupacion: "Juventudes Verdiblancas",
      club: "Racing de Santander",
      fundacion: 1986,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/23-juventudes.png",
      stadium: ""
    },
    {
      id: 23,
      agrupacion: "Resaca Castellana",
      club: "Burgos CF",
      fundacion: 1997,
      ubicacion: "Fondo sur",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/24-resaca.png",
      stadium: ""
    },
    {
      id: 24,
      agrupacion: "Brigadas Amarillas",
      club: "Cádiz CF",
      fundacion: 1982,
      ubicacion: "Fondo sur",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/25-brigadas.png",
      stadium: ""
    },
    {
      id: 25,
      agrupacion: "Brigadas Blanquiverdes",
      club: "Córdoba CF",
      fundacion: 1993,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/26-brigadas-blanquiverdes.png",
      stadium: ""
    },
    {
      id: 26,
      agrupacion: "Grada Joven",
      club: "UD Almería",
      fundacion: 2009,
      ubicacion: "Fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/27-grada-joven.png",
      stadium: ""
    },
    {
      id: 27,
      agrupacion: "Ultra Naciente",
      club: "UD Las Palmas",
      fundacion: 1985,
      ubicacion: "Curva del fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/28-ultra.png",
      stadium: ""
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
      stadium: pop.querySelector('#pop-stadium')
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
      els.agrupacion.textContent = data.agrupacion ?? "—";
      els.club.textContent = data.club ?? "—";
      els.fundacion.textContent = data.fundacion ?? "—";
      els.ideologia.textContent = data.ideologia ?? "—";
      els.ubicacion.textContent = data.ubicacion ?? "—";

      els.logo.src = data.logo;
      els.stadium.src = data.stadium;
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

    window.addEventListener("scroll", () => {
      if(activeId && !mqMobile.matches){
        closePopover();
      }
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

      gsap.set(img, { yPercent: -50 });
      gsap.to(img, {
        yPercent: 50,
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

  // NOTE: Animacion 01
  function initAnim01() {
    const imgs = gsap.utils.toArray('.anim-01 img');
    if (!imgs.length) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".anim-01",
        start: "top 50%",
        toggleActions: "play none none none"
      }
    });

    tl.from(imgs[0], {
      opacity: 0,
      x: -80,
      rotate: -90,
      duration: 0.5,
      ease: "power2.out"
    })
      .from(imgs[1], {
        opacity: 0,
        y: 80,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.4")
      .from(imgs[2], {
        opacity: 0,
        x: 80,
        rotate: 90,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.4")
      .from(imgs[3], {
        opacity: 0,
        y: 80,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.4")
      .from(imgs[4], {
        opacity: 0,
        scale: 0.2,
        duration: 0.5,
        ease: "back.out(2)"
      }, "-=0.4")
      .to(imgs[4], {
        x: -6,
        duration: 0.05,
        repeat: 5,
        yoyo: true
      });
  }

  function initAll() {
    initMoveEls('.v-a-s-t', '.v-ath--t1');
    initMapPopovers();
    initMapAnimation();
    initSumarioAnimation();
    initParallax();
    initAnim01();
  }

  document.addEventListener('DOMContentLoaded', initAll);
})();