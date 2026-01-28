import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, TrendingUp, Clock, Instagram } from "lucide-react"

export default function DecisionEnginePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decision Engine</h1>
        <p className="text-muted-foreground">
          Your next move, backed by data and market intelligence.
        </p>
      </div>

      {/* Primary Recommendation Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Recommended Next Move</CardTitle>
                <CardDescription>Based on your Creator DNA + market trends</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              High Confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recommendation Summary */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  <span className="font-medium">Instagram Reel</span>
                </div>
                <h3 className="text-xl font-semibold">
                  &quot;Day in my life as a [your niche]&quot; style content
                </h3>
              </div>
            </div>

            <p className="text-muted-foreground">
              This format is currently trending with 47% higher engagement than your average.
              Hook: Start with the end result, then show the journey.
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                Best time: 6-8 PM
              </Badge>
              <Badge variant="outline">Format: 30-60 seconds</Badge>
              <Badge variant="outline">Hook: Result-first</Badge>
            </div>
          </div>

          {/* Reasoning */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Why this recommendation?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your &quot;behind the scenes&quot; content performs 2.3x better than average</li>
              <li>• This format is trending up 34% this week across similar creators</li>
              <li>• Your audience is most active in the evening hours</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1">
              Accept & Generate Assets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">
              See Alternatives
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Connected Platforms</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Connect platforms to unlock personalized recommendations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Creator DNA Score</CardDescription>
            <CardTitle className="text-2xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Complete onboarding to build your profile
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available Credits</CardDescription>
            <CardTitle className="text-2xl">1,000</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Credits refresh monthly
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
