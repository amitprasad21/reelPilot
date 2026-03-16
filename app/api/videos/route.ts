import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const seriesId = searchParams.get("seriesId")

  const supabase = createAdminClient()

  let query = supabase
    .from("generated_video_assets")
    .select("id, series_id, title, created_at, status, images_json")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (seriesId) {
    query = query.eq("series_id", seriesId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
