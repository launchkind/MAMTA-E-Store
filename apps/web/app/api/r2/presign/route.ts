import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET, r2PublicUrl } from "@/lib/r2/client";
import { authorizeAdminOrStaff } from "@/lib/r2/authorize-admin";
import { corsHeaders } from "@/lib/r2/cors";

// Folder prefixes allowed for uploads — mirrors the old Supabase bucket
// names plus the base64 columns being cut over to R2.
const ALLOWED_FOLDERS = new Set([
  "products",
  "banners",
  "categories",
  "avatars",
  "icons",
  "product",
  "brands",
  "sellers",
  "ads_banners",
  "product_banners",
  "product_types",
  "social_media",
  "website_icons",
  "product_variants",
  "users",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);

  const auth = await authorizeAdminOrStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status, headers });
  }

  try {
    const body = await request.json();
    const { folder, contentType } = body as { folder?: string; contentType?: string };

    if (!folder || !ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ success: false, message: "Invalid or missing folder" }, { status: 400, headers });
    }
    if (!contentType || !EXT_BY_MIME[contentType]) {
      return NextResponse.json({ success: false, message: "Unsupported content type" }, { status: 400, headers });
    }

    const ext = EXT_BY_MIME[contentType];
    const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return NextResponse.json({ success: true, uploadUrl, key, publicUrl: r2PublicUrl(key) }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create upload URL";
    return NextResponse.json({ success: false, message }, { status: 500, headers });
  }
}
