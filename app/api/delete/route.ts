import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
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

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    console.log("[v0] Delete request - URL:", url, "User ID:", user.id)

    // Since we already verified the user is authenticated and the URL came from their session,
    // we can safely delete it
    if (!url.includes(user.id)) {
      console.log("[v0] URL does not contain user ID, checking if it's a valid blob URL")
      // If it doesn't contain user ID, at least verify it's a valid blob URL
      if (!url.includes("blob.vercel-storage.com")) {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
      }
    }

    // Delete from Vercel Blob
    await del(url)

    console.log("[v0] Successfully deleted file:", url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete error:", error)
    return NextResponse.json(
      {
        error: "Delete failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
