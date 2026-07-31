import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// DigitalOcean Spaces is S3-compatible: same client, just point it at the
// region-specific Spaces endpoint (e.g. https://nyc3.digitaloceanspaces.com).
// Checked lazily (not at module load) so scripts that load .env after import still work.
function spacesConfigured() {
  return (
    !!process.env.DO_SPACES_KEY &&
    !!process.env.DO_SPACES_SECRET &&
    !!process.env.DO_SPACES_ENDPOINT &&
    !!process.env.DO_SPACES_BUCKET
  );
}

let client: S3Client | null = null;

function getClient() {
  if (!spacesConfigured()) return null;
  if (!client) {
    client = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: process.env.DO_SPACES_REGION ?? "us-east-1",
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
      },
    });
  }
  return client;
}

export function isSpacesConfigured() {
  return spacesConfigured();
}

/**
 * Downloads an image from `sourceUrl` and uploads it to the configured DigitalOcean
 * Space under `key`, returning its public CDN URL. Throws if Spaces isn't configured —
 * check `isSpacesConfigured()` first if you want a fallback instead.
 */
export async function uploadImageFromUrl(sourceUrl: string, key: string): Promise<string> {
  const s3 = getClient();
  if (!s3) {
    throw new Error(
      "DigitalOcean Spaces is not configured. Set DO_SPACES_KEY, DO_SPACES_SECRET, DO_SPACES_ENDPOINT, and DO_SPACES_BUCKET.",
    );
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch source image (${response.status}): ${sourceUrl}`);
  }
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const body = Buffer.from(await response.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read",
    }),
  );

  const cdnBase = process.env.DO_SPACES_CDN_URL ?? `${process.env.DO_SPACES_ENDPOINT}/${process.env.DO_SPACES_BUCKET}`;
  return `${cdnBase.replace(/\/$/, "")}/${key}`;
}
