# Environment Variables Template

Copy these to your `.env` file and fill in your values.

## Supabase Configuration
Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## AI Provider Configuration
You need at least one of these:

```
# OpenAI - Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Anthropic (alternative) - Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...
```

## OAuth Providers (Optional)

```
# Google OAuth - https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth - https://github.com/settings/developers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## Stripe (Future - for payments)

```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Application Settings

```
NODE_ENV=development
SITE_URL=http://localhost:3000
FREE_REVIEWS_LIMIT=3
```

