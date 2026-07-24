import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { toISODate } from '@/lib/date-utils';

import type { Recipe } from './use-recipes';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export const MEAL_DEFS: MealType[] = ['breakfast', 'lunch', 'dinner'];

export type MealPlanEntry = {
  id: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  recipe: Recipe;
};

type MealPlanResponse = { items: MealPlanEntry[] };

export function useMealPlan(range: { startDate: Date; endDate: Date }) {
  const startISO = toISODate(range.startDate);
  const endISO = toISODate(range.endDate);

  return useQuery({
    queryKey: ['meal-plan', startISO, endISO],
    queryFn: () => api.get<MealPlanResponse>(`/api/meal-plans?startDate=${startISO}&endDate=${endISO}`),
    select: (data) => data.items,
  });
}

export function useAssignMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { date: Date; mealType: MealType; recipeId: string }) =>
      api.post<MealPlanEntry>('/api/meal-plans', {
        date: toISODate(input.date),
        mealType: input.mealType,
        recipeId: input.recipeId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-plan'] }),
  });
}

export function useGenerateMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      startDate: Date;
      endDate: Date;
      vegetarianOnly?: boolean;
      avoidRepeats?: boolean;
    }) =>
      api.post<MealPlanResponse>('/api/meal-plans/generate', {
        startDate: toISODate(input.startDate),
        endDate: toISODate(input.endDate),
        vegetarianOnly: input.vegetarianOnly,
        avoidRepeats: input.avoidRepeats,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-plan'] }),
  });
}
