import type { ShapeAnimation } from '../types'
import { ANIMATION_DEFAULTS } from '../types'
import { hexToRgb, easeFunction, interpolateColor } from '../helpers'

// export const animate = (animation: ShapeAnimation) => (drawFn: (options: Circle) => void) => {
//   return (options: Circle) => {
//     let startTime: number | null = null;
//     const startColor = hexToRgb(options.color || '#000000');
//     const endColor = hexToRgb(animation.newShape.color || '#000000');
//     const { at: startAt, radius: startRadius } = options;
//     const { at: endAt, radius: endRadius } = animation.newShape;
//     const { duration, ease } = animation;

//     const  animateFrame(timestamp: number) {
//       if (startTime === null) startTime = timestamp;
//       const elapsed = timestamp - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easedProgress = easeFunction(progress, ease);

//       // Interpolate shape properties
//       const currentX = startAt.x + (endAt.x - startAt.x) * easedProgress;
//       const currentY = startAt.y + (endAt.y - startAt.y) * easedProgress;
//       const currentRadius = startRadius + (endRadius - startRadius) * easedProgress;
//       const currentColor = interpolateColor(startColor, endColor, easedProgress);

//       // Draw the current frame
//       drawFn({
//         at: { x: currentX, y: currentY },
//         radius: currentRadius,
//         color: currentColor,
//       });

//       // Continue animation if not finished
//       if (progress < 1) {
//         requestAnimationFrame(animateFrame);
//       }
//     }

//     // Start the animation
//     requestAnimationFrame(animateFrame);
//   };
// };


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