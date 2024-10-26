import type { Coordinate, ShapeAnimation } from "./types"

/**
 * @description rotates a point around a center point by a given angle in radians
 *
 * @param pointToRotate - the point that is to be rotated
 * @param centerPoint - the point that the pointToRotate will rotate around
 * @param angle - the angle in radians that the pointToRotate will rotate by
 * @returns the new point after rotation
 */
export const rotatePoint = (pointToRotate: Coordinate, centerPoint: Coordinate, angle: number) => {
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const dx = pointToRotate.x - centerPoint.x
  const dy = pointToRotate.y - centerPoint.y

  return {
    x: centerPoint.x + (dx * cosA - dy * sinA),
    y: centerPoint.y + (dx * sinA + dy * cosA)
  }
}

/**
 * @description same as rotatePoint but modifies the pointToRotate in place as opposed to returning a new point object
 *
 * @param pointToRotate - the point that is to be rotated
 * @param centerPoint - the point that the pointToRotate will rotate around
 * @param angle - the angle in radians that the pointToRotate will rotate by
 */
export const rotatePointInPlace = (pointToRotate: Coordinate, centerPoint: Coordinate, angle: number) => {
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const dx = pointToRotate.x - centerPoint.x
  const dy = pointToRotate.y - centerPoint.y

  pointToRotate.x = centerPoint.x + (dx * cosA - dy * sinA)
  pointToRotate.y = centerPoint.y + (dx * sinA + dy * cosA)
}

/**
 * @description calculates the angle between two points in radians
 *
 * @param point1 - the first point
 * @param point2 - the second point
 * @returns the angle between the two points in radians
 */
export const getAngle = (point1: Coordinate, point2: Coordinate) => {
  const { x: x1, y: y1 } = point1
  const { x: x2, y: y2 } = point2
  return Math.atan2(y2 - y1, x2 - x1)
}

/**
 * @description calculates the midpoint of the largest angular between a center point and a list of points
 *
 * @param center - the center point
 * @param points - the list of points
 * @returns the midpoint of the largest angular space
 */
export const getLargestAngularSpace = (center: Coordinate, points: Coordinate[]) => {
  if (points.length === 0) return 0
  const [ firstPoint ] = points
  if (points.length === 1) return getAngle(center, firstPoint) + Math.PI

  const angles = points
    .map((point) => getAngle(center, point))
    .sort((angleA, angleB) => angleA - angleB)

  let maxAngularDistance = 0
  let maxAngularDistanceIndex = 0

  for (let i = 0; i < angles.length; i++) {
    const nextAngle = (i + 1) % angles.length
    const angularDistance = (angles[nextAngle] - angles[i] + 2 * Math.PI) % (2 * Math.PI)
    if (angularDistance > maxAngularDistance) {
      maxAngularDistance = angularDistance
      maxAngularDistanceIndex = i
    }
  }

  return (angles[maxAngularDistanceIndex] + maxAngularDistance / 2) % (2 * Math.PI)
}

/**
 * @description converts hex color to rgb color
 *
 * @param hex - the hex color (including the #)
 * @returns rgb object
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

/**
 * @description gets intermediate color value between two colors
 *
 * @param startColor - rgb object of start color
 * @param endColor - rgb object of the end color
 * @param progress - number between 0 and 100
 * @returns rgb string
 */
export const interpolateColor = (startColor: { r: number; g: number; b: number }, endColor: { r: number; g: number; b: number }, progress: number) => {
  const r = startColor.r + (endColor.r - startColor.r) * progress;
  const g = startColor.g + (endColor.g - startColor.g) * progress;
  const b = startColor.b + (endColor.b - startColor.b) * progress;
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

/**
 * @description returns the progress of an animation based on an easing function
 *
 * @param startColor - rgb object of start color
 * @param endColor - rgb object of the end color
 * @param progress - number between 0 and 100
 * @returns rgb string
 */
export const easeFunction = (progress: number, ease: ShapeAnimation['ease']) => {
  if (typeof ease === "function") return ease()

  switch (ease) {
    case 'linear':
      return progress;
    case 'in':
      return progress * progress;
    case 'out':
      return progress * (2 - progress);
    case 'in-out':
      return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    default:
      return progress;
  }
};