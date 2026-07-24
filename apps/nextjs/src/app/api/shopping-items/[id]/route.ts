import { notFoundResponse, parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { deleteShoppingItem, updateShoppingItem } from "@/use-cases/shopping-items";
import { z } from "zod";

const updateBodySchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.string().optional(),
  category: z.string().min(1).optional(),
  checked: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, updateBodySchema);
  if ("error" in parsed) return parsed.error;

  const { id } = await params;
  const item = await updateShoppingItem(ctx.organizationId, id, parsed.data);
  if (!item) return notFoundResponse("Shopping list item");

  return Response.json(item);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const { id } = await params;
  const deleted = await deleteShoppingItem(ctx.organizationId, id);
  if (!deleted) return notFoundResponse("Shopping list item");

  return Response.json({ id });
}
