export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function motionDuration(defaultDuration) {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

export function scrollBehavior() {
  return prefersReducedMotion() ? "auto" : "smooth";
}
