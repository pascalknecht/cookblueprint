import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clearTrialData, isTrialActive, setTrialActive } from '@/lib/local-db/trial-state';

export const TRIAL_MODE_QUERY_KEY = ['trial-mode'];

/** Whether the app is running in local-only trial mode (no server account). */
export function useTrialMode() {
  return useQuery({
    queryKey: TRIAL_MODE_QUERY_KEY,
    queryFn: isTrialActive,
  });
}

/** Enters trial mode — a pure local write, no network call. */
export function useStartTrialMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => setTrialActive(true),
    onSuccess: () => queryClient.setQueryData(TRIAL_MODE_QUERY_KEY, true),
  });
}

/** Leaves trial mode and wipes local trial data — used once reconciliation succeeds. */
export function useEndTrialMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearTrialData,
    onSuccess: () => queryClient.setQueryData(TRIAL_MODE_QUERY_KEY, false),
  });
}
