-- Migration 004: Seed Supplemental Essay Prompts
-- Purpose: Populate real supplemental essay questions for Stanford, MIT, and Harvard
-- Source: Official 2025-2026 application cycle prompts

-- =====================================================
-- STANFORD UNIVERSITY (Class of 2030)
-- =====================================================

-- Stanford has 5 short questions (50 words) + 3 essays (100-250 words)

-- SHORT QUESTIONS (50 words each)
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
  );

-- REQUIRED ESSAYS (100-250 words each)
INSERT INTO public.supplemental_essay_prompts
  (school_code, school_name, prompt_group, prompt_number, prompt_text, word_limit, academic_year, notes)
VALUES
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
  );

-- =====================================================
-- MIT (Massachusetts Institute of Technology)
-- =====================================================

-- MIT has 5 required essays (100-200 words each) + optional prompts

-- REQUIRED ESSAYS
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
  );

-- OPTIONAL ESSAYS
INSERT INTO public.supplemental_essay_prompts
  (school_code, school_name, prompt_group, prompt_number, prompt_text, word_limit, academic_year, notes)
VALUES
  (
    'mit',
    'Massachusetts Institute of Technology',
    'optional',
    1,
    'If there is significant information that you were not able to include elsewhere in the application, you may include it here.',
    350,
    '2025-2026',
    'Additional information - only use if truly necessary'
  );

-- =====================================================
-- HARVARD UNIVERSITY
-- =====================================================

-- Harvard has 5 required essays (150 words each)

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
  );

-- =====================================================
-- ADDITIONAL SCHOOLS FOR FUTURE EXPANSION
-- (Currently commented out - uncomment when ready to add)
-- =====================================================

/*
-- YALE UNIVERSITY
-- Coming soon...

-- PRINCETON UNIVERSITY
-- Coming soon...

-- UNIVERSITY OF CHICAGO
-- Coming soon...

-- COLUMBIA UNIVERSITY
-- Coming soon...

-- UNIVERSITY OF PENNSYLVANIA
-- Coming soon...

-- DUKE UNIVERSITY
-- Coming soon...
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count prompts per school
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

  RAISE NOTICE 'Migration 004 completed successfully';
  RAISE NOTICE 'Stanford prompts: % (expected: 8)', stanford_count;
  RAISE NOTICE 'MIT prompts: % (expected: 6)', mit_count;
  RAISE NOTICE 'Harvard prompts: % (expected: 5)', harvard_count;
  RAISE NOTICE 'Total prompts seeded: %', (stanford_count + mit_count + harvard_count);

  -- Alert if counts don't match expected
  IF stanford_count != 8 THEN
    RAISE WARNING 'Stanford prompt count mismatch! Expected 8, got %', stanford_count;
  END IF;

  IF mit_count != 6 THEN
    RAISE WARNING 'MIT prompt count mismatch! Expected 6, got %', mit_count;
  END IF;

  IF harvard_count != 5 THEN
    RAISE WARNING 'Harvard prompt count mismatch! Expected 5, got %', harvard_count;
  END IF;
END $$;
