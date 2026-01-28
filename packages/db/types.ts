/**
 * ORO Database Types
 * Auto-generated from Supabase schema - keep in sync with migrations
 */

// ============================================
// ENUMS
// ============================================

export type PlatformType = 'instagram' | 'youtube' | 'tiktok'
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending'
export type ContentType = 'video' | 'image' | 'carousel' | 'text' | 'story' | 'reel' | 'short'
export type ContentSource = 'synced' | 'uploaded' | 'url_import' | 'generated'
export type RecommendationStatus = 'pending' | 'accepted' | 'modified' | 'rejected' | 'published'
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
export type WorkflowType =
  | 'content_sync'
  | 'trend_analysis'
  | 'recommendation_generation'
  | 'script_generation'
  | 'caption_generation'
  | 'image_generation'
  | 'transcription'
  | 'content_analysis'
export type CreditTransactionType = 'grant' | 'purchase' | 'consumption' | 'refund' | 'adjustment'
export type UserRole = 'owner' | 'admin' | 'member'
export type PlanTier = 'free' | 'pro' | 'enterprise'

// ============================================
// BASE TYPES
// ============================================

export interface Organization {
  id: string
  name: string
  slug: string | null
  credit_balance: number
  plan_tier: PlanTier
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  org_id: string
  clerk_id: string | null
  email: string
  name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface PlatformConnection {
  id: string
  org_id: string
  platform: PlatformType
  account_id: string | null
  account_name: string | null
  account_username: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  scopes: string[] | null
  status: ConnectionStatus
  last_sync_at: string | null
  metadata: Record<string, unknown>
  connected_at: string | null
  created_at: string
  updated_at: string
}

export interface CreatorDNA {
  id: string
  org_id: string
  niche: string | null
  voice_description: string | null
  goals: string[] | null
  posting_capacity: string | null
  target_platforms: PlatformType[] | null
  performance_patterns: PerformancePatterns
  style_preferences: StylePreferences
  knowledge_memory: KnowledgeMemory
  dna_score: number | null
  last_updated_from_feedback: string | null
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  org_id: string
  platform_connection_id: string | null
  external_id: string | null
  external_url: string | null
  content_type: ContentType
  source: ContentSource
  title: string | null
  description: string | null
  transcript: string | null
  duration_seconds: number | null
  thumbnail_url: string | null
  storage_url: string | null
  storage_path: string | null
  file_size_bytes: number | null
  platform: PlatformType | null
  published_at: string | null
  metrics: ContentMetrics
  analysis: ContentAnalysis
  synced_at: string | null
  created_at: string
  updated_at: string
}

export interface TrendPattern {
  id: string
  platform: PlatformType
  category: string | null
  pattern_data: PatternData
  example_content_urls: string[] | null
  example_metrics: Record<string, unknown> | null
  confidence_score: number | null
  detected_at: string
  expires_at: string | null
  is_active: boolean
  source: string | null
  created_at: string
  updated_at: string
}

export interface Recommendation {
  id: string
  org_id: string
  platform: PlatformType
  format: ContentType
  hook_angle: string | null
  structure: string | null
  timing_suggestion: TimingSuggestion | null
  hashtag_guidance: string[] | null
  metadata_guidance: Record<string, unknown> | null
  reasoning: RecommendationReasoning
  confidence_score: number | null
  confidence_breakdown: ConfidenceBreakdown | null
  trend_pattern_ids: string[] | null
  based_on_content_ids: string[] | null
  status: RecommendationStatus
  accepted_at: string | null
  modified_at: string | null
  user_modifications: Record<string, unknown> | null
  outcome_content_id: string | null
  experiment_id: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  org_id: string
  workflow_type: WorkflowType
  status: JobStatus
  priority: number
  input_data: Record<string, unknown>
  output_artifacts: JobOutputArtifacts
  progress: number | null
  progress_message: string | null
  stages_completed: string[] | null
  current_stage: string | null
  credits_estimated: number | null
  credits_consumed: number
  model_usage: Record<string, number>
  error_message: string | null
  error_details: Record<string, unknown> | null
  retry_count: number
  max_retries: number
  queued_at: string
  started_at: string | null
  completed_at: string | null
  recommendation_id: string | null
  content_id: string | null
  created_at: string
  updated_at: string
}

export interface CreditLedger {
  id: string
  org_id: string
  amount: number
  balance_after: number
  transaction_type: CreditTransactionType
  description: string | null
  job_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ============================================
// JSONB FIELD TYPES
// ============================================

export interface PerformancePatterns {
  best_hooks?: string[]
  top_formats?: string[]
  peak_times?: { day: string; hour: number }[]
  best_duration_range?: [number, number]
  top_hashtags?: string[]
}

export interface StylePreferences {
  tone?: 'casual' | 'professional' | 'educational' | 'entertaining'
  visual_style?: string
  cta_style?: 'soft' | 'direct' | 'none'
  music_preference?: string
}

export interface KnowledgeMemory {
  products?: { name: string; description: string; url?: string }[]
  faqs?: { question: string; answer: string }[]
  brand_guidelines?: {
    colors?: string[]
    fonts?: string[]
    dos?: string[]
    donts?: string[]
  }
}

export interface ContentMetrics {
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  retention?: number // 0-1
  reach?: number
  impressions?: number
  engagement_rate?: number
  watch_time_seconds?: number
}

export interface ContentAnalysis {
  hook_type?: string
  pacing?: 'slow' | 'medium' | 'fast'
  cta_present?: boolean
  cta_type?: string
  topics?: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
  key_moments?: { timestamp: number; description: string }[]
}

export interface PatternData {
  hook?: string
  structure?: string
  pacing?: string
  duration_range?: [number, number]
  music?: string
  text_overlay?: boolean
  editing_style?: string
  cta_type?: string
}

export interface TimingSuggestion {
  day?: string
  time?: string
  timezone?: string
  reasoning?: string
}

export interface RecommendationReasoning {
  trend_match?: string
  creator_fit?: string
  timing_rationale?: string
  market_signal?: string
  confidence_explanation?: string
}

export interface ConfidenceBreakdown {
  trend?: number
  creator_history?: number
  timing?: number
  market?: number
}

export interface JobOutputArtifacts {
  script_url?: string
  script_text?: string
  captions?: string[]
  images?: { url: string; prompt: string }[]
  transcript?: string
  analysis?: Record<string, unknown>
}

// ============================================
// INSERT TYPES (for creating records)
// ============================================

export type OrganizationInsert = Omit<Organization, 'id' | 'created_at' | 'updated_at'>
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type PlatformConnectionInsert = Omit<PlatformConnection, 'id' | 'created_at' | 'updated_at'>
export type CreatorDNAInsert = Omit<CreatorDNA, 'id' | 'created_at' | 'updated_at'>
export type ContentInsert = Omit<Content, 'id' | 'created_at' | 'updated_at'>
export type TrendPatternInsert = Omit<TrendPattern, 'id' | 'created_at' | 'updated_at'>
export type RecommendationInsert = Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>
export type JobInsert = Omit<Job, 'id' | 'created_at' | 'updated_at'>
export type CreditLedgerInsert = Omit<CreditLedger, 'id' | 'created_at'>

// ============================================
// UPDATE TYPES (for partial updates)
// ============================================

export type OrganizationUpdate = Partial<OrganizationInsert>
export type UserUpdate = Partial<UserInsert>
export type PlatformConnectionUpdate = Partial<PlatformConnectionInsert>
export type CreatorDNAUpdate = Partial<CreatorDNAInsert>
export type ContentUpdate = Partial<ContentInsert>
export type TrendPatternUpdate = Partial<TrendPatternInsert>
export type RecommendationUpdate = Partial<RecommendationInsert>
export type JobUpdate = Partial<JobInsert>
