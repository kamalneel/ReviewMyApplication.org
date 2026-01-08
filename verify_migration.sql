-- Verify tables were created
SELECT 'supplemental_essay_prompts' as table_name, COUNT(*) as row_count 
FROM supplemental_essay_prompts
UNION ALL
SELECT 'application_versions', COUNT(*) 
FROM application_versions
UNION ALL
SELECT 'application_outcomes', COUNT(*) 
FROM application_outcomes;

-- Verify prompts by school
SELECT school_code, COUNT(*) as prompt_count
FROM supplemental_essay_prompts
WHERE is_active = true
GROUP BY school_code
ORDER BY school_code;

-- Verify new columns exist in applications table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('application_id_display', 'student_email', 'version_number', 'previous_version_id')
ORDER BY column_name;

-- Verify new columns exist in reviews table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('decision_binary', 'detailed_feedback_unlocked', 'email_captured_at')
ORDER BY column_name;
