import Func from "./Func.js"

function radians(degrees) {
  return degrees * Math.PI / 180;
}

const period = 10;

export default {
  data() {
    return {
      fx: (t) => Math.sin(t),
      fy: (t) => Math.cos(t),
      secsPassed: 0,
    }
  },
  methods: {
    onMnt() {
      this.secsPassed += period / 20;
      const centerX = this.$refs.canvas.width / 2;
      const centerY = this.$refs.canvas.height / 2;
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      this.ctx.strokeStyle = "black";
      this.ctx.beginPath();
      for (let i = 0; i < 360; i += 0.1) {
        const angleX = radians(i + this.secsPassed);
        const angleY = radians(i);
        const x = this.fx(angleX) * this.$refs.canvas.width / 2 + centerX;
        const y = this.fy(angleY) * this.$refs.canvas.height / 2 + centerY;
        this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      this.ctx.stroke();
    }
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d");
    this.onMnt();
    setInterval(this.onMnt, period);
  },
  components: {
    Func
  },
  template: /*html*/`
    <canvas ref="canvas" width="400" height="400"/>
    <div>
      <Func
        initFcn="sin"
        v-model:func="fx"
      />
      <Func
        initFcn="cos"
        v-model:func="fy"
      />
    </div>
  `
}
