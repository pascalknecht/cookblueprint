import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.delete<{ ok: boolean }>('/api/account'),
  });
}
