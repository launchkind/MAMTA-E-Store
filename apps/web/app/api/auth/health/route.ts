import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Supabase is accessible" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "Cannot connect to Supabase", error: errorMessage },
      { status: 500 }
    );
  }
}
