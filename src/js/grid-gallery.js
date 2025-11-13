// grid-gallery.js
import { animateFlipToYear } from './flip-gallery.js';

export async function gridGallery(galleryElement) {
  // --- REUBICAR TICK + FEATURE SEGÚN ANCHO ---
  function setupStickyWrapper(galleryEl) {
    const isMobile = window.matchMedia("(max-width: 699px)").matches;

    const stk = galleryEl.querySelector(".grid-gallery__stk");        // wrapper sticky en mobile
    const tick = galleryEl.querySelector(".grid-gallery-tick");       // contador flip
    const feature = galleryEl.querySelector(".grid-gallery-feature"); // panel destacado

    const containerGallery = galleryEl.querySelector(".grid-gallery__c");

    if (!stk || !tick || !feature || !containerGallery) return;

    //
    // 📱 MOBILE → mover dentro de grid-gallery__stk
    //
    if (isMobile) {
      if (!stk.contains(tick)) stk.appendChild(tick);
      if (!stk.contains(feature)) stk.appendChild(feature);
      return;
    }

    //
    // 🖥 DESKTOP → restaurar posiciones originales
    //

    // 1) tick → vuelve a la raíz de .grid-gallery (justo después de la apertura)
    if (stk.contains(tick)) {
      galleryEl.insertBefore(tick, galleryEl.children[1]); 
      // children[0] es .grid-gallery__stk, así que lo ponemos detrás
    }

    // 2) feature → vuelve dentro de grid-gallery__c
    if (stk.contains(feature)) {
      containerGallery.appendChild(feature);
    }
  }

  window.addEventListener("resize", () => setupStickyWrapper(galleryElement));

  const category = galleryElement.dataset.category; // "movies" | "music"
  const url = new URL(`./json/data-${category}.json`, import.meta.url);
  const containerGallery = galleryElement.querySelector('.grid-gallery__c');

  try {
    const response = await fetch(url);
    const items = await response.json();

    // Elements inside feature
    const feature = containerGallery.querySelector('.grid-gallery-feature');

    const featureImg = feature.querySelector('#feature-img') || null;
    const featureTitle = feature.querySelector('#feature-title') || null;
    const featureSubtitle = feature.querySelector('#feature-subtitle') || null;
    const featureDesc = feature.querySelector('#feature-desc') || null;

    // Spotify iframe (only exists in songs)
    const featureSpotify = feature.querySelector('#feature-spotify') || null;

    // 🎨 Create thumbnails dynamically
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

    // ⭐ Mover elementos sticky (solo mobile) — hacerlo AHORA que feature ya está en el DOM
    setupStickyWrapper(galleryElement);

    // 🧩 Update the feature panel
    function updateFeature(slug) {
      const item = items.find(i => i.slug === slug);
      if (!item) return;

      // Fade-out
      feature.classList.add("fade-out");
      feature.classList.remove("fade-in");

      setTimeout(() => {

        //
        // 🎬 MOVIES
        //
        if (featureImg) {
          featureImg.src = item.img;
          featureImg.alt = item.title;
        }
        if (featureTitle) featureTitle.textContent = item.title || "";
        if (featureSubtitle) featureSubtitle.textContent = item.subtitle || "";
        if (featureDesc) featureDesc.textContent = item.desc || "";

        //
        // 🎵 SONGS — iframe sin glitch
        if (featureSpotify && item.embed) {
          const loader = document.getElementById("feature-loader");

          // Mostrar loader, ocultar iframe
          loader.style.display = "block";
          featureSpotify.style.opacity = "0";

          // Actualizar la URL
          featureSpotify.src = item.embed;

          // Cuando cargue
          featureSpotify.onload = () => {
            loader.style.display = "none";
            featureSpotify.style.opacity = "1";
          };
        }

        // Fade-in
        feature.classList.remove("fade-out");
        feature.classList.add("fade-in");

      }, 100);

      // 🎞️ Flip animation
      if (item.year) animateFlipToYear(category, item.year);
    }

    // 🖱️ Click listeners
    containerGallery.querySelectorAll('.grid-gallery-thumb').forEach(thumb => {
      const slug = thumb.dataset.item;
      thumb.addEventListener('click', () => updateFeature(slug));
    });

    // 🚀 Initial load
    if (items.length > 0) updateFeature(items[0].slug);

  } catch (err) {
    console.error(`Error cargando galería (${category}):`, err);
  }
}
