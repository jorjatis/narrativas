import observeInView from "../helpers/observeInView";
import prefersReducedMotion from "../helpers/prefersReducedMotion";

const IMG =
  "https://s1.abcstatics.com/comun/narrativas/redaccion/2026/09/15/diez-argentina/images";

const img = (file) => `${IMG}/${file}`;

const STAT_PAD = {
  matches: 0.15,
  minutes: 0.28,
  goals: 0.2,
  goalsPer90: 0.35,
  goalsAfter80: 0.18,
  teamGoalsOnPitch: 0.25,
};

const PLAYERS = [
  {
    id: "messi",
    name: "Lionel Messi",
    image: img("player-lionel-messi.webp"),
    mirrorImage: img("player-lionel-messi-flip.webp"),
    mirrorImage2: img("player-lionel-messi-flip-2.webp"),
    mouth: img("player-lionel-messi-mouth.webp"),
    mouth2: img("player-lionel-messi-mouth-2.webp"),
    position: "Delantero / Mediocentro ofensivo",
    titles: "Copa América (2), Finalissima y Mundial",
    pitchZones: img("campo-lionel-messi.webp"),
    stats: {
      matches: 31,
      minutes: 2932,
      goals: 20,
      goalsPer90: 0.61,
      goalsAfter80: 25,
      teamGoalsOnPitch: 56,
    },
  },
  {
    id: "riquelme",
    name: "Juan Román Riquelme",
    image: img("player-juan-roman-riquelme.webp"),
    position: "Mediapunta",
    titles: "Oro JJOO 2008",
    pitchZones: img("campo-juan-roman-riquelme.webp"),
    stats: {
      matches: 5,
      minutes: 449,
      goals: 0,
      goalsPer90: 0,
      goalsAfter80: 0,
      teamGoalsOnPitch: 10,
    },
  },
  {
    id: "rojas",
    name: "Alfredo Rojas",
    image: img("player-alfredo-rojas.webp"),
    position: "Delantero Centro",
    titles: "0",
    pitchZones: img("campo-alfredo-rojas.webp"),
    stats: {
      matches: 1,
      minutes: 90,
      goals: 0,
      goalsPer90: 0,
      goalsAfter80: 0,
      teamGoalsOnPitch: 1,
    },
  },
  {
    id: "sanfilippo",
    name: "José Sanfilippo",
    image: img("player-jose-sanfilippo.webp"),
    position: "Delantero Centro",
    titles: "0",
    pitchZones: img("campo-jose-sanfilippo.webp"),
    stats: {
      matches: 2,
      minutes: 180,
      goals: 1,
      goalsPer90: 0.5,
      goalsAfter80: 100,
      teamGoalsOnPitch: 2,
    },
  },
  {
    id: "rattin",
    name: "Antonio Rattín",
    image: img("player-antonio-rattin.webp"),
    position: "Pivote / Centrocampista",
    titles: "0",
    pitchZones: img("campo-antonio-rattin.webp"),
    stats: {
      matches: 4,
      minutes: 304,
      goals: 0,
      goalsPer90: 0,
      goalsAfter80: 0,
      teamGoalsOnPitch: 4,
    },
  },
  {
    id: "heredia",
    name: "Ramón Heredia",
    image: img("player-ramon-heredia.webp"),
    position: "Defensa y Centrocampista",
    titles: "0",
    pitchZones: img("campo-ramon-heredia.webp"),
    stats: {
      matches: 6,
      minutes: 540,
      goals: 1,
      goalsPer90: 0.17,
      goalsAfter80: 0,
      teamGoalsOnPitch: 9,
    },
  },
  {
    id: "kempes",
    name: "Mario Alberto Kempes",
    image: img("player-mario-alberto-kempes.webp"),
    position: "Delantero Centro",
    titles: "Mundial",
    pitchZones: img("campo-mario-alberto-kempes.webp"),
    stats: {
      matches: 7,
      minutes: 660,
      goals: 6,
      goalsPer90: 0.82,
      goalsAfter80: 16.67,
      teamGoalsOnPitch: 15,
    },
  },
  {
    id: "maradona",
    name: "Diego Armando Maradona",
    image: img("player-diego-armando-maradona.webp"),
    position: "Mediapunta / Delantero",
    titles: "Mundial",
    pitchZones: img("campo-diego-armando-maradona.webp"),
    stats: {
      matches: 21,
      minutes: 1936,
      goals: 8,
      goalsPer90: 0.37,
      goalsAfter80: 0,
      teamGoalsOnPitch: 31,
    },
  },
  {
    id: "ortega",
    name: "Ariel Ortega",
    image: img("player-ariel-ortega.webp"),
    position: "Mediapunta / Delantero",
    titles: "0",
    pitchZones: img("campo-ariel-ortega.webp"),
    stats: {
      matches: 8,
      minutes: 707,
      goals: 2,
      goalsPer90: 0.41,
      goalsAfter80: 0,
      teamGoalsOnPitch: 12,
    },
  },
];

const DEFAULTS = { left: "messi", right: "riquelme" };

function getPlayer(id) {
  return PLAYERS.find((player) => player.id === id);
}

function getStatValue(player, key) {
  return Number(player?.stats?.[key]) || 0;
}

const STAT_SCALE = Object.fromEntries(
  Object.keys(STAT_PAD).map((key) => {
    const max = PLAYERS.reduce((current, player) => {
      const value = getStatValue(player, key);
      return value > current ? value : current;
    }, 0);

    return [key, Math.max(max * (1 + STAT_PAD[key]), 1)];
  })
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

function setImage(imgEl, src, alt = "") {
  if (!imgEl) return;

  imgEl.alt = alt;

  if (src) {
    imgEl.src = src;
    imgEl.width = imgEl.width || 320;
    imgEl.height = imgEl.height || 320;
    imgEl.decoding = "async";
    imgEl.hidden = false;
  } else {
    imgEl.removeAttribute("src");
    imgEl.hidden = true;
  }
}

function debounce(fn, wait = 150) {
  let timer = 0;

  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

export default function playersComparison() {
  const root = document.querySelector(".v-n-players-comparison");
  if (!root || PLAYERS.length < 2) return;

  const ui = {
    left: cacheSide(root, "left"),
    right: cacheSide(root, "right"),
  };

  if (!ui.left.player || !ui.right.player) return;

  const selected = {
    left: getPlayer(DEFAULTS.left) ? DEFAULTS.left : PLAYERS[0].id,
    right: getPlayer(DEFAULTS.right) ? DEFAULTS.right : PLAYERS[1].id,
  };
  let messiTalkSide = null;

  populateSelects();
  syncSelectState();
  bindSelectAria();
  renderPlayer("left");
  renderPlayer("right");
  renderStats();
  bindSelects();

  window.addEventListener(
    "resize",
    debounce(() => {
      syncPositionHeights();
      requestAnimationFrame(() => renderStats());
    })
  );

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
    onEnter: () => renderStats(undefined, true),
  });

  function cacheSide(scope, side) {
    const select = scope.querySelector(`.v-slc[data-side="${side}"]`);

    return {
      select,
      button: select?.querySelector(".v-slc__h"),
      list: select?.querySelector(".v-slc__u"),
      label: select?.querySelector(".v-slc__t"),
      player: scope.querySelector(`.player-${side}`),
    };
  }

  function populateSelects() {
    ["left", "right"].forEach((side) => {
      const { list } = ui[side];
      if (!list) return;

      list.innerHTML = PLAYERS.map(
        (player) => `
          <li class="v-slc__l" role="option">
            <button class="v-slc__a" type="button" data-player-id="${player.id}">${player.name}</button>
          </li>
        `
      ).join("");
    });
  }

  function syncSelectExpanded(side) {
    const { select, button } = ui[side];
    if (!select || !button) return;

    const open =
      select.classList.contains("is-open") ||
      select.classList.contains("v-slc--o") ||
      select.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function bindSelectAria() {
    ["left", "right"].forEach((side) => {
      const { select, button } = ui[side];
      if (!select || !button) return;

      syncSelectExpanded(side);
      button.addEventListener("click", () => {
        requestAnimationFrame(() => syncSelectExpanded(side));
      });
      new MutationObserver(() => syncSelectExpanded(side)).observe(select, {
        attributes: true,
        attributeFilter: ["class", "aria-expanded"],
      });
    });
  }

  function syncSelectState() {
    ["left", "right"].forEach((side) => {
      const other = side === "left" ? "right" : "left";

      ui[side].list?.querySelectorAll("[data-player-id]").forEach((button) => {
        const id = button.dataset.playerId;
        const isSelected = id === selected[side];
        const isTaken = id === selected[other];
        const canMirror = id === "messi";

        button.classList.toggle("is-selected", isSelected);
        button.classList.toggle("is-taken", isTaken && !canMirror);
        button.disabled = isSelected || (isTaken && !canMirror);
        button.setAttribute("aria-selected", isSelected ? "true" : "false");
      });
    });
  }

  function bindSelects() {
    ["left", "right"].forEach((side) => {
      const { list, label } = ui[side];
      if (!list) return;

      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-player-id]");
        if (!button || button.disabled) return;

        const id = button.dataset.playerId;
        const other = side === "left" ? "right" : "left";
        const mirroringMessi = id === "messi" && id === selected[other];

        if (id === selected[side] || (id === selected[other] && !mirroringMessi)) return;

        const enteringMessiDuel = id === "messi" && selected[other] === "messi";

        selected[side] = id;
        if (label) label.textContent = getPlayer(id).name;

        if (enteringMessiDuel) {
          messiTalkSide = other;
        } else if (!(selected.left === "messi" && selected.right === "messi")) {
          messiTalkSide = null;
        }

        syncSelectState();
        renderPlayer("left");
        renderPlayer("right");
        renderStats(side, true);
      });
    });
  }

  function isMessiDuel() {
    return selected.left === "messi" && selected.right === "messi";
  }

  function renderPlayer(side) {
    const player = getPlayer(selected[side]);
    const el = ui[side].player;
    const position = el.querySelector(".player-position__value");
    const duel = isMessiDuel();
    const talking = duel && side === messiTalkSide;
    const talkImage = side === "left" ? player.mirrorImage : player.mirrorImage2;
    const talkMouth = side === "left" ? player.mouth : player.mouth2;
    let image = player.image;

    // En duelo Messi la foto espejada lleva hueco de boca: hay que taparlo siempre.
    if (duel && side === "left" && player.mirrorImage) {
      image = player.mirrorImage;
    } else if (talking && talkImage) {
      image = talkImage;
    }

    setImage(el.querySelector(".player-photo"), image, player.name);
    setImage(el.querySelector(".player-pitch"), player.pitchZones, `Posición de ${player.name}`);

    const mouth = el.querySelector(".player-mouth");
    const bubble = el.querySelector(".player-bubble");
    const fillMouth =
      (duel && side === "left" && player.mouth) || (talking && talkMouth);

    if (mouth) {
      const isTalking = talking && talkMouth;
      const wasTalking = mouth.classList.contains("is-talking");

      if (fillMouth) {
        mouth.src = side === "left" ? player.mouth : talkMouth;
        mouth.hidden = false;
      } else {
        mouth.hidden = true;
      }

      if (isTalking && !wasTalking) {
        mouth.classList.remove("is-talking");
        void mouth.offsetWidth;

        if (bubble) {
          bubble.hidden = false;
          bubble.classList.remove("is-in");
          void bubble.offsetWidth;
          bubble.classList.add("is-in");
        }

        // La boca arranca al terminar el giro del bocadillo (ver delay en SCSS).
        mouth.classList.add("is-talking");

        const hideBubble = (event) => {
          if (event && !String(event.animationName).startsWith("messi-talk")) return;
          if (bubble) {
            bubble.hidden = true;
            bubble.classList.remove("is-in");
          }
          mouth.classList.remove("is-talking");
        };

        if (prefersReducedMotion()) {
          window.setTimeout(hideBubble, 3000);
        } else {
          mouth.addEventListener("animationend", hideBubble, { once: true });
        }
      } else if (!isTalking) {
        mouth.classList.remove("is-talking");
        if (bubble) {
          bubble.hidden = true;
          bubble.classList.remove("is-in");
        }
      }
    } else if (bubble) {
      bubble.hidden = true;
    }

    if (position) position.textContent = player.position || "";
    root.classList.toggle("is-messi-duel", duel);
    root.classList.toggle("is-messi-duel-left", duel && messiTalkSide === "left");
    root.classList.toggle("is-messi-duel-right", duel && messiTalkSide === "right");
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

    requestAnimationFrame(() => placeValue(bar, scale, isZero));
  }

  function placeValue(bar, scale, isZero) {
    const valueEl = bar.querySelector(".stat-bar__value");
    if (!valueEl || !bar.offsetWidth) return;

    const fillWidth = bar.offsetWidth * scale;
    bar.classList.toggle("is-outside", !isZero && fillWidth < valueEl.offsetWidth + 40);
  }
}
