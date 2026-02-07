/**
 * Cache for payment verification results to reduce RPC calls
 */

interface CachedVerification {
  isValid: boolean;
  timestamp: number;
  txHash: string;
  expiresAt: number;
}

// In-memory cache (use Redis in production)
const verificationCache = new Map<string, CachedVerification>();

// Cache TTL: 5 minutes (300000 ms)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get cached verification result
 */
export function getCachedVerification(txHash: string): CachedVerification | null {
  const cached = verificationCache.get(txHash);
  
  if (!cached) {
    return null;
  }

  // Check if cache is expired
  if (Date.now() > cached.expiresAt) {
    verificationCache.delete(txHash);
    return null;
  }

  return cached;
}

/**
 * Cache verification result
 */
export function setCachedVerification(
  txHash: string,
  isValid: boolean
): void {
  verificationCache.set(txHash, {
    isValid,
    timestamp: Date.now(),
    txHash,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

/**
 * Clear expired cache entries (call periodically)
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [txHash, cached] of verificationCache.entries()) {
    if (now > cached.expiresAt) {
      verificationCache.delete(txHash);
    }
  }
}

// Clean up expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(clearExpiredCache, 60 * 1000);
}
