function flatten(n) {
  return n === null ? [] :
    n instanceof Node ? [n] :
    typeof n === "string" ? [n] :
      n.flatMap(flatten);
}

function m(
  tag,
  props = {},
  ...children
) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "style") {
      for (const [k, v] of Object.entries(value ?? {})) {
        el.style.setProperty(k, v);
      }
    } else if (key.startsWith("on")) {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of flatten(children)) {
    if (child === null) {
      continue;
    }
    el.append(
      child instanceof Node ? child :
      typeof child === "string" ? document.createTextNode(child) :
        child[0]);
  }
  return el;
}

function remap(x, old_min, old_max, new_min, new_max) {
  return (x - old_min) / (old_max - old_min) * (new_max - new_min) + new_min;
}

const formulaPrelude = `
  const {sin, cos, pow} = Math;
  window.alert = window.close;
`;

const examples = ["sin(1/x)", "sin(x)", "x*x", "1/x", "cos(x)", "cos(1/x)"];

function changed(orig, patch) {
  return patch !== undefined && patch !== orig;
}

function input(label, props) {
  const el_input = m("input", {type: "range", ...props, oninput: e => props.oninput(Number(e.target.value))});
  const el_value = m("div", {});

  return {
    root: m("p", {}, label, el_input, el_value),
    set: (value) => {
      el_input.value = value;
      el_value.textContent = value;
    },
  };
}

/**
 *
 * @param {HTMLElement} root
 * @returns {void}
 */
(function(root) {
  const data = {
    formula: "",
    error: null,
    lowx: -1,
    highx: 1,
    zoomx: 0,
    lowy: -1,
    highy: 1,
    zoomy: 0,
    steps: 100,
  };
  const updLowx = (lowx) => Math.min(lowx, data.highx - 1);
  const lowxinput  = input("lowx",  {min: -100, max: 100, oninput: x => update({lowx:  updLowx(x)})});
  const updHighx = (highx) => Math.max(highx, data.lowx + 1);
  const highxinput = input("highx", {min: -100, max: 100, oninput: x => update({highx: updHighx(x)})});
  const zoomxinput = input("zoomx", {min: -10,  max: 10,  oninput: x => update({zoomx: x}), step: 0.1});
  const updLowy = (lowy) => Math.min(lowy, data.highy - 1);
  const lowyinput  = input("lowy",  {min: -100, max: 100, oninput: x => update({lowy:  updLowy(x)})});
  const updHighy = (highy) => Math.max(highy, data.lowy + 1);
  const highyinput = input("highy", {min: -100, max: 100, oninput: x => update({highy: updHighy(x)})});
  const zoomyinput = input("zoomy", {min: -10,  max: 10,  oninput: x => update({zoomy: x}), step: 0.1});
  const refs = {
    canvas:  m("canvas", {width: "400", height: "400"}),
    canvas2: m("canvas", {width: "400", height: "400"}),
    formula: m("input", {type: "textarea", oninput: (e) => update({formula: e.target.value})}),
    errtext: m("span", {style: {color: "red"}}),
  };
  const ctx = refs.canvas.getContext("2d");
  const ctx2 = refs.canvas2.getContext("2d");
  const update = (patch) => {
    // NOTE: error change does not trigger redraw
    if (patch.error !== undefined && patch.error !== data.error) {
      data.error = patch.error;
      refs.errtext.textContent = data.error ?? "";
    }

    let should_redraw2 = changed(data.formula, patch.formula);
    let should_redraw =
      should_redraw2 ||
      changed(data.steps, patch.steps) ||
      changed(data.lowx, patch.lowx) ||
      changed(data.highx, patch.highx) ||
      changed(data.zoomx, patch.zoomx) ||
      changed(data.lowy, patch.lowy) ||
      changed(data.highy, patch.highy) ||
      changed(data.zoomy, patch.zoomy);

    Object.assign(data, patch);
    refs.formula.value = data.formula;
    lowxinput.set(data.lowx);
    highxinput.set(data.highx);
    zoomxinput.set(data.zoomx);
    lowyinput.set(data.lowy);
    highyinput.set(data.highy);
    zoomyinput.set(data.zoomy);
    if (should_redraw) {
      draw(should_redraw2);
    }
  };

  const draw = (draw2) => {
    try { // try to parse formula
      eval(formulaPrelude + `const x = ${data.lowx};` + data.formula);
    } catch (e) {
      update({error: e.message});
      return;
    };
    update({error: null});

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, refs.canvas.width, refs.canvas.height);
    ctx.strokeStyle = "black";
    ctx.beginPath();
    const zoomx = Math.pow(2, data.zoomx);
    const minx = data.lowx * zoomx;
    const maxx = data.highx * zoomx;
    const zoomy = Math.pow(2, data.zoomy);
    const miny = data.lowy * zoomy;
    const maxy = data.highy * zoomy;
    const step = (maxx - minx) / data.steps;
    console.log(`drawing in (${minx}, ${miny}) to (${maxx}, ${maxy}): ${data.formula}`);
    for (let x = minx; x < maxx; x += step) {
      const y = eval(formulaPrelude + `const x = ${x};` + data.formula);
      ctx.lineTo(
        remap(x, minx, maxx, 0, refs.canvas.width),
        remap(y, miny, maxy, refs.canvas.height, 0),
      );
    }
    ctx.stroke();

    if (draw2) {
      ctx2.fillStyle = "white";
      ctx2.fillRect(0, 0, refs.canvas.width, refs.canvas.height);
      ctx2.strokeStyle = "black";
      ctx2.beginPath();
      const POINTS = 10000;
      for (let i = 0; i < POINTS; i++) {
        const x = Math.tan(remap(i, 0, POINTS, -Math.PI/2, Math.PI/2));
        const y = eval(formulaPrelude + `const x = ${x};` + data.formula);
        ctx2.lineTo(
          remap(i, 0, POINTS, 0, refs.canvas.width),
          remap(Math.atan(y), -Math.PI/2, Math.PI/2, refs.canvas.height, 0),
        );
      }
      ctx2.stroke();
    }
  };
  update({formula: "sin(1/x)"}); // NOTE: init

  root.append(
    m("div", {style: {display: "grid", "grid-template-columns": "auto 1fr auto"}},
      refs.canvas,
      m("div", {style: {display: "grid", "grid-template-rows": "repeat(1fr, 4)", height: "min-content"}},
        m("div", {},
          "Examples: ",
          examples.map(example => m("button", {onclick: () => update({formula: example})}, example)),
        ),
        m("div", {},
          "Formula: ",
          refs.formula,
          refs.errtext,
        ),
        m("div", {},
          "Points: ",
          m("input", {type: "number", min: "100", step: "100", value: data.steps, oninput: e => update({steps: e.target.value})}),
        ),
        m("div", {},
          lowxinput.root,
          m("div", {style: {width: "1em"}}),
          highxinput.root,
          m("div", {style: {width: "1em"}}),
          zoomxinput.root,
        ),
        m("div", {},
          lowyinput.root,
          m("div", {style: {width: "1em"}}),
          highyinput.root,
          m("div", {style: {width: "1em"}}),
          zoomyinput.root,
        ),
      ),
      refs.canvas2,
    ),
  );
})(document.body);
