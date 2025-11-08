"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Mail, User } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!usernameRegex.test(username)) {
      setError("Username must be 3-20 characters and contain only letters, numbers, hyphens, or underscores")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            username: username.toLowerCase(),
          },
        },
      })
      if (error) throw error
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-black">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-10">
          {/* Logo Placeholder */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-white">D</span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-white text-center mb-2">Create your account</h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">Join dropss and share your links</p>

          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-white">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="your-username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Repeat Password Field */}
            <div className="space-y-2">
              <label htmlFor="repeat-password" className="text-sm font-medium text-white">
                Repeat Password
              </label>
              <div className="relative">
                <Input
                  id="repeat-password"
                  type={showRepeatPassword ? "text" : "password"}
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="pr-12 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-center">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
