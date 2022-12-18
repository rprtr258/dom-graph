<script lang="ts">
    import { afterUpdate, onMount } from "svelte";

  import Func from "./Func.svelte";

  const graphTypes = {
    "polar": "Polar",
    "lissajous": "Lissajous",
  };
  let theGraphType: keyof typeof graphTypes = "polar";
  let fx: (x: number) => number;
  let fy: (x: number) => number;
  let canvas: HTMLCanvasElement;

  function radians(degrees: number) {
    return degrees * Math.PI / 180;
  }

  function onMnt() {
    const ctx = canvas.getContext("2d")!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    for (let i = 0; i < 360; i += 0.1) {
      const angle = radians(i);
      const x = fx(angle) * canvas.width / 2 + centerX;
      const y = fy(angle) * canvas.height / 2 + centerY;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  onMount(onMnt);
  afterUpdate(onMnt);
</script>

<svelte:head>
  <title>DOM Graphs</title>
</svelte:head>

<canvas bind:this={canvas} width="400" height="400"/>
<div>
  <Func bind:func={fx}/>
  <Func bind:func={fy}/>
  <p>
    Type of graph:
    {#each Object.keys(graphTypes) as graphType}
      <input bind:group={theGraphType} type="radio" value={graphType} id={graphType}/>
      <label for={graphType}>{graphType.at(0)?.toUpperCase()}{graphType.substring(1)}</label>
    {/each}
  </p>
</div>

<style>
  canvas {
    width: 450px;
    float: left;
    border: 1px solid black;
    margin: 5px;
  }
</style>
