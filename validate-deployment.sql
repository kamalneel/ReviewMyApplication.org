-- ═══════════════════════════════════════════════════════════════
-- DEPLOYMENT VALIDATION SCRIPT
-- Run this in Supabase SQL Editor after running migrations
-- All queries should return expected results
-- ═══════════════════════════════════════════════════════════════

-- TEST 1: Verify all tables exist
-- Expected: 8 tables
SELECT
    'TEST 1: Table Count' as test_name,
    COUNT(*) as actual_count,
    8 as expected_count,
    CASE WHEN COUNT(*) = 8 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- TEST 2: List all tables (should see these 8)
SELECT
    'TEST 2: Tables List' as test_name,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected tables:
-- applications, dedicated_counselors, profiles, purchases,
-- review_feedback, reviews, supplemental_prompts, synthetic_schools

-- TEST 3: Verify RLS is enabled on all tables
-- Expected: 8 rows, all with rls_enabled = true
SELECT
    'TEST 3: RLS Enabled' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- TEST 4: Check storage buckets exist
-- Expected: 3 buckets (application-documents, avatars, counselor-assets)
SELECT
    'TEST 4: Storage Buckets' as test_name,
    COUNT(*) as bucket_count,
    3 as expected_count,
    CASE WHEN COUNT(*) >= 3 THEN '✅ PASS' ELSE '⚠️ Check storage setup' END as status
FROM storage.buckets;

-- TEST 5: List storage buckets
SELECT
    'TEST 5: Bucket Names' as test_name,
    name,
    public,
    file_size_limit
FROM storage.buckets
ORDER BY name;

-- TEST 6: Verify supplemental_prompts table has data
-- Expected: At least 1 row (Stanford or other seeded schools)
SELECT
    'TEST 6: Seed Data' as test_name,
    COUNT(*) as seeded_schools,
    CASE WHEN COUNT(*) > 0 THEN '✅ Has data' ELSE '⚠️ No seed data' END as status
FROM supplemental_prompts;

-- TEST 7: Check synthetic_schools table structure
-- Expected: Columns id, name, tier, prompt_type, system_prompt, acceptance_rate
SELECT
    'TEST 7: Synthetic Schools Schema' as test_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'synthetic_schools'
ORDER BY ordinal_position;

-- TEST 8: Test application insert (dry run - will rollback)
DO $$
DECLARE
    test_app_id UUID;
BEGIN
    -- Try to insert a test application
    INSERT INTO applications (program_type, form_data, status)
    VALUES ('college', '{"test": true}'::jsonb, 'submitted')
    RETURNING id INTO test_app_id;

    RAISE NOTICE 'TEST 8: Application Insert - ✅ PASS (ID: %)', test_app_id;

    -- Rollback the test insert
    RAISE EXCEPTION 'Rollback test insert' USING ERRCODE = 'RRDB1';
EXCEPTION
    WHEN SQLSTATE 'RRDB1' THEN
        -- Expected rollback
        RAISE NOTICE 'Test insert rolled back successfully';
END $$;

-- TEST 9: Check indexes exist
-- Expected: Multiple indexes for performance
SELECT
    'TEST 9: Indexes' as test_name,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- TEST 10: Verify foreign key constraints
-- Expected: Multiple FK constraints ensuring referential integrity
SELECT
    'TEST 10: Foreign Keys' as test_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ═══════════════════════════════════════════════════════════════
-- SUMMARY
-- ═══════════════════════════════════════════════════════════════

SELECT '
═══════════════════════════════════════════════════════════════
VALIDATION COMPLETE
═══════════════════════════════════════════════════════════════

If all tests passed:
✅ Database schema is correctly deployed
✅ RLS policies are enabled
✅ Storage buckets are configured
✅ Seed data is loaded
✅ Ready for Edge Function deployment

Next steps:
1. Deploy Edge Function (see DEPLOYMENT_GUIDE.md Part 3)
2. Set up secrets (ANTHROPIC_API_KEY or OPENAI_API_KEY)
3. Test from frontend

═══════════════════════════════════════════════════════════════
' as summary;
