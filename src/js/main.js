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
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-frente-atletico.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-frente-atletico.jpg"
    },
    {
      id: 2,
      agrupacion: "Suburbios Firm",
      club: "Atlético de Madrid",
      fundacion: null,
      ubicacion: "",
      ideologia: "Neonazis",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-suburbios-firm.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-suburbios-firm.jpg"
    },
    {
      id: 3,
      agrupacion: "Ultras Sur",
      club: "Real Madrid",
      fundacion: 1980,
      ubicacion: "",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-ultras-sur.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-ultras-sur.jpg"
    },
    {
      id: 4,
      agrupacion: "Frente Bokerón",
      club: "Málaga CF",
      fundacion: 1986,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-frente-bokeron.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-frente-bokeron.jpg"
    },
    {
      id: 5,
      agrupacion: "Biris Norte",
      club: "Sevilla FC",
      fundacion: 1975,
      ubicacion: "Fondo norte",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-biris-norte.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-biris-norte.jpg"
    },
    {
      id: 6,
      agrupacion: "Boixos Nois",
      club: "FC Barcelona",
      fundacion: 1981,
      ubicacion: "Fondo norte",
      ideologia: "Independentistas de extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-boixos-nois.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-boixos-nois.jpg"
    },
    {
      id: 7,
      agrupacion: "Supporters Gol Sur",
      club: "Real Betis",
      fundacion: 1986,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-supporters-gol-sur.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-supporters-gol-sur.jpg"
    },
    {
      id: 8,
      agrupacion: "United Family",
      club: "Real Betis",
      fundacion: 2011,
      ubicacion: "Fondo sur",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-united-family.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-united-family.jpg"
    },
    {
      id: 9,
      agrupacion: "Tropas de Breogán",
      club: "CD Lugo",
      fundacion: 2016,
      ubicacion: "Curva norte",
      ideologia: "Nacionalistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-tropas-de-breogan.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-tropas-de-breogan.jpg"
    },
    {
      id: 10,
      agrupacion: "Curva RCDE",
      club: "RCD Espanyol",
      fundacion: 2002,
      ubicacion: "Se sitúan en el gol de Cornellá",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-curva-rcde.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-curva-rcde.jpg"
    },
    {
      id: 11,
      agrupacion: "Bukaneros",
      club: "Rayo Vallecano",
      fundacion: 1992,
      ubicacion: "Se sitúan en el único fondo que hay",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-bukaneros.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-bukaneros.jpg"
    },
    {
      id: 12,
      agrupacion: "Symmachiarii",
      club: "Real Oviedo",
      fundacion: 1994,
      ubicacion: "Fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-symmachiarii.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-symmachiarii.jpg"
    },
    {
      id: 13,
      agrupacion: "Indar Gorri",
      club: "CA Osasuna",
      fundacion: 1987,
      ubicacion: "Grada baja del fondo sur",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-indar-gorri.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-indar-gorri.jpg"
    },
    {
      id: 14,
      agrupacion: "Bultza",
      club: "Real Sociedad",
      fundacion: 2018,
      ubicacion: "Fondo sur",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-bultza.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-bultza.jpg"
    },
    {
      id: 15,
      agrupacion: "Herri Norte Taldea",
      club: "Athletic Club",
      fundacion: 1982,
      ubicacion: "Fondo norte",
      ideologia: "Independentistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-herri-norte-taldea.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-herri-norte-taldea.jpg"
    },
    {
      id: 16,
      agrupacion: "Ghetto 28",
      club: "CD Leganés",
      fundacion: 2009,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-ghetto-28.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-ghetto-28.jpg"
    },
    {
      id: 17,
      agrupacion: "Riazor Blues",
      club: "RC Deportivo",
      fundacion: 1987,
      ubicacion: "Zona central del fondo norte",
      ideologia: "Nacionalistas de extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-riazor-blues.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-riazor-blues.jpg"
    },
    {
      id: 18,
      agrupacion: "Ligallo Fondo Norte",
      club: "Real Zaragoza",
      fundacion: 1986,
      ubicacion: "Fondo norte",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-ligallo-fondo-norte.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-ligallo-fondo-norte.jpg"
    },
    {
      id: 19,
      agrupacion: "Avispero Real Zaragoza",
      club: "Real Zaragoza",
      fundacion: 2010,
      ubicacion: "",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-avispero-real-zaragoza.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-avispero-real-zaragoza.jpg"
    },
    {
      id: 20,
      agrupacion: "Ultra Boys",
      club: "Sporting de Gijón",
      fundacion: 1981,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-ultra-boys.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-ultra-boys.jpg"
    },
    {
      id: 21,
      agrupacion: "Curva Sur Granada",
      club: "Granada CF",
      fundacion: 2022,
      ubicacion: "Curva sur del fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-curva-sur-granada.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-curva-sur-granada.jpg"
    },
    {
      id: 22,
      agrupacion: "Juventudes Verdiblancas",
      club: "Racing de Santander",
      fundacion: 1986,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-juventudes-verdiblancas.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-juventudes-verdiblancas.jpg"
    },
    {
      id: 23,
      agrupacion: "Resaca Castellana",
      club: "Burgos CF",
      fundacion: 1997,
      ubicacion: "Fondo sur",
      ideologia: "Extrema izquierda",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-resaca-castellana.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-resaca-castellana.jpg"
    },
    {
      id: 24,
      agrupacion: "Brigadas Amarillas",
      club: "Cádiz CF",
      fundacion: 1982,
      ubicacion: "Fondo sur",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-brigadas-amarillas.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-brigadas-amarillas.jpg"
    },
    {
      id: 25,
      agrupacion: "Brigadas Blanquiverdes",
      club: "Córdoba CF",
      fundacion: 1993,
      ubicacion: "Fondo sur",
      ideologia: "Extrema derecha",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-brigadas-blanquiverdes.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-brigadas-blanquiverdes.jpg"
    },
    {
      id: 26,
      agrupacion: "Grada Joven",
      club: "UD Almería",
      fundacion: 2009,
      ubicacion: "Fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-grada-joven.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-grada-joven.jpg"
    },
    {
      id: 27,
      agrupacion: "Ultra Naciente",
      club: "UD Las Palmas",
      fundacion: 1985,
      ubicacion: "Curva del fondo norte",
      ideologia: "",
      logo: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/logo/logo-ultra-naciente.jpg",
      stadium: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/03/08/grupos-ultra/images/stadium/stadium-ultra-naciente.jpg"
    }
  ];
  const MAP_INDEX = Object.fromEntries(
    MAP_DATA.map(item => [item.id, item])
  );
  function initMapPopovers() {
    const map = document.querySelector('.n-map-pop');
    if (!map) return;

    const dots = map.querySelectorAll('.n-map-pop__dot');
    const pop = document.getElementById('map-popover');
    if (!pop) return;

    const elAgrupacion = pop.querySelector('#pop-agrupacion');
    const elClub = pop.querySelector('#pop-club');
    const elFundacion = pop.querySelector('#pop-fundacion');
    const elIdeologia = pop.querySelector('#pop-ideologia');
    const elUbicacion = pop.querySelector('#pop-ubicacion');
    const elLogo = pop.querySelector('#pop-logo');
    const elStadium = pop.querySelector('#pop-stadium');

    function closeAll() {
      pop.hidePopover?.();
      dots.forEach(dot => dot.setAttribute('aria-expanded', 'false'));
      document.body.classList.remove('is-overflow');
    }

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();

        const id = Number(dot.dataset.id);
        const data = MAP_INDEX[id];
        if (!data) return;

        const isOpen = pop.matches(':popover-open');
        const currentAnchor = pop.style.positionAnchor;

        if (isOpen && currentAnchor === `--dot${id}`) {
          closeAll();
          return;
        }

        closeAll();

        elAgrupacion.textContent = data.agrupacion || "—";
        elClub.textContent = data.club || "—";
        elFundacion.textContent = data.fundacion || "—";
        elIdeologia.textContent = data.ideologia || "—";
        elUbicacion.textContent = data.ubicacion || "—";

        elLogo.src = data.logo;
        elStadium.src = data.stadium;

        pop.style.positionAnchor = `--dot${id}`;

        const rect = dot.getBoundingClientRect();

        pop.classList.remove('is-left', 'is-right');
        if (rect.left > window.innerWidth / 2) {
          pop.classList.add('is-left');
        } else {
          pop.classList.add('is-right');
        }

        if (window.matchMedia("(max-width: 699px)").matches) {
          map.scrollIntoView({ behavior: "smooth", block: "center" });
          document.body.classList.add('is-overflow');
        }
        pop.showPopover();
        dot.setAttribute('aria-expanded', 'true');

        pop.querySelector('.n-map-pop__card-close')?.focus();
      });
    });

    const closeBtn = pop.querySelector('.n-map-pop__card-close');
    if (closeBtn) closeBtn.addEventListener('click', closeAll);

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.n-map-pop__dot') &&
        !e.target.closest('#map-popover')) {
        closeAll();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
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

  function initAll() {
    initMoveEls('.v-a-s-t', '.v-ath--t1');
    initMapPopovers();
    initMapAnimation();
    initSumarioAnimation();
  }

  document.addEventListener('DOMContentLoaded', initAll);
})();