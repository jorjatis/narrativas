let updateFn = null;

export default function descriptionOverflow() {
  const itemDesc =
    document.querySelector('.item-desc');

  const itemDescContainer =
    document.querySelector(
      '.item-desc-c'
    );

  const itemLabelMain =
    document.querySelector(
      '.item-label--main'
    );

  const papaShadow =
    document.querySelector(
      '.papa-shadow'
    );

  const papaFig =
    document.querySelector(
      '.papa-fig'
    );

  if (
    !itemDesc ||
    !itemDescContainer
  ) {
    return null;
  }

  const overflowUI =
    createDescriptionOverflowUI(
      itemDescContainer
    );

  const {
    topShadow,
    bottomShadow,
    scrollHint
  } = overflowUI;

  scrollHint.addEventListener(
    'click',
    () => {
      itemDesc.scrollTo({
        top: itemDesc.scrollHeight,
        behavior: 'smooth'
      });
    }
  );

  function hasOverflow(element) {
    return (
      element.scrollHeight >
      element.clientHeight
    );
  }

  function syncHeight() {
    const isDesktop =
      window.innerWidth >= 820;

    const referenceElement =
      isDesktop
        ? papaShadow
        : papaFig;

    if (!referenceElement) {
      return false;
    }

    const referenceHeight =
      referenceElement.offsetHeight;

    let maxHeight =
      referenceHeight;

    // NOTE:
    // Desktop/tablet:
    // descontamos el title
    if (isDesktop) {
      const labelHeight =
        itemLabelMain
          ? itemLabelMain.offsetHeight + 32
          : 0;

      maxHeight =
        referenceHeight - labelHeight;
    }

    itemDesc.style.maxHeight =
      `${maxHeight}px`;

    return true;
  }

  function updateUI() {
    const overflow =
      hasOverflow(itemDesc);

    if (!overflow) {
      topShadow.hidden = true;

      bottomShadow.hidden = true;

      scrollHint.hidden = true;

      return;
    }

    const scrollTop =
      itemDesc.scrollTop;

    const maxScroll =
      itemDesc.scrollHeight -
      itemDesc.clientHeight;

    const isTop =
      scrollTop <= 4;

    const isBottom =
      scrollTop >= maxScroll - 4;

    topShadow.hidden = isTop;

    bottomShadow.hidden = isBottom;

    scrollHint.hidden = !isTop;
  }

  function update(resetScroll = false) {
    const synced =
      syncHeight();

    if (!synced) {
      return;
    }

    requestAnimationFrame(() => {
      if (resetScroll) {
        itemDesc.scrollTop = 0;
      }

      updateUI();
    });
  }

  updateFn = update;

  itemDesc.addEventListener(
    'scroll',
    updateUI
  );

  window.addEventListener(
    'resize',
    () => update(true)
  );

  const resizeObserver =
    new ResizeObserver(() => {
      update();
    });

  resizeObserver.observe(itemDesc);

  if (papaShadow) {
    resizeObserver.observe(
      papaShadow
    );
  }

  if (papaFig) {
    resizeObserver.observe(
      papaFig
    );
  }

  update(true);

  return {
    update
  };
}

export function refreshDescriptionOverflow(
  resetScroll = false
) {
  if (updateFn) {
    updateFn(resetScroll);
  }
}

function createDescriptionOverflowUI(
  container
) {
  const topShadow =
    document.createElement('div');

  topShadow.className =
    'item-desc__shadow item-desc__shadow--top';

  topShadow.hidden = true;

  const bottomShadow =
    document.createElement('div');

  bottomShadow.className =
    'item-desc__shadow item-desc__shadow--bottom';

  bottomShadow.hidden = true;

  const scrollHint =
    document.createElement('button');

  scrollHint.className =
    'item-desc__scroll-hint';

  scrollHint.type = 'button';

  scrollHint.hidden = true;

  scrollHint.setAttribute(
    'aria-label',
    'Ver más contenido'
  );

  scrollHint.innerHTML = '↓';

  container.append(
    topShadow,
    bottomShadow,
    scrollHint
  );

  return {
    topShadow,
    bottomShadow,
    scrollHint
  };
}