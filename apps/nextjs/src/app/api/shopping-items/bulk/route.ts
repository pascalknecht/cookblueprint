import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { createShoppingItemsBulk } from "@/use-cases/shopping-items";
import { z } from "zod";

const bulkBodySchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.string(),
        category: z.string().min(1),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, bulkBodySchema);
  if ("error" in parsed) return parsed.error;

  const created = await createShoppingItemsBulk(ctx.organizationId, parsed.data.items);
  return Response.json({ items: created }, { status: 201 });
}
