import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // Fetch user links
  const { data: links } = await supabase.from("links").select("*").eq("user_id", user.id).order("display_order")

  // Fetch user theme
  const { data: theme } = await supabase.from("themes").select("*").eq("user_id", user.id).maybeSingle()

  return <DashboardLayout profile={profile} links={links || []} theme={theme} userId={user.id} userEmail={user.email} />
}
