"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  Palette,
  LinkIcon,
  Crown,
  ImageIcon,
  FileText,
  Eye,
  Hash,
  Settings,
  ExternalLink,
  Share2,
  Pencil,
  MessageSquare,
  Upload,
  MapPin,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, X, Trash2, GripVertical } from "lucide-react"

const NAV_ITEMS = [
  { icon: User, label: "account", href: "/dashboard" },
  { icon: Palette, label: "customize", href: "/dashboard/customize" },
  { icon: LinkIcon, label: "links", href: "/dashboard/links" },
  { icon: Crown, label: "premium", href: "/dashboard/premium" },
  { icon: ImageIcon, label: "image-host", href: "/dashboard/image-host" },
  { icon: FileText, label: "templates", href: "/dashboard/templates" },
]

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

const PLATFORMS = [
  "Twitter",
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitch",
  "Discord",
  "GitHub",
  "LinkedIn",
  "Spotify",
  "Facebook",
  "Website",
  "Custom",
]

export function DashboardLayout({ profile, links, theme, userId, userEmail }: any) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("account")

  // Profile state
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [location, setLocation] = useState(profile?.location || "")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Theme state
  const [backgroundColor, setBackgroundColor] = useState(theme?.background_color || "#0a0a0a")
  const [textColor, setTextColor] = useState(theme?.text_color || "#ffffff")
  const [accentColor, setAccentColor] = useState(theme?.accent_color || "#a855f7")
  const [fontFamily, setFontFamily] = useState(theme?.font_family || "sans-serif")
  const [cursorUrl, setCursorUrl] = useState(theme?.cursor_url || "")
  const [musicUrl, setMusicUrl] = useState(theme?.music_url || "")
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(theme?.background_image_url || "")
  const [nameEffect, setNameEffect] = useState(theme?.name_effect || "none")
  const [richPresence, setRichPresence] = useState(theme?.rich_presence || "")
  const [themeLoading, setThemeLoading] = useState(false)
  const [isMusicUploading, setIsMusicUploading] = useState(false)
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false)
  const [themeMessage, setThemeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Links state
  const [linksList, setLinksList] = useState(links)
  const [newPlatform, setNewPlatform] = useState("Twitter")
  const [newUrl, setNewUrl] = useState("")
  const [linksLoading, setLinksLoading] = useState(false)
  const [linksMessage, setLinksMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || null,
          bio: bio || null,
          avatar_url: avatarUrl || null,
          location: location || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      setProfileMessage({ type: "success", text: "Profile updated successfully!" })
      router.refresh()
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleConnectDiscord = async () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    if (!clientId) {
      setProfileMessage({ type: "error", text: "Discord integration not configured" })
      return
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}/api/discord/callback`)
    const scope = encodeURIComponent("identify activities.read")
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`

    window.location.href = discordAuthUrl
  }

  const handleFileUpload = async (file: File, type: "music" | "background" | "avatar" | "cursor") => {
    const setUploading =
      type === "music" ? setIsMusicUploading : type === "background" ? setIsBackgroundUploading : null
    if (setUploading) setUploading(true)
    setThemeMessage(null)

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
      } else if (type === "background") {
        setBackgroundImageUrl(data.url)
      } else if (type === "avatar") {
        setAvatarUrl(data.url)
      } else if (type === "cursor") {
        setCursorUrl(data.url)
      }

      setThemeMessage({ type: "success", text: `${type} uploaded successfully!` })
    } catch (error) {
      setThemeMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Upload failed",
      })
    } finally {
      if (setUploading) setUploading(false)
    }
  }

  const handleFileDelete = async (url: string, type: string) => {
    if (!url) return

    console.log("[v0] Attempting to delete file:", url, "Type:", type)

    try {
      const response = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      console.log("[v0] Delete response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Delete error response:", errorData)
        throw new Error(errorData.error || "Delete failed")
      }

      if (type === "music") {
        setMusicUrl("")
      } else if (type === "background") {
        setBackgroundImageUrl("")
      }

      setThemeMessage({ type: "success", text: `${type} removed successfully!` })

      router.refresh()
    } catch (error) {
      console.error("[v0] Delete failed:", error)
      setThemeMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Delete failed",
      })
    }
  }

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault()
    setThemeLoading(true)
    setThemeMessage(null)

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

      setThemeMessage({ type: "success", text: "Theme updated successfully!" })
      router.refresh()
    } catch (error) {
      setThemeMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update theme",
      })
    } finally {
      setThemeLoading(false)
    }
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinksLoading(true)
    setLinksMessage(null)

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

      setLinksMessage({ type: "success", text: "Link added successfully!" })
      setNewUrl("")

      setTimeout(() => {
        router.refresh()
        window.location.reload()
      }, 500)
    } catch (error) {
      setLinksMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add link",
      })
    } finally {
      setLinksLoading(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    setLinksLoading(true)
    setLinksMessage(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("links").delete().eq("id", linkId)
      if (error) throw error

      setLinksMessage({ type: "success", text: "Link deleted successfully!" })

      setTimeout(() => {
        router.refresh()
        window.location.reload()
      }, 500)
    } catch (error) {
      setLinksMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete link",
      })
    } finally {
      setLinksLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="font-bold text-xl">dropss</span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.label
            return (
              <button
                key={item.label}
                onClick={() => setActiveSection(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-purple-900/50 text-white" : "text-gray-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="space-y-3 pt-6 border-t border-zinc-800">
          <p className="text-sm text-gray-400">Check out your page</p>
          {profile && (
            <Button asChild variant="outline" className="w-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
              <Link href={`/${profile.username}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                My Page
              </Link>
            </Button>
          )}
          <Button variant="ghost" className="w-full justify-start text-purple-500 hover:bg-purple-900/20">
            <Share2 className="w-4 h-4 mr-2" />
            Share Your Profile
          </Button>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-zinc-800 mt-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.username || "User"}</p>
            <p className="text-xs text-gray-500 truncate">UID {profile?.id?.slice(0, 8)}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeSection === "account" && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Account Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-900/50 to-purple-900/20 rounded-xl p-6 border border-purple-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Username</span>
                  <Pencil className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">{profile?.username || "N/A"}</p>
                <p className="text-xs text-purple-400 mt-1">Change available now</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-purple-900/20 rounded-xl p-6 border border-purple-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Alias</span>
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">{displayName || "Unavailable"}</p>
                <p className="text-xs text-purple-400 mt-1">{displayName ? "Set" : "Premium Only"}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-purple-900/20 rounded-xl p-6 border border-purple-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">UID</span>
                  <Hash className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">{profile?.id?.slice(0, 7) || "0"}</p>
                <p className="text-xs text-gray-400 mt-1">Unique ID</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-purple-900/20 rounded-xl p-6 border border-purple-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Profile Views</span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">{profile?.views || 0}</p>
                <p className="text-xs text-gray-400 mt-1">+0 views since last 7 days</p>
              </div>
            </div>

            {/* Account Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Completion */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
                  <h2 className="text-xl font-bold mb-4">Account Statistics</h2>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Profile Completion</span>
                      <span className="text-sm text-gray-400">0% completed</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{ width: "0%" }} />
                    </div>
                  </div>

                  <div className="bg-orange-900/20 border border-orange-800/30 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="text-orange-500">⚠</span>
                      Your profile isn't complete yet!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Complete your profile to make it more discoverable and appealing.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">Upload An Avatar</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">Add A Description</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                    <button
                      onClick={handleConnectDiscord}
                      className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">Link Discord Account</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                    <button
                      onClick={() => setActiveSection("links")}
                      className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">Add Socials</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-6">
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
                  <h3 className="text-lg font-bold mb-4">Manage your account</h3>
                  <p className="text-sm text-gray-400 mb-4">Change your email, username and more.</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Change Username
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Change Display Name
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-purple-900/30 border-purple-800 hover:bg-purple-900/50"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Want more? Unlock with Premium
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                  </div>
                </div>

                <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
                  <h3 className="text-lg font-bold mb-2">Connections</h3>
                  <p className="text-sm text-gray-400 mb-4">Link your Discord account to dropss</p>
                  <Button onClick={handleConnectDiscord} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect Discord
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "customize" && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">General Customization</h1>

            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Profile Section */}
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-gray-400">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      placeholder="Your Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-400">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="location"
                        placeholder="My Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-gray-400">
                      Description
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <Textarea
                        id="bio"
                        placeholder="this is my description"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="bg-zinc-900 border-zinc-800 pl-10"
                      />
                    </div>
                  </div>
                </div>

                {profileMessage && (
                  <p
                    className={`mt-4 text-sm ${profileMessage.type === "success" ? "text-green-500" : "text-red-500"}`}
                  >
                    {profileMessage.text}
                  </p>
                )}

                <Button type="submit" disabled={profileLoading} className="mt-6 bg-purple-600 hover:bg-purple-700">
                  {profileLoading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>

            {/* Theme Customization */}
            <form onSubmit={handleSaveTheme} className="space-y-8 mt-8">
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-6">Color Customization</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-20 h-10 p-1 bg-zinc-900 border-zinc-800"
                      />
                      <Input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 bg-zinc-900 border-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-20 h-10 p-1 bg-zinc-900 border-zinc-800"
                      />
                      <Input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 bg-zinc-900 border-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-20 h-10 p-1 bg-zinc-900 border-zinc-800"
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 bg-zinc-900 border-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Font Family</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800">
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

                  <div className="space-y-2">
                    <Label className="text-gray-400">Username Effects</Label>
                    <div className="relative">
                      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Select value={nameEffect} onValueChange={setNameEffect}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 pl-10">
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
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 w-full bg-red-900/20 border-red-800 hover:bg-red-900/30 text-red-400"
                >
                  Enable Profile Gradient
                </Button>
              </div>

              {/* Assets Uploader */}
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-6">Assets Uploader</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Background Upload */}
                  <div className="space-y-2">
                    <Label className="text-gray-400">Background</Label>
                    {backgroundImageUrl ? (
                      <div className="relative">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-zinc-800 bg-zinc-900">
                          <img
                            src={backgroundImageUrl || "/placeholder.svg"}
                            alt="Background"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleFileDelete(backgroundImageUrl, "background")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg cursor-pointer hover:border-purple-600 transition-colors bg-zinc-900/50">
                        {isBackgroundUploading ? (
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-400 text-center px-4">Click to upload a file</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, "background")
                          }}
                          disabled={isBackgroundUploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Audio Upload */}
                  <div className="space-y-2">
                    <Label className="text-gray-400">Audio</Label>
                    {musicUrl ? (
                      <div className="relative">
                        <div className="rounded-lg border-2 border-zinc-800 bg-zinc-900 p-4">
                          <audio src={musicUrl} controls className="w-full" />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => handleFileDelete(musicUrl, "music")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Audio
                        </Button>
                      </div>
                    ) : (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg cursor-pointer hover:border-purple-600 transition-colors bg-zinc-900/50">
                        {isMusicUploading ? (
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-400 text-center px-4">Click to open audio manager</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, "music")
                          }}
                          disabled={isMusicUploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Profile Avatar */}
                  <div className="space-y-2">
                    <Label className="text-gray-400">Profile Avatar</Label>
                    {avatarUrl ? (
                      <div className="relative">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-zinc-800 bg-zinc-900">
                          <img
                            src={avatarUrl || "/placeholder.svg"}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setAvatarUrl("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg cursor-pointer hover:border-purple-600 transition-colors bg-zinc-900/50">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-400 text-center px-4">Click to upload a file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, "avatar")
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Custom Cursor */}
                  <div className="space-y-2">
                    <Label className="text-gray-400">Custom Cursor</Label>
                    {cursorUrl ? (
                      <div className="relative">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-zinc-800 bg-zinc-900">
                          <img
                            src={cursorUrl || "/placeholder.svg"}
                            alt="Cursor"
                            className="w-full h-full object-contain p-4"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setCursorUrl("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg cursor-pointer hover:border-purple-600 transition-colors bg-zinc-900/50">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-400 text-center px-4">Click to upload a file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, "cursor")
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {themeMessage && (
                  <p className={`mt-4 text-sm ${themeMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
                    {themeMessage.text}
                  </p>
                )}

                <Button type="submit" disabled={themeLoading} className="mt-6 bg-purple-600 hover:bg-purple-700">
                  {themeLoading ? "Saving..." : "Save Theme"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeSection === "links" && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Links Manager</h1>

            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-6">Add Social Links</h2>

              <form onSubmit={handleAddLink} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-gray-400">
                      Platform
                    </Label>
                    <Select value={newPlatform} onValueChange={setNewPlatform}>
                      <SelectTrigger id="platform" className="bg-zinc-900 border-zinc-800">
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
                    <Label htmlFor="url" className="text-gray-400">
                      URL
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      required
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={linksLoading} className="bg-purple-600 hover:bg-purple-700">
                  {linksLoading ? "Adding..." : "Add Link"}
                </Button>
              </form>

              {linksMessage && (
                <p className={`mb-4 text-sm ${linksMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
                  {linksMessage.text}
                </p>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Your Links</h3>
                {linksList.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No links added yet</p>
                ) : (
                  <div className="space-y-2">
                    {linksList.map((link: any) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800"
                      >
                        <GripVertical className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{link.platform}</p>
                          <p className="text-xs text-gray-500 truncate">{link.url}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLink(link.id)}
                          disabled={linksLoading}
                          className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === "premium" && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Premium</h1>
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-900/20 rounded-xl p-8 border border-purple-800/30 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
              <p className="text-gray-400 mb-6">Unlock exclusive features and customization options</p>
              <Button className="bg-purple-600 hover:bg-purple-700">Coming Soon</Button>
            </div>
          </div>
        )}

        {(activeSection === "image-host" || activeSection === "templates") && (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 capitalize">{activeSection.replace("-", " ")}</h1>
            <div className="bg-zinc-950 rounded-xl p-8 border border-zinc-800 text-center">
              <p className="text-gray-400">This feature is coming soon!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
