-- ═══════════════════════════════════════════════════════════════════════════
-- ReviewMyApplication.org - Storage Buckets Configuration
-- Migration: 002_storage_buckets.sql
-- Description: Creates storage buckets for application documents
-- ═══════════════════════════════════════════════════════════════════════════

-- Note: This migration creates storage buckets and policies.
-- In Supabase, you may need to run these via the dashboard or use the 
-- Supabase CLI with `supabase storage` commands.

-- ═══════════════════════════════════════════════════════════════════════════
-- CREATE STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════════════

-- Bucket for application documents (transcripts, portfolios, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'application-documents',
    'application-documents',
    false,  -- Private bucket
    52428800,  -- 50MB max file size
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket for user avatars (if we add profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,  -- Public bucket for profile images
    5242880,  -- 5MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket for counselor assets (logos, covers for dedicated counselors)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'counselor-assets',
    'counselor-assets',
    true,  -- Public bucket for display
    10485760,  -- 10MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE POLICIES: application-documents
-- ═══════════════════════════════════════════════════════════════════════════

-- Policy: Users can upload documents to their own application folders
-- Folder structure: application-documents/{application_id}/{filename}
CREATE POLICY "Users can upload own application documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'application-documents'
    AND (
        -- Check if the application belongs to the user
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE id = (storage.foldername(name))[1]::uuid
            AND (user_id = auth.uid() OR user_id IS NULL)
        )
        -- Or allow service role (for processing)
        OR auth.role() = 'service_role'
    )
);

-- Policy: Users can view their own application documents
CREATE POLICY "Users can view own application documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'application-documents'
    AND (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE id = (storage.foldername(name))[1]::uuid
            AND (user_id = auth.uid() OR user_id IS NULL)
        )
        OR auth.role() = 'service_role'
    )
);

-- Policy: Users can delete their own application documents
CREATE POLICY "Users can delete own application documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'application-documents'
    AND EXISTS (
        SELECT 1 FROM public.applications
        WHERE id = (storage.foldername(name))[1]::uuid
        AND user_id = auth.uid()
    )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE POLICIES: avatars
-- ═══════════════════════════════════════════════════════════════════════════

-- Policy: Users can upload their own avatar
-- Folder structure: avatars/{user_id}.{ext}
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE POLICIES: counselor-assets
-- ═══════════════════════════════════════════════════════════════════════════

-- Policy: Anyone can view counselor assets (public)
CREATE POLICY "Anyone can view counselor assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'counselor-assets');

-- Policy: Only service role can manage counselor assets
CREATE POLICY "Service role can manage counselor assets"
ON storage.objects FOR ALL
USING (
    bucket_id = 'counselor-assets'
    AND auth.role() = 'service_role'
)
WITH CHECK (
    bucket_id = 'counselor-assets'
    AND auth.role() = 'service_role'
);

