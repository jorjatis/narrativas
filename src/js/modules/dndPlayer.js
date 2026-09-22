import gsap from "gsap";

const VIEWBOX = { w: 703, h: 669 };
const LIFT = 1.07;

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
    const imgCenterX = imgRect.left + circle / 2 - itemRect.left;
    const imgCenterY = imgRect.bottom - circle / 2 - itemRect.top;
    const left = point.x - imgCenterX;
    const top = point.y - imgCenterY;

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

  items.forEach((item) => {
    item.querySelectorAll("img").forEach((img) => {
      img.draggable = false;
    });
    item.addEventListener("contextmenu", (event) => event.preventDefault());
    item.addEventListener("pointerdown", (event) => beginDrag(event, item, false), { passive: false });
  });

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

  function parkInBox(ghost) {
    const rect = ghost.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - boxRect.left;
    const y = rect.top + rect.height / 2 - boxRect.top;

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

  function pinGhost(ghost, figure) {
    const boxRect = box.getBoundingClientRect();
    const dropRect = dropZone.getBoundingClientRect();
    const size = figure.getBoundingClientRect().width || ghost.getBoundingClientRect().width;

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
      x: dropRect.left + dropRect.width / 2 - boxRect.left,
      y: dropRect.top + dropRect.height / 2 - boxRect.top,
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

  function beginDrag(event, item, fromGhost) {
    if (session || event.button > 0) return;

    const figure = item.querySelector(".v-n-dnd-player__img");
    const origin = figure && facePoint(figure);

    if (!origin || !origin.size) return;

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
    };

    gsap.to(ghost, {
      x: event.clientX,
      y: event.clientY,
      scale: LIFT,
      duration: reduced ? 0.01 : 0.16,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        if (!session || session.ghost !== ghost) return;
        root.classList.toggle("is-over", circlesTouch(ghost.getBoundingClientRect(), dropZone.getBoundingClientRect()));
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
      root.classList.toggle("is-over", circlesTouch(ghost.getBoundingClientRect(), dropZone.getBoundingClientRect()));
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

    const over = circlesTouch(ghost.getBoundingClientRect(), dropZone.getBoundingClientRect());

    if (!over) {
      sendHome(item);
      return;
    }

    if (occupant && occupant.item !== item) sendHome(occupant.item);

    root.classList.add("is-selected");
    parkInBox(ghost);
    occupant = { item, ghost, pinned: false };

    const boxRect = box.getBoundingClientRect();
    const dropRect = dropZone.getBoundingClientRect();

    gsap.to(ghost, {
      x: dropRect.left + dropRect.width / 2 - boxRect.left,
      y: dropRect.top + dropRect.height / 2 - boxRect.top,
      scale: 1,
      duration: reduced ? 0.01 : 0.48,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => {
        if (item._token !== token || !occupant || occupant.ghost !== ghost) return;

        pinGhost(ghost, figure);
        item.classList.add("is-placed");
        occupant.pinned = true;
      },
    });
  }

  return function syncPlaced() {
    if (!occupant || !occupant.pinned || session) return;
    pinGhost(occupant.ghost, occupant.item.querySelector(".v-n-dnd-player__img"));
  };
}

export default function dndPlayer() {
  const roots = document.querySelectorAll(".v-n-dnd-player");

  if (!roots.length) return;

  roots.forEach((root) => {
    const syncPlaced = bindDrag(root);
    const place = () => {
      anchorFaces(root);
      syncPlaced();
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
