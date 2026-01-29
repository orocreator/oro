export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Instagram, Youtube, Music2, CheckCircle2, AlertCircle } from "lucide-react"
import { ConnectionCard } from "./connection-card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const platforms = [
  {
    id: "instagram" as const,
    name: "Instagram",
    icon: Instagram,
    description: "Reels, Stories, Carousels",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    status: "primary",
    oauthUrl: "/api/auth/instagram",
  },
  {
    id: "youtube" as const,
    name: "YouTube",
    icon: Youtube,
    description: "Videos, Shorts, Analytics",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    status: "supported",
    oauthUrl: "/api/auth/youtube", // TODO: implement
  },
  {
    id: "tiktok" as const,
    name: "TikTok",
    icon: Music2,
    description: "Short-form videos",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    status: "supported",
    oauthUrl: "/api/auth/tiktok", // TODO: implement
  },
]

interface ConnectionsPageProps {
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function ConnectionsPage({ searchParams }: ConnectionsPageProps) {
  const params = await searchParams
  const successMessage = params.success
  const errorMessage = params.error

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
        <p className="text-muted-foreground">
          Connect your creator accounts to unlock personalized recommendations.
        </p>
      </div>

      {successMessage && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {platforms.map((platform) => (
          <ConnectionCard
            key={platform.id}
            platform={platform}
          />
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Why Connect?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Sync your content</strong> — automatically import your posts and analytics</p>
          <p>• <strong>Build Creator DNA</strong> — learn what works for you specifically</p>
          <p>• <strong>Smarter recommendations</strong> — decisions based on your actual performance</p>
          <p>• <strong>Cross-platform insights</strong> — see how content performs everywhere</p>
        </CardContent>
      </Card>

      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>To enable Instagram connection, you need to:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Create a Meta Developer app at developers.facebook.com</li>
            <li>Add Instagram Graph API product</li>
            <li>Configure OAuth redirect URI</li>
            <li>Submit for App Review (24-48 hours)</li>
          </ol>
          <p className="text-xs mt-4">
            Environment variables needed: <code className="bg-muted px-1 rounded">INSTAGRAM_APP_ID</code> and <code className="bg-muted px-1 rounded">INSTAGRAM_APP_SECRET</code>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
