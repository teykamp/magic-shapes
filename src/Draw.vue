
<template>
  <canvas
    :width="width ?? 1000"
    :height="height ?? 1000"
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
  color: "#FF0000",
  loop: true,
}

onMounted(() => {
  if (canvas.value) {

    const ctx = canvas.value.getContext('2d');
    if (ctx) {
      animate(animation)((options) => {
        drawShape(ctx).drawCircle(options);
      })({
        at: { x: 100, y: 100 },
        radius: 100,
        color: "#0000FF"
      });

      const drawLoop = setInterval(() => {
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
      }, 1000 / 60)
    }
  }
});
</script>