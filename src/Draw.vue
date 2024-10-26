
<template>
  <canvas
    :width="width"
    :height="height"
    ref="canvas"
    :class="`w-[${width}px] h-[${height}px]`"
  ></canvas>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWindowSize } from "@vueuse/core";
import { drawShape } from './shapes/draw.ts';
import { animate } from './shapes/animate/animate.ts';

const canvas = ref<HTMLCanvasElement | null>(null);

const { width, height } = useWindowSize();

const animation = {
  ease: "in-out",
  duration: 2000,
  xOffset: 500,
  yOffset: 500,
  scale: 1.5,
  loop: true,
}
const animation2 = {
  ease: "linear",
  duration: 20000,
  scale: 5,
  color: "#000000",
}

onMounted(() => {
  if (canvas.value) {

    const ctx = canvas.value.getContext('2d');
    if (ctx) {
      const x = animate(animation)((options) => {
        drawShape(ctx).drawCircle(options);
      })({
        at: { x: 100, y: 100 },
        radius: 100,
        color: "#0000FF",
      });
      

      setTimeout(() => {
        x.pauseAnimation()
      }, 1000);
      setTimeout(() => {
        x.restartAnimation()
      }, 2000);
      setTimeout(() => {
        x.pauseAnimation()
      }, 5000);
      setTimeout(() => {
        x.restartAnimation()
      }, 7000);

      const drawLoop = setInterval(() => {
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
      }, 1000 / 60)
    }

  }

});
</script>