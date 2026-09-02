import { normalizeEnabledMealTypes, normalizeShoppingCategoryOrder, type MealType, type ShoppingCategory } from '@repo/shared';

import { LOCAL_KEYS } from './keys';
import { getJSON, setJSON } from './store';
import type { OrganizationSettings } from './types';

const EMPTY_SETTINGS: OrganizationSettings = { enabledMealTypes: [], shoppingCategoryOrder: [] };

export function getSettings(): Promise<OrganizationSettings> {
  return getJSON<OrganizationSettings>(LOCAL_KEYS.settings, EMPTY_SETTINGS);
}

export async function updateEnabledMealTypes(enabledMealTypes: MealType[]): Promise<OrganizationSettings> {
  const current = await getSettings();
  const next: OrganizationSettings = {
    ...current,
    enabledMealTypes: normalizeEnabledMealTypes(enabledMealTypes),
  };
  await setJSON(LOCAL_KEYS.settings, next);
  return next;
}

export async function updateShoppingCategoryOrder(
  shoppingCategoryOrder: ShoppingCategory[],
): Promise<OrganizationSettings> {
  const current = await getSettings();
  const next: OrganizationSettings = {
    ...current,
    shoppingCategoryOrder: normalizeShoppingCategoryOrder(shoppingCategoryOrder),
  };
  await setJSON(LOCAL_KEYS.settings, next);
  return next;
}
