import { ref } from 'vue'
import type { 
  ShapeAnimation, 
  Circle,
  Rectangle,
  Line,
  Arrow,
  Triangle 
} from '../types'
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
    color,
  } = {
    ...ANIMATION_DEFAULTS,
    ...animation
  }

  const calculateFrameState = (initialOptions: Circle | Rectangle, progress: number) => {
    const startColor = hexToRgb(initialOptions.color ?? color)
    const endColor = animation.color ? hexToRgb(animation.color) : startColor
    const newColor = interpolateColor(startColor, endColor, progress)

    if ('radius' in initialOptions) {
      const newX = initialOptions.at.x + xOffset * progress
      const newY = initialOptions.at.y + yOffset * progress
      const newRadius = initialOptions.radius * (1 + (scale - 1) * progress)

      return {
        at: { x: newX, y: newY },
        radius: newRadius,
        color: newColor,
      }
    } else {
      const newX = initialOptions.at.x + xOffset * progress
      const newY = initialOptions.at.y + yOffset * progress
      const newWidth = initialOptions.width * (1 + (scale - 1) * progress)
      const newHeight = initialOptions.height * (1 + (scale - 1) * progress)

      return {
        at: { x: newX, y: newY },
        width: newWidth,
        height: newHeight,
        color: newColor,
      }
    }
  }

  return (drawFunction: (options: any) => void) => (initialOptions: any) => {
    const frameState = ref<typeof initialOptions>(initialOptions)

    const stopAnimation = () => {
      if (animationFrameId.value !== null) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = null
      }
    }

    const pauseAnimation = () => {
      if (animationFrameId.value !== null) {
        paused.value = true
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
        drawFunction(frameState.value)
        animationFrameId.value = requestAnimationFrame(animateFrame)
        return
      }

      if (startTime.value === null) startTime.value = timestamp

      const elapsed = timestamp - startTime.value
      lastElapsed.value = elapsed
      const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1)
      const easedProgress = easeFunction(progress, animation.ease)
      const currentProgress = isReversing.value ? 1 - easedProgress : easedProgress
      pausedProgress.value = currentProgress

      frameState.value = calculateFrameState(initialOptions, currentProgress)

      drawFunction(frameState.value)

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
      paused,
      lastElapsed,

      stopAnimation,
      pauseAnimation,
      unpauseAnimation,
      restartAnimation,
      reverseAnimation,
    }
  }
}
