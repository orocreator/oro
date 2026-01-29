export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileVideo, Upload, Link2 } from "lucide-react"

export default function ContentPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content</h1>
          <p className="text-muted-foreground">
            Your content library and synced posts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Link2 className="mr-2 h-4 w-4" />
            Import URL
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <FileVideo className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>No Content Yet</CardTitle>
          <CardDescription>
            Upload content or connect platforms to sync your library.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Your content will be analyzed to build your Creator DNA and inform
            recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
