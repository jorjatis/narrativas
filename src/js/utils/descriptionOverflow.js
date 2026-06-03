let updateFn = null;

export default function descriptionOverflow() {
  const itemDesc = document.querySelector('.item-desc');
  const itemLabelMain = document.querySelector('.item-label--main');
  const papaShadow = document.querySelector('.papa-shadow');
  const papaFig = document.querySelector('.papa-fig');

  if (!itemDesc) return null;

  let fakeTrack = itemDesc.querySelector('.item-desc__fake-track');
  let fakeThumb = itemDesc.querySelector('.item-desc__fake-thumb');

  if (!fakeTrack) {
    fakeTrack = document.createElement('div');
    fakeTrack.className = 'item-desc__fake-track';
    itemDesc.appendChild(fakeTrack);
  }
  if (!fakeThumb) {
    fakeThumb = document.createElement('div');
    fakeThumb.className = 'item-desc__fake-thumb';
    itemDesc.appendChild(fakeThumb);
  }

  function syncHeight() {
    const isDesktop = window.innerWidth >= 820;

    // SI ES ESCRITORIO: Limpiamos por completo el estilo inline y dejamos que fluya por CSS
    if (isDesktop) {
      itemDesc.style.maxHeight = ''; 
      return true;
    }

    // SI ES MÓVIL: Calculamos la altura límite según la ilustración de referencia
    const referenceElement = papaFig; 

    if (!referenceElement) {
      return false;
    }

    const referenceHeight = referenceElement.offsetHeight;
    itemDesc.style.maxHeight = `${referenceHeight}px`;
    return true;
  }

  function updateScrollbar() {
    const isDesktop = window.innerWidth >= 820;

    // Si estamos en escritorio, forzamos la desactivación de lógica interna de la barra
    if (isDesktop) {
      fakeTrack.style.opacity = '0';
      fakeThumb.style.opacity = '0';
      itemDesc.classList.remove('has-shadow-top', 'has-shadow-bottom');
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = itemDesc;

    // Si el contenido cabe entero en móvil, limpiamos todo de forma fluida
    if (scrollHeight <= clientHeight) {
      fakeTrack.style.opacity = '0';
      fakeThumb.style.opacity = '0';
      itemDesc.classList.remove('has-shadow-top', 'has-shadow-bottom');
      return;
    }

    fakeTrack.style.opacity = '1';
    fakeThumb.style.opacity = '1';

    const isAtTop = scrollTop < 2;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;

    if (!isAtTop) {
      itemDesc.classList.add('has-shadow-top');
    } else {
      itemDesc.classList.remove('has-shadow-top');
    }

    if (!isAtBottom) {
      itemDesc.classList.add('has-shadow-bottom');
    } else {
      itemDesc.classList.remove('has-shadow-bottom');
    }

    fakeTrack.style.height = `${clientHeight}px`;
    fakeTrack.style.transform = `translateY(${scrollTop}px)`;

    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 24);
    fakeThumb.style.height = `${thumbHeight}px`;

    const maxScroll = scrollHeight - clientHeight;
    const scrollPercent = scrollTop / maxScroll;
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = scrollTop + (scrollPercent * maxThumbTop);

    fakeThumb.style.transform = `translateY(${thumbTop}px)`;
  }

  function update(resetScroll = false) {
    const synced = syncHeight();

    if (!synced) return;

    if (resetScroll) {
      requestAnimationFrame(() => {
        itemDesc.scrollTop = 0;
        updateScrollbar();
      });
    } else {
      updateScrollbar();
    }
  }

  updateFn = update;

  itemDesc.addEventListener('scroll', updateScrollbar);
  
  // Al redimensionar la ventana, reseteamos el scroll a 0 para limpiar dimensiones viejas
  window.addEventListener('resize', () => update(true));

  let lastWidth = window.innerWidth;

  const resizeObserver = new ResizeObserver(() => {
    const currentWidth = window.innerWidth;
    
    if (currentWidth !== lastWidth) {
      lastWidth = currentWidth;
      // Damos 10ms para que el CSS aplique su layout responsive antes de que JS mida las alturas
      setTimeout(() => {
        update(true);
      }, 10);
    } else {
      update(false);
    }
  });

  resizeObserver.observe(itemDesc);
  if (papaShadow) resizeObserver.observe(papaShadow);
  if (papaFig) resizeObserver.observe(papaFig);

  update(true);

  return { update };
}

export function refreshDescriptionOverflow(resetScroll = false) {
  if (updateFn) {
    updateFn(resetScroll);
  }
}