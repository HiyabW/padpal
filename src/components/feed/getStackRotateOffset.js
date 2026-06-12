/** Max cards mounted in the stack (front + back peeks). */
export const VISIBLE_STACK_DEPTH = 3;

/**
 * Static rotation offset for back cards in the stack (desktop only).
 * Matches legacy: even itemIndex → tilt left (-4deg), odd → tilt right (+4deg).
 * @param {number} itemIndex - Index in full items array (0-based)
 * @param {boolean} isFront
 * @returns {number} degrees
 */
export function getStackRotateOffset(itemIndex, isFront) {
  if (isFront) return 0;
  if (typeof window !== "undefined" && window.innerWidth <= 900) return 0;
  return itemIndex % 2 === 0 ? -4 : 4;
}
