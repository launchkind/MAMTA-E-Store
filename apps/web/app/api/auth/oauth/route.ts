import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, redirectTo } = body;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider || "google",
      options: { redirectTo: redirectTo || `${request.nextUrl.origin}/auth/callback` },
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, url: data.url });
  } catch (error) {
    console.error("OAuth API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
