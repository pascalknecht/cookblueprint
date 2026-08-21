import * as Crypto from 'expo-crypto';

import { TRIAL_KEYS } from './keys';
import { listMealPlanEntries } from './meal-plan';
import { getRecipe } from './recipes';
import { getJSON, setJSON } from './store';
import type { RecentShoppingItem, ShoppingItem, ShoppingItemInput } from './types';

function readItems(): Promise<ShoppingItem[]> {
  return getJSON<ShoppingItem[]>(TRIAL_KEYS.shoppingItems, []);
}

function readRecent(): Promise<RecentShoppingItem[]> {
  return getJSON<RecentShoppingItem[]>(TRIAL_KEYS.recentShoppingItems, []);
}

export function listShoppingItems(): Promise<ShoppingItem[]> {
  return readItems();
}

export async function listRecentShoppingItems(take = 12): Promise<RecentShoppingItem[]> {
  const items = await readRecent();
  return [...items].sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt)).slice(0, take);
}

/** Upserts (name, category) into the "recently used" list, bumping lastUsedAt — mirrors recordRecentItems server-side. */
async function recordRecentItems(items: ShoppingItemInput[]): Promise<void> {
  if (items.length === 0) return;
  const recent = await readRecent();
  const byName = new Map(recent.map((item) => [item.name, item]));
  const now = new Date().toISOString();

  for (const item of items) {
    const existing = byName.get(item.name);
    byName.set(
      item.name,
      existing
        ? { ...existing, category: item.category, lastUsedAt: now }
        : { id: Crypto.randomUUID(), name: item.name, category: item.category, lastUsedAt: now },
    );
  }

  await setJSON(TRIAL_KEYS.recentShoppingItems, Array.from(byName.values()));
}

export async function createShoppingItem(input: ShoppingItemInput): Promise<ShoppingItem> {
  const items = await readItems();
  const item: ShoppingItem = { id: Crypto.randomUUID(), checked: false, ...input };
  await setJSON(TRIAL_KEYS.shoppingItems, [...items, item]);
  await recordRecentItems([input]);
  return item;
}

export async function updateShoppingItem(
  id: string,
  data: Partial<ShoppingItemInput & { checked: boolean }>,
): Promise<ShoppingItem | null> {
  const items = await readItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = { ...items[index], ...data };
  const next = [...items];
  next[index] = updated;
  await setJSON(TRIAL_KEYS.shoppingItems, next);
  return updated;
}

/** Creates only the items whose name doesn't already exist (case-insensitive) — mirrors createDedupedItems server-side. */
async function createDedupedItems(candidates: ShoppingItemInput[]): Promise<ShoppingItem[]> {
  if (candidates.length === 0) return [];

  const items = await readItems();
  const existingNames = new Set(items.map((item) => item.name.toLowerCase()));

  const seen = new Set<string>();
  const toCreate = candidates.filter((item) => {
    const key = item.name.toLowerCase();
    if (existingNames.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (toCreate.length === 0) return [];

  const created = toCreate.map((item) => ({ id: Crypto.randomUUID(), checked: false, ...item }));
  await setJSON(TRIAL_KEYS.shoppingItems, [...items, ...created]);
  await recordRecentItems(toCreate);
  return created;
}

export async function addRecipeIngredientsToShoppingList(recipeId: string): Promise<ShoppingItem[] | null> {
  const recipe = await getRecipe(recipeId);
  if (!recipe) return null;

  const candidates = recipe.ingredients.map((ing) => ({ name: ing.n, quantity: ing.q, category: ing.cat }));
  return createDedupedItems(candidates);
}

export async function addMealPlanIngredientsToShoppingList(startDate: Date, endDate: Date): Promise<ShoppingItem[]> {
  const entries = await listMealPlanEntries(startDate, endDate);

  const candidatesByName = new Map<string, ShoppingItemInput>();
  for (const entry of entries) {
    for (const ing of entry.recipe.ingredients) {
      const key = ing.n.toLowerCase();
      if (!candidatesByName.has(key)) {
        candidatesByName.set(key, { name: ing.n, quantity: ing.q, category: ing.cat });
      }
    }
  }

  return createDedupedItems(Array.from(candidatesByName.values()));
}
