import { ref } from 'vue'
import type { 
  ShapeAnimation, 
  Circle,
  Rectangle,
  Line,
  Arrow,
  Triangle,
  Coordinate
} from '../types'
import { ANIMATION_DEFAULTS } from '../types'
import {
  hexToRgb,
  easeFunction,
  interpolateColor,
  rotatePoint,
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
    rotation,
  } = {
    ...ANIMATION_DEFAULTS,
    ...animation
  }

  const calculateFrameState = (initialOptions: Circle | Rectangle | Triangle, progress: number) => {
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
    } else if ('width' in initialOptions && 'height' in initialOptions) {
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
    } else {
      const { point1, point2, point3 } = initialOptions

      const initialCenter = {
        x: (point1.x + point2.x + point3.x) / 3,
        y: (point1.y + point2.y + point3.y) / 3
      }

      const offsetCenter = {
        x: initialCenter.x + xOffset * progress,
        y: initialCenter.y + yOffset * progress
      }

      const scaledPoint = (point: Coordinate) => ({
        x: offsetCenter.x + (point.x - initialCenter.x) * (1 + (scale - 1) * progress),
        y: offsetCenter.y + (point.y - initialCenter.y) * (1 + (scale - 1) * progress)
      })

      const newPoint1 = scaledPoint(point1)
      const newPoint2 = scaledPoint(point2)
      const newPoint3 = scaledPoint(point3)

      const rotationAngle = rotation * progress
      const rotatedPoint1 = rotatePoint(newPoint1, offsetCenter, rotationAngle)
      const rotatedPoint2 = rotatePoint(newPoint2, offsetCenter, rotationAngle)
      const rotatedPoint3 = rotatePoint(newPoint3, offsetCenter, rotationAngle)

      return {
        point1: rotatedPoint1,
        point2: rotatedPoint2,
        point3: rotatedPoint3,
        color: newColor,
        rotation: rotationAngle
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
