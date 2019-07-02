function initCursor() {
  // What does an animation need to know about the cursor at each frame?
  // First, whether the user did any of the following since the last frame:
  //  - Started new actions
  var touchStarted = false; // Touched or clicked the element
  var zoomStarted  = false; // Rotated mousewheel, or started two-finger touch
  //  - Changed something
  var moved  = false;       // Moved mouse or touch point
  var zoomed = false;       // Rotated mousewheel, or adjusted two-finger touch
  //  - Is potentially in the middle of something
  var tapping = false;      // No touchEnd, and no cursor motion
  //  - Ended actions
  var touchEnded = false;   // mouseup or touchend/cancel/leave
  var tapped = false;       // Completed a click or tap action

  // We also need to know the current cursor position and zoom scale
  var cursorX = 0;
  var cursorY = 0;
  var zscale = 1.0;

  // For tap/click reporting, we need to remember where the touch started
  var startX = 0;
  var startY = 0;
  // What is a click/tap and what is a drag? If the cursor moved more than
  // this threshold between touchStart and touchEnd, it is a drag
  const threshold = 5;

  return {
    // Methods to report local state. These protect local values, returning a copy
    touchStarted: () => touchStarted,
    zoomStarted:  () => zoomStarted,
    moved:        () => moved,
    zoomed:       () => zoomed,
    tapped:       () => tapped,
    touchEnded:   () => touchEnded,
    hasChanged:   () => (moved || zoomed),
    zscale:       () => zscale,
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
    var dist = Math.abs(cursorX - startX) + Math.abs(cursorY - startY);
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

// Add event listeners to update the state of a cursor object
// Input div is an HTML element on which events will be registered
function initTouchy(div) {
  const cursor = initCursor();

  // Remember the distance between two pointers
  var lastDistance = 1.0;
  
  // Capture the drag event so we can disable any default actions
  div.addEventListener('dragstart', function(drag) {
    drag.preventDefault();
    return false;
  }, false);

  // Add mouse events
  div.addEventListener('mousedown',   cursor.startTouch, false);
  div.addEventListener('mousemove',   cursor.move,       false);
  div.addEventListener('mouseup',     cursor.endTouch,   false);
  div.addEventListener('mouseleave',  cursor.endTouch,   false);
  div.addEventListener('wheel',       wheelZoom,         false);

  // Add touch events
  div.addEventListener('touchstart',  initTouch,       false);
  div.addEventListener('touchmove',   moveTouch,       false);
  div.addEventListener('touchend',    cursor.endTouch, false);
  div.addEventListener('touchcancel', cursor.endTouch, false);

  // Return a pointer to the cursor object
  return cursor;

  function initTouch(evnt) {
    evnt.preventDefault();
    switch (evnt.touches.length) {
      case 1: 
        cursor.startTouch(evnt.touches[0]);
        break;
      case 2:
        var midpoint = getMidPoint(evnt.touches[0], evnt.touches[1]);
        cursor.startTouch(midpoint);
        cursor.startZoom(midpoint);
        // Initialize the starting distance between touches
        lastDistance = midpoint.distance;
        break;
      default:
        cursor.endTouch(evnt);
    }
  }

  function moveTouch(evnt) {
    evnt.preventDefault();
    // NOTE: MDN says to add the touchmove handler within the touchstart handler
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
    switch (evnt.touches.length) {
      case 1:
        cursor.move(evnt.touches[0]);
        break;
      case 2:
        var midpoint = getMidPoint(evnt.touches[0], evnt.touches[1]);
        // Move the cursor to the midpoint
        cursor.move(midpoint);
        // Zoom based on the change in distance between the two touches
        cursor.zoom(lastDistance / midpoint.distance);
        // Remember the new touch distance
        lastDistance = midpoint.distance;
        break;
      default:
        return false;
    }
  }

  // Convert a two-touch event to a single event at the midpoint
  function getMidPoint(p0, p1) {
    var dx = p1.clientX - p0.clientX;
    var dy = p1.clientY - p0.clientY;
    return {
      clientX: p0.clientX + dx / 2,
      clientY: p0.clientY + dy / 2,
      distance: Math.sqrt(dx * dx + dy * dy),
    }
  }

  function wheelZoom(turn) {
    turn.preventDefault();
    cursor.startZoom(turn);
    // We ignore the dY from the browser, since it may be arbitrarily scaled
    // based on screen resolution or other factors. We keep only the sign.
    // See https://github.com/Leaflet/Leaflet/issues/4538
    var zoomScale = 1.0 + 0.2 * Math.sign(turn.deltaY);
    cursor.zoom(zoomScale);
  }
}

export { initTouchy };
