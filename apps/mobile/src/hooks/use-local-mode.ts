import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clearLocalData, isLocalModeActive, setLocalModeActive } from '@/lib/local-db/local-mode-state';

export const LOCAL_MODE_QUERY_KEY = ['local-mode'];

/** Whether the app is running in on-device local mode (no server account). */
export function useLocalMode() {
  return useQuery({
    queryKey: LOCAL_MODE_QUERY_KEY,
    queryFn: isLocalModeActive,
    staleTime: Infinity,
  });
}

/** Enters local mode — a pure on-device write, no network call. */
export function useStartLocalMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => setLocalModeActive(true),
    onSuccess: () => queryClient.setQueryData(LOCAL_MODE_QUERY_KEY, true),
  });
}

/** Leaves local mode and wipes on-device data — used once reconciliation succeeds. */
export function useEndLocalMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearLocalData,
    onSuccess: () => queryClient.setQueryData(LOCAL_MODE_QUERY_KEY, false),
  });
}
