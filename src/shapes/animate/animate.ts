import { ref } from 'vue'
import type { ShapeAnimation } from '../types'
import { ANIMATION_DEFAULTS } from '../types'
import {
  hexToRgb,
  easeFunction,
  interpolateColor
} from '../helpers'

export const animate = (animation: ShapeAnimation) => {
  const animationFrameId = ref<number | null>(null)
  const startTime = ref<number | null>(null)
  const isReversing = ref(false)
  const paused = ref(false)
  const pausedProgress = ref(0)
  const lastElapsed = ref(0)

  const {
    duration,
    xOffset,
    yOffset,
    scale,
    loop, 
    color
  } = {
    ...ANIMATION_DEFAULTS,
    ...animation
  }
  
  return (drawFunction: (options: any) => void) => (initialOptions: any) => {
    const startColor = hexToRgb(initialOptions.color ?? color)
    const endColor = animation.color ? hexToRgb(animation.color) : startColor


    const stopAnimation = () => {
      if (animationFrameId.value !== null) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = null
      }
    }

    const pauseAnimation = () => {
      if (animationFrameId.value !== null) {
        paused.value = true
        stopAnimation()
      }
    }

    const unpauseAnimation = () => {
      if (paused.value) {
        paused.value = false
        startTime.value = performance.now() - lastElapsed.value
        animationFrameId.value = requestAnimationFrame(animateFrame)
      }
    }

    const restartAnimation = () => {
      paused.value = false
      startTime.value = null
      isReversing.value = false
      lastElapsed.value = 0
      pausedProgress.value = 0
      stopAnimation()
      animationFrameId.value = requestAnimationFrame(animateFrame)
    }

    const reverseAnimation = () => {
      isReversing.value = !isReversing.value
      const currentElapsed = lastElapsed.value
      const currentProgress = currentElapsed / duration

      startTime.value = performance.now() - (1 - currentProgress) * duration

      stopAnimation() 
      animationFrameId.value = requestAnimationFrame(animateFrame)
    }

    const animateFrame = (timestamp: number) => {
      if (paused.value) {
        return
      }

      if (startTime.value === null) startTime.value = timestamp

      const elapsed = timestamp - startTime.value
      lastElapsed.value = elapsed
      const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1)
      const easedProgress = easeFunction(progress, animation.ease)

      const currentProgress = isReversing.value ? 1 - easedProgress : easedProgress

      pausedProgress.value = currentProgress

      const newX = initialOptions.at.x + xOffset * currentProgress
      const newY = initialOptions.at.y + yOffset * currentProgress
      const newRadius = initialOptions.radius * (1 + (scale - 1) * currentProgress)
      const newColor = interpolateColor(startColor, endColor, currentProgress)

      drawFunction({
        at: { x: newX, y: newY },
        radius: newRadius,
        color: newColor,
      })

      if (progress < 1) {
        animationFrameId.value = requestAnimationFrame(animateFrame)
      } else if (!isReversing.value && loop) {
        isReversing.value = true
        startTime.value = null
        animationFrameId.value = requestAnimationFrame(animateFrame)
      } else if (isReversing.value && loop) {
        isReversing.value = false
        startTime.value = null
        animationFrameId.value = requestAnimationFrame(animateFrame)
      }
    }

    stopAnimation()
    animationFrameId.value = requestAnimationFrame(animateFrame)

    return {
      stopAnimation,
      pauseAnimation,
      unpauseAnimation,
      restartAnimation,
      reverseAnimation,
    }
  }
}
