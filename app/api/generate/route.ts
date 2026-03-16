import { auth } from "@clerk/nextjs/server"
import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { seriesId } = await request.json()

  if (!seriesId) {
    return NextResponse.json({ error: "Missing seriesId" }, { status: 400 })
  }

  // Verify ownership
  const supabase = createAdminClient()
  const { data: series } = await supabase
    .from("video_series")
    .select("id, series_name")
    .eq("id", seriesId)
    .eq("user_id", userId)
    .single()

  if (!series) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 })
  }

  const { data: pendingAsset, error: pendingAssetError } = await supabase
    .from("generated_video_assets")
    .insert({
      series_id: series.id,
      user_id: userId,
      title: `${series.series_name} - Generating`,
      status: "pending",
      captions_json: [],
      scenes_json: [],
      images_json: [],
    })
    .select("id")
    .single()

  if (pendingAssetError || !pendingAsset) {
    return NextResponse.json(
      { error: pendingAssetError?.message ?? "Failed to create pending video record" },
      { status: 500 }
    )
  }

  // Send event to Inngest
  await inngest.send({
    name: "video/generate",
    data: { seriesId, assetId: pendingAsset.id },
  })

  return NextResponse.json({ success: true, assetId: pendingAsset.id })
}
