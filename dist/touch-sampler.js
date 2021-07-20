function initCursor() {
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

function initTouch(div) {
  // Add event listeners to update the state of a cursor object
  // Input div is an HTML element on which events will be registered
  const cursor = initCursor();

  // Remember the distance between two pointers
  let lastDistance = 1.0;

  div.addEventListener("dragstart", d => d.preventDefault(), false);

  // Add mouse events
  div.addEventListener("mousedown",   cursor.startTouch, false);
  div.addEventListener("mousemove",   cursor.move,       false);
  div.addEventListener("mouseup",     cursor.endTouch,   false);
  div.addEventListener("mouseleave",  cursor.endTouch,   false);
  div.addEventListener("wheel",       wheelZoom,         false);

  // Add touch events
  div.addEventListener("touchstart",  initTouch,       false);
  div.addEventListener("touchmove",   moveTouch,       false);
  div.addEventListener("touchend",    cursor.endTouch, false);
  div.addEventListener("touchcancel", cursor.endTouch, false);

  return cursor;

  function initTouch(evnt) {
    const { touches } = evnt;
    evnt.preventDefault();
    switch (touches.length) {
      case 1:
        cursor.startTouch(touches[0]);
        break;
      case 2: {
        const midpoint = getMidPoint(touches[0], touches[1]);
        cursor.startTouch(midpoint);
        cursor.startZoom(midpoint);
        // Initialize the starting distance between touches
        lastDistance = midpoint.distance;
        break;
      }
      default:
        cursor.endTouch(evnt);
    }
  }

  function moveTouch(evnt) {
    const { touches } = evnt;
    evnt.preventDefault();
    // NOTE: MDN says to add the touchmove handler within the touchstart handler
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
    switch (touches.length) {
      case 1:
        cursor.move(touches[0]);
        break;
      case 2: {
        const midpoint = getMidPoint(touches[0], touches[1]);
        // Move the cursor to the midpoint
        cursor.move(midpoint);
        // Zoom based on the change in distance between the two touches
        cursor.zoom(lastDistance / midpoint.distance);
        // Remember the new touch distance
        lastDistance = midpoint.distance;
        break;
      }
      default:
        return false;
    }
  }

  // Convert a two-touch event to a single event at the midpoint
  function getMidPoint(p0, p1) {
    const dx = p1.clientX - p0.clientX;
    const dy = p1.clientY - p0.clientY;
    return {
      clientX: p0.clientX + dx / 2,
      clientY: p0.clientY + dy / 2,
      distance: Math.hypot(dx, dy),
    };
  }

  function wheelZoom(turn) {
    turn.preventDefault();
    cursor.startZoom(turn);
    // We ignore the dY from the browser, since it may be arbitrarily scaled
    // based on screen resolution or other factors. We keep only the sign.
    // See https://github.com/Leaflet/Leaflet/issues/4538
    const zoomScale = 1.0 + 0.2 * Math.sign(turn.deltaY);
    cursor.zoom(zoomScale);
  }
}

export { initTouch };
