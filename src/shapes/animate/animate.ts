import type { ShapeAnimation } from '../types'
import { ANIMATION_DEFAULTS } from '../types'
import { hexToRgb, easeFunction, interpolateColor } from '../helpers'


export const animate = (animation: ShapeAnimation) => {
  let animationFrameId: number | null = null
  let startTime: number | null = null
  let isReversing = false

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
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    }

    const animateFrame = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1)
      const easedProgress = easeFunction(progress, animation.ease)

      const currentProgress = isReversing ? 1 - easedProgress : easedProgress

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
        animationFrameId = requestAnimationFrame(animateFrame)
      } else if (!isReversing && loop) {
        isReversing = true
        startTime = null 
        animationFrameId = requestAnimationFrame(animateFrame)
      } else if (isReversing && loop) {
        isReversing = false
        startTime = null 
        animationFrameId = requestAnimationFrame(animateFrame)
      }
    }

    stopAnimation()

    animationFrameId = requestAnimationFrame(animateFrame)

    return stopAnimation
  }
}
