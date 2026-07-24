import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, r2KeyFromPublicUrl } from "@/lib/r2/client";
import { authorizeAdminOrStaff } from "@/lib/r2/authorize-admin";
import { corsHeaders } from "@/lib/r2/cors";

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
    const { url } = body as { url?: string };
    if (!url) {
      return NextResponse.json({ success: false, message: "Missing url" }, { status: 400, headers });
    }

    const key = r2KeyFromPublicUrl(url);
    if (!key) {
      // Not an R2 URL (e.g. a leftover Cloudinary/Supabase URL) — nothing to delete.
      return NextResponse.json({ success: true, skipped: true }, { headers });
    }

    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete object";
    return NextResponse.json({ success: false, message }, { status: 500, headers });
  }
}
