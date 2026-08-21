import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { MealType } from '@/constants/meal-types';
import { api } from '@/lib/api-client';
import { toISODate } from '@/lib/date-utils';
import * as localMealPlan from '@/lib/local-db/meal-plan';
import type { MealPlanEntry } from '@/lib/local-db/types';
import { refreshMealPlanWidget } from '@/widgets/refresh-widgets';

import { useTrialMode } from './use-trial-mode';

export type { MealType };
export type { MealPlanEntry };

type MealPlanResponse = { items: MealPlanEntry[] };

export function useMealPlan(range: { startDate: Date; endDate: Date }) {
  const startISO = toISODate(range.startDate);
  const endISO = toISODate(range.endDate);
  const { data: isTrial } = useTrialMode();

  return useQuery({
    queryKey: ['meal-plan', startISO, endISO],
    queryFn: () =>
      isTrial
        ? localMealPlan.listMealPlanEntries(range.startDate, range.endDate)
        : api.get<MealPlanResponse>(`/api/meal-plans?startDate=${startISO}&endDate=${endISO}`).then((data) => data.items),
  });
}

export function useAssignMeal() {
  const queryClient = useQueryClient();
  const { data: isTrial } = useTrialMode();
  return useMutation({
    mutationFn: (input: { date: Date; mealType: MealType; recipeId: string }) =>
      isTrial
        ? localMealPlan.assignMeal(input)
        : api.post<MealPlanEntry>('/api/meal-plans', {
            date: toISODate(input.date),
            mealType: input.mealType,
            recipeId: input.recipeId,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      refreshMealPlanWidget();
    },
  });
}

export function useDeleteMealAssignment() {
  const queryClient = useQueryClient();
  const { data: isTrial } = useTrialMode();
  return useMutation({
    mutationFn: async (entryId: string) => {
      if (isTrial) {
        await localMealPlan.deleteMealAssignment(entryId);
        return { id: entryId };
      }
      return api.delete<{ id: string }>(`/api/meal-plans/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      refreshMealPlanWidget();
    },
  });
}

export function useGenerateMealPlan() {
  const queryClient = useQueryClient();
  const { data: isTrial } = useTrialMode();
  return useMutation({
    mutationFn: (input: { startDate: Date; endDate: Date; avoidRepeats?: boolean }) =>
      isTrial
        ? localMealPlan.generateMealPlan(input)
        : api
            .post<MealPlanResponse>('/api/meal-plans/generate', {
              startDate: toISODate(input.startDate),
              endDate: toISODate(input.endDate),
              avoidRepeats: input.avoidRepeats,
            })
            .then((data) => data.items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      refreshMealPlanWidget();
    },
  });
}
