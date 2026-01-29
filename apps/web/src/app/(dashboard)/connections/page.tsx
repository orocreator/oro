export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Instagram, Youtube, Music2, Plus } from "lucide-react"

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "Reels, Stories, Carousels",
    color: "text-pink-500",
    status: "primary",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    description: "Videos, Shorts, Analytics",
    color: "text-red-500",
    status: "supported",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music2,
    description: "Short-form videos",
    color: "text-cyan-500",
    status: "supported",
  },
]

export default function ConnectionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
        <p className="text-muted-foreground">
          Connect your creator accounts to unlock personalized recommendations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {platforms.map((platform) => (
          <Card key={platform.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${platform.color}`}>
                    <platform.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{platform.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {platform.description}
                    </CardDescription>
                  </div>
                </div>
                {platform.status === "primary" && (
                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </CardContent>
          </Card>
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
    </div>
  )
}
