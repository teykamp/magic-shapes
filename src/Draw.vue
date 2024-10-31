
<template>
  <canvas
    :width="width"
    :height="height"
    ref="canvas"
    :class="`w-[${width}px] h-[${height}px]`"
  ></canvas>

  <button @click="reverseee" style="color: red; position: absolute; top: 0; left: 0;">dsadsadsa</button>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue';
import { useWindowSize } from "@vueuse/core";
import { drawShape } from './shapes/draw';
import { animate } from './shapes/animate/animate';
import type { ShapeAnimation } from './shapes/types';

const canvas = ref<HTMLCanvasElement | null>(null);


const { width, height } = useWindowSize();

const animation: ShapeAnimation = {
  duration: 2000,
  xOffset: 500,
  yOffset: 500,
  scale: 5.5,
  loop: true,
}

let animationControl: {
  paused: Ref<boolean, boolean>;
  lastElapsed: Ref<number, number>;
  stopAnimation: () => void;
  pauseAnimation: () => void;
  unpauseAnimation: () => void;
  restartAnimation: () => void;
  reverseAnimation: () => void;
}

const reverseee = () => {
  if (!animationControl.paused.value)
  animationControl.pauseAnimation()
  else 
  animationControl.unpauseAnimation()
}

onMounted(() => {
  if (canvas.value) {

    const ctx = canvas.value.getContext('2d');
    if (ctx) {
      
      // this needs to be controlled like a shape. as in, you draw the shape normally, but this will interact with it and modify where it is being drawn, but it is the same shape...
      animationControl = animate(animation)((options) => {
        drawShape(ctx).drawSquare(options)
      })({
        at: { x: 100, y: 100 },
        width: 50,
        height: 50
      })

      const drawLoop = setInterval(() => {
        ctx.clearRect(0, 0, 1000, 1000)

          
      }, 1000 / 60)
    }

  }

});
</script>