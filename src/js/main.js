// NOTE: Helpers
import { initSceneYebenes } from "./scene-yebenes";

// NOTE: Modules

export function initAll() {
  initSceneYebenes();
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener("load", initAll);
