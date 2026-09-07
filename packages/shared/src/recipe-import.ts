import { decode as decodeHtmlEntities } from 'html-entities';
import { parseIngredient, type UnitOfMeasureDefinitions } from 'parse-ingredient';

import { DEFAULT_RECIPE_FREQUENCY, type RecipeFrequency } from './recipe-frequency';
import { normalizeRecipeMealTypes, type RecipeMealType } from './recipe-meal-types';
import type { ShoppingCategory } from './shopping-categories';

// Mirrors RecipeAccentColors in apps/mobile/src/constants/theme.ts.
const IMPORT_ACCENT_COLORS = ['#E8A33D', '#C4553E', '#B0447E', '#D98324', '#2FA46A', '#C77C3A'];

export type RecipeIngredientInput = { n: string; q: string; cat: string };

export type RecipeInput = {
  title: string;
  color: string;
  imageUrl?: string | null;
  frequency: RecipeFrequency;
  time: number;
  servings: number;
  kcal: string;
  mealTypes: RecipeMealType[];
  ingredients: RecipeIngredientInput[];
  steps: string[];
};

const JSON_LD_SCRIPT_RE = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

/** Recursively searches parsed JSON-LD for a node whose `@type` includes "Recipe". */
function findRecipeNode(node: unknown): Record<string, unknown> | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipeNode(item);
      if (found) return found;
    }
    return null;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    const type = obj['@type'];
    const types = Array.isArray(type) ? type : [type];
    if (types.some((t) => typeof t === 'string' && t.toLowerCase() === 'recipe')) {
      return obj;
    }
    if ('@graph' in obj) {
      const found = findRecipeNode(obj['@graph']);
      if (found) return found;
    }
    if ('mainEntity' in obj) {
      const found = findRecipeNode(obj.mainEntity);
      if (found) return found;
    }
  }
  return null;
}

/** Extracts the first schema.org Recipe node from a page's `<script type="application/ld+json">` blocks. */
export function extractRecipeJsonLd(html: string): Record<string, unknown> | null {
  for (const match of html.matchAll(JSON_LD_SCRIPT_RE)) {
    const raw = match[1].trim();
    if (!raw) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue; // some sites emit malformed/truncated JSON-LD; skip and keep looking
    }

    const recipe = findRecipeNode(parsed);
    if (recipe) return recipe;
  }
  return null;
}

const ISO_DURATION_RE = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

/** Parses an ISO 8601 duration ("PT1H30M") into whole minutes. Returns 0 if unparsable. */
export function parseIsoDurationMinutes(duration: unknown): number {
  if (typeof duration !== 'string') return 0;
  const match = ISO_DURATION_RE.exec(duration.trim());
  if (!match) return 0;

  const [, days, hours, minutes, seconds] = match;
  const totalMinutes =
    Number(days ?? 0) * 24 * 60 + Number(hours ?? 0) * 60 + Number(minutes ?? 0) + Number(seconds ?? 0) / 60;
  return Math.round(totalMinutes);
}

// Longest-first so "tl" wins over "l", "esslöffel" over "el", etc.
const QUANTITY_UNIT_WORDS =
  'tablespoons?|teaspoons?|dessertspoons?|kilograms?|millilitres?|milliliters?|milligrams?|handfuls?|' +
  'packages?|sachets?|' +
  'teel[oö]ffel|essl[oö]ffel|messerspitze|p[äa]ckchen|packungen?|milliliter|kilogramm|' +
  'tbsp\\.?|tsp\\.?|dsp\\.?|grams?|grammes?|gramm|fluid\\s+ounces?|ounces?|pounds?|cloves?|' +
  'pinch(?:es)?|prise(?:n)?|' +
  'cans?|tins?|dosen?|slices?|scheiben?|bunch(?:es)?|heads?|sprigs?|pieces?|' +
  'st[uü]cke?|handvoll|tassen?|becher|zehen?|bund|' +
  'cups?|pints?|quarts?|gallons?|litres?|liters?|liter|' +
  'pck\\.?|msp\\.?|stk?\\.?|bd\\.?|tl\\.?|el\\.?|' +
  'kg|mg|ml|cl|dl|fl\\.?\\s*oz\\.?|oz\\.?|lbs?\\.?|g|l';
const FRACTION_CHARS = '¼½¾⅓⅔⅛⅜⅝⅞';
const APPROX_PREFIX = '(?:ca\\.?|circa|approx\\.?(?:imately)?|etwa|about|~)\\s*';
const QUANTITY_NUMBER = `[0-9${FRACTION_CHARS}][0-9${FRACTION_CHARS}./\\-\\s]*`;
const QUANTITY_WORDS = 'etwas|some|a\\s+little';
const WITH_UNIT_RE = new RegExp(
  `^((?:${APPROX_PREFIX})?(?:${QUANTITY_NUMBER}\\s*(?:${QUANTITY_UNIT_WORDS})|(?:${QUANTITY_UNIT_WORDS})))\\s+(.+)$`,
  'i',
);
const NUMBER_ONLY_RE = new RegExp(`^((?:${APPROX_PREFIX})?${QUANTITY_NUMBER})\\s+(.+)$`, 'i');
const QUANTITY_WORD_RE = new RegExp(`^(${QUANTITY_WORDS})\\s+(.+)$`, 'i');

/** Best-effort split of a raw ingredient line ("2 cups flour", "1 TL Kreuzkümmelpulver") into quantity and name. */
export function parseIngredientLine(rawLine: string): { name: string; quantity: string } {
  const line = rawLine.trim();
  const withUnit = WITH_UNIT_RE.exec(line);
  if (withUnit) return { quantity: withUnit[1].trim(), name: withUnit[2].trim() };
  const numberOnly = NUMBER_ONLY_RE.exec(line);
  if (numberOnly) return { quantity: numberOnly[1].trim(), name: numberOnly[2].trim() };
  const quantityWord = QUANTITY_WORD_RE.exec(line);
  if (quantityWord) return { quantity: quantityWord[1].trim(), name: quantityWord[2].trim() };
  return { quantity: '', name: line };
}

export type IngredientExtract = {
  unit?: string;
};

// parse-ingredient ships English units only; these fill in the German ones this app's
// recipes use, plus a few English ones (dessertspoon, sachet, tin, slice, handful, cl)
// missing from its default table. Matching is case-insensitive, so one casing suffices.
const EXTRA_UOMS: UnitOfMeasureDefinitions = {
  teelöffel: { short: 'TL', plural: 'Teelöffel', alternates: [], type: 'volume' },
  esslöffel: { short: 'EL', plural: 'Esslöffel', alternates: [], type: 'volume' },
  messerspitze: { short: 'Msp', plural: 'Messerspitzen', alternates: ['Msp.'], type: 'volume' },
  prise: { short: 'Prise', plural: 'Prisen', alternates: [], type: 'volume' },
  zehe: { short: 'Zehe', plural: 'Zehen', alternates: [], type: 'count' },
  stück: { short: 'Stück', plural: 'Stücke', alternates: ['Stk', 'Stk.'], type: 'count' },
  bund: { short: 'Bund', plural: 'Bund', alternates: ['Bd', 'Bd.'], type: 'count' },
  handvoll: { short: 'Handvoll', plural: 'Handvoll', alternates: [], type: 'volume' },
  tasse: { short: 'Tasse', plural: 'Tassen', alternates: [], type: 'volume' },
  becher: { short: 'Becher', plural: 'Becher', alternates: [], type: 'volume' },
  päckchen: { short: 'Päckchen', plural: 'Päckchen', alternates: ['Pck', 'Pck.', 'Packung', 'Packungen'], type: 'count' },
  dose: { short: 'Dose', plural: 'Dosen', alternates: [], type: 'count' },
  scheibe: { short: 'Scheibe', plural: 'Scheiben', alternates: [], type: 'count' },
  zentiliter: { short: 'cl', plural: 'cl', alternates: [], type: 'volume', conversionFactor: 10 },
  dessertspoon: { short: 'dsp', plural: 'dessertspoons', alternates: ['dsp.'], type: 'volume' },
  sachet: { short: 'sachet', plural: 'sachets', alternates: [], type: 'count' },
  tin: { short: 'tin', plural: 'tins', alternates: [], type: 'count' },
  slice: { short: 'slice', plural: 'slices', alternates: [], type: 'count' },
  handful: { short: 'handful', plural: 'handfuls', alternates: [], type: 'volume' },
};

/**
 * Identifies each ingredient line's unit using parse-ingredient (a plain-JS, regex-based
 * library — no WASM, no WebView). Only the unit token is read back — its numeric quantity
 * and cleaned-up description are discarded in favor of slicing the original line in
 * mergeIngredientExtract, which preserves fractions, ranges, and "ca." prefixes verbatim
 * and isn't affected by whatever parse-ingredient made of the rest of the line.
 */
export function extractIngredientTokens(lines: string[]): (IngredientExtract | null)[] {
  return lines.map((line) => {
    if (!line.trim()) return null;
    const [parsed] = parseIngredient([line], { additionalUOMs: EXTRA_UOMS });
    if (!parsed?.unitOfMeasure) return null;
    return { unit: parsed.unitOfMeasure };
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Index of `unit` as its own token in `line`, or -1. */
function findUnitTokenIndex(line: string, unit: string): { start: number; end: number } | null {
  const trimmed = unit.trim();
  if (!trimmed) return null;
  const match = new RegExp(`(?:^|\\s)(${escapeRegExp(trimmed)})(?=\\s|$)`, 'i').exec(line);
  if (!match || match.index === undefined) return null;
  const start = match[0].startsWith(' ') ? match.index + 1 : match.index;
  return { start, end: start + match[1].length };
}

/**
 * Merge an ingredient extract back onto the original line. Quantity is the prefix
 * through the unit (so "gehackte" stays on the name); invented units are ignored.
 */
export function mergeIngredientExtract(
  rawLine: string,
  extracted: IngredientExtract | null | undefined,
  fallback: { name: string; quantity: string },
): { name: string; quantity: string } {
  const line = rawLine.trim();
  if (!extracted?.unit) return fallback;

  const span = findUnitTokenIndex(line, extracted.unit);
  if (!span) return fallback;
  const quantity = line.slice(0, span.end).trim();
  const name = line.slice(span.end).trim();
  if (quantity && name) return { quantity, name };
  return fallback;
}

export function ingredientInputFromParsed(name: string, quantity: string): RecipeIngredientInput {
  return { n: name, q: quantity, cat: guessIngredientCategory(name) };
}

/** Applies parse-ingredient's unit/name split onto raw lines, falling back to the deterministic parser per line. */
export function preprocessIngredientLines(rawLines: string[]): RecipeIngredientInput[] {
  const lines = rawLines.map((line) => decodeHtmlEntities(line));
  const extracts = extractIngredientTokens(lines);
  return lines.map((line, index) => {
    const fallback = parseIngredientLine(line);
    const parsed = mergeIngredientExtract(line, extracts[index], fallback);
    return ingredientInputFromParsed(parsed.name, parsed.quantity);
  });
}

export function extractIngredientLines(schemaRecipe: Record<string, unknown>): string[] {
  return toStringArray(schemaRecipe.recipeIngredient ?? schemaRecipe.ingredients);
}

const CATEGORY_KEYWORDS: Partial<Record<ShoppingCategory, string[]>> = {
  'Meat & Fish': [
    'chicken', 'beef', 'pork', 'steak', 'salmon', 'fish', 'shrimp', 'prawn', 'turkey',
    'bacon', 'sausage', 'tuna', 'lamb', 'ham', 'fillet', 'mince', 'anchov',
  ],
  'Dairy & Eggs': [
    'milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'egg', 'parmesan', 'mozzarella', 'ricotta', 'feta',
  ],
  Bakery: ['bread', 'bun', 'bagel', 'tortilla', 'baguette', 'roll', 'dough', 'pita', 'brioche'],
  Produce: [
    'onion', 'garlic', 'tomato', 'potato', 'carrot', 'pepper', 'lettuce', 'spinach', 'cucumber', 'avocado',
    'lemon', 'lime', 'basil', 'cilantro', 'parsley', 'herb', 'apple', 'banana', 'broccoli', 'cabbage',
    'mushroom', 'ginger', 'zucchini', 'courgette', 'corn', 'celery', 'chili', 'chilli', 'kale', 'leek',
  ],
};

/** Keyword-based best guess at which shopping category an ingredient belongs to; falls back to Pantry. */
function guessIngredientCategory(name: string): ShoppingCategory {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords!.some((keyword) => lower.includes(keyword))) return category as ShoppingCategory;
  }
  return 'Pantry';
}

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  return [];
}

/**
 * Some CDNs (observed on BBC Good Food's image host) put a raw, unencoded comma in the
 * query string (e.g. `?resize=440,400`). That's valid per the URL spec and every server
 * decodes `%2C` back to `,` normally, but the native image loader behind expo-image on
 * Android fails to load the image when the comma is left unencoded. Encoding just the
 * query string sidesteps that without touching anything the CDN actually needs literal.
 */
function encodeQueryCommas(url: string): string {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return url;
  return url.slice(0, queryIndex) + url.slice(queryIndex).replace(/,/g, '%2C');
}

function extractImageUrl(value: unknown): string | null {
  if (typeof value === 'string') return encodeQueryCommas(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = extractImageUrl(item);
      if (url) return url;
    }
    return null;
  }
  if (value && typeof value === 'object' && typeof (value as { url?: unknown }).url === 'string') {
    return encodeQueryCommas((value as { url: string }).url);
  }
  return null;
}

/** Flattens recipeInstructions — a string, a string array, HowToStep objects, or nested HowToSections. */
function extractInstructionSteps(value: unknown): string[] {
  if (typeof value === 'string') {
    return value
      .split(/\r?\n+/)
      .map((s) => decodeHtmlEntities(s.trim()))
      .filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => extractInstructionSteps(item));
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.itemListElement)) return extractInstructionSteps(obj.itemListElement);
    if (typeof obj.text === 'string') return [decodeHtmlEntities(obj.text.trim())];
    if (typeof obj.name === 'string') return [decodeHtmlEntities(obj.name.trim())];
  }
  return [];
}

function extractServings(value: unknown): number {
  const source = Array.isArray(value) ? value[0] : value;
  if (typeof source === 'number' && Number.isFinite(source)) return Math.max(1, Math.round(source));
  if (typeof source === 'string') {
    const match = /\d+/.exec(source);
    if (match) return Math.max(1, parseInt(match[0], 10));
  }
  return 4;
}

function extractCalories(value: unknown): string {
  if (value && typeof value === 'object') {
    const calories = (value as Record<string, unknown>).calories;
    if (typeof calories === 'string') {
      const match = /\d+/.exec(calories);
      if (match) return match[0];
    }
    if (typeof calories === 'number') return String(Math.round(calories));
  }
  return '0';
}

const MEAL_TYPE_KEYWORDS: Record<RecipeMealType, string[]> = {
  breakfast: ['breakfast', 'brunch'],
  lunch: ['lunch'],
  dinner: ['dinner', 'main course', 'main dish', 'entree', 'entrée', 'supper'],
  snack: ['snack', 'appetizer', 'starter', 'side dish'],
};

/** Best-effort guess at which meal type(s) a recipe belongs to, from its category/keyword text. */
function guessMealTypes(recipeCategory: unknown, keywords: unknown): RecipeMealType[] {
  const words: string[] = [];
  for (const c of Array.isArray(recipeCategory) ? recipeCategory : [recipeCategory]) {
    if (typeof c === 'string' && c.trim()) words.push(c.trim());
  }
  if (typeof keywords === 'string') {
    words.push(...keywords.split(','));
  } else if (Array.isArray(keywords)) {
    words.push(...keywords.filter((k): k is string => typeof k === 'string'));
  }

  const haystack = words.join(' ').toLowerCase();
  const guessed = (Object.keys(MEAL_TYPE_KEYWORDS) as RecipeMealType[]).filter((mealType) =>
    MEAL_TYPE_KEYWORDS[mealType].some((keyword) => haystack.includes(keyword)),
  );
  return normalizeRecipeMealTypes(guessed);
}

/** Deterministic pick from the accent palette so imported recipes aren't all the same color. */
function pickAccentColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return IMPORT_ACCENT_COLORS[hash % IMPORT_ACCENT_COLORS.length];
}

/** Maps a schema.org Recipe JSON-LD node to this app's RecipeInput shape. */
export function mapSchemaRecipeToInput(schemaRecipe: Record<string, unknown>): RecipeInput {
  const title = typeof schemaRecipe.name === 'string' && schemaRecipe.name.trim()
    ? decodeHtmlEntities(schemaRecipe.name.trim())
    : 'Imported recipe';

  const totalMinutes =
    parseIsoDurationMinutes(schemaRecipe.totalTime) ||
    parseIsoDurationMinutes(schemaRecipe.prepTime) + parseIsoDurationMinutes(schemaRecipe.cookTime) ||
    30;

  const ingredients = preprocessIngredientLines(extractIngredientLines(schemaRecipe));

  const steps = extractInstructionSteps(schemaRecipe.recipeInstructions);

  return {
    title,
    color: pickAccentColor(title),
    imageUrl: extractImageUrl(schemaRecipe.image),
    frequency: DEFAULT_RECIPE_FREQUENCY,
    time: totalMinutes,
    servings: extractServings(schemaRecipe.recipeYield),
    kcal: extractCalories(schemaRecipe.nutrition),
    mealTypes: guessMealTypes(schemaRecipe.recipeCategory, schemaRecipe.keywords),
    ingredients,
    steps: steps.length > 0 ? steps : ['No instructions found on the source page — add your own steps.'],
  };
}
