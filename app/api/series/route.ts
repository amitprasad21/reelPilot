import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  const supabase = createAdminClient()

  if (id) {
    const { data, error } = await supabase
      .from("video_series")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from("video_series")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[GET /api/series] select error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: "Missing series id" }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from("video_series")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("video_series")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("[PATCH /api/series] update error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing series id" }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from("video_series")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 })
  }

  const { error } = await supabase
    .from("video_series")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) {
    console.error("[DELETE /api/series] delete error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()

  const {
    seriesName,
    videoDuration,
    niche,
    language,
    voiceId,
    bgTracks,
    videoStyle,
    captionStyle,
    platforms,
    repeatType,
    publishDate,
    publishTime,
    repeatDays,
  } = body

  // Validate required fields
  if (!seriesName || !videoDuration || !platforms?.length || !publishTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  let publishAt: string | null = null
  let generateAt: string | null = null

  if (repeatType === "once" && publishDate) {
    const [hours, minutes] = publishTime.split(":").map(Number)
    const pub = new Date(publishDate)
    pub.setHours(hours, minutes, 0, 0)
    publishAt = pub.toISOString()

    const gen = new Date(pub)
    gen.setHours(gen.getHours() - 4)
    generateAt = gen.toISOString()
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("video_series")
    .insert({
      user_id: userId,
      series_name: seriesName,
      video_duration: videoDuration,
      niche: niche || null,
      language: language || null,
      voice_id: voiceId || null,
      bg_tracks: bgTracks || [],
      video_style: videoStyle || null,
      caption_style: captionStyle || null,
      platforms,
      publish_at: publishAt,
      generate_at: generateAt,
      repeat_type: repeatType || "once",
      repeat_days: repeatDays || [],
      status: "active",
    })
    .select()
    .single()

  if (error) {
    console.error("[POST /api/series] insert error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
