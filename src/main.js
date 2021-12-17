import { initCursor } from "./cursor.js";
import { getMidPoint, initWheelScale } from "./util.js";

export function initTouch(div, { wheelDelta = "default" } = {}) {
  // Add event listeners to update the state of a cursor object
  // Input div is an HTML element on which events will be registered
  const cursor = initCursor();
  const getWheelScale = initWheelScale(wheelDelta);

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

  function wheelZoom(turn) {
    turn.preventDefault();
    cursor.startZoom(turn);
    cursor.zoom(getWheelScale(turn));
  }
}
