import observeInView from "../helpers/observeInView";

const PLAYERS_DATA = {
  defaults: {
    left: "messi",
    right: "riquelme",
  },
  players: [
    {
      id: "messi",
      name: "Lionel Messi",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-lionel-messi.webp",
      position: "Delantero / Mediocentro ofensivo",
      titles: "Copa América (2), Finalissima y Mundial",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-lionel-messi.webp",
      stats: {
        matches: { value: 31, percent: 15 },
        minutes: { value: 2932, percent: 28 },
        goals: { value: 20, percent: 20 },
        goalsPer90: { value: 0.61, percent: 35 },
        goalsAfter80: { value: 25, percent: 18 },
        teamGoalsOnPitch: { value: 56, percent: 25 },
      },
    },
    {
      id: "riquelme",
      name: "Juan Román Riquelme",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-juan-roman-riquelme.webp",
      position: "Mediapunta",
      titles: "Oro JJOO 2008",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-juan-roman-riquelme.webp",
      stats: {
        matches: { value: 5, percent: 15 },
        minutes: { value: 449, percent: 28 },
        goals: { value: 0, percent: 20 },
        goalsPer90: { value: 0, percent: 35 },
        goalsAfter80: { value: 0, percent: 18 },
        teamGoalsOnPitch: { value: 10, percent: 25 },
      },
    },
    {
      id: "rojas",
      name: "Alfredo Rojas",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-alfredo-rojas.webp",
      position: "Delantero Centro",
      titles: "0",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-alfredo-rojas.webp",
      stats: {
        matches: { value: 1, percent: 15 },
        minutes: { value: 90, percent: 28 },
        goals: { value: 0, percent: 20 },
        goalsPer90: { value: 0, percent: 35 },
        goalsAfter80: { value: 0, percent: 18 },
        teamGoalsOnPitch: { value: 1, percent: 25 },
      },
    },
    {
      id: "sanfilippo",
      name: "José Sanfilippo",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-jose-sanfilippo.webp",
      position: "Delantero Centro",
      titles: "0",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-jose-sanfilippo.webp",
      stats: {
        matches: { value: 2, percent: 15 },
        minutes: { value: 180, percent: 28 },
        goals: { value: 1, percent: 20 },
        goalsPer90: { value: 0.5, percent: 35 },
        goalsAfter80: { value: 100, percent: 18 },
        teamGoalsOnPitch: { value: 2, percent: 25 },
      },
    },
    {
      id: "rattin",
      name: "Antonio Rattín",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-antonio-rattin.webp",
      position: "Pivote / Centrocampista",
      titles: "0",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-antonio-rattin.webp",
      stats: {
        matches: { value: 4, percent: 15 },
        minutes: { value: 304, percent: 28 },
        goals: { value: 0, percent: 20 },
        goalsPer90: { value: 0, percent: 35 },
        goalsAfter80: { value: 0, percent: 18 },
        teamGoalsOnPitch: { value: 4, percent: 25 },
      },
    },
    {
      id: "heredia",
      name: "Ramón Heredia",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-ramon-heredia.webp",
      position: "Defensa y Centrocampista",
      titles: "0",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-ramon-heredia.webp",
      stats: {
        matches: { value: 6, percent: 15 },
        minutes: { value: 540, percent: 28 },
        goals: { value: 1, percent: 20 },
        goalsPer90: { value: 0.17, percent: 35 },
        goalsAfter80: { value: 0, percent: 18 },
        teamGoalsOnPitch: { value: 9, percent: 25 },
      },
    },
    {
      id: "kempes",
      name: "Mario Alberto Kempes",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-mario-alberto-kempes.webp",
      position: "Delantero Centro",
      titles: "Mundial",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-mario-alberto-kempes.webp",
      stats: {
        matches: { value: 7, percent: 15 },
        minutes: { value: 660, percent: 28 },
        goals: { value: 6, percent: 20 },
        goalsPer90: { value: 0.82, percent: 35 },
        goalsAfter80: { value: 16.67, percent: 18 },
        teamGoalsOnPitch: { value: 15, percent: 25 },
      },
    },
    {
      id: "maradona",
      name: "Diego Armando Maradona",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-diego-armando-maradona.webp",
      position: "Mediapunta / Delantero",
      titles: "Mundial",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-diego-armando-maradona.webp",
      stats: {
        matches: { value: 21, percent: 15 },
        minutes: { value: 1936, percent: 28 },
        goals: { value: 8, percent: 20 },
        goalsPer90: { value: 0.37, percent: 35 },
        goalsAfter80: { value: 0, percent: 18 },
        teamGoalsOnPitch: { value: 31, percent: 25 },
      },
    },
    {
      id: "ortega",
      name: "Ariel Ortega",
      image: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/player-ariel-ortega.webp",
      position: "Mediapunta / Delantero",
      titles: "0",
      pitchZones: "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images/campo-ariel-ortega.webp",
      stats: {
        matches: { value: 8, percent: 15 },
        minutes: { value: 707, percent: 28 },
        goals: { value: 2, percent: 20 },
        goalsPer90: { value: 0.41, percent: 35 },
        goalsAfter80: { value: 0, percent: 18 },
        teamGoalsOnPitch: { value: 12, percent: 25 },
      },
    },
  ],
};

const PLAYERS = PLAYERS_DATA.players;
const DEFAULTS = PLAYERS_DATA.defaults;

function getPlayer(id) {
  return PLAYERS.find((player) => player.id === id);
}

function getStatValue(player, key) {
  const stat = player?.stats?.[key];

  if (stat && typeof stat === "object") return Number(stat.value) || 0;

  return Number(stat) || 0;
}

function getStatPercent(key) {
  for (const player of PLAYERS) {
    const percent = Number(player.stats?.[key]?.percent);

    if (Number.isFinite(percent)) return percent / 100;
  }

  return 0.15;
}

const STAT_SCALE = ["matches", "minutes", "goals", "goalsPer90", "goalsAfter80", "teamGoalsOnPitch"].reduce(
  (scales, key) => {
    const max = PLAYERS.reduce((current, player) => {
      const value = getStatValue(player, key);
      return value > current ? value : current;
    }, 0);

    scales[key] = Math.max(max * (1 + getStatPercent(key)), 1);
    return scales;
  },
  {}
);

function formatStat(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return String(value ?? "");

  if (!Number.isInteger(number)) {
    return number.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return number.toLocaleString("es-AR");
}

function setImage(img, src, alt = "") {
  if (!img) return;

  img.alt = alt;

  if (src) {
    img.src = src;
    img.hidden = false;
  } else {
    img.removeAttribute("src");
    img.hidden = true;
  }
}

export default function playersComparison() {
  const root = document.querySelector(".v-n-players-comparison");
  if (!root || PLAYERS.length < 2) return;

  const sides = {
    left: root.querySelector(".player-left"),
    right: root.querySelector(".player-right"),
  };

  if (!sides.left || !sides.right) return;

  const selected = {
    left: getPlayer(DEFAULTS.left) ? DEFAULTS.left : PLAYERS[0].id,
    right: getPlayer(DEFAULTS.right) ? DEFAULTS.right : PLAYERS[1].id,
  };

  populateSelects();
  syncSelectState();
  renderPlayer("left");
  renderPlayer("right");
  renderStats();
  bindSelects();
  window.addEventListener("resize", () => {
    syncPositionHeights();
    requestAnimationFrame(() => renderStats());
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      renderStats();
      syncPositionHeights();
    });
  }

  observeInView({
    target: root,
    threshold: 0.5,
    once: true,
    onEnter: animateBars,
  });

  function sideSelect(side) {
    return root.querySelector(`.v-slc[data-side="${side}"]`);
  }

  function populateSelects() {
    Object.keys(sides).forEach((side) => {
      const list = sideSelect(side)?.querySelector(".v-slc__u");
      if (!list) return;

      list.innerHTML = PLAYERS.map(
        (player) => `
          <li class="v-slc__l">
            <button class="v-slc__a" type="button" data-player-id="${player.id}">${player.name}</button>
          </li>
        `
      ).join("");
    });
  }

  function syncSelectState() {
    ["left", "right"].forEach((side) => {
      const other = side === "left" ? "right" : "left";

      sideSelect(side)?.querySelectorAll("[data-player-id]").forEach((button) => {
        const id = button.dataset.playerId;
        const isSelected = id === selected[side];
        const isTaken = id === selected[other];

        button.classList.toggle("is-selected", isSelected);
        button.classList.toggle("is-taken", isTaken);
        button.disabled = isSelected || isTaken;
      });
    });
  }

  function bindSelects() {
    ["left", "right"].forEach((side) => {
      const list = sideSelect(side)?.querySelector(".v-slc__u");
      if (!list) return;

      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-player-id]");
        if (!button || button.disabled) return;

        const id = button.dataset.playerId;
        const other = side === "left" ? "right" : "left";

        if (id === selected[side] || id === selected[other]) return;

        selected[side] = id;
        const label = sideSelect(side)?.querySelector(".v-slc__t");
        if (label) label.textContent = getPlayer(id).name;

        syncSelectState();
        renderPlayer(side);
        renderStats(side, true);
      });
    });
  }

  function renderPlayer(side) {
    const player = getPlayer(selected[side]);
    const el = sides[side];
    const position = el.querySelector(".player-position__value");

    setImage(el.querySelector(".player-img img"), player.image, player.name);
    setImage(el.querySelector(".player-pitch"), player.pitchZones, `Posición de ${player.name}`);

    if (position) position.textContent = player.position || "";
    syncPositionHeights();
  }

  function syncPositionHeights() {
    const values = [...root.querySelectorAll(".player-position__value")];

    values.forEach((el) => {
      el.style.minHeight = "";
    });

    const max = values.reduce((height, el) => Math.max(height, el.offsetHeight), 0);

    values.forEach((el) => {
      el.style.minHeight = max ? `${max}px` : "";
    });
  }

  function renderStats(side, animate = false) {
    const left = getPlayer(selected.left);
    const right = getPlayer(selected.right);

    const titlesRow = root.querySelector('.stat-row[data-stat="titles"]');
    if (titlesRow) {
      if (!side || side === "left") {
        const leftText = titlesRow.querySelector(".stat-row__text--left");
        if (leftText) leftText.textContent = left.titles || "";
      }
      if (!side || side === "right") {
        const rightText = titlesRow.querySelector(".stat-row__text--right");
        if (rightText) rightText.textContent = right.titles || "";
      }
    }

    root.querySelectorAll(".stat-row--bar").forEach((row) => {
      const key = row.dataset.stat;
      const max = STAT_SCALE[key] || 1;

      if (!side || side === "left") {
        setBar(row.querySelector(".stat-bar--left"), getStatValue(left, key), max, animate);
      }

      if (!side || side === "right") {
        setBar(row.querySelector(".stat-bar--right"), getStatValue(right, key), max, animate);
      }
    });
  }

  function setBar(bar, value, max, animate) {
    if (!bar) return;

    const fill = bar.querySelector(".stat-bar__fill");
    const valueEl = bar.querySelector(".stat-bar__value");
    const percent = (value / max) * 100;

    const scale = percent / 100;
    const isZero = value === 0;

    if (valueEl) valueEl.textContent = formatStat(value);
    if (!fill) return;

    bar.classList.toggle("is-zero", isZero);
    bar.style.setProperty("--bar", String(scale));

    if (animate) fill.style.transform = `scaleX(${scale})`;

    placeValue(bar, scale, isZero);
    requestAnimationFrame(() => placeValue(bar, scale, isZero));
  }

  function placeValue(bar, scale, isZero) {
    const valueEl = bar.querySelector(".stat-bar__value");
    if (!valueEl) return;

    if (!bar.offsetWidth) return;

    const fillWidth = bar.offsetWidth * scale;
    // Margen amplio: en móvil la barra de 1 unidad no cubre el número y se sale.
    bar.classList.toggle("is-outside", !isZero && fillWidth < valueEl.offsetWidth + 40);
  }

  function animateBars() {
    renderStats(undefined, true);
  }
}
