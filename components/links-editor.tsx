"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, GripVertical } from "lucide-react"
import { useRouter } from "next/navigation"

type Link = {
  id: string
  platform: string
  url: string
  display_order: number
  is_visible: boolean
}

const PLATFORMS = [
  "Twitter",
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitch",
  "Discord",
  "GitHub",
  "LinkedIn",
  "Website",
  "Custom",
]

export function LinksEditor({ links, userId }: { links: Link[]; userId: string }) {
  const [linksList, setLinksList] = useState<Link[]>(links)
  const [newPlatform, setNewPlatform] = useState("Twitter")
  const [newUrl, setNewUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const { data: existingLinks } = await supabase
        .from("links")
        .select("display_order")
        .eq("user_id", userId)
        .order("display_order", { ascending: false })
        .limit(1)

      const newOrder = existingLinks && existingLinks.length > 0 ? existingLinks[0].display_order + 1 : 0

      const { error } = await supabase.from("links").insert({
        user_id: userId,
        platform: newPlatform,
        url: newUrl,
        display_order: newOrder,
        is_visible: true,
      })

      if (error) throw error

      setMessage({ type: "success", text: "Link added successfully!" })
      setNewUrl("")

      setTimeout(() => {
        router.refresh()
        window.location.reload()
      }, 500)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add link",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("links").delete().eq("id", linkId)

      if (error) throw error

      setMessage({ type: "success", text: "Link deleted successfully!" })

      setTimeout(() => {
        router.refresh()
        window.location.reload()
      }, 500)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete link",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links</CardTitle>
        <CardDescription>Add and manage your social links</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddLink} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={newPlatform} onValueChange={setNewPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Link"}
          </Button>
        </form>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
            {message.text}
          </p>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Links</h3>
          {linksList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No links added yet</p>
          ) : (
            <div className="space-y-2">
              {linksList.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{link.platform}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteLink(link.id)} disabled={isLoading}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
