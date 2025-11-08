import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileType = formData.get("type") as string // 'music' or 'background'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file types
    if (fileType === "music") {
      const validMusicTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"]
      if (!validMusicTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid music file type. Use MP3, WAV, or OGG" }, { status: 400 })
      }
    } else if (fileType === "background") {
      const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!validImageTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid image file type. Use JPG, PNG, GIF, or WebP" }, { status: 400 })
      }
    }

    // Generate unique filename with user ID and timestamp
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const uniqueFilename = `${user.id}/${fileType}-${timestamp}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
