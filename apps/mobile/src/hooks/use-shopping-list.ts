import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { toISODate } from '@/lib/date-utils';
import * as localShoppingItems from '@/lib/local-db/shopping-items';
import type { RecentShoppingItem, ShoppingItem, ShoppingItemInput } from '@/lib/local-db/types';
import { refreshShoppingListWidget } from '@/widgets/refresh-widgets';

import { useLocalMode } from './use-local-mode';

export type { RecentShoppingItem, ShoppingItem };

type ShoppingItemsResponse = { items: ShoppingItem[]; total: number };

export function useShoppingItems() {
  const { data: isLocal } = useLocalMode();

  return useQuery({
    queryKey: ['shopping-items'],
    enabled: isLocal !== undefined,
    queryFn: () =>
      isLocal
        ? localShoppingItems.listShoppingItems()
        : api.get<ShoppingItemsResponse>('/api/shopping-items?perPage=100').then((data) => data.items),
  });
}

export function useRecentShoppingItems() {
  const { data: isLocal } = useLocalMode();

  return useQuery({
    queryKey: ['shopping-items', 'recent'],
    enabled: isLocal !== undefined,
    queryFn: () =>
      isLocal
        ? localShoppingItems.listRecentShoppingItems()
        : api.get<{ items: RecentShoppingItem[] }>('/api/shopping-items/recent').then((data) => data.items),
  });
}

export function useToggleShoppingItem() {
  const queryClient = useQueryClient();
  const { data: isLocal } = useLocalMode();
  return useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      isLocal
        ? localShoppingItems.updateShoppingItem(id, { checked })
        : api.put<ShoppingItem>(`/api/shopping-items/${id}`, { checked }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      refreshShoppingListWidget();
    },
  });
}

export function useCreateShoppingItem() {
  const queryClient = useQueryClient();
  const { data: isLocal } = useLocalMode();
  return useMutation({
    mutationFn: (input: ShoppingItemInput) =>
      isLocal ? localShoppingItems.createShoppingItem(input) : api.post<ShoppingItem>('/api/shopping-items', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      refreshShoppingListWidget();
    },
  });
}

export function useAddRecipeToShoppingList() {
  const queryClient = useQueryClient();
  const { data: isLocal } = useLocalMode();
  return useMutation({
    mutationFn: (recipeId: string) =>
      isLocal
        ? localShoppingItems.addRecipeIngredientsToShoppingList(recipeId)
        : api.post<{ items: ShoppingItem[] }>(`/api/shopping-items/from-recipe/${recipeId}`).then((data) => data.items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      refreshShoppingListWidget();
    },
  });
}

export function useAddMealPlanToShoppingList() {
  const queryClient = useQueryClient();
  const { data: isLocal } = useLocalMode();
  return useMutation({
    mutationFn: (range: { startDate: Date; endDate: Date }) =>
      isLocal
        ? localShoppingItems.addMealPlanIngredientsToShoppingList(range.startDate, range.endDate)
        : api
            .post<{ items: ShoppingItem[] }>('/api/shopping-items/from-meal-plan', {
              startDate: toISODate(range.startDate),
              endDate: toISODate(range.endDate),
            })
            .then((data) => data.items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      refreshShoppingListWidget();
    },
  });
}
