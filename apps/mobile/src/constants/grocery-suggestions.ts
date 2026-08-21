import type { ShoppingCategory } from "@repo/shared";

export type GrocerySuggestion = {
  name: string;
  aliases: readonly string[];
  category: ShoppingCategory;
};

// Seed labels are curated from Wikidata's multilingual food entities. Wikidata's
// instance/subclass taxonomy is broader than a supermarket, so categories map to
// CookBlueprint's five shopping sections rather than being inferred at runtime.
export const GROCERY_SUGGESTIONS: readonly GrocerySuggestion[] = [
  {
    name: "Apples",
    aliases: ["apple", "apples", "apfel", "äpfel"],
    category: "Produce",
  },
  {
    name: "Bananas",
    aliases: ["banana", "bananas", "banane", "bananen"],
    category: "Produce",
  },
  {
    name: "Oranges",
    aliases: ["orange", "oranges", "orange", "orangen"],
    category: "Produce",
  },
  {
    name: "Lemons",
    aliases: ["lemon", "lemons", "zitrone", "zitronen"],
    category: "Produce",
  },
  {
    name: "Limes",
    aliases: ["lime", "limes", "limette", "limetten"],
    category: "Produce",
  },
  {
    name: "Strawberries",
    aliases: ["strawberry", "strawberries", "erdbeere", "erdbeeren"],
    category: "Produce",
  },
  {
    name: "Blueberries",
    aliases: ["blueberry", "blueberries", "heidelbeere", "heidelbeeren"],
    category: "Produce",
  },
  {
    name: "Grapes",
    aliases: ["grape", "grapes", "traube", "trauben"],
    category: "Produce",
  },
  { name: "Avocado", aliases: ["avocado", "avocados"], category: "Produce" },
  {
    name: "Tomatoes",
    aliases: ["tomato", "tomatoes", "tomate", "tomaten"],
    category: "Produce",
  },
  {
    name: "Cucumber",
    aliases: ["cucumber", "gurke", "gurken"],
    category: "Produce",
  },
  {
    name: "Potatoes",
    aliases: ["potato", "potatoes", "kartoffel", "kartoffeln"],
    category: "Produce",
  },
  {
    name: "Onions",
    aliases: ["onion", "onions", "zwiebel", "zwiebeln"],
    category: "Produce",
  },
  { name: "Garlic", aliases: ["garlic", "knoblauch"], category: "Produce" },
  {
    name: "Carrots",
    aliases: ["carrot", "carrots", "karotte", "karotten", "möhre", "möhren"],
    category: "Produce",
  },
  { name: "Broccoli", aliases: ["broccoli", "brokkoli"], category: "Produce" },
  {
    name: "Bell peppers",
    aliases: ["bell pepper", "bell peppers", "pepper", "paprika"],
    category: "Produce",
  },
  {
    name: "Zucchini",
    aliases: ["zucchini", "courgette", "courgettes"],
    category: "Produce",
  },
  { name: "Spinach", aliases: ["spinach", "spinat"], category: "Produce" },
  { name: "Lettuce", aliases: ["lettuce", "salat"], category: "Produce" },
  {
    name: "Mushrooms",
    aliases: ["mushroom", "mushrooms", "champignon", "champignons", "pilze"],
    category: "Produce",
  },
  { name: "Milk", aliases: ["milk", "milch"], category: "Dairy & Eggs" },
  { name: "Butter", aliases: ["butter"], category: "Dairy & Eggs" },
  {
    name: "Eggs",
    aliases: ["egg", "eggs", "ei", "eier"],
    category: "Dairy & Eggs",
  },
  {
    name: "Yogurt",
    aliases: ["yogurt", "yoghurt", "joghurt"],
    category: "Dairy & Eggs",
  },
  { name: "Cheese", aliases: ["cheese", "käse"], category: "Dairy & Eggs" },
  { name: "Cream", aliases: ["cream", "sahne"], category: "Dairy & Eggs" },
  { name: "Mozzarella", aliases: ["mozzarella"], category: "Dairy & Eggs" },
  {
    name: "Chicken breast",
    aliases: ["chicken breast", "chicken", "hähnchenbrust", "hähnchen"],
    category: "Meat & Fish",
  },
  {
    name: "Ground beef",
    aliases: ["ground beef", "minced beef", "hackfleisch", "rinderhack"],
    category: "Meat & Fish",
  },
  { name: "Salmon", aliases: ["salmon", "lachs"], category: "Meat & Fish" },
  { name: "Tuna", aliases: ["tuna", "thunfisch"], category: "Meat & Fish" },
  { name: "Bacon", aliases: ["bacon", "speck"], category: "Meat & Fish" },
  { name: "Ham", aliases: ["ham", "schinken"], category: "Meat & Fish" },
  { name: "Bread", aliases: ["bread", "brot"], category: "Bakery" },
  {
    name: "Toast bread",
    aliases: ["toast", "toast bread", "toastbrot"],
    category: "Bakery",
  },
  {
    name: "Bread rolls",
    aliases: ["roll", "rolls", "brötchen"],
    category: "Bakery",
  },
  {
    name: "Croissants",
    aliases: ["croissant", "croissants"],
    category: "Bakery",
  },
  {
    name: "Tortillas",
    aliases: ["tortilla", "tortillas", "wrap", "wraps"],
    category: "Bakery",
  },
  {
    name: "Pizza dough",
    aliases: ["pizza dough", "pizzateig"],
    category: "Bakery",
  },
  {
    name: "Oats",
    aliases: ["oats", "oatmeal", "hafer", "haferflocken"],
    category: "Pantry",
  },
  {
    name: "Corn flakes",
    aliases: ["corn flakes", "cornflakes"],
    category: "Pantry",
  },
  { name: "Rice", aliases: ["rice", "reis"], category: "Pantry" },
  { name: "Pasta", aliases: ["pasta", "nudeln"], category: "Pantry" },
  { name: "Flour", aliases: ["flour", "mehl"], category: "Pantry" },
  { name: "Sugar", aliases: ["sugar", "zucker"], category: "Pantry" },
  { name: "Salt", aliases: ["salt", "salz"], category: "Pantry" },
  { name: "Olive oil", aliases: ["olive oil", "olivenöl"], category: "Pantry" },
  { name: "Vinegar", aliases: ["vinegar", "essig"], category: "Pantry" },
  {
    name: "Canned tomatoes",
    aliases: ["canned tomatoes", "tomatoes can", "dosentomaten"],
    category: "Pantry",
  },
  { name: "Beans", aliases: ["beans", "bohnen"], category: "Pantry" },
  {
    name: "Chickpeas",
    aliases: ["chickpeas", "kichererbsen"],
    category: "Pantry",
  },
  { name: "Lentils", aliases: ["lentils", "linsen"], category: "Pantry" },
  {
    name: "Peanut butter",
    aliases: ["peanut butter", "erdnussbutter"],
    category: "Pantry",
  },
  { name: "Coffee", aliases: ["coffee", "kaffee"], category: "Pantry" },
  { name: "Tea", aliases: ["tea", "tee"], category: "Pantry" },
  {
    name: "Chocolate",
    aliases: ["chocolate", "schokolade"],
    category: "Pantry",
  },
];

// Word-boundary match only — short aliases like "ei" would otherwise false-positive
// as substrings of unrelated words (e.g. "einkauf").
export function inferShoppingCategory(rawName: string): ShoppingCategory | null {
  const q = rawName.trim().toLowerCase();
  if (!q) return null;
  const words = q.split(/\s+/);
  const match = GROCERY_SUGGESTIONS.find((item) =>
    item.aliases.some((alias) => alias === q || words.includes(alias)),
  );
  return match?.category ?? null;
}
