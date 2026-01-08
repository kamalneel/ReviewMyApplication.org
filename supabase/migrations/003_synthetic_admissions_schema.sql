-- Migration 003: Synthetic Admissions System Schema
-- Purpose: Add tables and columns to support school-centric synthetic admissions
-- with version tracking, outcome reporting, and reinforcement learning

-- =====================================================
-- PART 1: NEW TABLES
-- =====================================================

-- Table: supplemental_essay_prompts
-- Stores school-specific essay questions for dynamic form generation
CREATE TABLE IF NOT EXISTS public.supplemental_essay_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- School identification
  school_code VARCHAR(100) NOT NULL,
  school_name VARCHAR(255) NOT NULL,

  -- Prompt details
  prompt_group VARCHAR(100),                    -- 'required', 'optional', 'short_answer'
  prompt_number INTEGER,                        -- Order within group (1, 2, 3...)
  prompt_text TEXT NOT NULL,
  word_limit INTEGER,
  char_limit INTEGER,

  -- Metadata
  academic_year VARCHAR(20) DEFAULT '2025-2026',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,                                   -- Internal notes about the prompt

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(school_code, prompt_group, prompt_number, academic_year)
);

-- Indexes for supplemental_essay_prompts
CREATE INDEX idx_prompts_school_code ON public.supplemental_essay_prompts(school_code);
CREATE INDEX idx_prompts_school_active ON public.supplemental_essay_prompts(school_code, is_active);
CREATE INDEX idx_prompts_academic_year ON public.supplemental_essay_prompts(academic_year);

-- RLS for supplemental_essay_prompts (public read access)
ALTER TABLE public.supplemental_essay_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompts are viewable by everyone"
  ON public.supplemental_essay_prompts FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert prompts"
  ON public.supplemental_essay_prompts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update prompts"
  ON public.supplemental_essay_prompts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =====================================================

-- Table: application_versions
-- Tracks version history when students resubmit to the same school
CREATE TABLE IF NOT EXISTS public.application_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Student identification (hashed for privacy)
  student_identifier VARCHAR(500) NOT NULL,     -- Hash of email or anonymous_session_id

  -- School and version tracking
  school_code VARCHAR(100) NOT NULL,
  version_number INTEGER NOT NULL,              -- 1, 2, 3...

  -- References
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,

  -- Decision tracking
  synthetic_decision VARCHAR(50),               -- 'ACCEPT' or 'REJECT'

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(student_identifier, school_code, version_number)
);

-- Indexes for application_versions
CREATE INDEX idx_versions_student_school ON public.application_versions(student_identifier, school_code);
CREATE INDEX idx_versions_application ON public.application_versions(application_id);
CREATE INDEX idx_versions_school ON public.application_versions(school_code);

-- RLS for application_versions
ALTER TABLE public.application_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own versions"
  ON public.application_versions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.applications WHERE id = application_versions.application_id
    )
    OR EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_versions.application_id
      AND anonymous_session_id IS NOT NULL
    )
  );

CREATE POLICY "Users can insert their own versions"
  ON public.application_versions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.applications WHERE id = application_versions.application_id
    )
    OR EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_versions.application_id
      AND anonymous_session_id IS NOT NULL
    )
  );

-- =====================================================

-- Table: application_outcomes
-- Stores real college decisions reported by students for reinforcement learning
CREATE TABLE IF NOT EXISTS public.application_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,

  -- Real-world outcome
  real_decision VARCHAR(50) NOT NULL,           -- 'ACCEPT', 'REJECT', 'WAITLIST', 'DEFER'
  decision_type VARCHAR(50),                     -- 'EA', 'ED', 'RD', 'REA'
  decision_date DATE,

  -- Verification
  letter_upload_path VARCHAR(500),              -- Path in Supabase Storage
  verification_status VARCHAR(50) DEFAULT 'unverified',  -- 'unverified', 'pending_review', 'verified'

  -- Application changes tracking
  final_application_changed BOOLEAN DEFAULT false,
  final_application_upload_path VARCHAR(500),
  changes_description TEXT,

  -- Feedback from student
  student_notes TEXT,
  synthetic_was_helpful BOOLEAN,

  -- Analytics
  mismatch_detected BOOLEAN,                    -- True if synthetic != real

  -- Timestamps
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,

  -- Constraints
  CHECK (real_decision IN ('ACCEPT', 'REJECT', 'WAITLIST', 'DEFER')),
  CHECK (decision_type IS NULL OR decision_type IN ('EA', 'ED', 'RD', 'REA'))
);

-- Indexes for application_outcomes
CREATE INDEX idx_outcomes_application ON public.application_outcomes(application_id);
CREATE INDEX idx_outcomes_review ON public.application_outcomes(review_id);
CREATE INDEX idx_outcomes_mismatch ON public.application_outcomes(mismatch_detected)
  WHERE mismatch_detected = true;
CREATE INDEX idx_outcomes_decision ON public.application_outcomes(real_decision);
CREATE INDEX idx_outcomes_reported_date ON public.application_outcomes(reported_at);

-- RLS for application_outcomes
ALTER TABLE public.application_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own outcomes"
  ON public.application_outcomes FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.applications WHERE id = application_outcomes.application_id
    )
    OR EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_outcomes.application_id
      AND anonymous_session_id IS NOT NULL
    )
  );

CREATE POLICY "Users can insert their own outcomes"
  ON public.application_outcomes FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.applications WHERE id = application_outcomes.application_id
    )
    OR EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_outcomes.application_id
      AND anonymous_session_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update their own outcomes"
  ON public.application_outcomes FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.applications WHERE id = application_outcomes.application_id
    )
    OR EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_outcomes.application_id
      AND anonymous_session_id IS NOT NULL
    )
  );

-- =====================================================
-- PART 2: ALTER EXISTING TABLES
-- =====================================================

-- Add new columns to applications table
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS application_id_display VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS student_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_version_id UUID REFERENCES public.applications(id);

-- Create indexes for new application columns
CREATE INDEX IF NOT EXISTS idx_applications_display_id
  ON public.applications(application_id_display);
CREATE INDEX IF NOT EXISTS idx_applications_email
  ON public.applications(student_email);
CREATE INDEX IF NOT EXISTS idx_applications_version
  ON public.applications(version_number);
CREATE INDEX IF NOT EXISTS idx_applications_previous
  ON public.applications(previous_version_id);

-- Add comment explaining application_id_display
COMMENT ON COLUMN public.applications.application_id_display IS
  'Human-readable unique ID (e.g., RMA-2026-STF-7F3A) displayed to users';

-- =====================================================

-- Add new columns to reviews table
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS decision_binary VARCHAR(20),
  ADD COLUMN IF NOT EXISTS detailed_feedback_unlocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_captured_at TIMESTAMPTZ;

-- Create indexes for new review columns
CREATE INDEX IF NOT EXISTS idx_reviews_binary_decision
  ON public.reviews(decision_binary);
CREATE INDEX IF NOT EXISTS idx_reviews_feedback_unlocked
  ON public.reviews(detailed_feedback_unlocked);

-- Add constraint for decision_binary
ALTER TABLE public.reviews
  ADD CONSTRAINT IF NOT EXISTS reviews_decision_binary_check
  CHECK (decision_binary IS NULL OR decision_binary IN ('ACCEPT', 'REJECT'));

-- Add comments
COMMENT ON COLUMN public.reviews.decision_binary IS
  'Binary admission decision: ACCEPT or REJECT (no waitlist/defer)';
COMMENT ON COLUMN public.reviews.detailed_feedback_unlocked IS
  'Whether detailed feedback has been unlocked (typically after email capture)';
COMMENT ON COLUMN public.reviews.email_captured_at IS
  'Timestamp when user provided email to unlock detailed feedback';

-- =====================================================
-- PART 3: ANALYTICS VIEWS
-- =====================================================

-- View: application_mismatches
-- Shows cases where synthetic prediction didn't match real outcome
CREATE OR REPLACE VIEW public.application_mismatches AS
SELECT
  ao.id as outcome_id,
  a.application_id_display,
  a.target_school,
  a.submitted_at as application_submitted_at,
  r.decision_binary as synthetic_decision,
  r.overall_score as synthetic_score,
  ao.real_decision,
  ao.decision_type,
  ao.decision_date,
  ao.final_application_changed,
  ao.changes_description,
  ao.student_notes,
  ao.reported_at,
  r.feedback_text,
  r.counselor_version,
  r.model_used
FROM public.application_outcomes ao
JOIN public.applications a ON ao.application_id = a.id
JOIN public.reviews r ON ao.review_id = r.id
WHERE ao.mismatch_detected = true
ORDER BY ao.reported_at DESC;

COMMENT ON VIEW public.application_mismatches IS
  'Shows all cases where synthetic prediction did not match real college decision';

-- =====================================================

-- View: school_accuracy_metrics
-- Aggregates accuracy statistics per school
CREATE OR REPLACE VIEW public.school_accuracy_metrics AS
SELECT
  a.target_school,
  COUNT(*) as total_outcomes_reported,
  COUNT(CASE WHEN NOT ao.mismatch_detected THEN 1 END) as correct_predictions,
  COUNT(CASE WHEN ao.mismatch_detected THEN 1 END) as incorrect_predictions,
  ROUND(100.0 * COUNT(CASE WHEN NOT ao.mismatch_detected THEN 1 END) / NULLIF(COUNT(*), 0), 2) as accuracy_percentage,

  -- Score analysis
  ROUND(AVG(r.overall_score) FILTER (WHERE ao.real_decision = 'ACCEPT'), 1) as avg_score_accepted,
  ROUND(AVG(r.overall_score) FILTER (WHERE ao.real_decision = 'REJECT'), 1) as avg_score_rejected,

  -- Decision type breakdown
  COUNT(*) FILTER (WHERE ao.decision_type = 'EA') as ea_count,
  COUNT(*) FILTER (WHERE ao.decision_type = 'ED') as ed_count,
  COUNT(*) FILTER (WHERE ao.decision_type = 'RD') as rd_count,
  COUNT(*) FILTER (WHERE ao.decision_type = 'REA') as rea_count,

  -- Most recent outcome
  MAX(ao.reported_at) as last_outcome_reported
FROM public.application_outcomes ao
JOIN public.applications a ON ao.application_id = a.id
JOIN public.reviews r ON ao.review_id = r.id
GROUP BY a.target_school
ORDER BY total_outcomes_reported DESC;

COMMENT ON VIEW public.school_accuracy_metrics IS
  'Accuracy metrics per school for monitoring synthetic admissions performance';

-- =====================================================

-- View: student_improvement_tracking
-- Shows how students improve across multiple attempts at the same school
CREATE OR REPLACE VIEW public.student_improvement_tracking AS
SELECT
  av.student_identifier,
  av.school_code,
  COUNT(*) as total_attempts,
  MAX(av.version_number) as latest_version,
  ARRAY_AGG(r.overall_score ORDER BY av.version_number) as score_progression,
  ARRAY_AGG(av.synthetic_decision ORDER BY av.version_number) as decision_progression,
  ARRAY_AGG(av.submitted_at ORDER BY av.version_number) as submission_dates,

  -- Improvement metrics
  (ARRAY_AGG(r.overall_score ORDER BY av.version_number DESC))[1] -
  (ARRAY_AGG(r.overall_score ORDER BY av.version_number ASC))[1] as score_improvement,

  -- Time between attempts
  MAX(av.submitted_at) - MIN(av.submitted_at) as time_span,

  -- Latest decision
  (ARRAY_AGG(av.synthetic_decision ORDER BY av.version_number DESC))[1] as latest_decision
FROM public.application_versions av
JOIN public.reviews r ON av.review_id = r.id
GROUP BY av.student_identifier, av.school_code
HAVING COUNT(*) > 1  -- Only show students with multiple attempts
ORDER BY total_attempts DESC, score_improvement DESC;

COMMENT ON VIEW public.student_improvement_tracking IS
  'Tracks student improvement across multiple application versions to the same school';

-- =====================================================
-- PART 4: HELPER FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for supplemental_essay_prompts
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.supplemental_essay_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================

-- Function to generate application display ID
-- Format: RMA-YYYY-XXX-AAAA (e.g., RMA-2026-STF-7F3A)
CREATE OR REPLACE FUNCTION public.generate_application_id(
  p_school_code VARCHAR,
  p_year INTEGER DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
  v_year VARCHAR(4);
  v_school_prefix VARCHAR(3);
  v_random VARCHAR(4);
  v_id VARCHAR(50);
  v_exists BOOLEAN;
BEGIN
  -- Use current year if not provided
  v_year := COALESCE(p_year::VARCHAR, EXTRACT(YEAR FROM NOW())::VARCHAR);

  -- Get first 3 letters of school code, uppercase
  v_school_prefix := UPPER(SUBSTRING(p_school_code FROM 1 FOR 3));

  -- Generate random suffix (loop until unique)
  LOOP
    -- Generate 4 random alphanumeric characters (excluding confusing chars)
    v_random := UPPER(
      SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 4)
    );

    -- Construct ID
    v_id := 'RMA-' || v_year || '-' || v_school_prefix || '-' || v_random;

    -- Check if exists
    SELECT EXISTS(
      SELECT 1 FROM public.applications WHERE application_id_display = v_id
    ) INTO v_exists;

    -- Exit loop if unique
    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_application_id IS
  'Generates unique human-readable application IDs (e.g., RMA-2026-STF-7F3A)';

-- =====================================================
-- PART 5: SAMPLE DATA FOR TESTING (Optional)
-- =====================================================

-- This section can be commented out in production
-- Uncomment for local testing

/*
-- Test: Insert a sample prompt
INSERT INTO public.supplemental_essay_prompts
  (school_code, school_name, prompt_group, prompt_number, prompt_text, word_limit, notes)
VALUES
  ('test_school', 'Test University', 'required', 1,
   'This is a test prompt for migration validation.', 250,
   'TEST DATA - DELETE IN PRODUCTION');

-- Test: Generate sample application ID
SELECT public.generate_application_id('stanford', 2026) as sample_stanford_id;
SELECT public.generate_application_id('mit', 2026) as sample_mit_id;
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 003 completed successfully';
  RAISE NOTICE 'Created tables: supplemental_essay_prompts, application_versions, application_outcomes';
  RAISE NOTICE 'Altered tables: applications, reviews';
  RAISE NOTICE 'Created views: application_mismatches, school_accuracy_metrics, student_improvement_tracking';
  RAISE NOTICE 'Created functions: update_updated_at_column, generate_application_id';
END $$;
