import { initTouch } from "../../dist/touch-sampler.js";
import { render } from "./render.js";

export function setupMap(canvas) {
  const cursor = initTouch(canvas, { wheelDelta: "constant" });
  let scale = 1;
  let x = 0;
  let y = 0;

  let x0 = 0;
  let y0 = 0;
  let dragging = false;

  const ctx = canvas.getContext("2d");

  requestAnimationFrame(animate);

  function animate() {
    if (cursor.touchStarted()) {
      dragging = true;
      x0 = cursor.x();
      y0 = cursor.y();
    }
    if (cursor.touchEnded()) {
      dragging = false;
    }
    if (dragging) {
      x += (cursor.x() - x0);
      y += (cursor.y() - y0);
      x0 = cursor.x();
      y0 = cursor.y();
    }
    if (cursor.zoomed()) {
      const zscale = 1.0 / cursor.zscale();
      const { left: cx, top: cy } = canvas.getBoundingClientRect();
      x += (cursor.x() - cx - x) * (1.0 - zscale);
      y += (cursor.y() - cy - y) * (1.0 - zscale);
      scale *= zscale;
    }
    cursor.reset();

    render(ctx, x, y, scale);
    requestAnimationFrame(animate);
  }
}
