<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';

function remap(x: number, old_min: number, old_max: number, new_min: number, new_max: number): number {
  return (x - old_min) / (old_max - old_min) * (new_max - new_min) + new_min;
}
function evalAt(formula: string, x: number): number {
  const formulaPrelude = `
    const sin = Math.sin;
    const cos = Math.cos;
  `;
  return eval(formulaPrelude + `const x = ${x};` + formula);
}

const x0  = ref(0);
const zoomx = ref(0);
const y0 = ref(0);
const zoomy = ref(0);
const steps = ref(10000);
const formula = ref("sin(1/x)");
const examples = ["sin(1/x)", "sin(x)", "x*x", "1/x", "cos(x)", "cos(1/x)"];
const error: Ref<string|null> = ref(null);

const $canvas = ref(null);

function draw() {
  try { // try to parse formula
    evalAt(formula.value, x0.value);
    error.value = null;
  } catch (e) { // if failed, do nothing
    if (e instanceof SyntaxError) {
      error.value = e.message;
      return;
    }
    throw e;
  }

  // NOTE: for some fucking reason x0.value is string here
  const minx = x0.value - Math.pow(2, zoomx.value);
  const maxx = +x0.value + Math.pow(2, zoomx.value);
  const miny = y0.value - Math.pow(2, zoomy.value);
  const maxy = +y0.value + Math.pow(2, zoomy.value);
  const step = (maxx - minx) / steps.value;

  // ====== actually drawing =======
  const canvas = $canvas as any as Ref<HTMLCanvasElement>;
  const ctx = canvas.value.getContext("2d") as CanvasRenderingContext2D;
  // NOTE: I am too dumb to just set appropriate transform matrix on canvas once
  function lineTo(x: number, y: number) {
    ctx.lineTo(
      remap(x, minx, maxx, 0, canvas.value.width),
      remap(y, miny, maxy, canvas.value.height, 0),
    );
  }
  // background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
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
  for (let i = 0; i < steps.value; i++) {
    const x = minx + i * step;
    const y = evalAt(formula.value, x);
    lineTo(x, y);
  }
  ctx.stroke();
}
watch([x0, zoomx, y0, zoomy, steps, formula], draw);
onMounted(draw);
</script>
<template>
  <canvas ref="$canvas" width="400" height="400" />
  <p><input type="textarea" v-model="formula"></p>
  <p style="color: red">{{error}}</p>
  <div><button v-for="example in examples" :key="example" @click="formula = example">{{example}}</button></div>
  <div>
    <p><input type="number" min=100 step=100 v-model="steps"></p>
  </div><div>
    <p>x0<input type="range" :min=-100 :max=100 v-model="x0">{{x0}}</p>
    <div style="width: 1em;"></div>
    <p>zoomx<input type="range" :min=-10 :max=10 :step=0.1 v-model="zoomx">{{zoomx}}</p>
    <div style="width: 1em;"></div>
  </div><div>
    <p>y0<input type="range" :min=-100 :max=100 v-model="y0">{{y0}}</p>
    <div style="width: 1em;"></div>
    <p>zoomy<input type="range" :min=-10 :max=10 :step=0.1 v-model="zoomy">{{zoomy}}</p>
    <div style="width: 1em;"></div>
  </div>
</template>
<style scoped>
canvas {
  width: 450px;
  float: left;
  border: 1px solid black;
  margin: 5px;
}
div * {
  display: inline-block;
}
</style>