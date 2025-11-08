"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Upload, X, Loader2 } from "lucide-react"

type Theme = {
  id: string
  background_color: string
  text_color: string
  accent_color: string
  font_family: string
  cursor_url: string | null
  music_url: string | null
  name_effect: string
  rich_presence: string | null
  background_image_url: string | null
}

const FONTS = [
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
]

const NAME_EFFECTS = [
  { value: "none", label: "None" },
  { value: "gradient", label: "Gradient" },
  { value: "glitch", label: "Glitch" },
  { value: "wave", label: "Wave" },
  { value: "rainbow", label: "Rainbow" },
]

export function ThemeEditor({ theme, userId }: { theme: Theme | null; userId: string }) {
  const [backgroundColor, setBackgroundColor] = useState(theme?.background_color || "#ffffff")
  const [textColor, setTextColor] = useState(theme?.text_color || "#000000")
  const [accentColor, setAccentColor] = useState(theme?.accent_color || "#3b82f6")
  const [fontFamily, setFontFamily] = useState(theme?.font_family || "sans-serif")
  const [cursorUrl, setCursorUrl] = useState(theme?.cursor_url || "")
  const [musicUrl, setMusicUrl] = useState(theme?.music_url || "")
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(theme?.background_image_url || "")
  const [nameEffect, setNameEffect] = useState(theme?.name_effect || "none")
  const [richPresence, setRichPresence] = useState(theme?.rich_presence || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isMusicUploading, setIsMusicUploading] = useState(false)
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleFileUpload = async (file: File, type: "music" | "background") => {
    const setUploading = type === "music" ? setIsMusicUploading : setIsBackgroundUploading
    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()

      if (type === "music") {
        setMusicUrl(data.url)
      } else {
        setBackgroundImageUrl(data.url)
      }

      setMessage({ type: "success", text: `${type === "music" ? "Music" : "Background"} uploaded successfully!` })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Upload failed",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileDelete = async (url: string, type: "music" | "background") => {
    if (!url) return

    try {
      const response = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      if (type === "music") {
        setMusicUrl("")
      } else {
        setBackgroundImageUrl("")
      }

      setMessage({ type: "success", text: `${type === "music" ? "Music" : "Background"} removed successfully!` })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Delete failed",
      })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const themeData = {
        background_color: backgroundColor,
        text_color: textColor,
        accent_color: accentColor,
        font_family: fontFamily,
        cursor_url: cursorUrl || null,
        music_url: musicUrl || null,
        background_image_url: backgroundImageUrl || null,
        name_effect: nameEffect,
        rich_presence: richPresence || null,
        updated_at: new Date().toISOString(),
      }

      if (theme) {
        const { error } = await supabase.from("themes").update(themeData).eq("id", theme.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("themes").insert({
          user_id: userId,
          ...themeData,
        })

        if (error) throw error
      }

      setMessage({ type: "success", text: "Theme updated successfully!" })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update theme",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Customization</CardTitle>
        <CardDescription>Customize your profile appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Colors Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Typography</h3>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="fontFamily">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Custom Effects</h3>

            <div className="space-y-2">
              <Label htmlFor="nameEffect">Name Effect</Label>
              <Select value={nameEffect} onValueChange={setNameEffect}>
                <SelectTrigger id="nameEffect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NAME_EFFECTS.map((effect) => (
                    <SelectItem key={effect.value} value={effect.value}>
                      {effect.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Add cool animated effects to your name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cursorUrl">Custom Cursor URL</Label>
              <Input
                id="cursorUrl"
                type="url"
                placeholder="https://example.com/cursor.png"
                value={cursorUrl}
                onChange={(e) => setCursorUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Upload a cursor image (PNG/CUR format, max 32x32px recommended)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="musicUrl">Background Music</Label>
              {musicUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <audio src={musicUrl} controls className="flex-1" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleFileDelete(musicUrl, "music")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="musicUpload"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    {isMusicUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload music</span>
                        <span className="text-xs text-muted-foreground">MP3, WAV, or OGG (max 10MB)</span>
                      </>
                    )}
                  </label>
                  <input
                    id="musicUpload"
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "music")
                    }}
                    disabled={isMusicUploading}
                  />
                  <Input
                    type="url"
                    placeholder="Or paste music URL"
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Add background music to your profile</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundImage">Background Image</Label>
              {backgroundImageUrl ? (
                <div className="space-y-2">
                  <div className="relative w-full h-32 rounded-md overflow-hidden border">
                    <img
                      src={backgroundImageUrl || "/placeholder.svg"}
                      alt="Background preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input type="text" value={backgroundImageUrl} readOnly className="flex-1" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleFileDelete(backgroundImageUrl, "background")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="backgroundUpload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    {isBackgroundUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload background image</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, GIF, or WebP (max 10MB)</span>
                      </>
                    )}
                  </label>
                  <input
                    id="backgroundUpload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "background")
                    }}
                    disabled={isBackgroundUploading}
                  />
                  <Input
                    type="url"
                    placeholder="Or paste image URL"
                    value={backgroundImageUrl}
                    onChange={(e) => setBackgroundImageUrl(e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Set a custom background image for your profile</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="richPresence">Rich Presence</Label>
              <Input
                id="richPresence"
                type="text"
                placeholder="e.g., 🎮 Playing Valorant | 🎵 Listening to Spotify"
                value={richPresence}
                onChange={(e) => setRichPresence(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">Show what you're currently doing (max 100 characters)</p>
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Theme"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
