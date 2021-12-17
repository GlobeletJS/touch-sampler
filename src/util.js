export function getMidPoint(p0, p1) {
  // Convert a two-touch event to a single event at the midpoint
  const dx = p1.clientX - p0.clientX;
  const dy = p1.clientY - p0.clientY;
  return {
    clientX: p0.clientX + dx / 2,
    clientY: p0.clientY + dy / 2,
    distance: Math.hypot(dx, dy),
  };
}

export function initWheelScale(wheelDelta) {
  return (wheelDelta === "constant") ? wheelScale_const : wheelScale;
}

function wheelScale(turn) {
  const { deltaY, deltaMode } = turn;
  if (!deltaY) return 1.0; // Could be a deltaX or deltaZ event

  switch (deltaMode) {
    case 0:
      // Chrome on Windows 10 Surface Book 2: deltaY = -100 * devicePixelRatio
      return 1.0 + deltaY * 0.002 / window.devicePixelRatio;
    case 1:
      // Firefox on Windows 10 Surface Book 2: deltaY = -3
      return 1.0 + deltaY * 0.067;
    case 2:
      // Untested. Ratio vs. case 0 is from d3-zoom
      return 1.0 + deltaY;
  }
}

function wheelScale_const(turn) {
  // We ignore the dY from the browser, since it may be arbitrarily scaled
  // based on screen resolution or other factors. We keep only the sign.
  // See https://github.com/Leaflet/Leaflet/issues/4538
  return 1.0 + 0.2 * Math.sign(turn.deltaY);
}
