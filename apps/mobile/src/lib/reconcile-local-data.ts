import { api } from '@/lib/api-client';
import { listAllMealPlanEntries } from '@/lib/local-db/meal-plan';
import { listRecipes as listLocalRecipes } from '@/lib/local-db/recipes';
import { getSettings as getLocalSettings } from '@/lib/local-db/settings';
import { listShoppingItems as listLocalShoppingItems } from '@/lib/local-db/shopping-items';
import type { Recipe, ShoppingItem } from '@/lib/local-db/types';

const localModeApi = { allowInLocalMode: true as const };

export type ReconciliationSummary = {
  /** Whether there was any on-device data to push at all. */
  imported: boolean;
  recipesImported: number;
  mealPlanEntriesImported: number;
  shoppingItemsImported: number;
  /** True if any individual item failed to push — the rest still succeeded (best-effort, not all-or-nothing). */
  hadErrors: boolean;
};

/**
 * Pushes everything accumulated during local mode up to the signed-in
 * account, reusing the same REST endpoints the app already calls when
 * online — no dedicated bulk-reconciliation endpoint exists server-side.
 * Best-effort per item: one failed recipe/entry/item doesn't abort the rest.
 */
export async function reconcileLocalData(): Promise<ReconciliationSummary> {
  const [recipes, entries, shoppingItems, settings] = await Promise.all([
    listLocalRecipes(),
    listAllMealPlanEntries(),
    listLocalShoppingItems(),
    getLocalSettings(),
  ]);

  let hadErrors = false;

  // 1. Recipes first — meal-plan entries below reference them by id, and the
  // server assigns new ids, so we need a local -> server id map before we can
  // push anything that points at a recipe.
  const recipeIdMap = new Map<string, string>();
  for (const recipe of recipes) {
    try {
      const { id, ...input } = recipe;
      const created = await api.post<Recipe>('/api/recipes', input, localModeApi);
      recipeIdMap.set(id, created.id);
    } catch {
      hadErrors = true;
    }
  }

  // 2. Meal plan entries, with recipeId remapped through step 1.
  let mealPlanEntriesImported = 0;
  for (const entry of entries) {
    const serverRecipeId = recipeIdMap.get(entry.recipeId);
    if (!serverRecipeId) continue; // that recipe failed to push above — skip, don't guess.
    try {
      await api.post('/api/meal-plans', { date: entry.date, mealType: entry.mealType, recipeId: serverRecipeId }, localModeApi);
      mealPlanEntriesImported += 1;
    } catch {
      hadErrors = true;
    }
  }

  // 3. Shopping items via the existing bulk endpoint, then a follow-up PATCH
  // for anything checked locally (the bulk route's schema doesn't carry it).
  let shoppingItemsImported = 0;
  if (shoppingItems.length > 0) {
    try {
      const { items: created } = await api.post<{ items: ShoppingItem[] }>(
        '/api/shopping-items/bulk',
        {
          items: shoppingItems.map(({ name, quantity, category }) => ({ name, quantity, category })),
        },
        localModeApi,
      );
      shoppingItemsImported = created.length;

      const createdByName = new Map(created.map((item) => [item.name, item]));
      for (const item of shoppingItems.filter((candidate) => candidate.checked)) {
        const match = createdByName.get(item.name);
        if (!match) continue;
        try {
          await api.put(`/api/shopping-items/${match.id}`, { checked: true }, localModeApi);
        } catch {
          hadErrors = true;
        }
      }
    } catch {
      hadErrors = true;
    }
  }

  // 4. Organization settings — the route only applies one field per call.
  try {
    if (settings.enabledMealTypes.length > 0) {
      await api.patch('/api/organization/settings', { enabledMealTypes: settings.enabledMealTypes }, localModeApi);
    }
    if (settings.shoppingCategoryOrder.length > 0) {
      await api.patch('/api/organization/settings', { shoppingCategoryOrder: settings.shoppingCategoryOrder }, localModeApi);
    }
  } catch {
    hadErrors = true;
  }

  return {
    imported: recipes.length > 0 || entries.length > 0 || shoppingItems.length > 0,
    recipesImported: recipeIdMap.size,
    mealPlanEntriesImported,
    shoppingItemsImported,
    hadErrors,
  };
}
