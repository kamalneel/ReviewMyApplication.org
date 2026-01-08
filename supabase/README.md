# Supabase Setup for ReviewMyApplication.org

This directory contains the database schema, migrations, storage configuration, and Edge Functions for the application.

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (takes a few minutes)
3. Go to Project Settings → API to get your keys

### 2. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# npm
npm install -g supabase

# Or download from https://github.com/supabase/cli/releases
```

### 3. Link Your Project

```bash
# Login to Supabase
supabase login

# Link to your project (get project ref from dashboard URL)
supabase link --project-ref your-project-ref
```

### 4. Run Migrations

```bash
# Push migrations to your Supabase project
supabase db push

# Or run them manually in the SQL editor:
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Run migrations/001_initial_schema.sql
# 3. Run migrations/002_storage_buckets.sql
```

### 5. Configure Environment Variables

For Edge Functions, set these secrets:

```bash
# Required: AI API key (at least one)
supabase secrets set OPENAI_API_KEY=sk-...
# OR
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Optional: OAuth providers
supabase secrets set GOOGLE_CLIENT_ID=...
supabase secrets set GOOGLE_CLIENT_SECRET=...
```

### 6. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy a specific function
supabase functions deploy generate-review
```

## Directory Structure

```
supabase/
├── config.toml              # Supabase CLI configuration
├── migrations/
│   ├── 001_initial_schema.sql    # Core database tables
│   └── 002_storage_buckets.sql   # Storage bucket policies
├── functions/
│   ├── _shared/             # Shared utilities
│   │   ├── cors.ts          # CORS headers
│   │   └── supabase.ts      # Supabase client helpers
│   └── generate-review/     # AI review generation
│       └── index.ts
└── README.md                # This file
```

## Database Schema Overview

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends Supabase auth) |
| `applications` | Submitted mock applications |
| `reviews` | AI-generated feedback |
| `dedicated_counselors` | Premium school-specific counselors |
| `purchases` | Payment records |
| `review_feedback` | User ratings of reviews |

### Key Relationships

```
profiles (1) ─────────< (many) applications
                              │
                              └───< (many) reviews
                              
dedicated_counselors (1) ───< (many) purchases
                              │
                              └───< (many) reviews (via counselor_type)
```

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **profiles**: Users can only read/update their own profile
- **applications**: Users can CRUD their own applications; anonymous users can insert
- **reviews**: Users can read reviews for their applications; only service role can insert
- **purchases**: Users can only see their own purchases
- **dedicated_counselors**: Anyone can view active counselors

## Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `application-documents` | Transcripts, portfolios | Private (user's own files) |
| `avatars` | User profile pictures | Public |
| `counselor-assets` | Logos for dedicated counselors | Public |

## Edge Functions

### generate-review

Generates AI feedback for an application.

**Endpoint:** `POST /functions/v1/generate-review`

**Request:**
```json
{
  "applicationId": "uuid-of-application"
}
```

**Response:**
```json
{
  "success": true,
  "reviewId": "uuid-of-review",
  "overallScore": 78,
  "decision": "competitive",
  "processingTime": 3500
}
```

## Local Development

```bash
# Start local Supabase
supabase start

# This starts:
# - PostgreSQL on localhost:54322
# - Supabase Studio on localhost:54323
# - API on localhost:54321

# Run Edge Functions locally
supabase functions serve

# Stop local Supabase
supabase stop
```

## Useful SQL Queries

### Get user stats
```sql
SELECT * FROM user_stats WHERE user_id = 'uuid';
```

### Get application with latest review
```sql
SELECT * FROM applications_with_reviews WHERE user_id = 'uuid';
```

### Export training data
```sql
SELECT 
    a.program_type,
    a.form_data,
    r.category_scores,
    r.feedback_text,
    r.decision,
    r.counselor_version
FROM applications a
JOIN reviews r ON a.id = r.application_id
WHERE r.created_at > '2024-01-01';
```

## Troubleshooting

### "Permission denied" errors
- Check that RLS policies are correctly configured
- Ensure you're using the right API key (anon vs service_role)
- For Edge Functions, use service_role to bypass RLS

### Edge Function not working
- Check that secrets are set: `supabase secrets list`
- Check function logs: `supabase functions logs generate-review`
- Ensure CORS headers are included in response

### Storage upload failing
- Check bucket exists and policies are applied
- Verify file size is under limit (50MB for documents)
- Check MIME type is allowed

