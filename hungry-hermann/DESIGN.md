# ReviewMyApplication.org - Synthetic Admissions System
## Design Document v1.0

**Last Updated:** January 7, 2026
**Status:** Phase 1 Complete (Database + School Selection UI)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Requirements](#business-requirements)
3. [User Stories](#user-stories)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [User Interface Design](#user-interface-design)
7. [Application Flow](#application-flow)
8. [Technical Specifications](#technical-specifications)
9. [Implementation Phases](#implementation-phases)
10. [Test Cases](#test-cases)
11. [Success Metrics](#success-metrics)

---

## Executive Summary

### Vision
Build a synthetic college admissions system that allows students to practice applying to universities through AI-powered admissions officers, receiving realistic accept/reject decisions with detailed feedback, enabling unlimited iterations before applying to real schools.

### Core Value Proposition
- **Practice-based learning:** Students can apply multiple times to synthetic admissions officers
- **Realistic decisions:** Binary ACCEPT/REJECT mimicking real college admissions
- **School-specific evaluation:** Each college has unique supplemental essays and criteria
- **Feedback loop:** Students report real outcomes to improve AI accuracy over time
- **100% free forever:** Unlimited attempts at any school

### Key Differentiation
Unlike existing college counseling services that help students CREATE applications, we focus on PRACTICE EVALUATION—letting students test their applications against realistic admissions criteria before the stakes are real.

---

## Business Requirements

### BR-001: Multi-School Support
**Requirement:** System must support multiple colleges with unique supplemental essay questions.

**Rationale:** Each college has different values, essay prompts, and evaluation criteria.

**Initial Scope:**
- Stanford University (8 supplemental essays)
- MIT (6 supplemental essays)
- Harvard University (5 supplemental essays)

**Future Expansion:** Yale, Princeton, UChicago, Columbia, Penn, Duke, etc.

---

### BR-002: School-Centric Application Flow
**Requirement:** Students must select a target college BEFORE starting the application.

**Rationale:** Each college has different supplemental questions that cannot be generic.

**Flow:**
1. Student lands on homepage
2. Clicks "Choose Your College"
3. Sees grid of available colleges
4. Selects specific college (e.g., Stanford)
5. Fills out Stanford-specific application form
6. Receives synthetic Stanford admissions decision

**Contrast with Current System:** Currently uses generic forms with a school dropdown buried in the form. New system makes school selection the primary navigation.

---

### BR-003: Binary Accept/Reject Decisions
**Requirement:** Synthetic admissions officers must return only ACCEPT or REJECT.

**Rationale:**
- Real colleges don't provide detailed rejection feedback
- Waitlist and Deferral depend on institutional capacity (not available to synthetic officers)
- Binary decision creates realistic experience

**Implementation:**
- AI evaluates application holistically
- Converts detailed analysis to binary decision based on score thresholds:
  - Ultra-selective schools (Harvard, MIT, Stanford): 90+ = ACCEPT
  - Highly selective schools: 85+ = ACCEPT
  - Very selective schools: 80+ = ACCEPT

---

### BR-004: Gated Detailed Feedback
**Requirement:** Detailed feedback (weaknesses, strengths, scores) is only revealed after email capture.

**Rationale:**
- Build email list for user engagement
- Create value exchange (email for feedback)
- Enable follow-up for outcome reporting

**User Experience:**
1. Student submits application
2. Sees ACCEPT or REJECT decision immediately
3. Application ID prominently displayed (e.g., RMA-2026-STF-7F3A)
4. To see detailed breakdown, student must provide email
5. Detailed feedback unlocked + sent to email

---

### BR-005: Version Tracking
**Requirement:** System must track multiple submissions by the same student to the same college.

**Key:** `student_identifier` + `school_code` = unique combination

**Behavior:**
- Each submission is version 1, 2, 3, etc.
- AI evaluates each version independently (no memory of previous attempts)
- Student can view version history in dashboard (future feature)
- Enables tracking student improvement over time

**Example:**
- John applies to Stanford → v1 → REJECT (score: 72)
- John improves essay, reapplies to Stanford → v2 → REJECT (score: 85)
- John adds research activity, reapplies → v3 → ACCEPT (score: 92)

---

### BR-006: Outcome Reporting & Reinforcement Learning
**Requirement:** Students can report real college decisions to improve system accuracy.

**Flow:**
1. Student applies to Synthetic Stanford → ACCEPT
2. Student applies to Real Stanford (months later)
3. Real Stanford responds → REJECT (mismatch!)
4. Student returns to system with Application ID
5. Reports outcome: REJECT
6. Optionally uploads rejection letter for verification
7. Can note if they changed the application
8. System flags mismatch for analysis

**Learning Loop:**
- **Mismatch detected:** Synthetic ACCEPT but Real REJECT
- **Action:** AI team reviews application to identify what was missed
- **Improvement:** Adjust decision thresholds or add new evaluation criteria
- **Goal:** Increase prediction accuracy from ~70% → 90%+

**Data Captured:**
- Real decision (ACCEPT/REJECT/WAITLIST/DEFER)
- Decision type (EA, ED, RD, REA)
- Decision date
- Decision letter (optional upload)
- Whether application was modified after synthetic review
- Student notes

---

### BR-007: Application ID System
**Requirement:** Every application must have a unique, human-readable ID.

**Format:** `RMA-YYYY-XXX-AAAA`
- RMA = ReviewMyApplication
- YYYY = Year (2026)
- XXX = School code (STF=Stanford, MIT=MIT, HAR=Harvard)
- AAAA = Random 4-character alphanumeric (excluding I, O, 1, 0 for clarity)

**Examples:**
- RMA-2026-STF-7F3A (Stanford)
- RMA-2026-MIT-K9L2 (MIT)
- RMA-2026-HAR-P5Q8 (Harvard)

**Usage:**
- Displayed prominently after submission
- Used to retrieve application later
- Required for outcome reporting
- Sent via email if provided
- Stored in localStorage for convenience

---

### BR-008: Free Forever Model
**Requirement:** All features must be 100% free with no limits on attempts.

**Rationale:**
- Democratize access to admissions feedback
- Build large dataset for ML improvements
- Differentiate from expensive counseling services ($10k-$50k)

**Monetization (Future):**
- Optional premium features (comparison across schools, detailed analytics)
- Institutional licensing (high schools/counseling firms)
- Data insights reports (aggregated, anonymized)

**Not Allowed:**
- Paywalls for basic features
- Attempt limits
- Time-based restrictions
- Feature degradation

---

## User Stories

### US-001: High School Senior Applying to Stanford
**As a** high school senior
**I want to** practice applying to Stanford before submitting my real application
**So that** I can see if my application would be competitive

**Acceptance Criteria:**
- ✅ I can select Stanford from the college list
- ✅ I see Stanford-specific supplemental essay prompts
- ✅ I can fill out all required fields
- ✅ I receive ACCEPT or REJECT decision
- ✅ I get a unique Application ID to save
- ✅ I can provide email to unlock detailed feedback
- ✅ I can reapply unlimited times if rejected

---

### US-002: Student Iterating to Improve
**As a** student who was rejected
**I want to** improve my application and try again
**So that** I can increase my chances of acceptance

**Acceptance Criteria:**
- ✅ I can return to Stanford application page
- ✅ I can modify my essays and activities
- ✅ I can resubmit (creates version 2)
- ✅ System evaluates independently (doesn't remember v1)
- ✅ I receive new decision (could be ACCEPT or still REJECT)
- ✅ Each submission gets unique Application ID
- ✅ My improvement is tracked (score progression)

---

### US-003: Student Reporting Real Outcome
**As a** student who applied to both synthetic and real Stanford
**I want to** report my real admissions decision
**So that** the system becomes more accurate for future students

**Acceptance Criteria:**
- ✅ I can navigate to "Report Real Decision"
- ✅ I can enter my Application ID
- ✅ System retrieves my application and shows verification info
- ✅ I can select real outcome (ACCEPT/REJECT/WAITLIST/DEFER)
- ✅ I can upload my decision letter
- ✅ I can note if I changed my application
- ✅ System detects if synthetic prediction was wrong
- ✅ I receive confirmation that my report was submitted

---

### US-004: Student Exploring Multiple Schools
**As a** student considering multiple colleges
**I want to** apply to synthetic MIT, Stanford, and Harvard
**So that** I can compare how competitive I am at each

**Acceptance Criteria:**
- ✅ I can apply to MIT with MIT-specific essays
- ✅ I can separately apply to Stanford with Stanford-specific essays
- ✅ I can separately apply to Harvard with Harvard-specific essays
- ✅ Each application is independent with its own ID
- ✅ I can see different decisions (e.g., MIT ACCEPT, Stanford REJECT)
- ✅ Each decision reflects that school's specific criteria

---

### US-005: Returning Student Finding Previous Application
**As a** returning student
**I want to** find my previous application using my email or Application ID
**So that** I can see my old feedback or report my outcome

**Acceptance Criteria:**
- ✅ I can enter my Application ID on outcome reporting page
- ✅ System retrieves and displays my application summary
- ✅ I see: Application ID, school, submission date, synthetic decision, my name
- ✅ I can confirm it's mine before proceeding
- ✅ If wrong ID, I can try again

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │→ │   College    │→ │ Application  │     │
│  │     Page     │  │  Selection   │  │     Form     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                              ↓              │
│                                       ┌──────────────┐     │
│                                       │   Results    │     │
│                                       │     Page     │     │
│                                       └──────────────┘     │
│                                              ↓              │
│                                       ┌──────────────┐     │
│                                       │   Outcome    │     │
│                                       │  Reporting   │     │
│                                       └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                 │  │
│  │  • applications                                      │  │
│  │  • reviews                                          │  │
│  │  • supplemental_essay_prompts                       │  │
│  │  • application_versions                             │  │
│  │  • application_outcomes                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Edge Function: generate-review                      │  │
│  │  • Fetch application data                           │  │
│  │  • Load school-specific criteria                    │  │
│  │  • Call AI model (Claude/GPT-4)                     │  │
│  │  • Generate detailed review                         │  │
│  │  • Convert to binary decision                       │  │
│  │  • Store review in database                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI MODELS                                │
│  ┌──────────────┐                 ┌──────────────┐         │
│  │   Claude     │  (preferred)    │    GPT-4     │         │
│  │  Sonnet 3.5  │                 │    Turbo     │         │
│  └──────────────┘                 └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Vanilla HTML/CSS/JavaScript (no framework)
- Single Page Application (SPA) pattern
- Custom routing via `hidden` class toggles
- Direct Supabase REST API calls (no SDK)

**Backend:**
- Supabase (PostgreSQL + Edge Functions)
- Row Level Security (RLS) for data isolation
- Storage buckets for file uploads

**AI:**
- Primary: Anthropic Claude Sonnet 3.5
- Fallback: OpenAI GPT-4 Turbo
- School-specific system prompts
- JSON-structured output

**Hosting:**
- Static hosting (Netlify, Vercel, or GitHub Pages)
- Supabase cloud for backend

---

## Database Schema

### Table: `supplemental_essay_prompts`

Stores school-specific essay questions for dynamic form generation.

```sql
CREATE TABLE supplemental_essay_prompts (
  id UUID PRIMARY KEY,
  school_code VARCHAR(100) NOT NULL,          -- 'stanford', 'mit', 'harvard'
  school_name VARCHAR(255) NOT NULL,
  prompt_group VARCHAR(100),                   -- 'required', 'optional', 'short_answer'
  prompt_number INTEGER,                       -- Order within group
  prompt_text TEXT NOT NULL,
  word_limit INTEGER,
  char_limit INTEGER,
  academic_year VARCHAR(20) DEFAULT '2025-2026',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_code, prompt_group, prompt_number, academic_year)
);
```

**Indexes:**
- `idx_prompts_school_code` on `school_code`
- `idx_prompts_school_active` on `(school_code, is_active)`

**Sample Data:**
- Stanford: 8 prompts (5 short_answer 50 words, 3 required 250 words)
- MIT: 6 prompts (5 required 200 words, 1 optional 350 words)
- Harvard: 5 prompts (all required 150 words)

---

### Table: `applications`

Stores user-submitted applications (enhanced from original).

**New Columns Added:**
```sql
ALTER TABLE applications ADD COLUMN application_id_display VARCHAR(50) UNIQUE;
ALTER TABLE applications ADD COLUMN student_email VARCHAR(255);
ALTER TABLE applications ADD COLUMN version_number INTEGER DEFAULT 1;
ALTER TABLE applications ADD COLUMN previous_version_id UUID REFERENCES applications(id);
```

**Key Fields:**
- `id`: UUID primary key
- `application_id_display`: Human-readable ID (RMA-2026-STF-7F3A)
- `user_id`: Links to auth.users (null for anonymous)
- `anonymous_session_id`: Browser session tracking
- `student_email`: Optional email for feedback delivery
- `program_type`: 'middle-school', 'high-school', 'college'
- `target_school`: 'stanford', 'mit', 'harvard', etc.
- `form_data`: JSONB with all form responses
- `version_number`: 1, 2, 3... for resubmissions
- `previous_version_id`: Links to prior version
- `status`: 'draft', 'submitted', 'processing', 'reviewed', 'error'

---

### Table: `reviews`

Stores AI-generated evaluations (enhanced from original).

**New Columns Added:**
```sql
ALTER TABLE reviews ADD COLUMN decision_binary VARCHAR(20) CHECK (decision_binary IN ('ACCEPT', 'REJECT'));
ALTER TABLE reviews ADD COLUMN detailed_feedback_unlocked BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN email_captured_at TIMESTAMPTZ;
```

**Key Fields:**
- `id`: UUID primary key
- `application_id`: Foreign key to applications
- `decision_binary`: 'ACCEPT' or 'REJECT'
- `overall_score`: 0-100 integer
- `decision`: Original rating (e.g., 'Ivy-Level Candidate')
- `category_scores`: JSONB with component breakdowns
- `feedback_text`: JSONB with full review
- `detailed_feedback_unlocked`: Gates feedback behind email
- `counselor_version`: 'v2.0.0' for A/B testing
- `model_used`: 'claude-3-5-sonnet-20241022'
- `tokens_used`: Cost tracking
- `processing_time_ms`: Performance metrics

---

### Table: `application_versions`

Tracks version history for same student + school.

```sql
CREATE TABLE application_versions (
  id UUID PRIMARY KEY,
  student_identifier VARCHAR(500) NOT NULL,    -- Hash of email or session
  school_code VARCHAR(100) NOT NULL,
  version_number INTEGER NOT NULL,
  application_id UUID REFERENCES applications(id),
  review_id UUID REFERENCES reviews(id),
  synthetic_decision VARCHAR(50),              -- 'ACCEPT' or 'REJECT'
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_identifier, school_code, version_number)
);
```

**Purpose:**
- Enable version history view (v1, v2, v3...)
- Track student improvement over time
- Support "View Previous Attempts" dashboard

**Student Identifier:**
- Hash of email (if provided) OR anonymous_session_id
- Ensures privacy while maintaining linkage
- `hashIdentifier()` function: simple 32-bit hash → base36 string

---

### Table: `application_outcomes`

Stores real college decisions for reinforcement learning.

```sql
CREATE TABLE application_outcomes (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  review_id UUID REFERENCES reviews(id),

  -- Real outcome
  real_decision VARCHAR(50) NOT NULL,          -- 'ACCEPT', 'REJECT', 'WAITLIST', 'DEFER'
  decision_type VARCHAR(50),                   -- 'EA', 'ED', 'RD', 'REA'
  decision_date DATE,

  -- Verification
  letter_upload_path VARCHAR(500),
  verification_status VARCHAR(50) DEFAULT 'unverified',

  -- Application changes
  final_application_changed BOOLEAN DEFAULT false,
  final_application_upload_path VARCHAR(500),
  changes_description TEXT,

  -- Feedback
  student_notes TEXT,
  synthetic_was_helpful BOOLEAN,

  -- Analytics
  mismatch_detected BOOLEAN,                   -- True if synthetic ≠ real
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);
```

**Mismatch Detection Logic:**
```javascript
const mismatch = (
  (syntheticDecision === 'ACCEPT' && realDecision === 'REJECT') ||
  (syntheticDecision === 'REJECT' && realDecision === 'ACCEPT')
);
```

---

### Views for Analytics

#### `application_mismatches`
```sql
CREATE VIEW application_mismatches AS
SELECT
  ao.id,
  a.application_id_display,
  a.target_school,
  r.decision_binary as synthetic_decision,
  ao.real_decision,
  r.overall_score,
  r.feedback_text,
  ao.final_application_changed,
  ao.changes_description,
  ao.reported_at
FROM application_outcomes ao
JOIN applications a ON ao.application_id = a.id
JOIN reviews r ON ao.review_id = r.id
WHERE ao.mismatch_detected = true;
```

**Purpose:** Identify cases where AI was wrong for manual review and improvement.

---

#### `school_accuracy_metrics`
```sql
CREATE VIEW school_accuracy_metrics AS
SELECT
  a.target_school,
  COUNT(*) as total_outcomes_reported,
  COUNT(CASE WHEN NOT ao.mismatch_detected THEN 1 END) as correct_predictions,
  ROUND(100.0 * COUNT(CASE WHEN NOT ao.mismatch_detected THEN 1 END) / COUNT(*), 2) as accuracy_percentage,
  AVG(r.overall_score) FILTER (WHERE ao.real_decision = 'ACCEPT') as avg_score_accepted,
  AVG(r.overall_score) FILTER (WHERE ao.real_decision = 'REJECT') as avg_score_rejected
FROM application_outcomes ao
JOIN applications a ON ao.application_id = a.id
JOIN reviews r ON ao.review_id = r.id
GROUP BY a.target_school;
```

**Purpose:** Monitor accuracy per school to identify which schools need better calibration.

---

#### `student_improvement_tracking`
```sql
CREATE VIEW student_improvement_tracking AS
SELECT
  av.student_identifier,
  av.school_code,
  COUNT(*) as total_attempts,
  ARRAY_AGG(r.overall_score ORDER BY av.version_number) as score_progression,
  ARRAY_AGG(av.synthetic_decision ORDER BY av.version_number) as decision_progression,
  (ARRAY_AGG(r.overall_score ORDER BY av.version_number DESC))[1] -
  (ARRAY_AGG(r.overall_score ORDER BY av.version_number ASC))[1] as score_improvement
FROM application_versions av
JOIN reviews r ON av.review_id = r.id
GROUP BY av.student_identifier, av.school_code
HAVING COUNT(*) > 1;
```

**Purpose:** Show students their progress over multiple attempts (future feature).

---

## User Interface Design

### Landing Page

**Current State:** Generic program cards (Middle School, High School, College)

**Updated College Card:**
```
┌─────────────────────────────────────────┐
│  🎯  UNDERGRADUATE                      │
│                                         │
│  College Admissions                     │
│                                         │
│  Apply to our synthetic admissions      │
│  officers. Get realistic accept/reject  │
│  decisions. Unlimited attempts. Free.   │
│                                         │
│  ✓ School-specific supplementals        │
│  ✓ Binary accept/reject decisions       │
│  ✓ Detailed feedback (email required)   │
│  ✓ Version tracking & outcomes          │
│                                         │
│  [  Choose Your College  →  ]           │
└─────────────────────────────────────────┘
```

---

### College Selection Page

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  ← Back                                                    │
│                                                            │
│          Choose Your Target College                        │
│                                                            │
│  Select a college to apply to our synthetic admissions     │
│  officer. Each school has its own supplemental essays      │
│  and evaluation criteria.                                  │
│                                                            │
│  ┌──────────────────────┬──────────────────────────┐      │
│  │ Search colleges...   │ ▼ Ultra-Selective (<5%) │      │
│  └──────────────────────┴──────────────────────────┘      │
│                                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│  │STANFORD │  │   MIT   │  │ HARVARD │                   │
│  │  CARD   │  │  CARD   │  │  CARD   │                   │
│  └─────────┘  └─────────┘  └─────────┘                   │
└────────────────────────────────────────────────────────────┘
```

**School Card Design:**
```
┌───────────────────────────────────────┐
│ [Colored Header - School Brand Color] │
│                                       │
│  #3 US NEWS                          │
│  Stanford University                  │
│  📍 Stanford, CA                      │
│                                       │
├───────────────────────────────────────┤
│                                       │
│  ACCEPTANCE RATE    SUPPLEMENTALS     │
│      3.7%              8 essays       │
│                                       │
│  Innovation and intellectual vitality │
│                                       │
│  Stanford seeks students who          │
│  demonstrate intellectual vitality... │
│                                       │
│  [Apply to Synthetic Stanford  →]     │
│                                       │
└───────────────────────────────────────┘
```

**Colors:**
- **Stanford:** `#8C1515` (Cardinal red)
- **MIT:** `#A31F34` (MIT red)
- **Harvard:** `#A51C30` (Crimson)

---

### Application Form (Future - Not Yet Built)

**Multi-Step Form:**

**Step 1: Basic Profile (Common)**
- First Name, Last Name
- Email (optional - for Application ID delivery)
- Graduation Year
- Intended Major

**Step 2: Academics (Common)**
- GPA (Unweighted & Weighted)
- SAT/ACT Scores
- AP/IB/Honors Courses
- Course Rigor Summary

**Step 3: Common App Personal Statement (Common)**
- Select prompt from 7 options
- 650-word essay

**Steps 4-N: School-Specific Supplementals (Dynamic)**
- Loaded from `supplemental_essay_prompts` table
- Different for each school:
  - Stanford: 5 short (50w) + 3 long (250w)
  - MIT: 5 required (200w) + 1 optional (350w)
  - Harvard: 5 required (150w)

**Step N+1: Activities & Honors (Common)**
- Activity 1 (Most Meaningful)
- Activity 2-5
- Honors & Awards

**Step N+2: Review & Submit**
- Summary of all responses
- Generate Application ID
- Submit for evaluation

---

### Results Page

**Stage 1: Binary Decision (Always Shown)**
```
┌────────────────────────────────────────────┐
│  YOUR APPLICATION ID                       │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃  RMA-2026-STF-7F3A             [Copy] ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  Save this ID! You'll need it to access    │
│  feedback and report real decisions later. │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │                                    │   │
│  │        ✅  ACCEPTED                │   │
│  │                                    │   │
│  │  Based on our analysis, this       │   │
│  │  application would likely be       │   │
│  │  accepted at Stanford.             │   │
│  │                                    │   │
│  │  Overall Strength: 92/100          │   │
│  │                                    │   │
│  │  ─────────────────────────────     │   │
│  │                                    │   │
│  │  📊 Want Detailed Feedback?        │   │
│  │                                    │   │
│  │  Learn exactly what worked and     │   │
│  │  what to improve.                  │   │
│  │                                    │   │
│  │  ✓ Component score breakdown       │   │
│  │  ✓ Specific weaknesses (H/M/L)     │   │
│  │  ✓ What Stanford seeks             │   │
│  │  ✓ Red flags detected              │   │
│  │  ✓ Narrative archetype             │   │
│  │                                    │   │
│  │  ┌──────────────────────────────┐  │   │
│  │  │ Enter your email             │  │   │
│  │  └──────────────────────────────┘  │   │
│  │  [  Get Detailed Feedback  →  ]    │   │
│  │                                    │   │
│  │  Privacy: We never spam.           │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [Apply to Another College]                │
│  [Improve & Resubmit to Stanford]          │
│                                            │
│  Applied to Stanford in real life?         │
│  [Report Real Decision Later]              │
└────────────────────────────────────────────┘
```

**Stage 2: Detailed Feedback (After Email Capture)**
- Overall score circle (0-100)
- Target school analysis
- Component scores (Academics, Essays, Activities, Fit)
- Identified weaknesses (HIGH/MEDIUM/LOW priority)
- Red flags (if any)
- Narrative assessment
- Final assessment text

---

### Outcome Reporting Page

**Step 1: Enter Application ID**
```
┌────────────────────────────────────────┐
│  Report Your Real College Decision     │
│                                        │
│  Help improve our synthetic admissions │
│  by reporting your real outcome!       │
│                                        │
│  Step 1: Enter Your Application ID    │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ RMA-2026-STF-7F3A              │   │
│  └────────────────────────────────┘   │
│  [Look Up]                            │
└────────────────────────────────────────┘
```

**Step 2: Verify Application**
```
┌────────────────────────────────────────┐
│  Step 2: Verify This Is Your App      │
│                                        │
│  Application ID: RMA-2026-STF-7F3A    │
│  School: Stanford University           │
│  Submitted: December 15, 2025          │
│  Synthetic Decision: ACCEPT            │
│  Your Name: John Doe                   │
│  Intended Major: Computer Science      │
│                                        │
│  [✓ Yes, This Is Mine]  [← Try Again] │
└────────────────────────────────────────┘
```

**Step 3: Report Real Decision**
```
┌────────────────────────────────────────┐
│  Step 3: Report Real Decision          │
│                                        │
│  What was the real decision? *         │
│  ○ ✅ Accepted                         │
│  ● ❌ Rejected                         │
│  ○ ⏳ Waitlisted                       │
│  ○ 📅 Deferred (EA/ED)                │
│                                        │
│  Application Type *                    │
│  ▼ Regular Decision                    │
│                                        │
│  Decision Date *                       │
│  [  March 28, 2026  ]                 │
│                                        │
│  Upload Decision Letter (Optional)     │
│  [Choose File]                         │
│                                        │
│  Did you change your application?      │
│  ● No, submitted exactly as practiced  │
│  ○ Yes, I made changes                │
│                                        │
│  Was our synthetic review helpful? *   │
│  ▼ Yes, very helpful                   │
│                                        │
│  [Submit Report]                       │
└────────────────────────────────────────┘
```

**Step 4: Confirmation**
```
┌────────────────────────────────────────┐
│  ✅ Thank You for Reporting!           │
│                                        │
│  🔍 Mismatch Detected                  │
│                                        │
│  Our Prediction: ACCEPT                │
│  Real Decision: REJECT                 │
│                                        │
│  This is valuable data! We'll analyze  │
│  what we missed to improve future      │
│  predictions.                          │
│                                        │
│  What Happens Next?                    │
│  • Your report is added to training    │
│  • We analyze mismatches               │
│  • Future predictions improve          │
│  • Other students benefit              │
│                                        │
│  [Return to Home]                      │
└────────────────────────────────────────┘
```

---

## Application Flow

### Flow 1: First-Time Application to Stanford

```
┌──────────────────────────────────────────────────────┐
│  1. User lands on homepage                           │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  2. Clicks "Choose Your College"                     │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  3. Sees college selection grid                      │
│     (Stanford, MIT, Harvard cards)                   │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  4. Clicks "Apply to Synthetic Stanford"             │
│     → appState.selectedSchool = 'stanford'           │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  5. System loads Stanford supplemental prompts       │
│     → Fetch from supplemental_essay_prompts table    │
│     → WHERE school_code = 'stanford'                 │
│     → 8 prompts returned                             │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  6. Dynamic form builder creates steps               │
│     • Step 1: Basic Profile                          │
│     • Step 2: Academics                              │
│     • Step 3: Common App Essay                       │
│     • Steps 4-11: Stanford Supplementals (dynamic)   │
│     • Step 12: Activities                            │
│     • Step 13: Review & Submit                       │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  7. User fills out all 13 steps                      │
│     → Auto-save to localStorage on step change       │
│     → Progress bar shows 8/13                        │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  8. User clicks "Submit Application"                 │
│     → Generate Application ID (RMA-2026-STF-7F3A)    │
│     → Hash student identifier                        │
│     → Check for previous versions                    │
│     → None found → version_number = 1                │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  9. Create application record                        │
│     INSERT INTO applications (                       │
│       application_id_display,                        │
│       target_school,                                 │
│       form_data,                                     │
│       version_number,                                │
│       status = 'submitted'                           │
│     )                                                │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  10. Create version record                           │
│      INSERT INTO application_versions (              │
│        student_identifier,                           │
│        school_code = 'stanford',                     │
│        version_number = 1,                           │
│        application_id                                │
│      )                                               │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  11. Show loading state                              │
│      "Evaluating your application..."               │
│      → Update status = 'processing'                  │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  12. Call Edge Function                              │
│      supabase.functions.invoke('generate-review', {  │
│        applicationId: app.id                         │
│      })                                              │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  13. Edge Function processes                         │
│      • Fetch application from DB                     │
│      • Load Stanford-specific criteria               │
│      • Build AI prompt with school context           │
│      • Call Claude Sonnet 3.5                        │
│      • Receive detailed JSON review                  │
│      • Overall score: 92/100                         │
│      • Convert to binary: 92 >= 90 → ACCEPT          │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  14. Save review to database                         │
│      INSERT INTO reviews (                           │
│        application_id,                               │
│        decision_binary = 'ACCEPT',                   │
│        overall_score = 92,                           │
│        feedback_text = {...},                        │
│        detailed_feedback_unlocked = false            │
│      )                                               │
│      → Update status = 'reviewed'                    │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  15. Update application_versions with review         │
│      UPDATE application_versions                     │
│      SET review_id = r.id,                           │
│          synthetic_decision = 'ACCEPT'               │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  16. Return minimal response to frontend             │
│      {                                               │
│        reviewId: uuid,                               │
│        decision: 'ACCEPT',                           │
│        application_id_display: 'RMA-2026-STF-7F3A',  │
│        overallScore: 92                              │
│      }                                               │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  17. Show results page (Stage 1)                     │
│      • Display Application ID prominently            │
│      • Show ACCEPT with score 92/100                 │
│      • Email gate for detailed feedback              │
│      • [Apply to Another College] button             │
│      • [Report Real Decision Later] button           │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  18. User provides email                             │
│      → Unlock detailed feedback                      │
│      → Update detailed_feedback_unlocked = true      │
│      → Send email with Application ID & link         │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  19. Show detailed feedback (Stage 2)                │
│      • Component scores                              │
│      • Weaknesses (if any)                           │
│      • Narrative assessment                          │
│      • Final assessment text                         │
└──────────────────────────────────────────────────────┘
```

---

### Flow 2: Resubmission After Rejection

```
┌──────────────────────────────────────────────────────┐
│  1. User previously applied to MIT → REJECT          │
│     Application ID: RMA-2026-MIT-K9L2                │
│     Version 1, Score: 78/100                         │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  2. User returns to site                             │
│     → Clicks "Choose Your College"                   │
│     → Selects MIT again                              │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  3. Form loads with blank fields                     │
│     (System does NOT pre-fill previous attempt)      │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  4. User rewrites essays, adds new activity          │
│     → Completes all steps                            │
│     → Clicks "Submit Application"                    │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  5. Generate new Application ID                      │
│     → RMA-2026-MIT-P7N4 (different from v1)          │
│     → Hash student identifier (same as before)       │
│     → Query for previous versions                    │
│     → Found: version 1 exists                        │
│     → New version_number = 2                         │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  6. Create application record (version 2)            │
│     INSERT INTO applications (                       │
│       application_id_display = 'RMA-2026-MIT-P7N4',  │
│       version_number = 2,                            │
│       previous_version_id = v1.id                    │
│     )                                                │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  7. AI evaluates INDEPENDENTLY                       │
│     (Does NOT see version 1)                         │
│     (No memory of previous attempt)                  │
│     → New score: 88/100                              │
│     → Binary: 88 < 90 → REJECT (still not enough)   │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  8. Show results                                     │
│     Application ID: RMA-2026-MIT-P7N4                │
│     Decision: REJECT                                 │
│     Score: 88/100 (improved from 78!)                │
│                                                      │
│     System tracks:                                   │
│     student_improvement_tracking view shows:         │
│     score_progression: [78, 88]                      │
│     decision_progression: ['REJECT', 'REJECT']       │
│     score_improvement: +10                           │
└──────────────────────────────────────────────────────┘
```

---

### Flow 3: Outcome Reporting

```
┌──────────────────────────────────────────────────────┐
│  1. User applied to:                                 │
│     • Synthetic Stanford → ACCEPT (RMA-2026-STF-7F3A)│
│     • Real Stanford → Submitted December 1, 2025     │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  2. Real Stanford responds (March 28, 2026)          │
│     → REJECT                                         │
│     (Mismatch! Synthetic said ACCEPT)                │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  3. User returns to ReviewMyApplication.org          │
│     → Clicks "Report Real Decision"                  │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  4. Enter Application ID                             │
│     → Types: RMA-2026-STF-7F3A                       │
│     → Clicks "Look Up"                               │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  5. System queries database                          │
│     SELECT * FROM applications                       │
│     WHERE application_id_display = 'RMA-2026-STF-...'│
│     JOIN reviews...                                  │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  6. Show verification screen                         │
│     Application ID: RMA-2026-STF-7F3A                │
│     School: Stanford University                      │
│     Submitted: December 1, 2025                      │
│     Synthetic Decision: ACCEPT                       │
│     Your Name: Jane Smith                            │
│     → User confirms: "Yes, This Is Mine"             │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  7. User fills out outcome form                      │
│     Real Decision: ● REJECT                          │
│     Decision Type: Regular Decision                  │
│     Decision Date: March 28, 2026                    │
│     Upload Letter: [stanford_decision.pdf]           │
│     Changed Application?: ● No, same as practiced    │
│     Was Helpful?: Yes, very helpful                  │
│     → Clicks "Submit Report"                         │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  8. System processes outcome                         │
│     • Upload decision letter to Storage              │
│     • Calculate mismatch:                            │
│       synthetic='ACCEPT', real='REJECT' → TRUE       │
│     • INSERT INTO application_outcomes (...)         │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  9. Show confirmation with mismatch notice           │
│     ✅ Thank You for Reporting!                      │
│                                                      │
│     🔍 Mismatch Detected                             │
│     Our Prediction: ACCEPT                           │
│     Real Decision: REJECT                            │
│                                                      │
│     We'll analyze what we missed to improve.         │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  10. Added to application_mismatches view            │
│      (For manual review by AI team)                  │
└──────────────────────────────────────────────────────┘
```

---

## Technical Specifications

### Frontend JavaScript Architecture

**State Management:**
```javascript
let appState = {
  currentProgram: null,           // 'middle-school', 'high-school', 'college'
  selectedSchool: null,            // 'stanford', 'mit', 'harvard'
  currentStep: 0,                  // 0-based step index
  formData: {},                    // All form responses
  uploadedFiles: {},               // File upload metadata
  applicationID: null              // Generated ID (RMA-2026-STF-7F3A)
};
```

**School Data Structure:**
```javascript
const SCHOOLS = [
  {
    code: 'stanford',
    name: 'Stanford University',
    shortName: 'Stanford',
    tier: 'ultra_selective',
    acceptance_rate: '3.7%',
    location: 'Stanford, CA',
    us_news_rank: 3,
    tagline: 'Innovation and intellectual vitality',
    description: 'Stanford seeks students who demonstrate...',
    colors: { primary: '#8C1515', secondary: '#FFFFFF' },
    num_supplemental_essays: 8
  },
  // ... MIT, Harvard
];
```

**Supabase Client (Custom - No SDK):**
```javascript
const supabase = {
  from(table) {
    return {
      async insert(data) { ... },
      select(columns) {
        return {
          eq(column, value) { ... },
          order(column, options) { ... },
          async single() { ... },
          async execute() { ... }
        };
      }
    };
  },
  functions: {
    async invoke(name, options) { ... }
  }
};
```

**Key Functions:**

**Application ID Generation:**
```javascript
function generateApplicationID(schoolCode) {
  const year = new Date().getFullYear();                    // 2026
  const schoolPrefix = schoolCode.substring(0, 3).toUpperCase();  // STF
  const randomSuffix = generateRandomString(4);             // 7F3A
  return `RMA-${year}-${schoolPrefix}-${randomSuffix}`;     // RMA-2026-STF-7F3A
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

**Student Identifier Hashing:**
```javascript
function hashIdentifier(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).padStart(16, '0');
}

// Example:
// hashIdentifier('john.doe@email.com') → 'a7f3k9m2p5q8r4s1'
// hashIdentifier('anon_1234567890') → 'b2g6j8l3n9t5v7x4'
```

**Dynamic Form Builder (Future):**
```javascript
async function loadSchoolSpecificForm(schoolCode) {
  // 1. Fetch supplemental prompts
  const { data: prompts } = await supabase
    .from('supplemental_essay_prompts')
    .select('*')
    .eq('school_code', schoolCode)
    .eq('is_active', true)
    .order('prompt_group, prompt_number')
    .execute();

  // 2. Build form structure
  PROGRAM_DATA['college'] = {
    name: `${schoolInfo.name} Application`,
    school_code: schoolCode,
    steps: [
      basicProfileStep,
      academicsStep,
      commonAppEssayStep,
      ...generateSupplementalSteps(prompts, schoolInfo),
      activitiesStep,
      reviewStep
    ]
  };

  renderApplicationForm();
}

function generateSupplementalSteps(prompts, schoolInfo) {
  return prompts.map((prompt, index) => ({
    id: `supplemental-${prompt.id}`,
    title: `${schoolInfo.name} Essay ${index + 1}`,
    fields: [{
      id: `supplemental_${prompt.id}`,
      label: prompt.prompt_text,
      type: 'textarea',
      required: prompt.prompt_group !== 'optional',
      maxLength: (prompt.word_limit || 250) * 7,
      hint: `${prompt.word_limit} words max`
    }]
  }));
}
```

---

### Backend Edge Function

**File:** `/supabase/functions/generate-review/index.ts`

**Request:**
```typescript
{
  applicationId: string  // UUID
}
```

**Response:**
```typescript
{
  reviewId: string,                      // UUID
  decision: 'ACCEPT' | 'REJECT',
  application_id_display: string,        // RMA-2026-STF-7F3A
  overallScore: number,                  // 0-100
  student_email: string | null
}
```

**Binary Decision Logic:**
```typescript
function convertToBinaryDecision(
  reviewResult: ReviewResult,
  schoolData: SchoolCriteria
): 'ACCEPT' | 'REJECT' {
  const score = reviewResult.overall_assessment.score;
  const hasRedFlags = reviewResult.red_flags.some(f => f.severity === 'critical');

  // Critical red flags = automatic reject
  if (hasRedFlags) return 'REJECT';

  // Tier-based thresholds
  let threshold: number;
  if (schoolData.tier === 'ultra_selective') {
    threshold = 90;  // Harvard, MIT, Stanford
  } else if (schoolData.tier === 'highly_selective') {
    threshold = 85;  // Duke, Northwestern
  } else if (schoolData.tier === 'very_selective') {
    threshold = 80;
  } else {
    threshold = 75;
  }

  return score >= threshold ? 'ACCEPT' : 'REJECT';
}
```

**AI Prompt Template (Simplified):**
```
You are XCounselor v2, evaluating this application AS IF YOU WERE AN ADMISSIONS OFFICER AT [SCHOOL].

You must make a BINARY decision: ACCEPT or REJECT.

[SCHOOL] accepts approximately [RATE]. At this rate:
- ACCEPT: Applicant is in TOP TIER of pool
- REJECT: Applicant does not meet exceptionally high bar

## What [SCHOOL] Seeks
[School-specific criteria from database]

## Evaluation Components
Score 0-100 on:
1. Academics (20%)
2. Extracurriculars (35%)
3. Essays (30%)
4. University Fit (15%)

## Output Format
{
  "overall_assessment": {
    "score": 0-100,
    "rating": "...",
    "admission_likelihood": "..."
  },
  "component_scores": { ... },
  "weaknesses": [ ... ],
  "red_flags": [ ... ],
  "final_assessment": "..."
}
```

---

### CSS Design System

**Colors:**
```css
--color-bg-primary: #0D0D0D;         /* Dark background */
--color-bg-secondary: #1A1A1A;       /* Cards */
--color-text-primary: #FFFFFF;       /* Main text */
--color-text-secondary: #A3A3A3;     /* Secondary text */
--color-accent: #00D632;             /* Green CTA */
--color-border: rgba(255,255,255,0.08);
```

**Typography:**
```css
--font-sans: 'Outfit', sans-serif;
--font-display: 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Spacing:**
```css
--space-1: 0.25rem;  /* 4px */
--space-4: 1rem;     /* 16px */
--space-8: 2rem;     /* 32px */
--space-16: 4rem;    /* 64px */
```

**School-Specific Colors:**
- Stanford: `#8C1515` (Cardinal red)
- MIT: `#A31F34` (MIT red)
- Harvard: `#A51C30` (Crimson)

---

## Implementation Phases

### ✅ Phase 1: Foundation (COMPLETE)

**Database:**
- [x] Create `supplemental_essay_prompts` table
- [x] Create `application_versions` table
- [x] Create `application_outcomes` table
- [x] Alter `applications` table (add `application_id_display`, `student_email`, `version_number`)
- [x] Alter `reviews` table (add `decision_binary`, `detailed_feedback_unlocked`)
- [x] Create analytics views (`application_mismatches`, `school_accuracy_metrics`, `student_improvement_tracking`)
- [x] Seed Stanford prompts (8)
- [x] Seed MIT prompts (6)
- [x] Seed Harvard prompts (5)

**Frontend - School Selection:**
- [x] Add SCHOOLS constant to app.js
- [x] Create school selection page in index.html
- [x] Build renderSchoolGrid() function
- [x] Build filterSchools() function
- [x] Build selectSchool() function
- [x] Add CSS styling for school cards
- [x] Add helper functions (generateApplicationID, hashIdentifier, copyToClipboard)

**Status:** Ready for migration and visual testing

---

### Phase 2: Dynamic Form Builder (IN PROGRESS)

**Tasks:**
- [ ] Load supplemental prompts from database
- [ ] Generate dynamic form steps based on school
- [ ] Combine common fields + school-specific supplementals
- [ ] Handle form validation
- [ ] Save progress to localStorage
- [ ] Generate Application ID on submission
- [ ] Check for previous versions (version tracking)
- [ ] Create application and version records
- [ ] Call Edge Function for evaluation

**Estimated:** 2-3 days

---

### Phase 3: Results Page Redesign

**Tasks:**
- [ ] Show Application ID prominently with copy button
- [ ] Display binary decision (ACCEPT/REJECT) with score hint
- [ ] Build email capture form
- [ ] Update database on email capture
- [ ] Send email with Application ID and feedback link
- [ ] Show detailed feedback after unlock
- [ ] Add "Apply to Another College" button
- [ ] Add "Improve & Resubmit" button
- [ ] Add "Report Real Decision" link

**Estimated:** 2 days

---

### Phase 4: Backend Edge Function Updates

**Tasks:**
- [ ] Modify Edge Function to return binary decision
- [ ] Implement convertToBinaryDecision() logic with thresholds
- [ ] Update AI prompts for ACCEPT/REJECT focus
- [ ] Save decision_binary to reviews table
- [ ] Update application_versions with review_id and decision
- [ ] Return minimal response (no detailed feedback in initial response)
- [ ] Handle email capture timestamp

**Estimated:** 1-2 days

---

### Phase 5: Outcome Reporting System

**Tasks:**
- [ ] Create outcome reporting page UI
- [ ] Build application lookup by ID
- [ ] Show verification screen
- [ ] Build outcome submission form
- [ ] Handle file upload (decision letter)
- [ ] Detect mismatches (synthetic ≠ real)
- [ ] Save to application_outcomes table
- [ ] Show confirmation with mismatch notice
- [ ] Build mismatch review dashboard (admin)

**Estimated:** 2-3 days

---

### Phase 6: Testing & Polish

**Tasks:**
- [ ] End-to-end testing (all flows)
- [ ] Mobile responsiveness
- [ ] Browser compatibility (Chrome, Safari, Firefox)
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Email template testing
- [ ] Analytics integration
- [ ] SEO optimization

**Estimated:** 2-3 days

---

## Test Cases

### TC-001: School Selection

**Precondition:** User is on landing page

**Steps:**
1. Click "Choose Your College"
2. Verify college selection page loads
3. Verify 3 school cards visible (Stanford, MIT, Harvard)
4. Type "MIT" in search box
5. Verify only MIT card is visible
6. Clear search
7. Select "Ultra-Selective" from tier filter
8. Verify all 3 cards visible (all are ultra-selective)

**Expected Result:**
- ✅ Navigation works
- ✅ Search filters by name
- ✅ Tier filter works correctly
- ✅ All cards show school info (name, rank, rate, tagline, description)

---

### TC-002: Application ID Generation

**Precondition:** None

**Steps:**
1. Call `generateApplicationID('stanford')`
2. Verify format: `RMA-YYYY-XXX-AAAA`
3. Verify year is current year
4. Verify school prefix is 'STF'
5. Verify random suffix is 4 characters
6. Verify no confusing characters (I, O, 1, 0)
7. Generate 100 IDs, verify all unique

**Expected Result:**
- ✅ Format matches specification
- ✅ IDs are unique
- ✅ No confusing characters

---

### TC-003: First Application Submission

**Precondition:** Database is empty

**Steps:**
1. Select Stanford from college selection page
2. Fill out all form fields
3. Submit application
4. Wait for processing
5. Verify results page shows
6. Verify Application ID is displayed
7. Verify decision is shown (ACCEPT or REJECT)
8. Check database:
   - `applications` table has 1 record
   - `application_id_display` is set
   - `version_number` = 1
   - `previous_version_id` is NULL
   - `target_school` = 'stanford'
9. Check `application_versions` table:
   - 1 record exists
   - `version_number` = 1
   - `school_code` = 'stanford'
10. Check `reviews` table:
    - 1 record exists
    - `decision_binary` is set ('ACCEPT' or 'REJECT')
    - `detailed_feedback_unlocked` = false

**Expected Result:**
- ✅ Application submitted successfully
- ✅ All database records created correctly
- ✅ Version tracking initialized

---

### TC-004: Resubmission (Version 2)

**Precondition:** Student has already submitted v1 to Stanford

**Steps:**
1. Return to college selection page
2. Select Stanford again
3. Fill out application (with different content)
4. Submit
5. Verify new Application ID (different from v1)
6. Check database:
   - `applications` table has 2 records for this student+school
   - New record has `version_number` = 2
   - New record has `previous_version_id` = v1.id
7. Check `application_versions`:
   - 2 records exist
   - Same `student_identifier`
   - Same `school_code`
   - version_numbers: 1, 2
8. Verify AI evaluated independently (no memory of v1)

**Expected Result:**
- ✅ Version 2 created
- ✅ Linked to version 1
- ✅ Independent evaluation
- ✅ Version history tracked

---

### TC-005: Email Capture for Detailed Feedback

**Precondition:** Application submitted, results page showing REJECT

**Steps:**
1. Verify decision shows: "REJECT"
2. Verify detailed feedback is hidden
3. Verify email form is visible
4. Enter email: "test@example.com"
5. Click "Get Detailed Feedback"
6. Wait for processing
7. Verify detailed feedback appears
8. Check database:
   - `reviews.detailed_feedback_unlocked` = true
   - `reviews.email_captured_at` is set
   - `applications.student_email` = "test@example.com"
9. Check email sent (mock/test mode)

**Expected Result:**
- ✅ Feedback unlocked
- ✅ Email saved
- ✅ Timestamp recorded
- ✅ Email sent with Application ID

---

### TC-006: Binary Decision Logic

**Precondition:** Edge Function receives review result

**Test Cases:**

| School Tier        | Score | Red Flags | Expected Decision |
|--------------------|-------|-----------|-------------------|
| Ultra-Selective    | 92    | None      | ACCEPT            |
| Ultra-Selective    | 89    | None      | REJECT            |
| Ultra-Selective    | 95    | Critical  | REJECT            |
| Highly Selective   | 86    | None      | ACCEPT            |
| Highly Selective   | 84    | None      | REJECT            |
| Very Selective     | 81    | None      | ACCEPT            |
| Very Selective     | 79    | None      | REJECT            |

**Steps:**
1. For each test case:
2. Mock review result with specified score and red flags
3. Call `convertToBinaryDecision(review, schoolData)`
4. Verify decision matches expected

**Expected Result:**
- ✅ All test cases pass
- ✅ Thresholds are correct (90/85/80)
- ✅ Red flags always reject

---

### TC-007: Outcome Reporting - Match

**Precondition:** Student applied to Synthetic Stanford → ACCEPT

**Steps:**
1. Navigate to "Report Real Decision"
2. Enter Application ID: RMA-2026-STF-7F3A
3. Click "Look Up"
4. Verify application summary shows:
   - School: Stanford
   - Synthetic Decision: ACCEPT
   - Student name matches
5. Click "Yes, This Is Mine"
6. Select Real Decision: ACCEPT
7. Select Decision Type: Regular Decision
8. Enter Decision Date: March 28, 2026
9. Upload decision letter (PDF)
10. Select "No, submitted exactly as practiced"
11. Select "Yes, very helpful"
12. Click "Submit Report"
13. Verify confirmation page shows:
    - "✅ Prediction Matched!"
    - Both synthetic and real = ACCEPT
14. Check database:
    - `application_outcomes` table has 1 record
    - `real_decision` = 'ACCEPT'
    - `mismatch_detected` = false
    - `letter_upload_path` is set

**Expected Result:**
- ✅ Outcome reported successfully
- ✅ Match detected correctly
- ✅ File uploaded to Storage
- ✅ Confirmation shown

---

### TC-008: Outcome Reporting - Mismatch

**Precondition:** Student applied to Synthetic MIT → ACCEPT

**Steps:**
1. Report real decision: REJECT
2. Fill out all fields
3. Submit
4. Verify confirmation shows:
   - "🔍 Mismatch Detected"
   - Synthetic: ACCEPT
   - Real: REJECT
   - "We'll analyze what we missed"
5. Check database:
   - `mismatch_detected` = true
6. Verify appears in `application_mismatches` view

**Expected Result:**
- ✅ Mismatch detected
- ✅ Flagged for review
- ✅ Added to analytics view

---

### TC-009: Student Improvement Tracking

**Precondition:** Student has 3 versions for Stanford

**Steps:**
1. Query `student_improvement_tracking` view
2. Filter by student_identifier and school_code = 'stanford'
3. Verify results:
   - `total_attempts` = 3
   - `score_progression` = [72, 85, 92]
   - `decision_progression` = ['REJECT', 'REJECT', 'ACCEPT']
   - `score_improvement` = 92 - 72 = 20

**Expected Result:**
- ✅ Progression tracked correctly
- ✅ Improvement calculated
- ✅ Array ordering correct (chronological)

---

### TC-010: School Accuracy Metrics

**Precondition:** 10 students reported outcomes for Stanford

**Data:**
- 7 correct predictions (synthetic matched real)
- 3 mismatches
- Average score of accepted: 94
- Average score of rejected: 76

**Steps:**
1. Query `school_accuracy_metrics` view
2. Filter by target_school = 'stanford'
3. Verify results:
   - `total_outcomes_reported` = 10
   - `correct_predictions` = 7
   - `accuracy_percentage` = 70.00
   - `avg_score_accepted` ≈ 94
   - `avg_score_rejected` ≈ 76

**Expected Result:**
- ✅ Metrics calculated correctly
- ✅ Accuracy percentage accurate
- ✅ Average scores correct

---

## Success Metrics

### Launch Metrics (Month 1)

| Metric                          | Target    | Measurement Method                      |
|---------------------------------|-----------|-----------------------------------------|
| Total Applications Submitted    | 500+      | COUNT(*) FROM applications              |
| Email Capture Rate              | 50%+      | detailed_feedback_unlocked / total      |
| Resubmission Rate               | 20%+      | version_number > 1 / total              |
| Outcome Reports Submitted       | 10+       | COUNT(*) FROM application_outcomes      |
| System Error Rate               | <5%       | status = 'error' / total                |
| Average Review Generation Time  | <30s      | AVG(processing_time_ms)                 |

---

### Long-Term Metrics (6-12 Months)

| Metric                          | Target    | Measurement Method                      |
|---------------------------------|-----------|-----------------------------------------|
| Prediction Accuracy             | 70%+      | school_accuracy_metrics view            |
| Total Applications              | 10,000+   | COUNT(*) FROM applications              |
| Outcome Reports                 | 500+      | COUNT(*) FROM application_outcomes      |
| Schools with 50+ Applications   | 20+       | GROUP BY target_school                  |
| User Satisfaction (Helpful)     | 60%+      | synthetic_was_helpful = true / total    |
| Accuracy Improvement Over Time  | +10%      | Compare month 1 vs month 12             |

---

## Future Enhancements

### User Authentication & Profiles
- Login with email/password or Google
- Dashboard showing all applications
- Version comparison (side-by-side v1 vs v2)
- Track outcomes across all schools
- Export application history

### Advanced Analytics
- Compare competitiveness across schools
- See where you're most competitive
- Trend analysis (improving vs plateauing)
- Peer comparisons (anonymized)

### Additional Schools
- Expand to 20+ universities
- Tier 2 schools (very selective)
- State universities (UC system, UVA, UMich)
- Liberal arts colleges (Williams, Amherst)

### AI Improvements
- Fine-tune model on outcome data
- Adjust thresholds per school based on accuracy
- Add more nuanced decision factors
- Provide improvement suggestions (future feature)

### Email Campaigns
- Reminder to report outcome (3 months after application)
- Tips for improving rejected applications
- Success stories (accepted students)
- New school additions announcements

---

## Appendix

### Glossary

**Application ID:** Unique identifier for each application (RMA-2026-STF-7F3A format)

**Binary Decision:** ACCEPT or REJECT (no waitlist/defer)

**Mismatch:** When synthetic decision ≠ real decision

**Student Identifier:** Hashed email or session ID for privacy-preserving tracking

**Supplemental Essays:** School-specific essay questions beyond Common App

**Synthetic Admissions Officer:** AI that evaluates applications as if it were a real admissions officer

**Version:** Resubmission count for same student + school (v1, v2, v3...)

---

### Related Documents

- `PLAN.md`: Original implementation plan with phases
- `README.md`: Project overview and setup instructions
- `/counselor-knowledge/v2/`: School-specific evaluation criteria
- `/supabase/migrations/`: Database schema files

---

**Document Version:** 1.0
**Last Updated:** January 7, 2026
**Maintained By:** Development Team
