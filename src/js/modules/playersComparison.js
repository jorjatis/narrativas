import gsap from "gsap";
import observeInView from "../helpers/observeInView";

const STATS = [
  { key: "goals", label: "Goles" },
  { key: "assists", label: "Asistencias" },
  { key: "matches", label: "Partidos" },
  { key: "titles", label: "Títulos" },
  { key: "worldCups", label: "Mundiales" },
];

const PLAYERS = [
  {
    id: "messi",
    name: "Lionel Messi",
    image: "",
    stats: { goals: 112, assists: 58, matches: 191, titles: 8, worldCups: 1 },
  },
  {
    id: "maradona",
    name: "Diego Maradona",
    image: "",
    stats: { goals: 34, assists: 26, matches: 91, titles: 4, worldCups: 1 },
  },
  {
    id: "riquelme",
    name: "Juan Román Riquelme",
    image: "",
    stats: { goals: 17, assists: 24, matches: 51, titles: 3, worldCups: 0 },
  },
  {
    id: "ortega",
    name: "Ariel Ortega",
    image: "",
    stats: { goals: 17, assists: 12, matches: 87, titles: 2, worldCups: 0 },
  },
  {
    id: "aimar",
    name: "Pablo Aimar",
    image: "",
    stats: { goals: 8, assists: 10, matches: 52, titles: 2, worldCups: 0 },
  },
];

const DEFAULTS = {
  left: "messi",
  right: "riquelme",
};

function getPlayer(id) {
  return PLAYERS.find((player) => player.id === id);
}

function maxForStat(key) {
  return Math.max(...PLAYERS.map((player) => Number(player.stats[key]) || 0), 1);
}

export default function playersComparison() {
  const root = document.querySelector(".v-n-players-comparison");
  if (!root) return;

  const sides = {
    left: root.querySelector(".player-left"),
    right: root.querySelector(".player-right"),
  };

  if (!sides.left || !sides.right) return;

  const selected = { ...DEFAULTS };

  populateSelects();
  renderSide("left");
  renderSide("right");
  bindSelects();

  observeInView({
    target: root,
    threshold: 0.2,
    once: true,
    onEnter: () => {
      animateBars("left");
      animateBars("right");
    },
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
        const otherSide = side === "left" ? "right" : "left";

        if (id === selected[side] || id === selected[otherSide]) return;

        selected[side] = id;
        const label = sides[side].querySelector(".v-slc__t");
        if (label) label.textContent = getPlayer(id).name;

        renderSide(side);
        animateBars(side);
      });
    });
  }

  function renderSide(side) {
    const player = getPlayer(selected[side]);
    const el = sides[side];
    const img = el.querySelector(".player-img img");

    if (img) {
      img.alt = player.name;

      if (player.image) {
        img.src = player.image;
        img.hidden = false;
      } else {
        img.removeAttribute("src");
        img.hidden = true;
      }
    }

    const items = el.querySelectorAll(".player-stat");

    STATS.forEach((stat, index) => {
      const item = items[index];
      if (!item) return;

      const value = Number(player.stats[stat.key]) || 0;
      const percent = (value / maxForStat(stat.key)) * 100;
      const nameEl = item.querySelector(".player-stat__name");
      const valueEl = item.querySelector(".player-stat-bar__value");
      const barEl = item.querySelector(".player-stat-bar__bar");

      if (nameEl) nameEl.textContent = stat.label;
      if (valueEl) valueEl.textContent = value;

      if (barEl) {
        barEl.dataset.width = String(percent);
        barEl.classList.toggle("is-zero", value === 0);
        gsap.killTweensOf(barEl);
        gsap.set(barEl, { width: `${percent}%`, scaleX: 0 });
      }
    });
  }

  function animateBars(side) {
    const bars = sides[side].querySelectorAll(".player-stat-bar__bar");

    gsap.killTweensOf(bars);

    gsap.to(bars, {
      scaleX: 1,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.06,
      overwrite: true,
      force3D: true,
    });
  }
}
