# ORO — Product Requirements Document

**Version:** 1.0
**Status:** Locked
**Last Updated:** 2026-01-27

---

## 1. Problem Statement

### The Creator's Dilemma

Creators today face two distinct problems:

**1. Production overhead**
Turning raw content (long-form video, podcast, course material) into distribution-ready assets across platforms is manual, repetitive, and expensive.

**2. Decision paralysis**
Even with production tools, creators lack a system that tells them *what to create next, why, and in what format* — based on what's actually working. Existing tools optimize output volume, not outcome quality.

### The Market Gap

Current solutions (Blotato, ViewCreator, and similar) address problem #1 — they help creators produce and ship more content. None of them meaningfully address problem #2.

| Product | Core Value | Center of Gravity |
|---------|------------|-------------------|
| **Blotato** | All-in-one content workspace | "Ship a lot of content across platforms" |
| **ViewCreator** | Agent-powered clipping + autopilot | "Automate virality workflows" |
| **ORO** | Decision engine + creator intelligence | "ORO tells you what to do next. You ship. It learns." |

---

## 2. Product Definition

### What ORO Is

ORO is a **creator operating system** that:
- Ingests content and performance data
- Builds a Creator DNA model
- Recommends the next best move
- Executes via agent-orchestrated workflows
- Compounds learning through a closed-loop feedback system

### What ORO Is Not

- Not "another clipper" or repurposing tool
- Not a scheduling/publishing dashboard with AI bolted on
- Not an AI wrapper around a single model
- Not a creative sandbox or blank canvas

### The Core Thesis

**ORO is a decision engine first, execution engine second.**

The product must feel like a cockpit, not a toolbox. The differentiator is the closed feedback loop that makes every recommendation better than the last.

---

## 3. MVP Thesis

### The Question We're Validating

> Can a system reliably tell a creator "what to post next" in a way that's more valuable than their own intuition or existing tools?

### MVP Definition

The first usable version of ORO allows a creator to:

1. **Connect at least one primary platform** (deeply), with awareness of platform-specific rules and features
2. **Analyze past content and performance** to extract patterns that inform recommendations (or operate purely on market intelligence if history is sparse)
3. **Incorporate external signal** (trending/high-performing content patterns) to influence recommendations
4. **Receive a clear recommendation** for what to post next, including:
   - Platform
   - Format
   - Hook/angle
   - Metadata guidance (hashtags, description intent)
   - Suggested timing
   - Optional experiment context
5. **Use agents to assist execution** (script, outline, captions, clip plan) with both modes:
   - Hands-on (creator edits)
   - Automated (agents execute end-to-end)
6. **Log recommendations and outcomes** so the system can learn over time
7. **View a unified dashboard** showing content performance across connected platforms

### What MVP Proves

If creators use ORO and:
- Accept recommendations more often than reject them
- Report that recommendations are better than their own guesses
- Return to ORO habitually for "what's next"

Then the decision engine thesis is validated.

---

## 4. The Four Pillars

### Pillar 1 — Creator Intelligence (Creator DNA)

A persistent, evolving profile that learns:
- Hooks that retain attention
- Formats that convert (by platform)
- Voice and tone patterns
- Audience engagement signals
- Content topics/buckets that win

**Key principle:** ORO's intelligence is market-driven first, user-personalized second. User history increases precision but is not required for the system to function.

**Creator DNA includes:**
- Performance patterns (what works)
- Brand/style memory (voice, visual identity, rules)
- Knowledge memory (products, offers, FAQs, past scripts)

### Pillar 2 — Decision Engine

A single interface that answers:
- What should I post next?
- On which platform?
- What angle/hook?
- What structure/format?
- What CTA?
- When to publish?

**Key constraint:** Not 50 ideas. One recommended move, with reasoning. The creator can override, explore alternatives, or accept — but the default is opinionated.

**Graceful degradation:** Works with sparse user data by leveraging market trend intelligence. Shows confidence levels based on available inputs.

### Pillar 3 — Execution Engine

Agent-orchestrated workflows that turn decisions into distribution-ready outputs:
- Workflows are defined as jobs
- Jobs spawn ephemeral orchestrators
- Orchestrators run specialized agents in parallel
- Outputs are platform-formatted, ready to publish

**Capabilities (non-exhaustive):**
- Long-form to short-form extraction
- Script generation
- Caption/subtitle generation
- Thumbnail concepts
- Title/headline generation
- Platform-specific formatting

**Dual mode support:**
- Hands-on: Creator edits agent outputs
- Automated: Agents execute end-to-end

### Pillar 4 — Feedback Loop

Every recommendation becomes a tracked experiment:
- What was recommended
- What was actually posted (and modifications)
- What happened (views, retention, saves, comments, CTR, shares)
- What changed in Creator DNA as a result

**Why it matters:** This is how ORO becomes "unfair" after 30-90 days. The system compounds. Competitors reset every session.

**MVP note:** Feedback loop exists in v1 as lightweight logging. Full adaptive learning is deferred.

---

## 5. Platform Strategy

### Primary Platform (Deep Support in MVP)

**Instagram**
- Largest active creator market
- Multiple formats (Reels, carousels, stories)
- Rapid feedback cycles ideal for validating decision engine
- Special features awareness (trial reels, etc.)

### Secondary Platforms (Shallow Support in MVP)

**YouTube + TikTok**
- Cross-platform analytics visibility
- Content planning and recommendations
- Assisted execution (scripts, captions, clip plans)
- Deeper support post-MVP

### Platform Intelligence Requirements

ORO must understand platform-specific:
- Rules and affordances
- Hashtag strategies
- Description/metadata formats
- Posting formats and special features
- Account eligibility for gated features

---

## 6. User Journeys

### Primary User (MVP)

**Daniel (founder, first user)**
- Background in advertising and AI consulting
- Creating content across Instagram, YouTube, TikTok
- Dogfooding ORO to validate the decision engine thesis

### Core User Journey

```
Open ORO
    → See recommended next move (with reasoning)
    → Accept / Modify / Reject
    → If accepted: Agents generate supporting assets
    → Review and refine outputs
    → Publish (manually in MVP)
    → Performance data flows back
    → Creator DNA updates
    → Repeat
```

### Cold Start Journey (New Creator, No History)

```
Sign up
    → Onboard: goals, niche, voice, posting capacity
    → Connect platforms (optional)
    → ORO generates market-driven recommendation
    → Creator executes
    → Performance data begins accumulating
    → Recommendations personalize over time
```

---

## 7. MVP Scope

### In Scope

| Category | Included in MVP |
|----------|-----------------|
| **Auth** | Email/password or OAuth login, single user per account |
| **Platform connections** | Instagram (deep), YouTube, TikTok (shallow) |
| **Content sync** | Pull recent posts + metrics from connected platforms |
| **Manual ingestion** | Upload files, paste URLs |
| **Creator DNA** | Onboarding flow, basic profile, goals, voice notes |
| **Trend intelligence** | Market pattern detection, Meta Ad Library integration |
| **Decision engine** | Single recommendation with reasoning, accept/modify/reject |
| **Execution** | Script generation, caption generation, hashtag suggestions |
| **AI Toolkit** | Basic text generation, basic image generation (single model) |
| **Analytics** | Simple dashboard showing recent content performance |
| **Credits** | Basic consumption tracking and display |
| **Progress tracking** | Stage-based progress for async jobs |
| **Prompt handling** | Template-driven prompts by default; user-editable as advanced option; from-scratch mode for power users |

### Explicitly Out of Scope (Non-Goals for MVP)

| Category | Deferred |
|----------|----------|
| **AI Toolkit (full)** | Node-based editing, video generation, voice generation, negative prompts, reference images, template style presets, multiple outputs |
| **Feedback loop (full)** | Automated Creator DNA updates, recommendation quality scoring, A/B experiment infrastructure |
| **Auto-publishing** | Direct posting to platforms, scheduled publishing |
| **Advanced analytics** | Cross-platform comparison charts, retention curves, competitive benchmarking |
| **Teams** | Multi-user permissions, role-based access, workspace switching |
| **Billing** | Stripe integration, subscription tiers, feature gating, credit purchases |

---

## 8. Success Criteria

### After 2-3 Weeks of Development

| Criterion | Measurement |
|-----------|-------------|
| **Auth works** | Can sign up, log in, see dashboard |
| **Connections work** | Can OAuth connect Instagram, see account info |
| **Content syncs** | Connected account content appears in ORO |
| **Recommendation generates** | "What should I post next?" returns a recommendation with reasoning |
| **Execution produces output** | Accepting a recommendation generates script/captions |
| **Credits tracked** | Can see credit consumption for operations |
| **Command center feel** | Dark mode, clean UI, clear next action |

### After 2-3 Weeks of Use (Post-MVP Validation)

| Criterion | Measurement |
|-----------|-------------|
| **Recommendation acceptance** | >50% of recommendations are acted on |
| **Perceived value** | Creator reports ORO recommendations are better than intuition |
| **Habitual return** | Creator opens ORO first when planning content |
| **System improvement** | Recommendations measurably improve as data accumulates |

---

## 9. Design Principles

### Product Principles

1. **Decision over production.** If a feature doesn't help the creator decide or learn, it's a "nice to have."

2. **Compounding over clever.** The system should get measurably better with use. One-shot intelligence is table stakes.

3. **Opinionated over flexible.** Default to strong recommendations. Let power users override, but don't make everyone configure.

4. **Market-driven first, user-personalized second.** ORO works even with zero user history.

5. **Correctness over speed.** Avoid surfacing incomplete or low-confidence outputs just to feel fast.

### UX Principles

1. **Cockpit, not toolbox.** The interface should feel like a command center — focused, opinionated, action-oriented.

2. **One move, not fifty ideas.** Default to a single recommendation. Exploration is available but not the default.

3. **Simple by default, powerful on demand.** Progressive disclosure. Power users can configure; new users get guided decisions.

4. **Transparency.** Show *why* something is recommended. Surface the data behind the decision. Build trust through explainability.

5. **Dark mode first.** Premium, command-center aesthetic. Apple glass-esque light mode as alternative.

### Design References

Primary influences for ORO's visual and interaction design:

- **YouTube Studio** — Overall flow, clarity, simplicity. Data-forward without being overwhelming.
- **Artlist AI / Higgsfield** — Premium visual polish, confidence, clean hierarchy.
- **Axiom.trade / Phantom wallet** — Advanced analytics and multi-panel views, revealed on demand (not dense by default).
- **CapCut / Instagram Edits** — Intuitive, low-friction creation flows.

**Key synthesis:** Simple by default, powerful on demand. Cockpit/command center feel, not a creative sandbox. Clear "next action" guidance. Node-based editing available for advanced creation flows (post-MVP).

---

## 10. Guiding Constraints

### Architectural Constraints

- **Multi-tenant from day one.** Data model supports teams even if UI is single-user.
- **Model-agnostic.** No lock-in to a single LLM provider. Route based on task/cost/quality.
- **Control plane owns state.** Execution is ephemeral. All durable state lives in the control plane.
- **OSS as components, not backbone.** Open-source frameworks are building blocks, not identity.

### Operational Constraints

- **Cost-conscious by default.** Use efficient models for analysis. Reserve premium models for creative output.
- **API-first and compliant.** Use official platform APIs where available. Unofficial methods are optional enrichment, never hard dependencies.
- **Quality thresholds.** Creative outputs only surface when they meet quality bar.
- **API change monitoring.** Build lightweight monitoring for platform API changes (Meta developer blog, deprecation notices) to stay ahead of breaking changes.
- **BYOK support (future).** Architecture should support user-provided API keys for advanced/cost-sensitive users.

### Process Constraints

- **Ship MVP in weeks, not months.** Speed over polish for v1.
- **Defer aggressively.** Refer to non-goals list when tempted to expand scope.
- **Validate thesis first.** Don't build advanced features until decision engine is proven.

---

## 11. Open Questions (To Be Resolved)

These are decisions that may need to be revisited during implementation:

1. **Instagram API scope** — What analytics are actually available via official API post-review?
2. **Trend data sources** — Beyond Meta Ad Library, what reliable sources exist for trend patterns?
3. **Credit pricing** — What's the right credit cost per operation to balance value and sustainability?
4. **Recommendation frequency** — How often should ORO generate new recommendations? On-demand only, or proactive?
5. **Confidence thresholds** — What confidence level is required before showing a recommendation?

---

## Appendix: Competitive Reference

### What Competitors Do Well

- **Blotato:** All-in-one surface area, automation ecosystem, faceless video
- **ViewCreator:** Agent-powered clipping, "virality on autopilot" positioning, credits model
- **Artlist/Higgsfield:** Premium visual polish, model selection UI, template-driven generation

### Where ORO Wins

- **Decision layer** that tells you *what* to create, not just *how* to create it
- **Compounding intelligence** that improves with every interaction
- **Closed feedback loop** that connects recommendations to outcomes
- **Platform-specific awareness** that adapts content strategy per platform
- **Market-driven intelligence** that works even for new creators
