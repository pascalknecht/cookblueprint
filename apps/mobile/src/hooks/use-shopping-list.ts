import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { toISODate } from '@/lib/date-utils';

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
};

export type RecentShoppingItem = { id: string; name: string; category: string; lastUsedAt: string };

type ShoppingItemsResponse = { items: ShoppingItem[]; total: number };

export function useShoppingItems() {
  return useQuery({
    queryKey: ['shopping-items'],
    queryFn: () => api.get<ShoppingItemsResponse>('/api/shopping-items?perPage=100'),
    select: (data) => data.items,
  });
}

export function useRecentShoppingItems() {
  return useQuery({
    queryKey: ['shopping-items', 'recent'],
    queryFn: () => api.get<{ items: RecentShoppingItem[] }>('/api/shopping-items/recent'),
    select: (data) => data.items,
  });
}

export function useToggleShoppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      api.put<ShoppingItem>(`/api/shopping-items/${id}`, { checked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-items'] }),
  });
}

export function useCreateShoppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; quantity: string; category: string }) =>
      api.post<ShoppingItem>('/api/shopping-items', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-items'] }),
  });
}

export function useAddRecipeToShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) =>
      api.post<{ items: ShoppingItem[] }>(`/api/shopping-items/from-recipe/${recipeId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-items'] }),
  });
}

export function useAddMealPlanToShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (range: { startDate: Date; endDate: Date }) =>
      api.post<{ items: ShoppingItem[] }>('/api/shopping-items/from-meal-plan', {
        startDate: toISODate(range.startDate),
        endDate: toISODate(range.endDate),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-items'] }),
  });
}
