export function initCursor() {
  // What does an animation need to know about the cursor at each frame?
  // First, whether the user did any of the following since the last frame:
  //  - Started new actions
  let touchStarted = false; // Touched or clicked the element
  let zoomStarted  = false; // Rotated mousewheel, or started two-finger touch
  //  - Changed something
  let moved  = false;       // Moved mouse or touch point
  let zoomed = false;       // Rotated mousewheel, or adjusted two-finger touch
  //  - Is potentially in the middle of something
  let tapping = false;      // No touchEnd, and no cursor motion
  //  - Ended actions
  let touchEnded = false;   // mouseup or touchend/cancel/leave
  let tapped = false;       // Completed a click or tap action

  // We also need to know the current cursor position and zoom scale
  let cursorX = 0;
  let cursorY = 0;
  let zscale = 1.0;

  // For tap/click reporting, we need to remember where the touch started
  let startX = 0;
  let startY = 0;
  // What is a click/tap and what is a drag? If the cursor moved more than
  // this threshold between touchStart and touchEnd, it is a drag
  const threshold = 6;

  return {
    // Methods to report local state. Return a copy to protect local values
    touchStarted: () => touchStarted,
    zoomStarted: () => zoomStarted,
    moved: () => moved,
    zoomed: () => zoomed,
    tapped: () => tapped,
    touchEnded: () => touchEnded,
    hasChanged: () => (moved || zoomed || tapped),
    zscale: () => zscale,
    x: () => cursorX,
    y: () => cursorY,

    // Methods to update local state
    startTouch,
    startZoom,
    move,
    zoom,
    endTouch,
    reset,
  };

  function startTouch(evnt) {
    cursorX = evnt.clientX;
    cursorY = evnt.clientY;
    touchStarted = true;
    startX = cursorX;
    startY = cursorY;
    tapping = true;
  }

  function startZoom(evnt) {
    // Store the cursor position
    cursorX = evnt.clientX;
    cursorY = evnt.clientY;
    zoomStarted = true;
    tapping = false;
  }

  function move(evnt) {
    cursorX = evnt.clientX;
    cursorY = evnt.clientY;
    moved = true;
    const dist = Math.abs(cursorX - startX) + Math.abs(cursorY - startY);
    if (dist > threshold) tapping = false;
  }

  function zoom(scale) {
    zscale *= scale;
    zoomed = true;
    tapping = false;
  }

  function endTouch() {
    if (touchStarted) {
      // Ending a new touch? Just ignore both // TODO: is this a good idea?
      touchStarted = false;
      touchEnded = false;
    } else {
      touchEnded = true;
    }
    tapped = tapping;
    tapping = false;
  }

  function reset() {
    touchStarted = false;
    zoomStarted  = false;
    moved  = false;
    zoomed = false;
    touchEnded = false;
    // NOTE: we do NOT reset tapping... this could carry over to next check
    tapped = false;
    zscale = 1.0;
  }
}
