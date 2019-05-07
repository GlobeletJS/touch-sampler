export function initCursor() {
  // What does an animation need to know about the cursor at each frame?
  // First, whether the user did any of the following since the last frame:
  //  - Started new actions
  var touchStarted = false; // Touched or clicked the element
  var zoomStarted  = false; // Rotated mousewheel, or started two-finger touch
  //  - Changed something
  var moved  = false;       // Moved mouse or touch point
  var zoomed = false;       // Rotated mousewheel, or adjusted two-finger touch
  //  - Ended actions
  var touchEnded = false;   // mouseup or touchend/cancel/leave

  // We also need to know the current cursor position and zoom scale
  var cursorX = 0;
  var cursorY = 0;
  var zscale = 1.0;

  return {
    // Methods to report local state. These protect local values, returning a copy
    touchStarted: function() { return touchStarted; },
    zoomStarted:  function() { return zoomStarted; },
    moved:        function() { return moved; },
    zoomed:       function() { return zoomed; },
    touchEnded:   function() { return touchEnded; },
    hasChanged:   function() { return (moved || zoomed); },
    x: function() { return cursorX; },
    y: function() { return cursorY; },
    zscale: function() { return zscale; },

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
  }

  function startZoom(evnt) {
    // Store the cursor position
    cursorX = evnt.clientX;
    cursorY = evnt.clientY;
    zoomStarted = true;
  }

  function move(evnt) {
    cursorX = evnt.clientX;
    cursorY = evnt.clientY;
    moved = true;
    return;
  }

  function zoom(scale) {
    zscale *= scale;
    zoomed = true;
    return;
  }

  function endTouch() {
    if (touchStarted) {
      // Ending a new touch? Just ignore both
      touchStarted = false;
      touchEnded = false;
    } else {
      touchEnded = true;
    }
  }

  function reset() {
    touchStarted = false;
    zoomStarted  = false;
    moved  = false;
    zoomed = false;
    touchEnded = false;
    zscale = 1.0;
  }
}
