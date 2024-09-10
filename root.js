// function remap(x: number, old_min: number, old_max: number, new_min: number, new_max: number): number {
function remap(x, old_min, old_max, new_min, new_max) {
  return (x - old_min) / (old_max - old_min) * (new_max - new_min) + new_min;
}

// function evalAt(formula: string, xs: []number): []number {
function evalAt(formula, xs) {
  const formulaPrelude = `
    const sin = Math.sin;
    const cos = Math.cos;
  `;
  return eval(formulaPrelude + `[${xs}].map(x => ` + formula + `)`);
}

function draw(props, canvas) {
  const {formula, x0, zoomx, y0, zoomy, steps} = props;

  props.error = (() => {
    try { // try to parse formula
      evalAt(formula, [x0]);
      return null;
    } catch (e) { // if failed, do nothing
      if (e instanceof SyntaxError) {
        return e.message;
      }
      throw e;
    }
  })();

  const zoomxpw2 = Math.pow(2, zoomx);
  const zoomypw2 = Math.pow(2, zoomy);
  const minx =  x0 - zoomxpw2;
  const maxx = +x0 + zoomxpw2;
  const miny =  y0 - zoomypw2;
  const maxy = +y0 + zoomypw2;
  const step = (maxx - minx) / steps;

  // ====== actually drawing =======
  const ctx = canvas.getContext("2d");
  // NOTE: I am too dumb to just set appropriate transform matrix on canvas once
  // function lineTo(x: number, y: number) {
  function lineTo(x, y) {
    ctx.lineTo(
      remap(x, minx, maxx, 0, canvas.width),
      remap(y, miny, maxy, canvas.height, 0),
    );
  }
  // background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // x-axis
  ctx.strokeStyle = "black";
  ctx.beginPath();
  lineTo(minx, 0);
  lineTo(maxx, 0);
  ctx.stroke();
  // y-axis
  ctx.beginPath();
  lineTo(0, miny);
  lineTo(0, maxy);
  ctx.stroke();
  // graph itself
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  const xs = Array.from({length: steps}, (_, i) => minx + i * step);
  evalAt(formula, xs).forEach((y, i) => lineTo(xs[i], y));
  ctx.stroke();
}