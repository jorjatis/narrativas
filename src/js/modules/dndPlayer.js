import gsap from "gsap";

const VIEWBOX = { w: 703, h: 669 };
const LIFT = 1.07;
const VOTES_API =
  "https://script.google.com/macros/s/AKfycbwN8IGCHX_t6jcmbKvWvJf14eMJ364vxTe9Rg_2yDG1nwzOo04d9iGzunf7l0mck0Ntxw/exec";

function syncShares(root) {
  const items = [...root.querySelectorAll(".v-n-dnd-player__drag-item")];
  const max = Math.max(0, ...items.map((item) => Number(item.dataset.votes) || 0));

  items.forEach((item) => {
    const votes = Number(item.dataset.votes) || 0;

    item.dataset.share = String(max ? Math.round((votes / max) * 100) : 0);
  });
}

function applyPlayers(root, players) {
  if (!Array.isArray(players)) return;

  const byId = new Map(players.map((player) => [String(player.id), player]));

  root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
    const row = byId.get(item.dataset.id);

    if (!row) return;

    item.dataset.votes = String(Number(row.votes) || 0);
  });

  syncShares(root);
}

async function requestVotes(action, id) {
  const url = new URL(VOTES_API);

  url.searchParams.set("action", action);
  if (id) url.searchParams.set("id", id);

  const response = await fetch(url.toString());

  if (!response.ok) throw new Error(`Votes API ${response.status}`);

  return response.json();
}

function loadVotes(root) {
  return requestVotes("get")
    .then((data) => applyPlayers(root, data && data.players))
    .catch(() => {});
}

function castVote(root, id) {
  if (!id) return Promise.resolve();

  return requestVotes("vote", id)
    .then((data) => applyPlayers(root, data && data.players))
    .catch(() => {});
}

// Vértices del pentágono negro, en el mismo orden que --01 … --05.
const VERTICES = {
  "01": [351.415, 0.617188],
  "02": [702.243, 255.509],
  "03": [568.239, 667.932],
  "04": [134.592, 667.932],
  "05": [0.58725, 255.509],
};

function vertexOnBox(svgRect, boxRect, vertex) {
  return {
    x: svgRect.left - boxRect.left + (vertex[0] / VIEWBOX.w) * svgRect.width,
    y: svgRect.top - boxRect.top + (vertex[1] / VIEWBOX.h) * svgRect.height,
  };
}

function anchorFaces(root) {
  const box = root.querySelector(".v-n-dnd-player__c");
  const svg = root.querySelector(".v-n-dnd-player__pentagon--01 svg");

  if (!box || !svg) return;

  const boxRect = box.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();

  if (!svgRect.width || !svgRect.height) return;

  const placed = [];

  root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
    const modifier = [...item.classList].find((className) => className.includes("--"));
    const key = modifier && modifier.split("--").pop();
    const vertex = VERTICES[key];
    const img = item.querySelector(".v-n-dnd-player__img");

    if (!vertex || !img) return;

    const point = vertexOnBox(svgRect, boxRect, vertex);
    const imgRect = img.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const circle = imgRect.width;

    placed.push({
      item,
      left: point.x - (imgRect.left + circle / 2 - itemRect.left),
      top: point.y - (imgRect.bottom - circle / 2 - itemRect.top),
    });
  });

  placed.forEach(({ item, left, top }) => {
    item.style.left = `${left}px`;
    item.style.top = `${top}px`;
    item.style.right = "auto";
    item.style.bottom = "auto";
    item.style.transform = "none";
    item.classList.add("is-anchored");
  });
}

function facePoint(figure) {
  const rect = figure.getBoundingClientRect();
  const size = rect.width;

  return {
    size,
    x: rect.left + size / 2,
    y: rect.bottom - size / 2,
  };
}

function circleAt(x, y, diameter) {
  return {
    left: x - diameter / 2,
    top: y - diameter / 2,
    width: diameter,
    height: diameter,
  };
}

function ghostCircle(ghost, size) {
  const scale = Number(gsap.getProperty(ghost, "scale")) || 1;

  return circleAt(Number(gsap.getProperty(ghost, "x")), Number(gsap.getProperty(ghost, "y")), size * scale);
}

function circlesTouch(a, b) {
  const ar = Math.min(a.width, a.height) / 2;
  const br = Math.min(b.width, b.height) / 2;
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;

  return Math.hypot(ax - bx, ay - by) <= ar + br + 8;
}

function bindDrag(root) {
  const box = root.querySelector(".v-n-dnd-player__c");
  const dropZone = root.querySelector(".v-n-dnd-player__drop-zone");

  if (!box || !dropZone) return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = [...root.querySelectorAll(".v-n-dnd-player__drag-item")];
  let session = null;
  let occupant = null;
  let blockScroll = null;
  let outroPlayed = false;
  let replaying = false;

  items.forEach((item) => {
    item.querySelectorAll("img").forEach((img) => {
      img.draggable = false;
    });
    item.addEventListener("contextmenu", (event) => event.preventDefault());
    item.addEventListener("pointerdown", (event) => beginDrag(event, item, false), { passive: false });
  });

  const again = root.querySelector(".v-n-dnd-player__again");

  if (again) again.addEventListener("click", replay);

  function lockScroll() {
    if (blockScroll) return;

    blockScroll = (event) => event.preventDefault();
    document.addEventListener("touchmove", blockScroll, { passive: false, capture: true });
  }

  function unlockScroll() {
    if (!blockScroll) return;

    document.removeEventListener("touchmove", blockScroll, { capture: true });
    blockScroll = null;
  }

  function setGhostSize(ghost, size) {
    ghost.style.width = `${size}px`;
    ghost.style.height = `${size}px`;
  }

  function stickFixed(ghost) {
    const rect = ghost.getBoundingClientRect();

    document.body.appendChild(ghost);
    gsap.set(ghost, {
      position: "fixed",
      left: 0,
      top: 0,
      xPercent: -50,
      yPercent: -50,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  function parkInBox(ghost, known) {
    const rect = known ? null : ghost.getBoundingClientRect();
    const boxRect = known ? known.boxRect : box.getBoundingClientRect();
    const x = known ? known.x - boxRect.left : rect.left + rect.width / 2 - boxRect.left;
    const y = known ? known.y - boxRect.top : rect.top + rect.height / 2 - boxRect.top;

    ghost.style.position = "absolute";
    ghost.style.left = "0px";
    ghost.style.top = "0px";
    box.appendChild(ghost);
    gsap.set(ghost, {
      position: "absolute",
      left: 0,
      top: 0,
      xPercent: -50,
      yPercent: -50,
      x,
      y,
    });
  }

  function pinGhost(ghost, figure, known) {
    const boxRect = known ? null : box.getBoundingClientRect();
    const dropRect = known ? null : dropZone.getBoundingClientRect();
    const size = known ? known.size : (figure.getBoundingClientRect().width || ghost.getBoundingClientRect().width);
    const x = known ? known.x : dropRect.left + dropRect.width / 2 - boxRect.left;
    const y = known ? known.y : dropRect.top + dropRect.height / 2 - boxRect.top;

    box.appendChild(ghost);
    setGhostSize(ghost, size);
    ghost.style.pointerEvents = "";
    ghost.classList.add("is-placed");
    ghost.classList.remove("is-dragging");
    gsap.set(ghost, {
      position: "absolute",
      left: 0,
      top: 0,
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      x,
      y,
    });
  }

  function createGhost(item, figure) {
    const ghost = document.createElement("div");
    const face = figure.cloneNode(true);

    ghost.className = "v-n-dnd-player__ghost";
    ghost.setAttribute("aria-hidden", "true");
    face.classList.remove("is-lifted");
    face.querySelectorAll("img").forEach((img) => {
      img.draggable = false;
      img.alt = "";
    });
    ghost.append(face);

    ghost.addEventListener("pointerdown", (event) => {
      if (event.button > 0) return;
      event.preventDefault();
      event.stopPropagation();
      beginDrag(event, item, true);
    }, { passive: false });
    ghost.addEventListener("contextmenu", (event) => event.preventDefault());

    item._ghost = ghost;
    return ghost;
  }

  function sendHome(item) {
    const ghost = item._ghost;
    const figure = item.querySelector(".v-n-dnd-player__img");

    if (!ghost || !figure) return;
    if (occupant && occupant.item === item) occupant = null;

    item._token = (item._token || 0) + 1;
    const token = item._token;
    const home = facePoint(figure);
    const boxRect = box.getBoundingClientRect();
    const homeX = home.x - boxRect.left;
    const homeY = home.y - boxRect.top;

    gsap.killTweensOf(ghost);
    parkInBox(ghost);
    setGhostSize(ghost, home.size);
    ghost.style.pointerEvents = "none";
    ghost.classList.remove("is-placed", "is-dragging");
    item.classList.remove("is-placed");

    gsap.to(ghost, {
      x: homeX,
      y: homeY,
      scale: 1,
      duration: reduced ? 0.01 : 0.42,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => {
        if (item._token !== token) return;

        ghost.remove();
        item._ghost = null;
        item.classList.remove("is-lifted", "is-placed");
        figure.classList.remove("is-lifted");
      },
    });
  }

  function formatVotes(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function buildRanking() {
    const list = root.querySelector(".v-n-dnd-player__ranking-list");

    if (!list) return [];
    if (list.childElementCount) return [...list.children];

    const players = items
      .map((item) => {
        const img = item.querySelector("img");

        return {
          name: (img && img.alt) || "",
          src: (img && img.getAttribute("src")) || "",
          votes: Number(item.dataset.votes) || 0,
          share: Number(item.dataset.share) || 0,
        };
      })
      .sort((a, b) => b.share - a.share || b.votes - a.votes);

    players.forEach((player) => {
      const row = document.createElement("li");
      const face = document.createElement("figure");
      const photo = document.createElement("img");
      const body = document.createElement("div");
      const name = document.createElement("p");
      const meta = document.createElement("div");
      const votes = document.createElement("span");
      const bar = document.createElement("span");

      row.className = "v-n-dnd-player__row";
      row.style.setProperty("--bar", `${player.share}%`);
      face.className = "v-n-dnd-player__row-face";
      photo.src = player.src;
      photo.alt = "";
      body.className = "v-n-dnd-player__row-body";
      name.className = "v-n-dnd-player__row-name";
      name.textContent = player.name;
      meta.className = "v-n-dnd-player__row-meta";
      votes.className = "v-n-dnd-player__row-votes";
      votes.textContent = formatVotes(player.votes);
      bar.className = "v-n-dnd-player__row-bar";
      bar.append(document.createElement("i"));
      face.append(photo);
      meta.append(votes, bar);
      body.append(name, meta);
      row.append(face, body);
      list.append(row);
    });

    return [...list.children];
  }

  function centerDelta(from, to) {
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      scale: to.width ? from.width / to.width : 1,
    };
  }

  function restoreFlag(flag) {
    if (!flag) return;

    flag.removeAttribute("style");
    dropZone.prepend(flag);
  }

  function scrollResultIntoView() {
    const heading = root.previousElementSibling;
    const target = heading && heading.classList.contains("v-n-suh") ? heading : root;
    const header = document.querySelector("header.v-h");
    let offset = 0;

    if (header) {
      const pos = getComputedStyle(header).position;
      if (pos === "fixed" || pos === "sticky") offset = header.getBoundingClientRect().height;
    }

    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
    const from = window.scrollY;

    if (Math.abs(from - top) < 2) return;

    if (reduced) {
      window.scrollTo(0, top);
      return;
    }

    if (root._scrollState) gsap.killTweensOf(root._scrollState);

    const state = { y: from };
    root._scrollState = state;

    // Corto a propósito: el scroll nativo no tiene duración y se solapa
    // con el clip-path de los laureles, que pinta en CPU.
    gsap.to(state, {
      y: top,
      duration: 0.38,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => window.scrollTo(0, state.y),
    });
  }

  function playResult() {
    if (!occupant) return;

    const ghost = occupant.ghost;
    const flag = dropZone.querySelector(".v-n-dnd-player__flag");
    const num = dropZone.querySelector(".v-n-dnd-player__num");
    const fromGhost = ghost.getBoundingClientRect();
    const fromNum = num.getBoundingClientRect();
    const hero = root.querySelector(".v-n-dnd-player__hero");
    const vote = root.querySelector(".v-n-dnd-player__vote");
    const voteName = root.querySelector(".v-n-dnd-player__vote-name");
    const chosen = occupant.item.querySelector("img");

    if (!hero || !vote || !num) return;
    if (voteName) voteName.textContent = (chosen && chosen.alt) || "";

    if (flag) {
      gsap.killTweensOf(flag);
      flag.style.visibility = "hidden";
    }

    ghost.style.pointerEvents = "none";
    root.classList.add("is-finished");
    hero.append(ghost, num);
    gsap.set(ghost, { clearProps: "all" });
    gsap.set(num, { clearProps: "all" });

    const placed = ghost.getBoundingClientRect();
    const shift = (fromGhost.top + fromGhost.height / 2) - (placed.top + placed.height / 2);

    if (shift > 1) box.style.paddingTop = `${shift}px`;

    const ghostMove = centerDelta(fromGhost, ghost.getBoundingClientRect());
    const numMove = centerDelta(fromNum, num.getBoundingClientRect());
    const face = ghost.querySelector(".v-n-dnd-player__img");
    const ranking = root.querySelector(".v-n-dnd-player__ranking");
    const laurelL = root.querySelector(".v-n-dnd-player__laurel--l");
    const laurelR = root.querySelector(".v-n-dnd-player__laurel--r");
    const laurelSvg = root.querySelectorAll(".v-n-dnd-player__laurel svg");
    const rows = buildRanking();
    const rowNames = root.querySelectorAll(".v-n-dnd-player__row-name");
    const rowVotes = root.querySelectorAll(".v-n-dnd-player__row-votes");
    const rowBars = root.querySelectorAll(".v-n-dnd-player__row-bar i");
    const rowTops = rows.map((row) => row.getBoundingClientRect().top);
    const firstTop = rowTops[0] || 0;
    const time = (value) => (reduced ? 0.01 : value);

    if (rows.length) gsap.set(rows, { y: (index) => firstTop - rowTops[index] });

    gsap.set(ghost, {
      transformOrigin: "50% 50%",
      x: ghostMove.x,
      y: ghostMove.y,
      scale: ghostMove.scale,
    });
    gsap.set(num, {
      transformOrigin: "50% 50%",
      x: numMove.x,
      y: numMove.y,
      scale: numMove.scale,
    });
    if (ranking) gsap.set(ranking, { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

    tl.to(ghost, {
      x: 0,
      y: 0,
      scale: 1,
      duration: time(0.7),
      ease: "power3.inOut",
    }, 0);
    tl.to(num, {
      x: 0,
      y: 0,
      scale: 1,
      duration: time(0.75),
      ease: "power3.inOut",
    }, 0);
    tl.to(box, {
      paddingTop: 0,
      duration: time(0.9),
      ease: "power2.inOut",
    }, 0.35);

    if (face) {
      tl.to(face, {
        "--face-bg": "#88E0FF",
        "--face-scale": 1.12,
        duration: time(0.6),
        ease: "power2.out",
      }, 0.12);
    }

    tl.from(vote, { y: 28, autoAlpha: 0, duration: time(0.5), ease: "power3.out" }, 0.28);
    tl.fromTo(laurelSvg, {
      clipPath: "inset(0% 0% 100% 0%)",
    }, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: time(1.05),
      ease: "power2.inOut",
      stagger: 0.08,
    }, 0.62);
    tl.from(laurelL, { x: 16, duration: time(1.05), ease: "power2.out" }, 0.62);
    tl.from(laurelR, { x: -16, duration: time(1.05), ease: "power2.out" }, 0.62);

    if (ranking) {
      tl.to(ranking, { autoAlpha: 1, duration: time(0.35), ease: "power1.out" }, 1.45);
    }

    tl.to(rows, {
      y: 0,
      duration: time(0.7),
      ease: "power3.out",
      stagger: 0.07,
    }, 1.5);
    tl.from(rowNames, {
      x: -36,
      autoAlpha: 0,
      duration: time(0.45),
      ease: "power2.out",
      stagger: 0.07,
    }, 1.62);
    tl.from(rowVotes, {
      autoAlpha: 0,
      duration: time(0.35),
      stagger: 0.07,
    }, 1.76);
    tl.from(rowBars, {
      scaleX: 0,
      duration: time(0.55),
      ease: "power2.out",
      stagger: 0.08,
    }, 1.86);

    requestAnimationFrame(() => scrollResultIntoView());
  }

  function replay() {
    if (!outroPlayed || replaying) return;

    replaying = true;

    const result = root.querySelector(".v-n-dnd-player__result");
    const looseFlag = document.querySelector("body > .v-n-dnd-player__flag");

    root.querySelectorAll("*").forEach((node) => gsap.killTweensOf(node));
    if (looseFlag) gsap.killTweensOf(looseFlag);
    if (again) again.disabled = true;

    gsap.to(result, {
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.45,
      ease: "power1.out",
      overwrite: true,
      onComplete: revealBoard,
    });
  }

  function revealBoard() {
    const result = root.querySelector(".v-n-dnd-player__result");
    const num = root.querySelector(".v-n-dnd-player__num");
    const flag = root.querySelector(".v-n-dnd-player__flag") || document.querySelector("body > .v-n-dnd-player__flag");
    const bg = root.querySelector(".v-n-dnd-player__bg");
    const list = root.querySelector(".v-n-dnd-player__ranking-list");

    if (occupant && occupant.ghost) {
      occupant.ghost.remove();
      occupant.item._ghost = null;
    }

    occupant = null;

    items.forEach((item) => {
      const figure = item.querySelector(".v-n-dnd-player__img");

      item.classList.remove("is-lifted", "is-placed");
      item.style.zIndex = "";
      item._ghost = null;
      item._token = (item._token || 0) + 1;

      if (!figure) return;

      figure.classList.remove("is-lifted");
      gsap.set(figure, { clearProps: "all" });
    });

    if (bg) gsap.set(bg, { clearProps: "all" });
    if (num) {
      dropZone.appendChild(num);
      gsap.set(num, { clearProps: "all" });
    }

    restoreFlag(flag);
    if (list) list.replaceChildren();
    box.style.paddingTop = "";
    box.style.marginTop = "";
    box.style.marginBottom = "";
    box.style.minHeight = "";
    box.style.overflowAnchor = "";

    const incoming = root.querySelectorAll(".v-n-dnd-player__lead, .v-n-dnd-player__drag-item, .v-n-dnd-player__bg, .v-n-dnd-player__drop-zone");

    gsap.set(incoming, { autoAlpha: 0 });
    root.classList.remove("is-finished", "is-selected", "is-dragging", "is-over");
    if (result) gsap.set(result, { clearProps: "all" });
    gsap.set(root.querySelectorAll(".v-n-dnd-player__vote, .v-n-dnd-player__laurel, .v-n-dnd-player__laurel svg, .v-n-dnd-player__ranking"), { clearProps: "all" });
    requestAnimationFrame(() => {
      anchorFaces(root);
      requestAnimationFrame(() => {
        box.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "center",
        });
      });
    });

    gsap.to(incoming, {
      autoAlpha: 1,
      duration: reduced ? 0.01 : 0.5,
      ease: "power1.out",
      overwrite: true,
      onComplete: () => {
        gsap.set(incoming, { clearProps: "opacity,visibility" });
        root.classList.remove("is-clearing");
        outroPlayed = false;
        replaying = false;
        if (again) again.disabled = false;
      },
    });
  }

  function playOutro() {
    if (outroPlayed) return;

    outroPlayed = true;
    root.classList.add("is-clearing");

    if (occupant && occupant.item) {
      const voted = occupant.item;
      const id = voted.dataset.id;

      voted.dataset.votes = String((Number(voted.dataset.votes) || 0) + 1);
      syncShares(root);
      castVote(root, id);
    }

    const names = root.querySelectorAll(".v-n-dnd-player__name, .v-n-dnd-player__lead");
    const bg = root.querySelector(".v-n-dnd-player__bg");
    const circles = items
      .map((item) => item.querySelector(".v-n-dnd-player__img"))
      .filter(Boolean);

    if (occupant) occupant.ghost.style.pointerEvents = "none";

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: playResult,
    });

    tl.to(names, {
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.35,
      ease: "power1.out",
    }, 0);

    tl.to(circles, {
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.35,
      ease: "power1.out",
    }, 0);

    tl.to(bg, {
      scale: 0,
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.9,
      ease: "power2.in",
      transformOrigin: "50% 50%",
    }, 0.08);
  }

  function beginDrag(event, item, fromGhost) {
    if (session || outroPlayed || event.button > 0) return;

    const figure = item.querySelector(".v-n-dnd-player__img");
    const origin = figure && facePoint(figure);

    if (!origin || !origin.size) return;

    const boxRect = box.getBoundingClientRect();
    const zoneRect = dropZone.getBoundingClientRect();

    event.preventDefault();

    if (occupant && occupant.item !== item) sendHome(occupant.item);

    root.classList.remove("is-selected");
    item._token = (item._token || 0) + 1;
    const token = item._token;
    let ghost = item._ghost;

    if (!ghost) {
      ghost = createGhost(item, figure);
      setGhostSize(ghost, origin.size);
      document.body.appendChild(ghost);
      gsap.set(ghost, {
        position: "fixed",
        left: 0,
        top: 0,
        xPercent: -50,
        yPercent: -50,
        x: origin.x,
        y: origin.y,
        scale: 1,
      });
    } else {
      gsap.killTweensOf(ghost);
      stickFixed(ghost);
      setGhostSize(ghost, origin.size);
    }

    figure.classList.add("is-lifted");
    item.classList.add("is-lifted");
    item.classList.remove("is-placed");
    ghost.classList.add("is-dragging");
    ghost.classList.remove("is-placed");
    ghost.style.pointerEvents = fromGhost ? "auto" : "none";
    root.classList.add("is-dragging");
    document.documentElement.classList.add("is-dnd-grabbing");
    lockScroll();

    const handle = fromGhost ? ghost : item;

    try {
      handle.setPointerCapture(event.pointerId);
    } catch (error) {
      // En algún WebView el puntero ya no admite capture; el listener de window sigue el gesto.
    }

    const setX = gsap.quickSetter(ghost, "x", "px");
    const setY = gsap.quickSetter(ghost, "y", "px");

    session = {
      item,
      ghost,
      figure,
      token,
      pointerId: event.pointerId,
      moved: false,
      setX,
      setY,
      size: origin.size,
      boxRect,
      zoneRect,
      dropX: zoneRect.left + zoneRect.width / 2 - boxRect.left,
      dropY: zoneRect.top + zoneRect.height / 2 - boxRect.top,
    };

    const overZone = () => circlesTouch(ghostCircle(ghost, origin.size), zoneRect);

    gsap.to(ghost, {
      x: event.clientX,
      y: event.clientY,
      scale: LIFT,
      duration: reduced ? 0.01 : 0.16,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        if (!session || session.ghost !== ghost) return;
        root.classList.toggle("is-over", overZone());
      },
    });

    const onMove = (ev) => {
      if (!session || ev.pointerId !== session.pointerId) return;

      ev.preventDefault();

      if (!session.moved) {
        session.moved = true;
        gsap.killTweensOf(ghost);
        gsap.set(ghost, { scale: LIFT });
        session.setX = gsap.quickSetter(ghost, "x", "px");
        session.setY = gsap.quickSetter(ghost, "y", "px");
      }

      session.setX(ev.clientX);
      session.setY(ev.clientY);
      root.classList.toggle("is-over", circlesTouch(circleAt(ev.clientX, ev.clientY, origin.size * LIFT), zoneRect));
    };

    const onUp = (ev) => {
      if (ev && ev.pointerId != null && session && ev.pointerId !== session.pointerId) return;
      endDrag(ev);
    };

    session.onMove = onMove;
    session.onUp = onUp;
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function endDrag(event) {
    if (!session) return;

    const current = session;
    session = null;

    window.removeEventListener("pointermove", current.onMove);
    window.removeEventListener("pointerup", current.onUp);
    window.removeEventListener("pointercancel", current.onUp);
    unlockScroll();
    root.classList.remove("is-dragging", "is-over");
    document.documentElement.classList.remove("is-dnd-grabbing");

    const { item, ghost, figure, token } = current;

    gsap.killTweensOf(ghost);

    if (current.moved && event && Number.isFinite(event.clientX)) {
      gsap.set(ghost, { x: event.clientX, y: event.clientY, scale: LIFT });
    }

    ghost.classList.remove("is-dragging");

    const centerX = Number(gsap.getProperty(ghost, "x"));
    const centerY = Number(gsap.getProperty(ghost, "y"));
    const over = circlesTouch(ghostCircle(ghost, current.size), current.zoneRect);

    if (!over) {
      sendHome(item);
      return;
    }

    if (occupant && occupant.item !== item) sendHome(occupant.item);

    root.classList.add("is-selected");
    parkInBox(ghost, { x: centerX, y: centerY, boxRect: current.boxRect });
    occupant = { item, ghost, pinned: false };

    gsap.to(ghost, {
      x: current.dropX,
      y: current.dropY,
      scale: 1,
      duration: reduced ? 0.01 : 0.48,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => {
        if (item._token !== token || !occupant || occupant.ghost !== ghost) return;

        pinGhost(ghost, figure, { size: current.size, x: current.dropX, y: current.dropY });
        item.classList.add("is-placed");
        occupant.pinned = true;
        playOutro();
      },
    });
  }

  return {
    syncPlaced() {
      if (outroPlayed || !occupant || !occupant.pinned || session) return;
      pinGhost(occupant.ghost, occupant.item.querySelector(".v-n-dnd-player__img"));
    },
    isClearing() {
      return outroPlayed;
    },
  };
}

export default function dndPlayer() {
  const roots = document.querySelectorAll(".v-n-dnd-player");

  if (!roots.length) return;

  roots.forEach((root) => {
    loadVotes(root);

    const drag = bindDrag(root);
    const place = () => {
      if (drag.isClearing()) return;

      anchorFaces(root);
      drag.syncPlaced();
    };
    const observer = new ResizeObserver(place);
    const box = root.querySelector(".v-n-dnd-player__c");

    if (box) observer.observe(box);
    root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
      observer.observe(item);
    });

    place();
  });
}
