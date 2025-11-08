import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">Your profile, simplified</h1>
        <p className="text-lg md:text-xl text-muted-foreground text-balance">
          Create a custom landing page to showcase all your links in one place. Share your dropss link everywhere.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
