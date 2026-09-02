import { env } from "@/env";

type RevenueCatEntitlement = {
  expires_date: string | null;
};

type RevenueCatSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, RevenueCatEntitlement>;
  };
};

/**
 * Checks RevenueCat's server API for an active entitlement, keyed by our own
 * user id (RevenueCat's app_user_id — linked via Purchases.logIn(userId) on
 * mobile login/register). Fails closed: any missing config or request error
 * returns false rather than granting access.
 */
export async function hasActiveEntitlement(userId: string): Promise<boolean> {
  if (!env.REVENUECAT_SECRET_API_KEY) return false;

  let response: Response;
  try {
    response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${env.REVENUECAT_SECRET_API_KEY}` },
    });
  } catch {
    return false;
  }
  if (!response.ok) return false;

  let data: RevenueCatSubscriberResponse;
  try {
    data = await response.json();
  } catch {
    return false;
  }

  const entitlements = data.subscriber?.entitlements;
  if (!entitlements) return false;

  const now = Date.now();
  return Object.values(entitlements).some(
    (entitlement) => !entitlement.expires_date || new Date(entitlement.expires_date).getTime() > now,
  );
}
