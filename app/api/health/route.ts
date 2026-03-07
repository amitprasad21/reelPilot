import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/health
 * Verifies the Supabase connection is working.
 * Remove or protect this route before going to production.
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Lightweight ping — count rows in profiles (returns 0 rows, just checks connectivity)
    const { error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: "ok",
      supabase: "connected",
      project_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    )
  }
}
