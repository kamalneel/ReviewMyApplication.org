# ReviewMyApplication.org

A synthetic college admissions system that allows students to practice applying to universities through AI-powered admissions officers, receiving realistic accept/reject decisions with detailed feedback.

## Overview

ReviewMyApplication.org enables students to:
- **Practice applications** unlimited times before applying to real schools
- **Receive realistic decisions** from AI admissions officers trained on real university criteria
- **Get detailed feedback** on their essays, activities, and overall profile
- **Understand school-specific requirements** for college, high school, and middle school admissions

## Project Status

### Phase 1: ✅ Complete
- Database architecture with Supabase integration
- School selection UI
- Comprehensive research on top 10 universities
- Counselor knowledge system (v1 & v2)

### Research Coverage
- **100% Complete**: Top 10 universities (Harvard, MIT, Stanford, Yale, Princeton, Columbia, Penn, Duke, UChicago, Northwestern)
- **100+ Universities catalogued** across 6 selectivity tiers
- **10 consulting/advisory resources** integrated
- **5 database resources** covering 3,000+ colleges

## Key Features

### 🎓 Multi-School Support
- College admissions (10 top universities with deep research)
- High school admissions
- Middle school admissions
- School-specific supplemental essays and evaluation criteria

### 🤖 AI-Powered Evaluation
- Holistic review matching real admissions processes
- Binary ACCEPT/REJECT decisions with detailed explanations
- Evaluation across 5 dimensions:
  - Academic Strength
  - Extracurricular Impact
  - Essay Quality
  - Recommendations
  - University Fit

### 📊 Comprehensive Database
- `college_admissions_database.json` (63KB) - Full research on top universities
- School-specific evaluation rubrics
- Common pitfalls and red flags
- Success patterns and examples

## Project Structure

```
/
├── index.html                          # Main web application
├── assets/                             # CSS and JavaScript
│   ├── styles.css
│   └── app.js
├── DESIGN.md                           # Complete design documentation
├── college_admissions_database.json   # Primary database
├── counselor-knowledge/                # AI counselor prompts and rubrics
│   ├── v1/                             # Version 1
│   └── v2/                             # Version 2 (current)
├── supabase/                           # Backend infrastructure
│   ├── migrations/                     # Database schema
│   └── functions/                      # Edge functions
├── mock-*.md                           # Sample applications for testing
└── *-admission-requirements.md        # Requirement documents
```

## Database Schema

See `supabase/migrations/` for complete schema:
- `001_initial_schema.sql` - Core tables for applications and reviews
- `002_storage_buckets.sql` - File storage configuration
- `003_synthetic_admissions_schema.sql` - Synthetic admissions system
- `004_seed_supplemental_prompts.sql` - School-specific essay prompts

## Key Documentation

- **[DESIGN.md](./DESIGN.md)** - Complete system architecture and implementation plan
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Research completion status and findings
- **[INTEGRATION_STATUS.md](./INTEGRATION_STATUS.md)** - Integration progress
- **[RESEARCH_COMPLETION_SUMMARY.md](./RESEARCH_COMPLETION_SUMMARY.md)** - Research methodology

## Getting Started

### Prerequisites
- Supabase account
- Node.js (for local development)

### Setup
1. Clone the repository
2. Configure Supabase (see `supabase/ENV_TEMPLATE.md`)
3. Run migrations: `supabase db reset`
4. Open `index.html` in a browser or deploy to a static host

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Storage**: Supabase Storage
- **AI**: Claude API (via Supabase Edge Functions)

## Research Sources

- 10 major consulting/advisory firms (IvyWise, PrepScholar, Ivy Coach, etc.)
- Official university admissions blogs and resources
- 5 comprehensive college databases (Common App, College Board, etc.)
- 100+ source URLs compiled

## Value Proposition

Unlike existing college counseling services that help students CREATE applications, ReviewMyApplication.org focuses on **PRACTICE EVALUATION**—letting students test their applications against realistic admissions criteria before the stakes are real.

**100% free forever** with unlimited attempts at any school.

## Future Roadmap

- Expand to 150+ universities
- Add top 30 liberal arts colleges
- UC system integration (Personal Insight Questions)
- Top 20 state flagships
- Real outcome feedback loop for AI improvement

## License

See LICENSE file for details.

## Contact

For questions or contributions, please open an issue on GitHub.

---

**Last Updated**: January 8, 2026
**Current Phase**: Phase 1 Complete, Phase 2 (UI/UX) In Progress
