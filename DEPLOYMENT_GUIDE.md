# 🚀 Phase C: Deployment & Testing Guide

## Date: January 8, 2026
## Status: Ready for Deployment

---

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] Supabase project created (note your project URL and keys)
- [ ] Anthropic API key (for Claude AI) OR OpenAI API key
- [ ] Access to Supabase Dashboard
- [ ] Git repository pushed to GitHub (for deployment)

---

## Part 1: Supabase Project Setup

### Step 1.1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Choose organization and set project details:
   - **Name**: ReviewMyApplication
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier works for development
4. Wait 2-3 minutes for provisioning
5. Once ready, note these from **Settings → API**:
   - **Project URL**: `https://[your-ref].supabase.co`
   - **Project API Keys**:
     - `anon` (public) key
     - `service_role` (secret) key

### Step 1.2: Update Frontend Configuration

Update `assets/app.js` lines 5-6 with your project details:

```javascript
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

---

## Part 2: Database Setup

### Step 2.1: Run Migrations

**Option A: Using SQL Editor (Recommended for first-time)**

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste `supabase/migrations/COMBINED_MIGRATION.sql`
4. Click **Run** (bottom right)
5. Wait for success message

**Option B: Individual Migrations (if COMBINED fails)**

Run these in order in SQL Editor:

1. `001_initial_schema.sql` - Core tables
2. `002_storage_buckets.sql` - Storage setup
3. `003_synthetic_admissions_schema.sql` - Enhanced schema
4. `004_seed_supplemental_prompts.sql` - Seed data

### Step 2.2: Verify Database

Run this query in SQL Editor to verify:

```sql
-- Should show all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- applications, dedicated_counselors, profiles, purchases,
-- review_feedback, reviews, supplemental_prompts, synthetic_schools
```

Expected result: 8 tables listed

---

## Part 3: Edge Function Deployment

### Step 3.1: Set Up Secrets

1. Go to Supabase Dashboard → **Settings** → **Edge Functions**
2. Scroll to **Secrets**
3. Add these secrets:

```bash
# Required: At least ONE AI provider
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
# OR
OPENAI_API_KEY=sk-your-key-here

# Optional but recommended: both for fallback
```

### Step 3.2: Deploy Edge Function

**Method 1: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI first (if not installed)
npm install -g supabase

# Login
supabase login

# Link to your project
cd /path/to/ReviewMyApplication.org
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy generate-review

# Verify deployment
supabase functions list
```

**Method 2: Manual Deployment (if CLI not available)**

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **Create a new function**
3. Name: `generate-review`
4. Copy entire contents of `supabase/functions/generate-review/index.ts`
5. Paste into editor
6. Click **Deploy**

**Important:** The JSON database must also be uploaded:
- Currently, Supabase Edge Functions don't support file imports directly
- **Workaround**: We'll embed the database in the function code (see Step 3.3)

### Step 3.3: Embed JSON Database in Function

Since Edge Functions have limited file system access, we need to embed the database:

**Create this modified version:**

```typescript
// At the top of index.ts, replace the import with:
const admissionsDatabase = {
  // Copy entire contents of college_admissions_database.json here
  "metadata": {
    "project_name": "College Admissions Counselor Knowledge Base",
    "version": "1.0",
    // ... rest of JSON
  },
  "top_10_universities_deep_research": [
    // ... all university data
  ]
};
```

**Alternative:** Use Supabase Storage to host the JSON:

1. Upload `college_admissions_database.json` to Supabase Storage
2. Fetch it at runtime in the Edge Function
3. Cache it for performance

---

## Part 4: Testing

### Step 4.1: Test Database Connection

Run this in SQL Editor:

```sql
-- Test insert
INSERT INTO applications (program_type, form_data, status)
VALUES ('college', '{"test": true}'::jsonb, 'submitted')
RETURNING id, created_at;

-- Should return a new UUID and timestamp
```

### Step 4.2: Test Edge Function Locally (Optional)

If you have Supabase CLI installed:

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve generate-review --env-file ./supabase/.env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-review' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"applicationId":"test-uuid"}'
```

### Step 4.3: Test from Frontend

1. Open `index.html` in browser (or deploy to hosting)
2. Fill out a mock application
3. Submit and wait for review
4. Check browser console for errors
5. Verify review appears correctly

**Expected Flow:**
```
User submits → Application saved to DB → Edge Function called →
AI generates review → Review saved to DB → UI displays results
```

### Step 4.4: Check Logs

Monitor Edge Function execution:

```bash
# Using CLI
supabase functions logs generate-review --tail

# Or in Dashboard: Edge Functions → generate-review → Logs
```

---

## Part 5: Validation Tests

### Test Case 1: Harvard Application

Create a test application:
- **School**: Harvard University
- **GPA**: 3.9
- **SAT**: 1520
- **Activities**: 3-4 with leadership
- **Essay**: Thoughtful, specific

**Expected Output:**
- ✅ Detects school as "Harvard University"
- ✅ Loads Harvard-specific criteria (6 what_they_seek items)
- ✅ Fit analysis shows alignment check for each criterion
- ✅ Score around 70-85 (competitive range)
- ✅ Common pitfalls checked (5 items for Harvard)
- ✅ Red flags section present (uses generic if no Harvard red_flags)

### Test Case 2: Stanford Application

Create a test application:
- **School**: Stanford University
- **GPA**: 3.7
- **SAT**: 1450
- **Activities**: 8 clubs, all participation
- **Essay**: Generic about "learning"

**Expected Output:**
- ✅ Detects school as "Stanford University"
- ✅ Loads Stanford-specific criteria (includes "intellectual vitality")
- ❌ Fit analysis shows NOT demonstrated for "intellectual vitality"
- ✅ Weakness flagged: "Well-rounded but not distinguished"
- ✅ Red flag: "No evidence of innovation" (Stanford has 6 red flags)
- ✅ Score around 55-65 (possible but weak)

### Test Case 3: Unknown School

Create a test application:
- **School**: Random University

**Expected Output:**
- ✅ Falls back to generic criteria
- ✅ Uses tier defaults (highly_selective)
- ✅ Still provides feedback (backward compatible)
- ✅ No school-specific criteria shown

---

## Part 6: Production Checklist

Before going live:

### Security
- [ ] All secrets set in Edge Functions
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket policies configured
- [ ] CORS headers configured correctly
- [ ] Rate limiting considered (if needed)

### Performance
- [ ] Edge Function deployed to correct region
- [ ] Database indices created (check migrations)
- [ ] JSON database accessible quickly
- [ ] Frontend assets minified (optional)

### Monitoring
- [ ] Edge Function logging enabled
- [ ] Database logging enabled
- [ ] Error tracking set up (optional: Sentry, etc.)
- [ ] Usage monitoring dashboard

### User Experience
- [ ] Frontend shows loading states
- [ ] Error messages are user-friendly
- [ ] Results display correctly
- [ ] Print functionality works
- [ ] Mobile responsive (check index.html)

---

## Part 7: Troubleshooting Guide

### Issue: "Database connection failed"

**Symptoms**: Error when saving application

**Solutions**:
1. Check Supabase project is running (not paused)
2. Verify API keys in `assets/app.js`
3. Check RLS policies in Database → Policies
4. Confirm migrations ran successfully

### Issue: "Edge Function timeout"

**Symptoms**: Review generation takes >60 seconds

**Solutions**:
1. Check AI API key is valid
2. Verify API has quota/credits remaining
3. Check Edge Function logs for errors
4. Consider reducing prompt length

### Issue: "No university-specific feedback"

**Symptoms**: Review shows generic criteria, not school-specific

**Solutions**:
1. Verify `extractTargetSchool()` detects school name
2. Check school name matches database exactly
3. Confirm JSON database loaded in Edge Function
4. Test with known school names (Harvard, Stanford, etc.)

### Issue: "Red flags not showing"

**Symptoms**: Red flags section empty or generic

**Solutions**:
1. Check which university (Harvard/MIT use generic fallback - expected)
2. Verify JSON database has `red_flags` field for that university
3. Check AI is actually detecting red flags (not just missing)
4. Review prompt to ensure red flag detection is active

### Issue: "UI not updating"

**Symptoms**: Old UI shown, not new v2 format

**Solutions**:
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Verify `assets/app.js` has `renderResultsV2()` function
4. Check console for JavaScript errors
5. Confirm review has `target_school_analysis` field

---

## Part 8: Deployment Timeline

### Estimated Time to Deploy

| Task | Time | Difficulty |
|------|------|------------|
| Create Supabase project | 5 min | Easy |
| Run migrations | 5 min | Easy |
| Set up secrets | 2 min | Easy |
| Deploy Edge Function (CLI) | 10 min | Medium |
| Deploy Edge Function (manual) | 30 min | Hard* |
| Test basic functionality | 10 min | Easy |
| Test all 10 universities | 30 min | Medium |
| Fix any issues | 30-60 min | Varies |
| **Total** | **1.5-2.5 hours** | |

\* Manual deployment requires embedding JSON database in code

---

## Part 9: Post-Deployment Monitoring

### Week 1: Active Monitoring

**Daily checks:**
- [ ] Check Edge Function logs for errors
- [ ] Monitor API usage (AI provider dashboard)
- [ ] Review database growth (applications, reviews tables)
- [ ] Test 1-2 applications yourself

**Metrics to track:**
- Applications submitted per day
- Reviews generated successfully
- Average review generation time
- Error rate

### Week 2+: Maintenance Mode

**Weekly checks:**
- [ ] Review error logs
- [ ] Check API quota usage
- [ ] Monitor database size
- [ ] Review user feedback (if collecting)

**Monthly:**
- [ ] Analyze most common universities queried
- [ ] Consider adding more universities
- [ ] Review AI output quality
- [ ] Update prompts if needed

---

## Part 10: Success Criteria

Your deployment is successful when:

✅ **Functionality**
- [ ] Users can submit applications
- [ ] Reviews generate in <30 seconds
- [ ] University-specific feedback displays
- [ ] Fit analysis shows for all schools
- [ ] Common pitfalls detected correctly
- [ ] Red flags appear for Stanford, Yale, Princeton, etc.

✅ **Quality**
- [ ] Reviews are coherent and helpful
- [ ] School-specific criteria are accurate
- [ ] No major bugs or errors
- [ ] UI is responsive and clear

✅ **Performance**
- [ ] Page loads in <3 seconds
- [ ] No timeouts or failed requests
- [ ] Edge Function cold start <5 seconds
- [ ] Warm requests <10 seconds

---

## Next Steps After Deployment

Once Phase C is complete:

1. **Gather User Feedback**
   - Share with test users
   - Collect feedback on accuracy
   - Note any confusion points

2. **Iterate on Prompts**
   - Refine based on output quality
   - Adjust thresholds if needed
   - Fine-tune school-specific criteria

3. **Expand Coverage**
   - Add more universities (Phase E)
   - Add more features (Phase D)
   - Improve UI/UX based on feedback

4. **Scale Up**
   - Monitor performance under load
   - Optimize Edge Function if needed
   - Consider caching strategies

---

## Files to Update for Deployment

### Required Updates:
1. `assets/app.js` - Update SUPABASE_URL and SUPABASE_ANON_KEY
2. `supabase/functions/generate-review/index.ts` - Embed JSON database (if not using file import)

### Optional Updates:
3. `index.html` - Update site URL, analytics, etc.
4. `supabase/config.toml` - Update auth site_url for production

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions Guide**: https://supabase.com/docs/guides/functions
- **Anthropic API Docs**: https://docs.anthropic.com/
- **OpenAI API Docs**: https://platform.openai.com/docs

---

**Phase C Status:** Ready to Begin 🚀

Start with Part 1 and work through sequentially. Good luck!
