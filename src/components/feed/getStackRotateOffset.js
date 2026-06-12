/**
 * Static rotation offset for back cards in the stack (desktop only).
 * @param {number} itemIndex - Index in full items array (0-based)
 * @param {boolean} isFront
 * @returns {number} degrees
 */
export function getStackRotateOffset(itemIndex, isFront) {
  if (isFront) return 0;
  if (typeof window !== "undefined" && window.innerWidth <= 900) return 0;
  return itemIndex % 2 === 0 ? 4 : -4;
}
