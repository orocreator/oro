import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Performance insights across all your connected platforms.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>No Analytics Yet</CardTitle>
          <CardDescription>
            Connect your platforms to see performance data here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Analytics will show views, engagement, retention, and trends across
            Instagram, YouTube, and TikTok.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
