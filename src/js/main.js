// NOTE: Helpers

// NOTE: Components

export function initAll() {
 
}

function start() {
  initAll();
}

// NOTE: Para prod el evento load de window, se borra, dejamos solo:
// start();
window.addEventListener('load', start);