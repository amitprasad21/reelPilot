import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const language = request.nextUrl.searchParams.get("language")

  let query = supabase
    .from("voices")
    .select("id, name, language, gender, tone, provider, voice_id, preview_url")
    .order("name")

  if (language) {
    query = query.eq("language", language)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
