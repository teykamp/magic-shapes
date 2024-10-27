
<template>
  <canvas
    :width="width"
    :height="height"
    ref="canvas"
    :class="`w-[${width}px] h-[${height}px]`"
  ></canvas>

  <button @click="clickval = !clickval" style="color: red; position: absolute; top: 0; left: 0;">{{ clickval }}</button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWindowSize } from "@vueuse/core";
import { drawShape } from './shapes/draw.ts';
import { animate } from './shapes/animate/animate.ts';

const canvas = ref<HTMLCanvasElement | null>(null);

const clickval = ref(false)

const { width, height } = useWindowSize();

const animation = {
  duration: 2000,
  xOffset: 500,
  yOffset: 500,
  scale: 1.5,
  loop: true
}

onMounted(() => {
  if (canvas.value) {

    const ctx = canvas.value.getContext('2d');
    if (ctx) {
      
      const animationControl = animate(animation)((options) => {
        drawShape(ctx).drawCircle(options)
      })({
        at: { x: 100, y: 100 },
        radius: 100,
      })

      const drawLoop = setInterval(() => {
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

        if (clickval.value) {
          animationControl.pauseAnimation()
          drawShape(ctx).drawCircle({
            at: { x: 100, y: 100 },
            radius: 100,
          })
        } else {
          animationControl.unpauseAnimation()
        }
      }, 1000 / 60)
    }

  }

});
</script>