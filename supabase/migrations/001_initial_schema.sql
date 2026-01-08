-- ═══════════════════════════════════════════════════════════════════════════
-- ReviewMyApplication.org - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates core tables for users, applications, reviews, and payments
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- PROFILES (Extends Supabase auth.users)
-- Every authenticated user gets a profile
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           VARCHAR(255),
    full_name       VARCHAR(255),
    avatar_url      VARCHAR(500),
    
    -- Subscription & billing
    subscription_tier   VARCHAR(50) DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active'
        CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
    stripe_customer_id  VARCHAR(255) UNIQUE,
    
    -- Usage tracking
    free_reviews_used   INTEGER DEFAULT 0,
    free_reviews_limit  INTEGER DEFAULT 3,
    
    -- Preferences
    preferences         JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- APPLICATIONS (User Submissions)
-- The core table storing all mock applications
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Application type and targeting
    program_type    VARCHAR(50) NOT NULL
        CHECK (program_type IN ('middle-school', 'high-school', 'college')),
    target_school   VARCHAR(255) DEFAULT NULL,  -- NULL for generic counselor
    
    -- Status tracking
    status          VARCHAR(50) DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'processing', 'reviewed', 'error')),
    
    -- The actual application data (flexible JSONB)
    form_data       JSONB NOT NULL DEFAULT '{}',
    
    -- File references (stored in Supabase Storage)
    -- Structure: [{ "field_id": "transcript", "storage_path": "...", "original_name": "...", "size": 12345 }]
    uploaded_files  JSONB DEFAULT '[]',
    
    -- Anonymous session tracking (for non-logged-in users)
    anonymous_session_id    VARCHAR(255),
    
    -- Analytics & debugging
    user_agent      TEXT,
    referrer        TEXT,
    ip_country      VARCHAR(10),
    
    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    submitted_at    TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_program_type ON public.applications(program_type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_anonymous_session ON public.applications(anonymous_session_id);

-- GIN index for JSONB queries on form_data
CREATE INDEX IF NOT EXISTS idx_applications_form_data ON public.applications USING GIN (form_data);

CREATE TRIGGER applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- REVIEWS (AI-Generated Feedback)
-- Stores all feedback generated by XCounselor
-- Critical for training future versions
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    
    -- Counselor version tracking (critical for training)
    counselor_version   VARCHAR(50) NOT NULL,       -- e.g., 'v1.0.0', 'v1.1.0'
    counselor_type      VARCHAR(100) NOT NULL DEFAULT 'generic',  -- 'generic', 'mit', 'stanford'
    model_used          VARCHAR(100),               -- e.g., 'gpt-4-turbo', 'claude-3-opus'
    model_version       VARCHAR(50),                -- Specific model version if available
    
    -- Evaluation results
    overall_score       INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    decision            VARCHAR(50)
        CHECK (decision IN ('likely_admit', 'competitive', 'developing', 'needs_work')),
    
    -- Detailed scores by category
    -- Structure: { "essay": 85, "academics": 78, "activities": 72, "completeness": 95 }
    category_scores     JSONB NOT NULL DEFAULT '{}',
    
    -- Detailed feedback text by category
    -- Structure: { "essay": { "summary": "...", "strengths": [...], "improvements": [...] }, ... }
    feedback_text       JSONB NOT NULL DEFAULT '{}',
    
    -- Actionable improvement suggestions
    -- Structure: ["Focus on specific examples in your essay", "Highlight leadership roles", ...]
    improvement_tips    JSONB NOT NULL DEFAULT '[]',
    
    -- For debugging, analysis, and future training
    raw_ai_request      JSONB,          -- The prompt/messages sent to AI
    raw_ai_response     JSONB,          -- Full response from AI API
    tokens_used         INTEGER,        -- Token count for cost tracking
    
    -- Processing info
    processing_time_ms  INTEGER,        -- How long the review took
    error_message       TEXT,           -- If processing failed
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_application_id ON public.reviews(application_id);
CREATE INDEX IF NOT EXISTS idx_reviews_counselor_version ON public.reviews(counselor_version);
CREATE INDEX IF NOT EXISTS idx_reviews_counselor_type ON public.reviews(counselor_type);
CREATE INDEX IF NOT EXISTS idx_reviews_decision ON public.reviews(decision);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- GIN indexes for JSONB
CREATE INDEX IF NOT EXISTS idx_reviews_category_scores ON public.reviews USING GIN (category_scores);

-- ═══════════════════════════════════════════════════════════════════════════
-- DEDICATED COUNSELORS (Premium School-Specific Counselors)
-- Configuration for premium, school-specific AI counselors
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dedicated_counselors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    school_code     VARCHAR(100) UNIQUE NOT NULL,   -- e.g., 'mit', 'stanford', 'harvard'
    school_name     VARCHAR(255) NOT NULL,
    
    -- Counselor configuration
    counselor_version   VARCHAR(50) NOT NULL,       -- Version of this specific counselor
    knowledge_path      VARCHAR(500),               -- Path in counselor-knowledge/schools/
    is_active           BOOLEAN DEFAULT FALSE,      -- Only active counselors are available
    
    -- Display information
    description         TEXT,
    short_description   VARCHAR(500),
    logo_url            VARCHAR(500),
    cover_image_url     VARCHAR(500),
    
    -- School context (for display and AI context)
    acceptance_rate     DECIMAL(5,2),               -- e.g., 3.5 for 3.5%
    us_news_ranking     INTEGER,
    school_type         VARCHAR(100),               -- 'Ivy League', 'Public', 'Liberal Arts', etc.
    location            VARCHAR(255),
    
    -- Pricing
    is_premium          BOOLEAN DEFAULT TRUE,
    price_cents         INTEGER DEFAULT 0,          -- Price in cents (0 = free)
    currency            VARCHAR(3) DEFAULT 'USD',
    
    -- Stripe product/price IDs (for payment processing)
    stripe_product_id   VARCHAR(255),
    stripe_price_id     VARCHAR(255),
    
    -- Usage stats
    total_reviews       INTEGER DEFAULT 0,
    avg_rating          DECIMAL(3,2),               -- User rating if we add that later
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counselors_school_code ON public.dedicated_counselors(school_code);
CREATE INDEX IF NOT EXISTS idx_counselors_is_active ON public.dedicated_counselors(is_active);
CREATE INDEX IF NOT EXISTS idx_counselors_is_premium ON public.dedicated_counselors(is_premium);

CREATE TRIGGER counselors_updated_at
    BEFORE UPDATE ON public.dedicated_counselors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- PURCHASES (Payment Records)
-- Tracks all purchases for premium counselors and subscriptions
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.purchases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- What was purchased
    product_type    VARCHAR(50) NOT NULL
        CHECK (product_type IN ('counselor_review', 'review_pack', 'subscription', 'credits')),
    counselor_id    UUID REFERENCES public.dedicated_counselors(id) ON DELETE SET NULL,
    
    -- Payment details
    amount_cents    INTEGER NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    
    -- Stripe references
    stripe_payment_intent_id    VARCHAR(255),
    stripe_checkout_session_id  VARCHAR(255),
    stripe_subscription_id      VARCHAR(255),       -- For subscription purchases
    
    -- Status
    status          VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
    
    -- Usage tracking (for credit-based purchases)
    credits_purchased   INTEGER DEFAULT 1,
    credits_used        INTEGER DEFAULT 0,
    
    -- Refund tracking
    refund_amount_cents INTEGER,
    refund_reason       TEXT,
    refunded_at         TIMESTAMPTZ,
    
    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_counselor_id ON public.purchases(counselor_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_payment_intent ON public.purchases(stripe_payment_intent_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- FEEDBACK (Optional: User Feedback on Reviews)
-- Allows users to rate the quality of AI reviews for improvement
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.review_feedback (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id       UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Rating
    rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Specific feedback
    was_helpful     BOOLEAN,
    was_accurate    BOOLEAN,
    was_actionable  BOOLEAN,
    
    -- Free text feedback
    comments        TEXT,
    
    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_feedback_review_id ON public.review_feedback(review_id);
CREATE INDEX IF NOT EXISTS idx_review_feedback_rating ON public.review_feedback(rating);

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS (Helpful aggregated views)
-- ═══════════════════════════════════════════════════════════════════════════

-- View: Application with latest review
CREATE OR REPLACE VIEW public.applications_with_reviews AS
SELECT 
    a.*,
    r.id as review_id,
    r.overall_score,
    r.decision,
    r.category_scores,
    r.counselor_version,
    r.created_at as reviewed_at
FROM public.applications a
LEFT JOIN LATERAL (
    SELECT *
    FROM public.reviews
    WHERE application_id = a.id
    ORDER BY created_at DESC
    LIMIT 1
) r ON true;

-- View: User stats
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    p.id as user_id,
    p.email,
    p.subscription_tier,
    COUNT(a.id) as total_applications,
    COUNT(r.id) as total_reviews,
    AVG(r.overall_score) as avg_score,
    MAX(a.created_at) as last_application_at
FROM public.profiles p
LEFT JOIN public.applications a ON a.user_id = p.id
LEFT JOIN public.reviews r ON r.application_id = a.id
GROUP BY p.id, p.email, p.subscription_tier;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dedicated_counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_feedback ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: Profiles
-- ═══════════════════════════════════════════════════════════════════════════

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: Applications
-- ═══════════════════════════════════════════════════════════════════════════

-- Users can view their own applications (or anonymous applications)
CREATE POLICY "Users can view own applications"
    ON public.applications FOR SELECT
    USING (
        auth.uid() = user_id 
        OR (user_id IS NULL AND anonymous_session_id IS NOT NULL)
    );

-- Anyone can insert applications (including anonymous users)
CREATE POLICY "Anyone can insert applications"
    ON public.applications FOR INSERT
    WITH CHECK (
        user_id = auth.uid() 
        OR user_id IS NULL  -- Allow anonymous
    );

-- Users can update their own applications
CREATE POLICY "Users can update own applications"
    ON public.applications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own applications
CREATE POLICY "Users can delete own applications"
    ON public.applications FOR DELETE
    USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: Reviews
-- ═══════════════════════════════════════════════════════════════════════════

-- Users can view reviews for their own applications
CREATE POLICY "Users can view own reviews"
    ON public.reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

-- Only service role can insert reviews (from Edge Functions)
-- This is handled by the service_role key, which bypasses RLS

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: Dedicated Counselors
-- ═══════════════════════════════════════════════════════════════════════════

-- Anyone can view active counselors
CREATE POLICY "Anyone can view active counselors"
    ON public.dedicated_counselors FOR SELECT
    USING (is_active = true);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: Purchases
-- ═══════════════════════════════════════════════════════════════════════════

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
    ON public.purchases FOR SELECT
    USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: Review Feedback
-- ═══════════════════════════════════════════════════════════════════════════

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
    ON public.review_feedback FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert feedback for reviews of their applications
CREATE POLICY "Users can insert feedback"
    ON public.review_feedback FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.reviews r
            JOIN public.applications a ON a.id = r.application_id
            WHERE r.id = review_id AND a.user_id = auth.uid()
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Initial Dedicated Counselors (Inactive)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.dedicated_counselors (
    school_code, school_name, counselor_version, is_active, is_premium,
    short_description, acceptance_rate, school_type, location
) VALUES
    ('mit', 'Massachusetts Institute of Technology', 'v1.0.0', false, true,
     'Specialized counselor trained on MIT admissions criteria and successful applications',
     3.9, 'Research University', 'Cambridge, MA'),
    ('stanford', 'Stanford University', 'v1.0.0', false, true,
     'Expert guidance tailored to Stanford''s holistic admissions process',
     3.7, 'Research University', 'Stanford, CA'),
    ('harvard', 'Harvard University', 'v1.0.0', false, true,
     'Insights into Harvard''s admissions priorities and evaluation criteria',
     3.2, 'Ivy League', 'Cambridge, MA'),
    ('berkeley', 'UC Berkeley', 'v1.0.0', false, true,
     'Specialized for UC application and Berkeley-specific Personal Insight Questions',
     11.0, 'Public Research University', 'Berkeley, CA')
ON CONFLICT (school_code) DO NOTHING;

