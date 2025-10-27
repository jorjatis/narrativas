document.addEventListener("DOMContentLoaded", async () => {
  // -----------------------
  // MOVER COMPONENTE BARRA SOCIAL
  // -----------------------
  const paywallFirstItem = document.querySelector('.voc-d > .paywall > .voc-p');
  const authorDiv = document.querySelector('.voc-d > .voc-author');

  if (paywallFirstItem && authorDiv) {
    paywallFirstItem.insertAdjacentElement('afterend', authorDiv);
  }

  // -----------------------
  // RUTAS / CONFIG
  // -----------------------
  const BASE_PATH = "https://s1.abcstatics.com/comun/narrativas/redaccion/2025/10/29/vidas-rotas/";
  const CSV_URL = `${BASE_PATH}dana_people.csv`;

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // -----------------------
  // UTILIDADES NOMBRES / SLUGS
  // -----------------------
  function limpiarNombreSlug(rawName) {
    return rawName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/🟢|🔴/g, "")
      .replace(/-\s*hija del número\s*\d+\s*-/i, "")
      .replace(/-\s*.*-$/i, "")
      .trim();
  }

  function limpiarNombreVisible(rawName) {
    return rawName.replace(/🟢|🔴/g, "").trim();
  }

  function crearSlug(nombre = "") {
    return nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(/\s+/)
      .filter(p => !["de", "del", "de la", "de los", "de las", "la", "los", "las", "y"].includes(p))
      .join("-");
  }

  // -----------------------
  // PARSER CSV ROBUSTO
  // -----------------------
  function parseCSV(csvText) {
    const rows = [];
    const lines = csvText.split(/\r?\n/);

    for (let line of lines) {
      // ignorar líneas vacías totalmente
      if (!line) {
        rows.push([]);
        continue;
      }

      const row = [];
      let current = '';
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          // doble comilla escapada dentro de comillas -> añadir una comilla
          if (insideQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // saltar la segunda comilla
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim());
      rows.push(row);
    }
    return rows;
  }

  // -----------------------
  // CARGAR CSV Y PROCESAR DATOS
  // -----------------------
  async function fetchPeople() {
    const res = await fetch(CSV_URL);
    if (!res.ok) throw new Error(`No se pudo cargar CSV: ${res.status} ${res.statusText}`);
    const csvText = await res.text();
    const rows = parseCSV(csvText);

    const people = [];
    for (let i = 8; i < rows.length; i++) { // empiezas en la fila 9 (índice 8)
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const fotoFlag = (row[0] || "").toUpperCase();
      let nombreRaw = "";
      for (let col of row) {
        if (/^\d+\./.test((col || "").trim())) {
          nombreRaw = col.trim();
          break;
        }
      }
      if (!nombreRaw) continue;

      const match = nombreRaw.match(/^\d+\.\s*(.*)/);
      const nombreVisible = match ? limpiarNombreVisible(match[1]) : limpiarNombreVisible(nombreRaw);
      const nombreSlug = limpiarNombreSlug(nombreVisible);
      if (!nombreVisible) continue;

      const slug = crearSlug(nombreSlug);
      const numero = match ? match[0].split(".")[0] : "";
      let slugImg = nombreSlug.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      slugImg = slugImg.replace(/^_+|_+$/g, "");
      const imgBase = numero ? `${numero}_${slugImg}` : slugImg;
      const foto = (fotoFlag === "SI")
        ? `${BASE_PATH}images/fotos/${imgBase}.jpg`
        : `${BASE_PATH}images/no-photo.jpg`;

      // descripción en la columna 3 (índice 2) como antes
      let descRaw = row[2] || "";
      descRaw = descRaw
        .replace(/"\s*(.*?)\s*"/g, '«$1»')  // convierte "texto" en «texto»
        .replace(/''\s*(.*?)\s*''/g, '«$1»') // soporte por si vinieran dobles comillas simples
        .replace(/"\s*/g, '«')               // comilla inicial huérfana
        .replace(/\s*"/g, '»');              // comilla final huérfana
      const location = ""; // si hay otra columna para ubicación, mapear aquí

      people.push({ nombreVisible, slug, foto, desc: descRaw, location });
    }

    // orden personalizado
    people.sort((a, b) => {
      const preposiciones = ["de", "del", "de la", "de los", "de las", "la", "los", "las", "y", "da", "do", "das", "dos"];

      function obtenerClaveOrden(nombre) {
        const partes = nombre
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .split(/\s+/)
          .filter(p => p && !preposiciones.includes(p.toLowerCase()));

        const indiceSocol = partes.findIndex(p => p.toLowerCase() === "socol");
        if (indiceSocol !== -1) {
          return "Socol " + partes[0].toLowerCase();
        }

        // NUEVA LÓGICA: si hay sólo 2 o 3 palabras, usar la 2ª como primer apellido, si hay 4 o mas, la 3ª
        if (partes.length === 2) {
          return partes[1].toLowerCase();
        } else if (partes.length === 3) {
          return partes[1].toLowerCase();
        } else if (partes.length >= 4) {
          return partes[2].toLowerCase();
        } else {
          return partes[0].toLowerCase();
        }
      }

      const claveA = obtenerClaveOrden(a.nombreVisible);
      const claveB = obtenerClaveOrden(b.nombreVisible);
      return claveA.localeCompare(claveB, "es", { sensitivity: "base" });
    });

    return people;
  }

  // -----------------------
  // POPUP CONTROL
  // -----------------------
  const pop = qs(".v-spc-pop");
  const closeBtn = qs(".v-x", pop);

  const closePopover = () => {
    const img = qs("#pop-img", pop);
    const name = qs("#pop-name", pop);
    const loc = qs("#pop-loc", pop);
    const desc = qs("#pop-desc", pop);

    if (img) { img.src = ""; img.alt = ""; }
    if (name) name.textContent = "";
    if (loc) { loc.textContent = ""; loc.style.display = "none"; }
    if (desc) { desc.textContent = ""; }

    pop.id = "";
    if (closeBtn) closeBtn.setAttribute("popovertarget", "");
    document.body.classList.remove("is-overflow");
    pop.classList.remove("is-open");
    pop.style.display = "none";
  };

  if (closeBtn) closeBtn.addEventListener("click", closePopover);

  const openPopover = pop => {
    pop.style.display = "";
    pop.classList.add("is-open");
    document.body.classList.add("is-overflow");
  };

  document.addEventListener("click", (e) => {
    if (!pop) return;
    const insidePopover = pop.contains(e.target);
    const faceItem = e.target.closest(".v-spc-faces__itm");
    if (document.body.classList.contains("is-overflow") && !insidePopover && !faceItem) {
      closePopover();
    }
  });

  // -----------------------
  // INIT: render nombres, grid y popup
  // -----------------------
  async function init() {
    const loaders = qsa(".v-spc-loader");
    const namesContainer = qs(".v-spc-names");
    const grid = qs(".v-spc-faces-grid");

    loaders.forEach(loader => loader.style.display = "block");

    let people = [];
    try {
      people = await fetchPeople();
    } catch (err) {
      console.error("Error cargando CSV:", err);
      loaders.forEach(loader => loader.style.display = "none");
      return;
    }

    namesContainer.innerHTML = "";
    grid.innerHTML = "";

    // NOMBRES (lista)
    people.forEach((person, index) => {
      const span = document.createElement("span");
      span.textContent = index === people.length - 1 ? person.nombreVisible : person.nombreVisible + ", ";
      span.dataset.target = person.slug;
      namesContainer.appendChild(span);
    });

    // GRID DE FOTOS
    people.forEach(person => {
      const btn = document.createElement("button");
      btn.className = "v-spc-faces__itm is-hidden";
      btn.setAttribute("popovertarget", person.slug);

      btn.innerHTML = `
      <figure class="v-spc-faces__img">
        <img src="${person.foto}" alt="${person.nombreVisible}">
      </figure>
      <span class="v-spc-faces__name">${person.nombreVisible}</span>
    `;

      const descLimpia = person.desc?.trim();
      const tieneDescReal = descLimpia && !/^(-{3,}|\/{3,})\s*$/.test(descLimpia);

      if (tieneDescReal) {
        btn.addEventListener("click", () => {
          closePopover();
          pop.id = person.slug;
          if (closeBtn) closeBtn.setAttribute("popovertarget", person.slug);

          const imgEl = qs("#pop-img", pop);
          if (imgEl) { imgEl.src = person.foto; imgEl.alt = person.nombreVisible; }

          const nameEl = qs("#pop-name", pop);
          if (nameEl) nameEl.textContent = person.nombreVisible;

          const locSpan = qs("#pop-loc", pop);
          if (locSpan) {
            if (person.location && !/Ubicación no disponible/.test(person.location)) {
              locSpan.textContent = person.location;
              locSpan.style.display = "";
            } else {
              locSpan.textContent = "";
              locSpan.style.display = "none";
            }
          }

          const descEl = qs("#pop-desc", pop);
          if (descEl) descEl.textContent = descLimpia;
          openPopover(pop);
        });
      }

      grid.appendChild(btn);
    });
  
    // --- TARJETA EXTRA AL FINAL ---
    const extraBtn = document.createElement("button");
    extraBtn.className = "v-spc-faces__itm is-hidden";
    extraBtn.setAttribute("popovertarget", "victima-desconocida");

    extraBtn.innerHTML = `
      <figure class="v-spc-faces__img">
        <img src="${BASE_PATH}images/no-photo.jpg" alt="Víctimas sin identificar">
      </figure>
    `;

    extraBtn.addEventListener("click", () => {
      closePopover();
      pop.id = "victima-desconocida";
      closeBtn.setAttribute("popovertarget", "victima-desconocida");

      qs("#pop-img", pop).src = `${BASE_PATH}images/no-photo.jpg`;
      qs("#pop-name", pop).style.display = "none";
      qs("#pop-loc", pop).style.display = "none";

      qs("#pop-desc", pop).textContent =
        "Tras consultar el sumario y los registros de las asociaciones, hay dos fallecidos de los que se desconoce con claridad la identidad: son la víctima 108 y la 228. La víctima 237 es un británico de 71 años, que murió en el hospital de Alhaurín de la Torre (Málaga) tras ser rescatado en su casa con signos de hipotermia. Es la única víctima mortal registrada en Andalucía.";

      openPopover(pop);
    });

    grid.appendChild(extraBtn);

    // Esperar carga de imágenes
    await Promise.all(qsa("img", grid).map(img => new Promise(res => { img.onload = img.onerror = res; })));

    loaders.forEach(loader => loader.style.display = "none");
    
    // Función para obtener umbral y posición guía según tamaño de pantalla
    function getThreshold() {
      if (window.innerWidth <= 699) return 0.25; // mobile
      return 0.50; // desktop
    }

    // Observador de visibilidad
    const spans = qsa(".v-spc-names span");
    const namesBlock = qs(".v-spc-names");
    if (namesBlock) {
      if (spans.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            const threshold = getThreshold();
            if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
              console.log("Animación activada", entry.intersectionRatio);
              const totalDuration = 5000;
              const delayStep = totalDuration / spans.length;

              spans.sort(() => Math.random() - 0.5)
                .forEach((span, i) => setTimeout(() => span.classList.add("visible"), i * delayStep));

              obs.unobserve(namesBlock);
            }
          });
        }, { threshold: Array.from({length:101}, (_,i)=>i/100) }); // threshold fino de 0 a 1

        observer.observe(namesBlock);
      }
    }

    // Scroll a imagen desde nombre
    spans.forEach(span => {
      span.addEventListener("click", () => {
        const target = span.dataset.target;
        const el = qs(`.v-spc-faces__itm[popovertarget="${target}"]`);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("found");
        setTimeout(() => el.classList.remove("found"), 3000);
      });
    });

    // Animación grid
    qsa(".v-spc-faces__itm", grid).forEach((item, i) =>
      setTimeout(() => item.classList.remove("is-hidden"), i * 20)
    );
  }

  init();
});