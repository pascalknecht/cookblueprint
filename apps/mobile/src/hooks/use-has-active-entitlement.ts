import { useSyncExternalStore } from 'react';

import { getCustomerInfoState, subscribeToCustomerInfo } from '@/lib/purchases';

export function useHasActiveEntitlement() {
  const state = useSyncExternalStore(subscribeToCustomerInfo, getCustomerInfoState);

  if (state.status === 'pending') return { isPending: true, hasActiveEntitlement: false } as const;
  if (state.status === 'unavailable') return { isPending: false, hasActiveEntitlement: false } as const;
  return {
    isPending: false,
    hasActiveEntitlement: Object.keys(state.info.entitlements.active).length > 0,
  } as const;
}
