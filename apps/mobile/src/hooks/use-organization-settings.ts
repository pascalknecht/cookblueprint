import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_ENABLED_MEAL_TYPES, sortMealTypes, type MealType } from '@/constants/meal-types';
import { api } from '@/lib/api-client';

type OrganizationSettings = { enabledMealTypes: MealType[] };

export function useOrganizationSettings() {
  return useQuery({
    queryKey: ['organization-settings'],
    queryFn: () => api.get<OrganizationSettings>('/api/organization/settings'),
  });
}

export function useEnabledMealTypes() {
  const { data } = useOrganizationSettings();
  return data?.enabledMealTypes.length ? sortMealTypes(data.enabledMealTypes) : DEFAULT_ENABLED_MEAL_TYPES;
}

export function useUpdateEnabledMealTypes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabledMealTypes: MealType[]) =>
      api.patch<OrganizationSettings>('/api/organization/settings', { enabledMealTypes }),
    onSuccess: (data) => queryClient.setQueryData(['organization-settings'], data),
  });
}
