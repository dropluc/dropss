import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Profile Not Found</h1>
        <p className="text-lg text-muted-foreground">This profile doesn&apos;t exist or has been removed.</p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
