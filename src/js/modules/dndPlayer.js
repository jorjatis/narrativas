const VIEWBOX = { w: 703, h: 669 };

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

export default function dndPlayer() {
  const roots = document.querySelectorAll(".v-n-dnd-player");

  if (!roots.length) return;

  roots.forEach((root) => {
    const place = () => anchorFaces(root);
    const observer = new ResizeObserver(place);

    observer.observe(root.querySelector(".v-n-dnd-player__c"));
    root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
      observer.observe(item);
    });

    place();
  });
}
