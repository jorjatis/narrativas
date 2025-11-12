// grid-gallery.js
import { animateFlipToYear } from './flip-gallery.js';

export async function gridGallery(galleryElement) {
  const category = galleryElement.dataset.category; // "movies" | "music"
  const url = new URL(`./json/data-${category}.json`, import.meta.url);
  const containerGallery = galleryElement.querySelector('.grid-gallery__c');

  try {
    const response = await fetch(url);
    const items = await response.json();

    const feature = containerGallery.querySelector('.grid-gallery-feature');
    const featureImg = feature.querySelector('#feature-img');
    const featureTitle = feature.querySelector('#feature-title');
    const featureSubtitle = feature.querySelector('#feature-subtitle');
    const featureDesc = feature.querySelector('#feature-desc');

    // 🎨 Crear thumbnails dinámicamente
    items.forEach(item => {
      const thumbDiv = document.createElement('div');
      thumbDiv.classList.add('grid-gallery-thumb');
      thumbDiv.dataset.item = item.slug;

      const img = document.createElement('img');
      img.src = item.img;
      img.alt = item.title;

      thumbDiv.appendChild(img);
      containerGallery.insertBefore(thumbDiv, feature);
    });

    // 🧩 Actualizar la tarjeta destacada
    function updateFeature(slug) {
      const item = items.find(i => i.slug === slug);
      if (!item) return;

      featureImg.src = item.img;
      featureImg.alt = item.title;
      featureTitle.textContent = item.title;
      featureSubtitle.textContent = item.subtitle || "—";
      featureDesc.textContent = item.desc;

      // 🎞️ Animar flip correspondiente a esta galería
      if (item.year) animateFlipToYear(category, item.year);
    }

    // 🖱️ Clicks
    containerGallery.querySelectorAll('.grid-gallery-thumb').forEach(thumb => {
      const slug = thumb.dataset.item;
      thumb.addEventListener('click', () => updateFeature(slug));
    });

    // 🚀 Init
    if (items.length > 0) updateFeature(items[0].slug);

  } catch (err) {
    console.error(`Error cargando galería (${category}):`, err);
  }
}
