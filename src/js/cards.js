export function initCards() {
  const url = 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/02/13/especial_rediseno';
  const ITEMS_PER_LOAD = 8;

  let articles = [];
  let currentIndex = 0;
  let isLoading = false;

  const grid = document.querySelector('.v-g');
  const loadMoreBtn = document.getElementById('more-articles');

  if (!grid || !loadMoreBtn) return;

  fetch(`${url}/data/articles.json`)
    .then(res => res.json())
    .then(data => {
      articles = data;
      renderNext(false);
    })
    .catch(err => console.error(err));

  function renderNext(shouldScroll = true) {
    if (isLoading) return;
    isLoading = true;

    loadMoreBtn.classList.add('is-load');

    const slice = articles.slice(currentIndex, currentIndex + ITEMS_PER_LOAD);

    slice.forEach(article => {
      const col = document.createElement('div');
      col.className = 'v-g__c';

      const card = document.createElement('article');
      card.className = 'v-a v-a--crd';

      card.innerHTML = `
        <div class="v-a-img-c">
          <figure class="v-a-fig">
            <a href="${article.url}" class="v-a-lnk">
              <img
                class="v-a-img"
                loading="lazy"
                src="${url}/images/${article.media}"
                alt="${article.titular}"
              >
            </a>
          </figure>
        </div>
        <div class="v-a-inf-c">
          <p class="v-a-p-t">
            <span class="v-a-p-t__p">${article.ano}</span>
          </p>
          <h2 class="v-a-t">
            <a href="${article.url}" title="${article.titular}">
              ${article.titular}
            </a>
          </h2>
          <p class="v-a-s-t">
            ${article.fecha} · ${article.autor}
          </p>
        </div>
      `;

      col.appendChild(card);
      grid.appendChild(col);
    });

    currentIndex += ITEMS_PER_LOAD;

    if (shouldScroll) {
      grid.lastElementChild?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    loadMoreBtn.classList.remove('is-load');
    isLoading = false;

    if (currentIndex >= articles.length) {
      loadMoreBtn.parentElement.style.display = 'none';
    }
  }

  loadMoreBtn.addEventListener('click', () => renderNext(true));
}
