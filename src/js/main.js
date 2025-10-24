document.addEventListener('DOMContentLoaded', () => {
  const chapters = [...document.querySelectorAll('.voc-d-c-chapter')];
  const video = document.querySelector(".video");

  // Asignar IDs si no los tienen
  chapters.forEach((el, index) => {
    if (!el.id) el.id = `zona-${index + 1}`;
  });

  // ---------------------------
  // VIDEO AUTO-PLAY
  // ---------------------------
  if (video) {
    let played = false;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting && !played) {
          video.muted = true;
          video.play().catch(err => console.log('Autoplay prevented:', err));
          played = true;
          obs.unobserve(video);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(video);
  }

  // Configuración del Intersection Observer
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.25 // Se activa cuando el 25% del elemento es visible
  };

  // Función para actualizar el estado activo
  function updateActiveState(zoneNumber) {
    // Actualizar navegación
    const navItems = document.querySelectorAll('.v-spc-nav li');
    navItems.forEach(item => {
      item.classList.remove('is-active');
      if (item.getAttribute('data-target') === `zona-${zoneNumber}`) {
        item.classList.add('is-active');
      }
    });

    // Actualizar mapa
    const map = document.querySelector('.v-spc-map');
    if (map) {
      // Remover todas las clases de zona anteriores
      map.className = map.className.replace(/v-spc-map--\d+/g, '').trim();
      // Añadir la nueva clase
      map.classList.add(`v-spc-map--${zoneNumber}`);
    }
  }

  // Objeto para rastrear qué zonas están visibles
  const visibleZones = new Set();

  // Callback del observer
  function handleIntersection(entries) {
    entries.forEach(entry => {
      // Extraer el número de zona del id (zona-1, zona-2, etc.)
      const zoneId = entry.target.id;
      const zoneNumber = zoneId.split('-')[1];

      if (entry.isIntersecting) {
        // Añadir la zona al conjunto de visibles
        visibleZones.add(parseInt(zoneNumber));
      } else {
        // Remover la zona del conjunto de visibles
        visibleZones.delete(parseInt(zoneNumber));
      }

      // Actualizar al número de zona más bajo que esté visible
      if (visibleZones.size > 0) {
        const lowestVisibleZone = Math.min(...Array.from(visibleZones));
        updateActiveState(lowestVisibleZone);
      }
    });
  }

  // Crear el observer
  const observer = new IntersectionObserver(handleIntersection, observerOptions);

  // Observar todos los chapters con id zona-*
  function initObserver() {
    const chapters = document.querySelectorAll('[id^="zona-"]');

    if (chapters.length === 0) {
      console.warn('No se encontraron elementos con id "zona-*"');
      return;
    }

    chapters.forEach(chapter => {
      observer.observe(chapter);
    });

    console.log(`Observer iniciado para ${chapters.length} zonas`);
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }

  // Opcional: Manejar clicks en la navegación para scroll suave
  document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.v-spc-nav a');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  });


  const toggleButton = document.querySelector('.v-spc-nav-tgl');
  const navList = document.querySelector('.v-spc-nav');

  toggleButton.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-active');
    toggleButton.setAttribute('aria-expanded', isOpen);
  });
});
