/**
 * Calculate progress of value between `[min;max]` range
 * returns normalized value between `[0;1]` if clamp is true
 * @param value number
 * @param min number
 * @param max number
 * @param clamp boolean
 * @returns number
 */
export function calculateProgress(
  value: number,
  min: number,
  max: number,
  clamp: boolean = false
) {
  const v = (value - min) / (max - min);

  return clamp ? Phaser.Math.Clamp(v, 0, 1) : v;
}
