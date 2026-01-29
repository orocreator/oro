-- ORO Initial Database Schema
-- Version: 1.0
-- Aligned with PRD v1.0

-- Enable UUID extension (Supabase uses pgcrypto by default)
-- gen_random_uuid() is available without extension in Postgres 13+

-- ============================================
-- ORGANIZATIONS (Multi-tenant foundation)
-- ============================================
-- PRD: "Multi-tenant from day one"
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    credit_balance INTEGER NOT NULL DEFAULT 1000,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    clerk_id VARCHAR(255) UNIQUE, -- Clerk authentication ID
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- ============================================
-- PLATFORM CONNECTIONS
-- ============================================
-- PRD: "Instagram (deep), YouTube, TikTok (shallow)"
CREATE TYPE platform_type AS ENUM ('instagram', 'youtube', 'tiktok');
CREATE TYPE connection_status AS ENUM ('connected', 'disconnected', 'error', 'pending');

CREATE TABLE platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    account_id VARCHAR(255), -- Platform-specific account ID
    account_name VARCHAR(255),
    account_username VARCHAR(255),
    access_token TEXT, -- Encrypted in production
    refresh_token TEXT, -- Encrypted in production
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[], -- Array of granted scopes
    status connection_status NOT NULL DEFAULT 'pending',
    last_sync_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(org_id, platform, account_id)
);

CREATE INDEX idx_platform_connections_org_id ON platform_connections(org_id);
CREATE INDEX idx_platform_connections_platform ON platform_connections(platform);

-- ============================================
-- CREATOR DNA
-- ============================================
-- PRD Pillar 1: "A persistent, evolving profile that learns"
CREATE TABLE creator_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Explicit inputs (onboarding)
    niche VARCHAR(255),
    voice_description TEXT,
    goals TEXT[],
    posting_capacity VARCHAR(50), -- e.g., 'daily', '3x_week', 'weekly'
    target_platforms platform_type[],

    -- Learned patterns (updated by feedback loop)
    performance_patterns JSONB DEFAULT '{}',
    -- e.g., { "best_hooks": [...], "top_formats": [...], "peak_times": [...] }

    style_preferences JSONB DEFAULT '{}',
    -- e.g., { "tone": "casual", "visual_style": "minimalist", "cta_style": "soft" }

    knowledge_memory JSONB DEFAULT '{}',
    -- e.g., { "products": [...], "faqs": [...], "brand_guidelines": {...} }

    dna_score INTEGER, -- 0-100, how complete/confident the profile is
    last_updated_from_feedback TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CONTENT
-- ============================================
-- PRD: "Content sync from connected platforms"
CREATE TYPE content_type AS ENUM ('video', 'image', 'carousel', 'text', 'story', 'reel', 'short');
CREATE TYPE content_source AS ENUM ('synced', 'uploaded', 'url_import', 'generated');

CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform_connection_id UUID REFERENCES platform_connections(id) ON DELETE SET NULL,

    -- Identifiers
    external_id VARCHAR(255), -- Platform-specific content ID
    external_url TEXT,

    -- Content metadata
    content_type content_type NOT NULL,
    source content_source NOT NULL DEFAULT 'uploaded',
    title VARCHAR(500),
    description TEXT,
    transcript TEXT,
    duration_seconds INTEGER,
    thumbnail_url TEXT,

    -- Storage
    storage_url TEXT, -- Our storage (R2/S3)
    storage_path VARCHAR(500),
    file_size_bytes BIGINT,

    -- Platform-specific data
    platform platform_type,
    published_at TIMESTAMPTZ,

    -- Performance metrics
    metrics JSONB DEFAULT '{}',
    -- e.g., { "views": 1000, "likes": 50, "comments": 10, "shares": 5, "retention": 0.45 }

    -- Analysis results
    analysis JSONB DEFAULT '{}',
    -- e.g., { "hook_type": "question", "pacing": "fast", "cta_present": true }

    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_org_id ON content(org_id);
CREATE INDEX idx_content_platform ON content(platform);
CREATE INDEX idx_content_published_at ON content(published_at DESC);
CREATE INDEX idx_content_platform_connection_id ON content(platform_connection_id);

-- ============================================
-- TREND PATTERNS
-- ============================================
-- PRD: "Market-driven first, user-personalized second"
CREATE TABLE trend_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    platform platform_type NOT NULL,
    category VARCHAR(255), -- e.g., "day_in_life", "tutorial", "hook_style"

    -- Pattern data
    pattern_data JSONB NOT NULL,
    -- e.g., { "hook": "Start with end result", "structure": "result->journey->cta",
    --         "pacing": "fast_cuts", "duration_range": [30, 60] }

    -- Evidence
    example_content_urls TEXT[],
    example_metrics JSONB, -- Aggregated metrics from examples

    -- Confidence & lifecycle
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Trends have a shelf life
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Source tracking
    source VARCHAR(100), -- e.g., "meta_ad_library", "manual_curation", "analysis"

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trend_patterns_platform ON trend_patterns(platform);
CREATE INDEX idx_trend_patterns_active ON trend_patterns(is_active, expires_at);
CREATE INDEX idx_trend_patterns_confidence ON trend_patterns(confidence_score DESC);

-- ============================================
-- RECOMMENDATIONS
-- ============================================
-- PRD Pillar 2: "Decision Engine"
CREATE TYPE recommendation_status AS ENUM ('pending', 'accepted', 'modified', 'rejected', 'published');

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- What we recommend
    platform platform_type NOT NULL,
    format content_type NOT NULL,
    hook_angle TEXT,
    structure TEXT,
    timing_suggestion JSONB, -- e.g., { "day": "tuesday", "time": "18:00", "timezone": "America/New_York" }
    hashtag_guidance TEXT[],
    metadata_guidance JSONB, -- Description hints, CTA suggestions

    -- Why we recommend it
    reasoning JSONB NOT NULL,
    -- e.g., { "trend_match": "...", "creator_fit": "...", "timing_rationale": "..." }

    -- Confidence
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    confidence_breakdown JSONB, -- { "trend": 0.8, "creator_history": 0.6, "timing": 0.9 }

    -- Sources
    trend_pattern_ids UUID[], -- Which trends influenced this
    based_on_content_ids UUID[], -- Which of user's content informed this

    -- Lifecycle
    status recommendation_status NOT NULL DEFAULT 'pending',
    accepted_at TIMESTAMPTZ,
    modified_at TIMESTAMPTZ,
    user_modifications JSONB, -- What the user changed

    -- Outcome tracking (for feedback loop)
    outcome_content_id UUID REFERENCES content(id) ON DELETE SET NULL,
    experiment_id UUID, -- For A/B testing (post-MVP)

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_org_id ON recommendations(org_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);

-- ============================================
-- JOBS (Execution Engine)
-- ============================================
-- PRD Pillar 3: "Agent-orchestrated workflows"
CREATE TYPE job_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE workflow_type AS ENUM (
    'content_sync',
    'trend_analysis',
    'recommendation_generation',
    'script_generation',
    'caption_generation',
    'image_generation',
    'transcription',
    'content_analysis'
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    workflow_type workflow_type NOT NULL,
    status job_status NOT NULL DEFAULT 'queued',
    priority INTEGER NOT NULL DEFAULT 0, -- Higher = more urgent

    -- Input/Output
    input_data JSONB NOT NULL DEFAULT '{}',
    output_artifacts JSONB DEFAULT '{}',
    -- e.g., { "script_url": "...", "captions": [...], "images": [...] }

    -- Progress
    progress INTEGER DEFAULT 0, -- 0-100
    progress_message VARCHAR(500),
    stages_completed TEXT[],
    current_stage VARCHAR(100),

    -- Cost tracking
    credits_estimated INTEGER,
    credits_consumed INTEGER DEFAULT 0,
    model_usage JSONB DEFAULT '{}', -- { "gpt-4": 1000, "claude": 500 } tokens/calls

    -- Error handling
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Timing
    queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Relations
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
    content_id UUID REFERENCES content(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_org_id ON jobs(org_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_queued ON jobs(status, priority DESC, queued_at ASC) WHERE status = 'queued';

-- ============================================
-- CREDIT LEDGER
-- ============================================
-- PRD: "Credits tracking"
CREATE TYPE credit_transaction_type AS ENUM ('grant', 'purchase', 'consumption', 'refund', 'adjustment');

CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    amount INTEGER NOT NULL, -- Positive for additions, negative for consumption
    balance_after INTEGER NOT NULL,

    transaction_type credit_transaction_type NOT NULL,
    description VARCHAR(500),

    -- Relations
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_ledger_org_id ON credit_ledger(org_id);
CREATE INDEX idx_credit_ledger_created_at ON credit_ledger(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_connections_updated_at BEFORE UPDATE ON platform_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_dna_updated_at BEFORE UPDATE ON creator_dna
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trend_patterns_updated_at BEFORE UPDATE ON trend_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update org credit balance after ledger insert
CREATE OR REPLACE FUNCTION update_org_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE organizations
    SET credit_balance = NEW.balance_after,
        updated_at = NOW()
    WHERE id = NEW.org_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_balance_on_ledger_insert
    AFTER INSERT ON credit_ledger
    FOR EACH ROW EXECUTE FUNCTION update_org_credit_balance();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables for multi-tenant security

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be defined based on authentication context
-- For now, we'll use service role for backend operations
-- Policies to be added when implementing auth integration

-- ============================================
-- SEED DATA (Development)
-- ============================================
-- This can be moved to a separate seed file for production

-- Insert a default organization for development
INSERT INTO organizations (id, name, slug, credit_balance, plan_tier)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ORO Development',
    'oro-dev',
    1000,
    'free'
);

-- Insert a default user for development
INSERT INTO users (id, org_id, email, name, role)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'daniel@oro.dev',
    'Daniel',
    'owner'
);

-- Insert Creator DNA for development user
INSERT INTO creator_dna (org_id, niche, voice_description, goals, posting_capacity)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'AI & Technology',
    'Professional yet approachable, educational with a conversational tone',
    ARRAY['Grow audience', 'Build authority', 'Drive leads'],
    'daily'
);

-- Insert sample trend patterns
INSERT INTO trend_patterns (platform, category, pattern_data, confidence_score, source)
VALUES
(
    'instagram',
    'day_in_life',
    '{"hook": "Start with the end result", "structure": "result->journey->cta", "pacing": "fast_cuts", "duration_range": [30, 60], "music": "trending_audio"}',
    0.85,
    'manual_curation'
),
(
    'instagram',
    'tutorial',
    '{"hook": "You''ve been doing X wrong", "structure": "problem->solution->result", "pacing": "medium", "duration_range": [45, 90], "text_overlay": true}',
    0.78,
    'manual_curation'
),
(
    'youtube',
    'hook_style',
    '{"hook": "What if I told you...", "structure": "hook->context->value->cta", "pacing": "build_up", "duration_range": [480, 900]}',
    0.72,
    'manual_curation'
);

COMMENT ON TABLE organizations IS 'Multi-tenant organizations (workspaces)';
COMMENT ON TABLE users IS 'Users belonging to organizations';
COMMENT ON TABLE platform_connections IS 'OAuth connections to creator platforms';
COMMENT ON TABLE creator_dna IS 'Creator intelligence profile - what works for this creator';
COMMENT ON TABLE content IS 'Content library - synced, uploaded, or generated';
COMMENT ON TABLE trend_patterns IS 'Market trend intelligence - what is working now';
COMMENT ON TABLE recommendations IS 'Decision engine outputs - what to post next';
COMMENT ON TABLE jobs IS 'Execution engine jobs - async workflows';
COMMENT ON TABLE credit_ledger IS 'Credit transaction history';
