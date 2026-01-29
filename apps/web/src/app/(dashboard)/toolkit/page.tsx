export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Image, Mic, Sparkles } from "lucide-react"

const tools = [
  {
    id: "script",
    name: "Script Generator",
    description: "Generate scripts, hooks, and captions",
    icon: FileText,
    status: "available",
    credits: 10,
  },
  {
    id: "image",
    name: "Image Generator",
    description: "Create thumbnails and visuals",
    icon: Image,
    status: "available",
    credits: 25,
  },
  {
    id: "voice",
    name: "Voice Generator",
    description: "Create voiceovers and narration",
    icon: Mic,
    status: "coming_soon",
    credits: 50,
  },
]

export default function ToolkitPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Toolkit</h1>
        <p className="text-muted-foreground">
          Generate content assets with AI assistance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.id} className={tool.status === "coming_soon" ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
                {tool.status === "coming_soon" && (
                  <Badge variant="outline">Coming Soon</Badge>
                )}
              </div>
              <CardTitle className="text-base">{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {tool.credits} credits per generation
                </span>
                <Button
                  size="sm"
                  disabled={tool.status === "coming_soon"}
                >
                  <Sparkles className="mr-2 h-3 w-3" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Template-driven</strong> — prompts are pre-optimized for creator content</p>
          <p>• <strong>Context-aware</strong> — generation uses your Creator DNA and brand voice</p>
          <p>• <strong>Editable outputs</strong> — review and refine before publishing</p>
          <p>• <strong>Credit-based</strong> — pay only for what you generate</p>
        </CardContent>
      </Card>
    </div>
  )
}
