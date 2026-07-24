import type { z } from "zod";

/**
 * Parses and validates a request body against a zod schema, matching the
 * manual try/catch + safeParse convention already used by the Stripe checkout
 * route. Returns either the parsed data or a ready-to-return error Response.
 */
export async function parseJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): Promise<{ data: z.infer<Schema> } | { error: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: Response.json({ error: "Request body must be valid JSON." }, { status: 400 }) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      error: Response.json(
        { error: "Invalid request payload.", details: parsed.error.flatten() },
        { status: 400 },
      ),
    };
  }

  return { data: parsed.data };
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFoundResponse(resource = "Resource") {
  return Response.json({ error: `${resource} not found.` }, { status: 404 });
}
