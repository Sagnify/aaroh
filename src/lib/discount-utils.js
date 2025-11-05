/**
 * Calculate discount percentage between original price and current price
 * @param {number} currentPrice - The current/sale price
 * @param {number} originalPrice - The original/full price
 * @returns {number} - Discount percentage (0-100)
 */
export function calculateDiscountPercentage(currentPrice, originalPrice) {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return 0
  }
  
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

/**
 * Check if there's a valid discount
 * @param {number} currentPrice - The current/sale price
 * @param {number} originalPrice - The original/full price
 * @returns {boolean} - True if there's a discount
 */
export function hasDiscount(currentPrice, originalPrice) {
  return originalPrice && currentPrice && originalPrice > currentPrice
}