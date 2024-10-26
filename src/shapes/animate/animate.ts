import type { ShapeAnimation } from '../types'
import { ANIMATION_DEFAULTS } from '../types'
import { hexToRgb, easeFunction, interpolateColor } from '../helpers'

export const animate = (animation: ShapeAnimation) => (drawFunction: (options: any) => void) => (initialOptions: any) => {
  let startTime: number | null = null;
  const startColor = hexToRgb(initialOptions.color);
  const endColor = animation.color ? hexToRgb(animation.color) : startColor;

  const {
    duration,
    xOffset,
    yOffset,
    scale
  } = {
    ...ANIMATION_DEFAULTS,
    ...animation
  }

  const animateFrame = (timestamp: number) => {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
    const easedProgress = easeFunction(progress, animation.ease);

    const newX = initialOptions.at.x + xOffset * easedProgress;
    const newY = initialOptions.at.y + yOffset * easedProgress;
    const newRadius = initialOptions.radius * (1 + (scale - 1) * easedProgress);
    const newColor = interpolateColor(startColor, endColor, easedProgress);

    drawFunction({
      at: { x: newX, y: newY },
      radius: newRadius,
      color: newColor,
    });

    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    }
  }
  requestAnimationFrame(animateFrame);
};