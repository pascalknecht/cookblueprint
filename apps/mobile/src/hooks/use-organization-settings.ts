import { normalizeShoppingCategoryOrder } from '@repo/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_ENABLED_MEAL_TYPES, sortMealTypes, type MealType } from '@/constants/meal-types';
import { DEFAULT_SHOPPING_CATEGORY_ORDER, type ShoppingCategory } from '@/constants/shopping-categories';
import { api } from '@/lib/api-client';
import * as localSettings from '@/lib/local-db/settings';
import type { OrganizationSettings } from '@/lib/local-db/types';

import { useTrialMode } from './use-trial-mode';

export function useOrganizationSettings() {
  const { data: isTrial } = useTrialMode();

  return useQuery({
    queryKey: ['organization-settings'],
    queryFn: () => (isTrial ? localSettings.getSettings() : api.get<OrganizationSettings>('/api/organization/settings')),
  });
}

export function useEnabledMealTypes() {
  const { data } = useOrganizationSettings();
  return data?.enabledMealTypes.length ? sortMealTypes(data.enabledMealTypes) : DEFAULT_ENABLED_MEAL_TYPES;
}

export function useUpdateEnabledMealTypes() {
  const queryClient = useQueryClient();
  const { data: isTrial } = useTrialMode();
  return useMutation({
    mutationFn: (enabledMealTypes: MealType[]) =>
      isTrial
        ? localSettings.updateEnabledMealTypes(enabledMealTypes)
        : api.patch<OrganizationSettings>('/api/organization/settings', { enabledMealTypes }),
    onSuccess: (data) => queryClient.setQueryData(['organization-settings'], data),
  });
}

export function useShoppingCategoryOrder() {
  const { data } = useOrganizationSettings();
  return data?.shoppingCategoryOrder?.length
    ? normalizeShoppingCategoryOrder(data.shoppingCategoryOrder)
    : DEFAULT_SHOPPING_CATEGORY_ORDER;
}

export function useUpdateShoppingCategoryOrder() {
  const queryClient = useQueryClient();
  const { data: isTrial } = useTrialMode();
  return useMutation({
    mutationFn: (shoppingCategoryOrder: ShoppingCategory[]) =>
      isTrial
        ? localSettings.updateShoppingCategoryOrder(shoppingCategoryOrder)
        : api.patch<OrganizationSettings>('/api/organization/settings', { shoppingCategoryOrder }),
    onSuccess: (data) => queryClient.setQueryData(['organization-settings'], data),
  });
}
