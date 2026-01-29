'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle2, Loader2, Unplug, RefreshCw } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import type { LucideIcon } from "lucide-react"

interface Platform {
  id: 'instagram' | 'youtube' | 'tiktok'
  name: string
  icon: LucideIcon
  description: string
  color: string
  bgColor: string
  status: string
  oauthUrl: string
}

interface ConnectionCardProps {
  platform: Platform
}

export function ConnectionCard({ platform }: ConnectionCardProps) {
  const Icon = platform.icon

  // Fetch connection status
  const { data: connection, isLoading, refetch } = trpc.platformConnection.get.useQuery(
    { platform: platform.id },
    { retry: false }
  )

  // Disconnect mutation
  const disconnect = trpc.platformConnection.disconnect.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const isConnected = connection?.status === 'connected'
  const isInstagramConfigured = platform.id === 'instagram' &&
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_INSTAGRAM_CONFIGURED === 'true'

  const handleConnect = () => {
    // For now, only Instagram is implemented
    if (platform.id === 'instagram') {
      window.location.href = platform.oauthUrl
    } else {
      alert(`${platform.name} connection coming soon!`)
    }
  }

  const handleDisconnect = () => {
    if (confirm(`Are you sure you want to disconnect ${platform.name}?`)) {
      disconnect.mutate({ platform: platform.id })
    }
  }

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${platform.bgColor} ${platform.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {platform.name}
                {isConnected && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
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
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : isConnected ? (
          <>
            <div className="text-sm space-y-1">
              <p className="font-medium">@{connection.account_username}</p>
              {connection.metadata && (
                <p className="text-xs text-muted-foreground">
                  {(connection.metadata as { followers_count?: number }).followers_count?.toLocaleString() || 0} followers
                </p>
              )}
              {connection.last_sync_at && (
                <p className="text-xs text-muted-foreground">
                  Last synced: {new Date(connection.last_sync_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => refetch()}
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Sync
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnect.isPending}
              >
                {disconnect.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Unplug className="h-3 w-3" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <Button
            className="w-full"
            variant="outline"
            onClick={handleConnect}
          >
            <Plus className="mr-2 h-4 w-4" />
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
