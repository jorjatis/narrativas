import { loadVotes } from "./dnd/votesApi";
import anchorFaces from "./dnd/anchorFaces";
import bindDrag from "./dnd/dragSession";

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
