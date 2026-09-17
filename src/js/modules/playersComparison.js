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
      image: "./assets/images/player-lionel-messi.webp",
      position: "Delantero / mediapunta",
      titles: "Copa América (2), Finalissima y Mundial",
      pitchZones: "./assets/images/pitch-lionel-messi.webp",
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
      image: "./assets/images/player-juan-roman-riquelme.webp",
      position: "Mediapunta",
      titles: "Oro JJOO 2008",
      pitchZones: "./assets/images/pitch-juan-roman-riquelme.webp",
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
      id: "maradona",
      name: "Diego Armando Maradona",
      image: "./assets/images/player-diego-armando-maradona.webp",
      position: "Mediapunta",
      titles: "Mundial 1986",
      pitchZones: "./assets/images/pitch-diego-armando-maradona.webp",
      stats: {
        matches: { value: 21, percent: 15 },
        minutes: { value: 1890, percent: 28 },
        goals: { value: 8, percent: 20 },
        goalsPer90: { value: 0.38, percent: 35 },
        goalsAfter80: { value: 12, percent: 18 },
        teamGoalsOnPitch: { value: 28, percent: 25 },
      },
    },
    {
      id: "kempes",
      name: "Mario Alberto Kempes",
      image: "./assets/images/player-mario-alberto-kempes.webp",
      position: "Delantero",
      titles: "Mundial 1978",
      pitchZones: "./assets/images/pitch-mario-alberto-kempes.webp",
      stats: {
        matches: { value: 12, percent: 15 },
        minutes: { value: 1080, percent: 28 },
        goals: { value: 6, percent: 20 },
        goalsPer90: { value: 0.5, percent: 35 },
        goalsAfter80: { value: 8, percent: 18 },
        teamGoalsOnPitch: { value: 18, percent: 25 },
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
  renderPlayer("left");
  renderPlayer("right");
  renderStats();
  bindSelects();

  observeInView({
    target: root,
    threshold: 0.2,
    once: true,
    onEnter: animateBars,
  });

  function populateSelects() {
    Object.values(sides).forEach((sideEl) => {
      const list = sideEl.querySelector(".v-slc__u");
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

  function bindSelects() {
    ["left", "right"].forEach((side) => {
      const list = sides[side].querySelector(".v-slc__u");
      if (!list) return;

      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-player-id]");
        if (!button) return;

        const id = button.dataset.playerId;

        if (id === selected[side]) return;

        selected[side] = id;
        const label = sides[side].querySelector(".v-slc__t");
        if (label) label.textContent = getPlayer(id).name;

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

    if (valueEl) valueEl.textContent = formatStat(value);
    if (animate && fill) fill.style.transform = `scaleX(${percent / 100})`;
  }

  function animateBars() {
    renderStats(undefined, true);
  }
}
