export const COOKING_STYLES = ['optimized', 'balanced', 'diverse'] as const;

export type CookingStyle = (typeof COOKING_STYLES)[number];
