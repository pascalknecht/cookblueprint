import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { ALL_MEAL_TYPES } from "@/lib/meal-types";
import { listMealPlanEntries, upsertMealPlanEntry } from "@/use-cases/meal-plans";
import { z } from "zod";

const mealTypeSchema = z.enum(ALL_MEAL_TYPES);

const upsertBodySchema = z.object({
  date: z.coerce.date(),
  mealType: mealTypeSchema,
  recipeId: z.string().min(1),
});

/** Monday–Sunday range containing `reference`, used when no date range is given. */
function currentWeekRange(reference = new Date()) {
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
  const weekday = start.getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (weekday + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);

  return { startDate: start, endDate: end };
}

export async function GET(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const url = new URL(request.url);
  const rawStartDate = url.searchParams.get("startDate");
  const rawEndDate = url.searchParams.get("endDate");

  let startDate: Date;
  let endDate: Date;
  if (rawStartDate && rawEndDate) {
    const parsed = z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }).safeParse({
      startDate: rawStartDate,
      endDate: rawEndDate,
    });
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid startDate/endDate query parameters.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    ({ startDate, endDate } = parsed.data);
  } else {
    ({ startDate, endDate } = currentWeekRange());
  }

  const entries = await listMealPlanEntries(ctx.organizationId, startDate, endDate);
  return Response.json({ startDate, endDate, items: entries });
}

export async function POST(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, upsertBodySchema);
  if ("error" in parsed) return parsed.error;

  const entry = await upsertMealPlanEntry(ctx.organizationId, parsed.data);
  return Response.json(entry, { status: 201 });
}
