import { openai } from "@ai-sdk/openai";

import { env } from "@/env";

const DEFAULT_MODEL = "gpt-5-mini";

/** One-file provider swap point for meal plan AI generation. */
export function getMealPlanModel() {
  return openai(env.MEAL_PLAN_AI_MODEL ?? DEFAULT_MODEL);
}
