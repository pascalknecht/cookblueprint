import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { paginationQuerySchema } from "@/lib/pagination";
import { createShoppingItem, deleteShoppingItemsBulk, listShoppingItems } from "@/use-cases/shopping-items";
import { z } from "zod";

const shoppingItemBodySchema = z.object({
  name: z.string().min(1),
  quantity: z.string(),
  category: z.string().min(1),
});

export async function GET(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const url = new URL(request.url);
  const pagination = paginationQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!pagination.success) {
    return Response.json(
      { error: "Invalid query parameters.", details: pagination.error.flatten() },
      { status: 400 },
    );
  }

  const result = await listShoppingItems(ctx.organizationId, pagination.data);
  return Response.json(result);
}

export async function POST(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, shoppingItemBodySchema);
  if ("error" in parsed) return parsed.error;

  const item = await createShoppingItem(ctx.organizationId, parsed.data);
  return Response.json(item, { status: 201 });
}

export async function DELETE(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const url = new URL(request.url);
  const ids = (url.searchParams.get("ids") ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) {
    return Response.json({ error: "Query parameter 'ids' is required (comma-separated)." }, { status: 400 });
  }

  const deletedCount = await deleteShoppingItemsBulk(ctx.organizationId, ids);
  return Response.json({ deletedCount });
}
