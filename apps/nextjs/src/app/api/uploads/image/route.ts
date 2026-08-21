import { randomUUID } from "node:crypto";

import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { isSpacesConfigured, uploadImageBuffer } from "@/lib/storage";
import { z } from "zod";

// Sent as base64 JSON rather than multipart FormData — the mobile client hits a
// native "Unsupported FormDataPart implementation" error on its current React
// Native version when uploading a { uri, name, type } file part, so it ships
// the image as a plain base64 string instead (see use-recipes.ts on mobile).
const MAX_BYTES = 8_000_000;
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

const uploadBodySchema = z.object({
  data: z.string().min(1),
  contentType: z.enum(Object.keys(EXTENSION_BY_TYPE) as [string, ...string[]]),
});

export async function POST(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  if (!isSpacesConfigured()) {
    return Response.json({ error: "Image uploads aren't configured on this server yet." }, { status: 501 });
  }

  const parsed = await parseJsonBody(request, uploadBodySchema);
  if ("error" in parsed) return parsed.error;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(parsed.data.data, "base64");
  } catch {
    return Response.json({ error: "Invalid base64 image data." }, { status: 400 });
  }
  if (buffer.length === 0) {
    return Response.json({ error: "Invalid base64 image data." }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return Response.json({ error: "Image is too large (max 8MB)." }, { status: 413 });
  }

  const extension = EXTENSION_BY_TYPE[parsed.data.contentType];
  const key = `recipes/${ctx.organizationId}/${randomUUID()}.${extension}`;
  const url = await uploadImageBuffer(buffer, parsed.data.contentType, key);

  return Response.json({ url }, { status: 201 });
}
