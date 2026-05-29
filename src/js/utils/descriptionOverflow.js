let updateFn = null;

export default function descriptionOverflow() {
  const itemDesc =
    document.querySelector('.item-desc');

  const itemDescContainer =
    document.querySelector(
      '.item-desc-c'
    );

  const papaFigure =
    document.querySelector('.papa-fig');

  const itemLabelMain =
    document.querySelector(
      '.item-label--main'
    );

  if (
    !itemDesc ||
    !itemDescContainer ||
    !papaFigure
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

  function hasOverflow(element) {
    return (
      element.scrollHeight >
      element.clientHeight
    );
  }

  function syncHeight() {
    const figureHeight =
      papaFigure.offsetHeight;

    const labelHeight =
      window.innerWidth >= 820
        ? itemLabelMain.offsetHeight + 32
        : 0;

    itemDesc.style.maxHeight =
      `${figureHeight - labelHeight}px`;
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

  function update() {
    syncHeight();

    requestAnimationFrame(() => {
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
    update
  );

  const resizeObserver =
    new ResizeObserver(update);

  resizeObserver.observe(itemDesc);

  update();

  return {
    update
  };
}

export function refreshDescriptionOverflow() {
  if (updateFn) {
    updateFn();
  }
}

function createDescriptionOverflowUI(
  container
) {
  const topShadow =
    document.createElement('div');

  topShadow.className =
    'item-desc__shadow item-desc__shadow--top';

  const bottomShadow =
    document.createElement('div');

  bottomShadow.className =
    'item-desc__shadow item-desc__shadow--bottom';

  const scrollHint =
    document.createElement('div');

  scrollHint.className =
    'item-desc__scroll-hint';

  scrollHint.setAttribute(
    'aria-hidden',
    'true'
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