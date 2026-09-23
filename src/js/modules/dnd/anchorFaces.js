const VIEWBOX = { w: 703, h: 669 };

// Vértices del pentágono negro, en el mismo orden que data-vertex 01 … 05.
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

export function vertexKey(item) {
  return item.dataset.vertex || "";
}

export default function anchorFaces(root) {
  const box = root.querySelector(".v-n-dnd-player__c");
  const svg = root.querySelector(".v-n-dnd-player__pentagon--01 svg");

  if (!box || !svg) return;

  const boxRect = box.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();

  if (!svgRect.width || !svgRect.height) return;

  const placed = [];

  root.querySelectorAll(".v-n-dnd-player__drag-item").forEach((item) => {
    const key = vertexKey(item);
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
