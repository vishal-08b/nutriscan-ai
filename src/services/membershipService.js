// Membership Tier & Daily Usage Service
export const MEMBERSHIP_TIER_KEY = 'nutriscan_membership_tier';
export const SCAN_USAGE_DATE_KEY = 'nutriscan_scan_usage_date';
export const SCAN_USAGE_COUNT_KEY = 'nutriscan_scan_usage_count';

export const FREE_DAILY_SCAN_LIMIT = 5;

// Valid VIP Promo codes to unlock Pro for free
export const PROMO_CODES = ['PRO2026', 'NUTRIFREE', 'VISHALPRO', 'HEALTHAI', 'PRO'];

/**
 * Returns 'free' or 'pro' (defaults to 'free' for new users)
 */
export function getMembershipTier() {
  try {
    const saved = localStorage.getItem(MEMBERSHIP_TIER_KEY);
    if (saved === 'pro') return 'pro';
    return 'free';
  } catch {
    return 'free';
  }
}

/**
 * Sets membership tier ('free' or 'pro')
 */
export function setMembershipTier(tier) {
  try {
    localStorage.setItem(MEMBERSHIP_TIER_KEY, tier === 'pro' ? 'pro' : 'free');
  } catch (e) {
    console.error('Failed to save membership tier', e);
  }
}

/**
 * Gets daily scan statistics for current date
 */
export function getDailyScanStats() {
  const tier = getMembershipTier();
  const today = new Date().toISOString().split('T')[0];

  if (tier === 'pro') {
    return {
      tier: 'pro',
      isUnlimited: true,
      scansUsed: 0,
      scansLimit: Infinity,
      remaining: Infinity,
      canScan: true,
    };
  }

  try {
    const savedDate = localStorage.getItem(SCAN_USAGE_DATE_KEY);
    let count = 0;

    if (savedDate === today) {
      count = parseInt(localStorage.getItem(SCAN_USAGE_COUNT_KEY) || '0', 10);
      if (isNaN(count)) count = 0;
    } else {
      // New day, reset counter
      localStorage.setItem(SCAN_USAGE_DATE_KEY, today);
      localStorage.setItem(SCAN_USAGE_COUNT_KEY, '0');
      count = 0;
    }

    const remaining = Math.max(0, FREE_DAILY_SCAN_LIMIT - count);

    return {
      tier: 'free',
      isUnlimited: false,
      scansUsed: count,
      scansLimit: FREE_DAILY_SCAN_LIMIT,
      remaining,
      canScan: remaining > 0,
    };
  } catch {
    return {
      tier: 'free',
      isUnlimited: false,
      scansUsed: 0,
      scansLimit: FREE_DAILY_SCAN_LIMIT,
      remaining: FREE_DAILY_SCAN_LIMIT,
      canScan: true,
    };
  }
}

/**
 * Records a successful live scan consumption
 */
export function recordScanUsage() {
  const tier = getMembershipTier();
  if (tier === 'pro') return getDailyScanStats();

  const today = new Date().toISOString().split('T')[0];
  try {
    const savedDate = localStorage.getItem(SCAN_USAGE_DATE_KEY);
    let count = 0;

    if (savedDate === today) {
      count = parseInt(localStorage.getItem(SCAN_USAGE_COUNT_KEY) || '0', 10);
      if (isNaN(count)) count = 0;
    }

    count += 1;
    localStorage.setItem(SCAN_USAGE_DATE_KEY, today);
    localStorage.setItem(SCAN_USAGE_COUNT_KEY, count.toString());
  } catch (e) {
    console.error('Failed to increment scan count', e);
  }

  return getDailyScanStats();
}

/**
 * Validates promo code or free unlock
 */
export function redeemProCode(code = '') {
  const clean = code.trim().toUpperCase();
  if (PROMO_CODES.includes(clean)) {
    setMembershipTier('pro');
    return { success: true, message: 'Pro Membership Unlocked Successfully!' };
  }
  return { success: false, message: 'Invalid Promo Code. Try using code: PRO2026' };
}
