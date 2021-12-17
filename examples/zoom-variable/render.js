export function render(ctx, dx, dy, scale) {
  const { width, height } = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.setTransform(scale, 0, 0, scale, dx, dy);
  fillBox(10, 10, 20, "red");
  fillBox(40, 40, 100, "blue");
  fillBox(300, 70, 150, "green");
  fillBox(120, 300, 200, "orange");
  fillBox(400, 350, 60, "purple");

  function fillBox(dx, dy, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(dx, dy, size, size);
  }
}
