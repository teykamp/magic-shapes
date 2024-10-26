import type { ShapeAnimation } from '../types'
import { ANIMATION_DEFAULTS } from '../types'
import { hexToRgb, easeFunction, interpolateColor } from '../helpers'
import { ref } from 'vue'


export const animate = (animation: ShapeAnimation) => {
  const animationFrameId = ref <number | null>(null)
  const startTime = ref <number | null>(null)
  const isReversing = ref(false)
  const paused = ref(false)
  const pausedProgress = ref(0)


  return (drawFunction: (options: any) => void) => (initialOptions: any) => {
    const startColor = hexToRgb(initialOptions.color)
    const endColor = animation.color ? hexToRgb(animation.color) : startColor

    const {
      duration,
      xOffset,
      yOffset,
      scale,
      loop
    } = {
      ...ANIMATION_DEFAULTS,
      ...animation
    }

    const stopAnimation = () => {
      if (animationFrameId.value !== null) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = null
      }
    }
// pausing only pauses drawing doesnt pause animation
    const pauseAnimation = () => {
      if (animationFrameId.value !== null) {
        paused.value = true
        stopAnimation()
      }
    }

    const restartAnimation = () => {
      paused.value = false
      stopAnimation();
      animationFrameId.value = requestAnimationFrame(animateFrame);
    }

    const animateFrame = (timestamp: number) => {
      if (startTime.value === null) startTime.value = timestamp

      const elapsed = timestamp - startTime.value
      const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1)
      const easedProgress = easeFunction(progress, animation.ease)

      const currentProgress = isReversing.value ? 1 - easedProgress : easedProgress

      // circles only
      const newX = initialOptions.at.x + xOffset * currentProgress
      const newY = initialOptions.at.y + yOffset * currentProgress
      const newRadius = initialOptions.radius * (1 + (scale - 1) * currentProgress)
      const newColor = interpolateColor(startColor, endColor, currentProgress)

      drawFunction({
        at: { x: newX, y: newY },
        radius: newRadius,
        color: newColor,
      })

      // end circles only

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
      restartAnimation
    }
  }
}
