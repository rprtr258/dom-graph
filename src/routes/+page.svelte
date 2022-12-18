<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import Func from "./Func.svelte";

  let fx: (x: number) => number;
  let fy: (x: number) => number;
  let canvas: HTMLCanvasElement;

  let offsetX = 0;
  let offsetY = 0;

  function radians(degrees: number) {
    return degrees * Math.PI / 180;
  }

  let ctx: CanvasRenderingContext2D;
  const period = 10;
  let secsPassed = 0;

  function onMnt() {
    secsPassed += period/20;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.beginPath();
    for (let i = 0; i < 360; i += 0.1) {
      const angleX = radians(i + secsPassed);
      const angleY = radians(i);
      const x = fx(angleX) * canvas.width / 2 + centerX;
      const y = fy(angleY) * canvas.height / 2 + centerY;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  onMount(() => {
    ctx = canvas.getContext("2d")!;
    onMnt();
    setInterval(onMnt, period);
  });
  afterUpdate(onMnt);
</script>

<svelte:head>
  <title>DOM Graphs</title>
</svelte:head>

<canvas bind:this={canvas} width="400" height="400"/>
<div>
  <Func
    bind:func={fx}
    fcn="sin"
    bind:offset={offsetX}
  />
  <Func
    bind:func={fy}
    fcn="cos"
    bind:offset={offsetY}
  />
</div>

<style>
  canvas {
    width: 450px;
    float: left;
    border: 1px solid black;
    margin: 5px;
  }
</style>
