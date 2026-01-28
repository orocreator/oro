import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Palette, CreditCard, Bell } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" defaultValue="Daniel" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" disabled />
              <p className="text-xs text-muted-foreground">
                Email is managed through your authentication provider
              </p>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Creator DNA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Creator DNA</CardTitle>
            </div>
            <CardDescription>Your content profile and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="niche">Niche / Industry</Label>
              <Input id="niche" placeholder="e.g., Tech reviews, Fitness, Cooking" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="voice">Voice & Tone</Label>
              <Input id="voice" placeholder="e.g., Casual and friendly, Professional, Educational" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goals">Content Goals</Label>
              <Input id="goals" placeholder="e.g., Grow audience, Drive sales, Build authority" />
            </div>
            <Button>Update Creator DNA</Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Subscription</CardTitle>
              </div>
              <Badge>Free Plan</Badge>
            </div>
            <CardDescription>Manage your plan and credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Available Credits</span>
                <span className="text-sm">1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Resets</span>
                <span className="text-sm text-muted-foreground">Monthly</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Upgrade to Pro for more credits and advanced features.
            </p>
            <Button variant="outline" disabled>
              Upgrade (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Notifications</CardTitle>
            </div>
            <CardDescription>Notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification settings coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
