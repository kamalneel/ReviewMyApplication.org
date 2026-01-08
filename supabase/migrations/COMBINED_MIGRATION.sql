-- ═════════════════════════════════════════════════════════════════
-- COMBINED MIGRATION FOR SYNTHETIC ADMISSIONS SYSTEM
-- Run this in Supabase Studio SQL Editor
-- ═════════════════════════════════════════════════════════════════
--
-- This combines:
-- - 003_synthetic_admissions_schema.sql
-- - 004_seed_supplemental_prompts.sql
--
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/afxqhokwlhbqhpcpzxur
-- 2. Navigate to SQL Editor
-- 3. Create new query
-- 4. Paste this entire file
-- 5. Click "Run"
-- 6. Verify success messages at bottom
--
-- Expected: "Success. No rows returned"
-- ═════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════════════
-- PART 1: NEW TABLES
-- ═════════════════════════════════════════════════════════════════

-- Table: supplemental_essay_prompts
CREATE TABLE IF NOT EXISTS public.supplemental_essay_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- School identification
  school_code VARCHAR(100) NOT NULL,
  school_name VARCHAR(255) NOT NULL,

  -- Prompt details
  prompt_group VARCHAR(100),
  prompt_number INTEGER,
  prompt_text TEXT NOT NULL,
  word_limit INTEGER,
  char_limit INTEGER,

  -- Metadata
  academic_year VARCHAR(20) DEFAULT '2025-2026',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(school_code, prompt_group, prompt_number, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_prompts_school_code ON public.supplemental_essay_prompts(school_code);
CREATE INDEX IF NOT EXISTS idx_prompts_school_active ON public.supplemental_essay_prompts(school_code, is_active);
CREATE INDEX IF NOT EXISTS idx_prompts_academic_year ON public.supplemental_essay_prompts(academic_year);

ALTER TABLE public.supplemental_essay_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prompts are viewable by everyone" ON public.supplemental_essay_prompts;
CREATE POLICY "Prompts are viewable by everyone"
  ON public.supplemental_essay_prompts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only authenticated users can insert prompts" ON public.supplemental_essay_prompts;
CREATE POLICY "Only authenticated users can insert prompts"
  ON public.supplemental_essay_prompts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only authenticated users can update prompts" ON public.supplemental_essay_prompts;
CREATE POLICY "Only authenticated users can update prompts"
  ON public.supplemental_essay_prompts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ═════════════════════════════════════════════════════════════════

-- Table: application_versions
CREATE TABLE IF NOT EXISTS public.application_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Student identification
  student_identifier VARCHAR(500) NOT NULL,

  -- School and version tracking
  school_code VARCHAR(100) NOT NULL,
  version_number INTEGER NOT NULL,

  -- References
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,

  -- Decision tracking
  synthetic_decision VARCHAR(50),

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(student_identifier, school_code, version_number)
);

CREATE INDEX IF NOT EXISTS idx_versions_student_school ON public.application_versions(student_identifier, school_code);
CREATE INDEX IF NOT EXISTS idx_versions_application ON public.application_versions(application_id);
CREATE INDEX IF NOT EXISTS idx_versions_school ON public.application_versions(school_code);

ALTER TABLE public.application_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own versions" ON public.application_versions;
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

DROP POLICY IF EXISTS "Users can insert their own versions" ON public.application_versions;
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

-- ═════════════════════════════════════════════════════════════════

-- Table: application_outcomes
CREATE TABLE IF NOT EXISTS public.application_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,

  -- Real-world outcome
  real_decision VARCHAR(50) NOT NULL,
  decision_type VARCHAR(50),
  decision_date DATE,

  -- Verification
  letter_upload_path VARCHAR(500),
  verification_status VARCHAR(50) DEFAULT 'unverified',

  -- Application changes tracking
  final_application_changed BOOLEAN DEFAULT false,
  final_application_upload_path VARCHAR(500),
  changes_description TEXT,

  -- Feedback from student
  student_notes TEXT,
  synthetic_was_helpful BOOLEAN,

  -- Analytics
  mismatch_detected BOOLEAN,

  -- Timestamps
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,

  -- Constraints
  CHECK (real_decision IN ('ACCEPT', 'REJECT', 'WAITLIST', 'DEFER')),
  CHECK (decision_type IS NULL OR decision_type IN ('EA', 'ED', 'RD', 'REA'))
);

CREATE INDEX IF NOT EXISTS idx_outcomes_application ON public.application_outcomes(application_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_review ON public.application_outcomes(review_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_mismatch ON public.application_outcomes(mismatch_detected)
  WHERE mismatch_detected = true;
CREATE INDEX IF NOT EXISTS idx_outcomes_decision ON public.application_outcomes(real_decision);
CREATE INDEX IF NOT EXISTS idx_outcomes_reported_date ON public.application_outcomes(reported_at);

ALTER TABLE public.application_outcomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own outcomes" ON public.application_outcomes;
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

DROP POLICY IF EXISTS "Users can insert their own outcomes" ON public.application_outcomes;
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

DROP POLICY IF EXISTS "Users can update their own outcomes" ON public.application_outcomes;
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

-- ═════════════════════════════════════════════════════════════════
-- PART 2: ALTER EXISTING TABLES
-- ═════════════════════════════════════════════════════════════════

-- Add new columns to applications table
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS application_id_display VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS student_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_version_id UUID REFERENCES public.applications(id);

CREATE INDEX IF NOT EXISTS idx_applications_display_id
  ON public.applications(application_id_display);
CREATE INDEX IF NOT EXISTS idx_applications_email
  ON public.applications(student_email);
CREATE INDEX IF NOT EXISTS idx_applications_version
  ON public.applications(version_number);
CREATE INDEX IF NOT EXISTS idx_applications_previous
  ON public.applications(previous_version_id);

COMMENT ON COLUMN public.applications.application_id_display IS
  'Human-readable unique ID (e.g., RMA-2026-STF-7F3A) displayed to users';

-- ═════════════════════════════════════════════════════════════════

-- Add new columns to reviews table
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS decision_binary VARCHAR(20),
  ADD COLUMN IF NOT EXISTS detailed_feedback_unlocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_captured_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reviews_binary_decision
  ON public.reviews(decision_binary);
CREATE INDEX IF NOT EXISTS idx_reviews_feedback_unlocked
  ON public.reviews(detailed_feedback_unlocked);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_decision_binary_check'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_decision_binary_check
      CHECK (decision_binary IS NULL OR decision_binary IN ('ACCEPT', 'REJECT'));
  END IF;
END $$;

COMMENT ON COLUMN public.reviews.decision_binary IS
  'Binary admission decision: ACCEPT or REJECT (no waitlist/defer)';
COMMENT ON COLUMN public.reviews.detailed_feedback_unlocked IS
  'Whether detailed feedback has been unlocked (typically after email capture)';
COMMENT ON COLUMN public.reviews.email_captured_at IS
  'Timestamp when user provided email to unlock detailed feedback';

-- ═════════════════════════════════════════════════════════════════
-- PART 3: ANALYTICS VIEWS
-- ═════════════════════════════════════════════════════════════════

-- View: application_mismatches
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

-- ═════════════════════════════════════════════════════════════════

-- View: school_accuracy_metrics
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

-- ═════════════════════════════════════════════════════════════════

-- View: student_improvement_tracking
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
HAVING COUNT(*) > 1
ORDER BY total_attempts DESC, score_improvement DESC;

COMMENT ON VIEW public.student_improvement_tracking IS
  'Tracks student improvement across multiple application versions to the same school';

-- ═════════════════════════════════════════════════════════════════
-- PART 4: HELPER FUNCTIONS
-- ═════════════════════════════════════════════════════════════════

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for supplemental_essay_prompts
DROP TRIGGER IF EXISTS update_prompts_updated_at ON public.supplemental_essay_prompts;
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.supplemental_essay_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═════════════════════════════════════════════════════════════════

-- Function to generate application display ID
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
    -- Generate 4 random alphanumeric characters
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

-- ═════════════════════════════════════════════════════════════════
-- PART 5: SEED DATA - SUPPLEMENTAL ESSAY PROMPTS
-- ═════════════════════════════════════════════════════════════════

-- STANFORD UNIVERSITY
INSERT INTO public.supplemental_essay_prompts
  (school_code, school_name, prompt_group, prompt_number, prompt_text, word_limit, academic_year, notes)
VALUES
  (
    'stanford',
    'Stanford University',
    'short_answer',
    1,
    'What is the most significant challenge that society faces today?',
    50,
    '2025-2026',
    'Short answer - students should be concise and thoughtful'
  ),
  (
    'stanford',
    'Stanford University',
    'short_answer',
    2,
    'How did you spend your last two summers?',
    50,
    '2025-2026',
    'Short answer - looking for meaningful activities and growth'
  ),
  (
    'stanford',
    'Stanford University',
    'short_answer',
    3,
    'What historical moment or event do you wish you could have witnessed?',
    50,
    '2025-2026',
    'Short answer - reveals intellectual curiosity and values'
  ),
  (
    'stanford',
    'Stanford University',
    'short_answer',
    4,
    'Briefly elaborate on one of your extracurricular activities, a job you hold, or responsibilities you have for your family.',
    50,
    '2025-2026',
    'Short answer - depth over breadth, show impact'
  ),
  (
    'stanford',
    'Stanford University',
    'short_answer',
    5,
    'List five things that are important to you.',
    50,
    '2025-2026',
    'Short answer - can be single words or short phrases, reveals priorities'
  ),
  (
    'stanford',
    'Stanford University',
    'required',
    1,
    'The Stanford community is deeply curious and driven to learn in and out of the classroom. Reflect on an idea or experience that makes you genuinely excited about learning.',
    250,
    '2025-2026',
    'Looking for intellectual vitality - a core Stanford value'
  ),
  (
    'stanford',
    'Stanford University',
    'required',
    2,
    'Virtually all of Stanford''s undergraduates live on campus. Write a note to your future roommate that reveals something about you or that will help your roommate—and us—get to know you better.',
    250,
    '2025-2026',
    'Famous Stanford roommate essay - be authentic and personable'
  ),
  (
    'stanford',
    'Stanford University',
    'required',
    3,
    'Please describe what aspects of your life experiences, interests and character would help you make a distinctive contribution as an undergraduate to Stanford University.',
    250,
    '2025-2026',
    'Why Stanford / What will you contribute - show fit and impact'
  )
ON CONFLICT (school_code, prompt_group, prompt_number, academic_year) DO NOTHING;

-- MIT
INSERT INTO public.supplemental_essay_prompts
  (school_code, school_name, prompt_group, prompt_number, prompt_text, word_limit, academic_year, notes)
VALUES
  (
    'mit',
    'Massachusetts Institute of Technology',
    'required',
    1,
    'We know you lead a busy life, full of activities, many of which are required of you. Tell us about something you do simply for the pleasure of it.',
    200,
    '2025-2026',
    'Looking for genuine passion and joy - not resume building'
  ),
  (
    'mit',
    'Massachusetts Institute of Technology',
    'required',
    2,
    'While some reach their goals following well-trodden paths, others blaze their own trails achieving the unexpected. In what ways have you done something different than what was expected in your educational journey?',
    200,
    '2025-2026',
    'Looking for innovation, creativity, independent thinking'
  ),
  (
    'mit',
    'Massachusetts Institute of Technology',
    'required',
    3,
    'How did you manage a situation or challenge that you didn''t expect? What did you learn from it?',
    200,
    '2025-2026',
    'Problem-solving and resilience - core MIT values'
  ),
  (
    'mit',
    'Massachusetts Institute of Technology',
    'required',
    4,
    'Tell us about a time when you collaborated with others. What did you learn about yourself? What did you learn about working with others?',
    200,
    '2025-2026',
    'Teamwork and collaboration - important in MIT''s project-based culture'
  ),
  (
    'mit',
    'Massachusetts Institute of Technology',
    'required',
    5,
    'Please tell us more about your cultural background and identity in the space below.',
    200,
    '2025-2026',
    'Optional in some years, but important for understanding student context'
  ),
  (
    'mit',
    'Massachusetts Institute of Technology',
    'optional',
    1,
    'If there is significant information that you were not able to include elsewhere in the application, you may include it here.',
    350,
    '2025-2026',
    'Additional information - only use if truly necessary'
  )
ON CONFLICT (school_code, prompt_group, prompt_number, academic_year) DO NOTHING;

-- HARVARD UNIVERSITY
INSERT INTO public.supplemental_essay_prompts
  (school_code, school_name, prompt_group, prompt_number, prompt_text, word_limit, academic_year, notes)
VALUES
  (
    'harvard',
    'Harvard University',
    'required',
    1,
    'Harvard has long recognized the importance of enrolling a student body with a diversity of perspectives and experiences. How will the life experiences that shaped who you are today enable you to contribute to Harvard?',
    150,
    '2025-2026',
    'Diversity and contribution - show unique perspective'
  ),
  (
    'harvard',
    'Harvard University',
    'required',
    2,
    'Describe a time when you strongly disagreed with someone about an idea or issue. How did you communicate or engage with this person? What did you learn from this experience?',
    150,
    '2025-2026',
    'Intellectual engagement and dialogue - core Harvard value'
  ),
  (
    'harvard',
    'Harvard University',
    'required',
    3,
    'Briefly describe any of your extracurricular activities, employment experience, travel, or family responsibilities that have shaped who you are.',
    150,
    '2025-2026',
    'Activity elaboration - choose most meaningful, show depth'
  ),
  (
    'harvard',
    'Harvard University',
    'required',
    4,
    'How do you hope to use your Harvard education in the future?',
    150,
    '2025-2026',
    'Future goals and impact - show ambition and purpose'
  ),
  (
    'harvard',
    'Harvard University',
    'required',
    5,
    'Top 3 things your roommates might like to know about you.',
    150,
    '2025-2026',
    'Personal qualities - be authentic and show personality'
  )
ON CONFLICT (school_code, prompt_group, prompt_number, academic_year) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═════════════════════════════════════════════════════════════════

DO $$
DECLARE
  stanford_count INTEGER;
  mit_count INTEGER;
  harvard_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO stanford_count
  FROM public.supplemental_essay_prompts
  WHERE school_code = 'stanford' AND is_active = true;

  SELECT COUNT(*) INTO mit_count
  FROM public.supplemental_essay_prompts
  WHERE school_code = 'mit' AND is_active = true;

  SELECT COUNT(*) INTO harvard_count
  FROM public.supplemental_essay_prompts
  WHERE school_code = 'harvard' AND is_active = true;

  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  • Tables created: 3 (supplemental_essay_prompts, application_versions, application_outcomes)';
  RAISE NOTICE '  • Tables altered: 2 (applications, reviews)';
  RAISE NOTICE '  • Views created: 3 (application_mismatches, school_accuracy_metrics, student_improvement_tracking)';
  RAISE NOTICE '  • Functions created: 2 (update_updated_at_column, generate_application_id)';
  RAISE NOTICE '';
  RAISE NOTICE '🎓 Supplemental Prompts Seeded:';
  RAISE NOTICE '  • Stanford: % prompts', stanford_count;
  RAISE NOTICE '  • MIT: % prompts', mit_count;
  RAISE NOTICE '  • Harvard: % prompts', harvard_count;
  RAISE NOTICE '  • Total: % prompts', (stanford_count + mit_count + harvard_count);
  RAISE NOTICE '';
  RAISE NOTICE '✨ System is ready for school-centric applications!';
END $$;
