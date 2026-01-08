/**
 * generate-review Edge Function (v2)
 * 
 * Sophisticated college admissions counselor that evaluates applications
 * against university-specific criteria and identifies weaknesses.
 * 
 * Key Features:
 * - University-specific evaluation criteria
 * - Weakness identification (no improvement suggestions)
 * - Activity tier assessment
 * - Narrative coherence analysis
 * - Red flag detection
 * 
 * Endpoint: POST /functions/v1/generate-review
 * Body: { applicationId: string }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import admissionsDatabase from './college_admissions_database.json' assert { type: 'json' }

// Types
interface ReviewRequest {
  applicationId: string
}

interface ComponentScore {
  score: number
  analysis: string
  [key: string]: unknown
}

interface Weakness {
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  weakness: string
  evidence: string
  school_expectation: string
}

interface RedFlag {
  flag: string
  severity: 'critical' | 'high' | 'medium'
  evidence: string
  impact: string
}

interface ReviewResult {
  target_school_analysis: {
    school: string
    tier: string
    acceptance_rate: string
    what_this_school_seeks: string[]
  }
  overall_assessment: {
    score: number
    rating: string
    admission_likelihood: string
  }
  component_scores: {
    academics: ComponentScore
    extracurriculars: ComponentScore
    essays: ComponentScore
    university_fit: ComponentScore
  }
  narrative_assessment: {
    has_clear_narrative: boolean
    archetype: string
    can_be_summarized_as: string
    coherence_issues: string[]
  }
  weaknesses: Weakness[]
  red_flags: RedFlag[]
  final_assessment: string
}

// Legacy format for compatibility
interface LegacyReviewResult {
  overallScore: number
  decision: 'likely_admit' | 'competitive' | 'developing' | 'needs_work'
  categoryScores: {
    essay: { score: number; summary: string; strengths: string[]; improvements: string[] }
    academics: { score: number; summary: string; strengths: string[]; improvements: string[] }
    activities: { score: number; summary: string; strengths: string[]; improvements: string[] }
    completeness: { score: number; summary: string; strengths: string[]; improvements: string[] }
  }
  feedbackText: {
    overview: string
    strengths: string[]
    areasForImprovement: string[]
    nextSteps: string[]
    encouragement: string
  }
  improvementTips: string[]
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Constants
const COUNSELOR_VERSION = 'v2.0.0'

// ═══════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE UNIVERSITY KNOWLEDGE BASE (v3 - JSON Database Integration)
// Loaded from college_admissions_database.json (1,822 lines, 150-200 data points per university)
// ═══════════════════════════════════════════════════════════════════════════

// JSON Database Interfaces (matches college_admissions_database.json structure)
interface UniversityData {
  university: string
  ranking: string
  acceptance_rate: string
  admissions_office_urls: string[]
  counselor_perspectives: {
    overall_philosophy: string
    holistic_review: string
    what_they_seek: string[]
    evaluation_process: string
    memorable_candidates: string
  }
  academic_criteria: {
    gpa_expectations: string
    test_scores: {
      sat_range: string
      act_range: string
      testing_policy: string
      superscoring: string
    }
    course_rigor: string
    academic_interests: string
  }
  essay_requirements: {
    supplement_questions: string[]
    essay_philosophy: string
    what_makes_strong_essays: string[]
    common_essay_mistakes: string[]
  }
  extracurriculars: {
    importance: string
    depth_vs_breadth: string
    leadership: string
    impact_and_initiative: string
    recognition_level: string
    unique_preferences?: string[]
  }
  letters_of_recommendation: {
    requirements: string
    what_reviewers_look_for: string[]
    importance: string
  }
  demonstrated_interest: {
    tracked: boolean
    interviews: string
  }
  evaluation_rubrics: {
    selection_process: string
    committee_review: string
    decision_framework: string
    key_evaluation_points: string[]
  }
  unique_insights: string[]
  common_pitfalls: string[]
  red_flags?: string[]
}

interface AdmissionsDatabase {
  metadata: {
    project_name: string
    version: string
    last_updated: string
    total_colleges_catalogued: number
    colleges_with_deep_research: number
    description: string
  }
  top_10_universities_deep_research: UniversityData[]
  [key: string]: unknown
}

// Legacy interface for backward compatibility
interface SchoolCriteria {
  name: string
  tier: 'ultra_selective' | 'highly_selective' | 'very_selective' | 'selective'
  acceptance_rate: string
  research_depth: 'full' | 'partial' | 'tier_default'
  
  academic_expectations: {
    gpa_expectation: string
    gpa_percentile: string
    sat_25th: number
    sat_75th: number
    sat_average: number
    testing_required: boolean
    course_rigor_notes: string
  }
  
  essay_philosophy: {
    what_they_seek: string[]
    strong_essay_markers: string[]
    common_essay_pitfalls: string[]
    key_quote: string
  }
  
  extracurricular_expectations: {
    importance: string
    depth_vs_breadth: string
    recognition_level: string
    unique_preferences: string[]
    key_quote: string
  }
  
  what_they_seek: string[]
  common_pitfalls: string[]
  unique_differentiators: string[]
  counselor_perspective: string

  evaluation_notes: {
    process: string
    committee_info: string
    key_insight: string
  }

  // Enhanced fields from comprehensive JSON database (optional for backward compatibility)
  key?: string
  red_flags?: string[]
  letters_of_recommendation?: {
    requirements: string
    what_reviewers_look_for: string[]
    importance: string
  }
  demonstrated_interest?: {
    tracked: boolean
    interviews: string
  }
  admissions_urls?: string[]
}

// FULLY RESEARCHED SCHOOLS
const UNIVERSITY_DATA: Record<string, SchoolCriteria> = {
  harvard: {
    name: 'Harvard University',
    tier: 'ultra_selective',
    acceptance_rate: '~3%',
    research_depth: 'full',
    
    academic_expectations: {
      gpa_expectation: 'Top 10% of graduating class (vast majority)',
      gpa_percentile: 'Top 10%',
      sat_25th: 1470,
      sat_75th: 1600,
      sat_average: 1540,
      testing_required: true,
      course_rigor_notes: 'Most rigorous courses available at high school'
    },
    
    essay_philosophy: {
      what_they_seek: [
        'Authenticity and genuine voice',
        'Reflection on life experiences',
        'Clear vision for engagement at Harvard',
        'Future aspirations'
      ],
      strong_essay_markers: [
        'Clear narrative arc - "the notable scientist," "the future leader," "the bridge-builder"',
        'Specific examples only this person would know',
        'Evidence of overcoming adversity',
        'Genuine self-reflection and growth'
      ],
      common_essay_pitfalls: [
        'Generic essays without authentic voice',
        'No clear identity or memorable quality',
        'Listing achievements instead of reflecting on them',
        'Essays that could be written by anyone'
      ],
      key_quote: 'Students with clear arc to their application—the notable scientist, the future political leader, the bridge-builder in times of division—have best chances.'
    },
    
    extracurricular_expectations: {
      importance: 'Critical - distinction in extracurricular activities is KEY differentiator',
      depth_vs_breadth: 'Depth and distinction matter MORE than breadth',
      recognition_level: 'Many admitted students have STATE or NATIONAL-level recognition',
      unique_preferences: [
        'Community involvement and contribution',
        'Demonstrated impact on others',
        'Initiative beyond just participation'
      ],
      key_quote: 'Distinction in extracurricular activities is key differentiator. Depth matters more than breadth.'
    },
    
    what_they_seek: [
      'Academic accomplishment in high school',
      'Community involvement and leadership',
      'Distinction in extracurricular activities',
      'Personal qualities and character',
      'Ability to overcome adversity',
      'Students who will contribute to Harvard\'s mission'
    ],
    
    common_pitfalls: [
      'Being "just" a well-rounded student with good scores',
      'Lacking clear passion or specialization',
      'Not demonstrating impact or achievement beyond grades',
      'Generic essays without authentic voice',
      'Spreading activities too thin without depth'
    ],
    
    unique_differentiators: [
      'Looks for clear "narrative arc" in applications',
      'Values students who can be summarized in a memorable way',
      '62% of cross-admits choose Harvard over Stanford',
      '75% choose Harvard over Princeton',
      'Test scores are baseline filters, NOT differentiators'
    ],
    
    counselor_perspective: 'At Harvard, there is NO formula for gaining admission. Academic accomplishment is important, but the admissions committee considers community involvement, leadership, distinction in extracurricular activities, and personal qualities. Harvard admits ~3% of applicants—most competitive in nation. Students who demonstrate deep passion, grit, and work ethic have best chances. The question is NOT "Is this a good student?" but "Why THIS student over 40,000+ other excellent applicants?"',
    
    evaluation_notes: {
      process: 'Applications discussed after initial review, must stand out beyond test scores and grades',
      committee_info: 'Holistic review by admissions committee with consensus-based decisions',
      key_insight: 'Most rejected applicants have perfect or near-perfect GPAs. What distinguishes admits: narrative, distinctiveness, authenticity.'
    }
  },
  
  mit: {
    name: 'Massachusetts Institute of Technology',
    tier: 'ultra_selective',
    acceptance_rate: '~4%',
    research_depth: 'full',
    
    academic_expectations: {
      gpa_expectation: 'Top 10% of class',
      gpa_percentile: 'Top 10% (100% of admitted students who submitted class rank)',
      sat_25th: 1510,
      sat_75th: 1570,
      sat_average: 1540,
      testing_required: true,
      course_rigor_notes: 'Most demanding courses, especially in math and science. ALL students take foundational math/science regardless of major.'
    },
    
    essay_philosophy: {
      what_they_seek: [
        'Demonstrating hands-on experience and MAKING',
        'Showing collaborative spirit',
        'Evidence of taking thoughtful risks',
        'Balance between academics and personal interests'
      ],
      strong_essay_markers: [
        'Evidence of building, creating, or making things',
        'Stories of collaborative problem-solving',
        'Examples of taking risks and learning from failure',
        'Genuine passion, NOT resume-building'
      ],
      common_essay_pitfalls: [
        'Focusing solely on academic achievement without showing hands-on making',
        'Not demonstrating collaborative spirit',
        'Appearing to do activities just for resume building'
      ],
      key_quote: 'Don\'t expect million things. Put heart into few things you truly care about.'
    },
    
    extracurricular_expectations: {
      importance: 'Very high - evaluated on TIER system',
      depth_vs_breadth: 'Quality over quantity - depth in few areas beats breadth',
      recognition_level: 'Tier 1 (national/international) most competitive, but IMPACT matters more than level',
      unique_preferences: [
        'Hands-on makers who build and create',
        'Collaborative problem-solvers',
        'Risk-takers who learn from failure',
        'Students who get "metaphorically or literally" dirty trying something new'
      ],
      key_quote: 'Impact doesn\'t require curing diseases—tutoring a kid in math changes the world, advocating for change matters.'
    },
    
    what_they_seek: [
      'Alignment with MIT culture (Mens et Manus - Mind and Hand)',
      'Hands-on makers and doers',
      'Initiative and impact-makers',
      'Collaborative spirit',
      'Risk-takers and resilient students',
      'Balance between work and life'
    ],
    
    common_pitfalls: [
      'Focusing solely on academic achievement without showing hands-on making',
      'Not demonstrating collaborative spirit or community care',
      'Appearing to do activities just for resume building',
      'Lacking balance between work and personal interests',
      'Not showing resilience or willingness to take risks',
      'Presenting as lone genius rather than collaborator'
    ],
    
    unique_differentiators: [
      'Latin motto "Mens et Manus" (Mind and Hand) reflects hands-on philosophy',
      'Innovation is risky and messy - MIT values students who embrace this',
      'Community values are critical: thoughtful people who lift each other up',
      'At least DOZEN people discuss each application before admit',
      'Reinstated testing requirement based on equity research'
    ],
    
    counselor_perspective: 'While grades and scores are important for MIT, it\'s really the MATCH between applicant and the Institute that drives selection. MIT\'s mission is to use science, technology, and other areas of scholarship to make the world better. We seek students who are hands-on makers, collaborative, and willing to take risks. The ideal MIT student has a garage full of half-finished projects, not just a perfect transcript.',
    
    evaluation_notes: {
      process: 'Application read by senior admissions officer holistically, strong applications read by additional officers',
      committee_info: 'At least a DOZEN people significantly discuss and debate an application before admit pile',
      key_insight: 'It\'s the MATCH between applicant and MIT culture that matters most, not just achievements.'
    }
  },
  
  stanford: {
    name: 'Stanford University',
    tier: 'ultra_selective',
    acceptance_rate: '~4%',
    research_depth: 'partial',
    
    academic_expectations: {
      gpa_expectation: 'Top 5% of class',
      gpa_percentile: 'Top 5%',
      sat_25th: 1500,
      sat_75th: 1580,
      sat_average: 1540,
      testing_required: true,
      course_rigor_notes: 'Highest rigor available, especially for intended major area'
    },
    
    essay_philosophy: {
      what_they_seek: [
        'Intellectual vitality and genuine curiosity',
        'Evidence of innovation and entrepreneurship',
        'Authentic voice and genuine passion',
        'Forward-thinking mindset'
      ],
      strong_essay_markers: [
        'Intellectual curiosity that extends beyond classroom',
        'Evidence of innovation or creating something new',
        'Genuine passion that comes through in voice'
      ],
      common_essay_pitfalls: [
        'Focusing on achievements without showing thought process',
        'Not demonstrating intellectual curiosity',
        'Generic essays that don\'t show personality'
      ],
      key_quote: 'Stanford weighs essays and "intellectual ethos" heavily in admissions decisions.'
    },
    
    extracurricular_expectations: {
      importance: 'Very high - innovation and entrepreneurship valued',
      depth_vs_breadth: 'Deep commitment to areas of genuine interest',
      recognition_level: 'National/international level preferred but impact matters',
      unique_preferences: [
        'Entrepreneurial mindset',
        'Innovation and creating new things',
        'Silicon Valley connection/tech orientation'
      ],
      key_quote: 'Stanford seeks students who will change the world through innovation.'
    },
    
    what_they_seek: [
      'Intellectual vitality',
      'Innovative thinking',
      'Entrepreneurial spirit',
      'Authentic passion',
      'Future world-changers'
    ],
    
    common_pitfalls: [
      'Not showing intellectual curiosity beyond grades',
      'Lacking innovative or entrepreneurial examples',
      'Being well-rounded without distinction',
      'Not demonstrating forward-thinking mindset'
    ],
    
    unique_differentiators: [
      'Silicon Valley location creates tech/entrepreneurship culture',
      'Essays weighted VERY heavily',
      'Intellectual vitality is explicit criterion',
      '74% of cross-admits choose Stanford over Princeton'
    ],
    
    counselor_perspective: 'Stanford looks for students who will shape the future. Intellectual vitality—genuine curiosity that extends beyond the classroom—is critical. They want students who will take advantage of their Silicon Valley location and entrepreneurial ecosystem. Stanford cares deeply about authenticity - they can spot consultant-polished applications.',
    
    evaluation_notes: {
      process: 'Holistic review with emphasis on essays',
      committee_info: 'Multiple readers with focus on intellectual vitality',
      key_insight: 'Essays and intellectual ethos weighted more heavily than at peer institutions'
    }
  },
  
  yale: {
    name: 'Yale University',
    tier: 'ultra_selective',
    acceptance_rate: '~4.5%',
    research_depth: 'partial',
    
    academic_expectations: {
      gpa_expectation: 'Top 10% of class',
      gpa_percentile: 'Top 10%',
      sat_25th: 1470,
      sat_75th: 1570,
      sat_average: 1520,
      testing_required: true,
      course_rigor_notes: 'Challenging courses with focus on intellectual depth'
    },
    
    essay_philosophy: {
      what_they_seek: [
        'Humanities-driven intellectual curiosity',
        'Deep thinking and analysis',
        'Genuine intellectual engagement',
        'Personal voice and perspective'
      ],
      strong_essay_markers: [
        'Evidence of deep, nuanced thinking',
        'Humanities/liberal arts engagement',
        'Genuine curiosity about ideas'
      ],
      common_essay_pitfalls: [
        'Surface-level treatment of topics',
        'Not showing intellectual depth',
        'Focusing only on STEM without broader interests'
      ],
      key_quote: 'Yale values humanities-driven intellectual curiosity and the life of the mind.'
    },
    
    extracurricular_expectations: {
      importance: 'High - but intellectual engagement matters most',
      depth_vs_breadth: 'Depth in areas of genuine intellectual interest',
      recognition_level: 'Achievement important but intellectual depth more so',
      unique_preferences: [
        'Intellectual pursuits beyond requirements',
        'Writing, debate, and humanities activities',
        'Community engagement with intellectual component'
      ],
      key_quote: 'Yale seeks students who engage deeply with ideas and contribute to intellectual community.'
    },
    
    what_they_seek: [
      'Intellectual curiosity',
      'Humanities orientation',
      'Deep thinkers',
      'Strong writers',
      'Community contributors'
    ],
    
    common_pitfalls: [
      'Not showing intellectual depth',
      'Focusing only on achievements without ideas',
      'Lacking humanities/liberal arts engagement',
      'Superficial treatment of interests'
    ],
    
    unique_differentiators: [
      'Returned to test-required for 2024-2025',
      'Humanities-driven intellectual curiosity emphasized',
      '54% of cross-admits choose Yale over Stanford',
      'Three recommendation letters required'
    ],
    
    counselor_perspective: 'Yale values intellectual curiosity, especially with a humanities orientation. They seek students who will contribute to Yale\'s intellectual community and engage deeply with ideas. The residential college system means fit with Yale\'s collaborative culture matters.',
    
    evaluation_notes: {
      process: 'Holistic review with three recommendation letters',
      committee_info: 'Emphasis on intellectual fit with Yale community',
      key_insight: 'Humanities-driven curiosity distinguishes Yale from peer institutions'
    }
  },
  
  princeton: {
    name: 'Princeton University',
    tier: 'ultra_selective',
    acceptance_rate: '~5%',
    research_depth: 'partial',
    
    academic_expectations: {
      gpa_expectation: 'Top 5-10% of class',
      gpa_percentile: 'Top 10%',
      sat_25th: 1500,
      sat_75th: 1580,
      sat_average: 1540,
      testing_required: true,
      course_rigor_notes: 'Most rigorous available, especially for STEM and policy interests'
    },
    
    essay_philosophy: {
      what_they_seek: [
        'Undergraduate focus and engagement',
        'Intellectual curiosity',
        'Community contribution',
        'Authentic voice'
      ],
      strong_essay_markers: [
        'Evidence of wanting undergraduate-focused experience',
        'Genuine intellectual interests',
        'How you\'ll contribute to Princeton community'
      ],
      common_essay_pitfalls: [
        'Not understanding Princeton\'s undergraduate focus',
        'Generic Ivy League essay',
        'Not showing specific Princeton fit'
      ],
      key_quote: 'Princeton\'s undergraduate focus means they want students fully engaged in the undergraduate experience.'
    },
    
    extracurricular_expectations: {
      importance: 'High - especially for STEM and public policy',
      depth_vs_breadth: 'Depth in areas related to academic interests',
      recognition_level: 'National level for competitive admits',
      unique_preferences: [
        'Research experience for STEM applicants',
        'Public service for policy-oriented applicants',
        'Community engagement'
      ],
      key_quote: 'Princeton is particularly competitive for STEM and public policy majors.'
    },
    
    what_they_seek: [
      'Strong undergraduate focus',
      'Academic excellence especially in STEM/policy',
      'Community contributors',
      'Service-oriented students'
    ],
    
    common_pitfalls: [
      'Not understanding undergraduate focus',
      'Applying without specific Princeton fit',
      'Lacking service/community component',
      'Generic Ivy approach'
    ],
    
    unique_differentiators: [
      'Ranked #1 by US News eleven times',
      'Particularly competitive for STEM and public policy',
      'Strong emphasis on undergraduate experience (no professional schools)',
      '75% of cross-admits choose Harvard over Princeton'
    ],
    
    counselor_perspective: 'Princeton\'s unique positioning as purely undergraduate-focused Ivy means they seek students who will fully engage in the undergraduate experience. Particularly competitive for STEM and public policy. Service and community are valued.',
    
    evaluation_notes: {
      process: 'Holistic review with undergraduate focus',
      committee_info: 'Dean Richardson discusses testing, rigor, AI, and "what we\'re really looking for"',
      key_insight: 'The most undergraduate-focused Ivy - they want students who want THAT experience'
    }
  },
  
  uchicago: {
    name: 'University of Chicago',
    tier: 'ultra_selective',
    acceptance_rate: '~5%',
    research_depth: 'partial',
    
    academic_expectations: {
      gpa_expectation: 'Top 10% of class',
      gpa_percentile: 'Top 10%',
      sat_25th: 1480,
      sat_75th: 1580,
      sat_average: 1530,
      testing_required: true,
      course_rigor_notes: 'Rigorous academic environment, Core Curriculum'
    },
    
    essay_philosophy: {
      what_they_seek: [
        'Intellectual passion - life of the mind',
        'Creative and original thinking',
        'Willingness to engage with difficult questions',
        'Genuine love of ideas'
      ],
      strong_essay_markers: [
        'Taking creative risks on quirky prompts',
        'Showing genuine intellectual curiosity',
        'Original thinking and analysis'
      ],
      common_essay_pitfalls: [
        'Playing it safe on quirky essay prompts',
        'Not showing genuine intellectual curiosity',
        'Taking yourself too seriously'
      ],
      key_quote: 'UChicago wants intellectual weirdos in the best sense.'
    },
    
    extracurricular_expectations: {
      importance: 'High - but intellectual pursuits valued most',
      depth_vs_breadth: 'Depth in intellectual interests',
      recognition_level: 'Intellectual achievement matters more than conventional recognition',
      unique_preferences: [
        'Academic clubs and competitions',
        'Research and intellectual exploration',
        'Creative pursuits'
      ],
      key_quote: 'Students who argue about philosophy at lunch and get genuinely excited about abstract concepts.'
    },
    
    what_they_seek: [
      'Intellectual passion',
      'Love of ideas for their own sake',
      'Creative and original thinking',
      'Rigorous thinkers'
    ],
    
    common_pitfalls: [
      'Playing it safe on quirky essay prompts',
      'Not showing genuine intellectual curiosity',
      'Taking yourself too seriously',
      'Conventional approach to unconventional prompts'
    ],
    
    unique_differentiators: [
      'Famous unconventional essay prompts',
      'Rigorous "life of the mind" culture',
      'Core Curriculum like Columbia',
      'Early Decision 0 program'
    ],
    
    counselor_perspective: 'UChicago wants intellectual weirdos in the best sense. They value students who love ideas, argue about philosophy at lunch, and get genuinely excited about abstract concepts. Their quirky essay prompts are legendary - take creative risks!',
    
    evaluation_notes: {
      process: 'Holistic review valuing intellectual passion',
      committee_info: 'Look for genuine intellectual curiosity',
      key_insight: 'The "life of the mind" is not just a slogan - it\'s what they evaluate'
    }
  }
}

// Additional schools with partial research
const PARTIAL_SCHOOLS: Record<string, Partial<SchoolCriteria>> = {
  columbia: {
    name: 'Columbia University',
    tier: 'ultra_selective',
    acceptance_rate: '~4.2%',
    research_depth: 'partial',
    unique_differentiators: [
      'Core Curriculum is distinctive feature',
      'New York City location',
      'Second lowest Ivy acceptance rate after Harvard'
    ],
    counselor_perspective: 'Columbia\'s Core Curriculum shapes admissions - they seek students excited about broad intellectual exploration. NYC location means they want students who\'ll engage with the city.',
    what_they_seek: ['Intellectual breadth', 'Urban engagement', 'Core Curriculum enthusiasm'],
    common_pitfalls: ['Not understanding Core Curriculum', 'Not showing NYC fit', 'Generic Ivy essay']
  },
  
  penn: {
    name: 'University of Pennsylvania',
    tier: 'ultra_selective',
    acceptance_rate: '~4.2%',
    research_depth: 'partial',
    unique_differentiators: [
      'Wharton School is particularly competitive',
      'Interdisciplinary spirit is key value',
      'Different essays for different schools within Penn'
    ],
    counselor_perspective: 'Penn values interdisciplinary thinking. Applicants to Wharton face especially stiff competition. Show how you\'ll take advantage of Penn\'s collaborative, cross-school culture.',
    what_they_seek: ['Interdisciplinary thinking', 'Collaborative spirit', 'School-specific fit'],
    common_pitfalls: ['Applying to Wharton without business depth', 'Not showing interdisciplinary interest', 'Generic "Why Penn"']
  },
  
  duke: {
    name: 'Duke University',
    tier: 'ultra_selective',
    acceptance_rate: '~6%',
    research_depth: 'partial',
    unique_differentiators: [
      'Often called "Southern Ivy"',
      'Strong campus pride and culture',
      'Pratt School of Engineering known for research'
    ],
    counselor_perspective: 'Duke seeks students eager to connect learning with purpose. Campus culture and pride are important - show you understand and want to be part of Duke\'s community.',
    what_they_seek: ['Purpose-driven learning', 'Campus engagement', 'Community contribution'],
    common_pitfalls: ['Not showing Duke-specific fit', 'Ignoring campus culture', 'Pure academic focus']
  },
  
  northwestern: {
    name: 'Northwestern University',
    tier: 'highly_selective',
    acceptance_rate: '~7%',
    research_depth: 'partial',
    unique_differentiators: [
      'Strong pre-professional programs',
      'Known for journalism, theater, interdisciplinary studies',
      'Near Chicago'
    ],
    counselor_perspective: 'Northwestern balances academic rigor with pre-professional preparation. Strong in communications, theater, and interdisciplinary work. Show specific fit with their programs.',
    what_they_seek: ['Pre-professional focus', 'Program-specific interest', 'Interdisciplinary thinking'],
    common_pitfalls: ['Not showing specific program fit', 'Generic "top school" approach']
  },
  
  caltech: {
    name: 'California Institute of Technology',
    tier: 'ultra_selective',
    acceptance_rate: '~3%',
    research_depth: 'partial',
    unique_differentiators: [
      'Smallest elite research university',
      'Intense STEM focus',
      'Collaborative culture despite competition'
    ],
    counselor_perspective: 'Caltech is for students who live and breathe STEM. Small size means intense academic environment. Research experience almost expected. Not for students unsure about science.',
    what_they_seek: ['Pure STEM passion', 'Research experience', 'Collaborative spirit'],
    common_pitfalls: ['Unclear STEM direction', 'No research experience', 'Lone wolf approach']
  },
  
  brown: {
    name: 'Brown University',
    tier: 'ultra_selective',
    acceptance_rate: '~5%',
    research_depth: 'partial',
    unique_differentiators: [
      'Open curriculum - no distribution requirements',
      'Student-driven academic experience',
      'Values intellectual risk-taking'
    ],
    counselor_perspective: 'Brown\'s open curriculum attracts self-directed learners. Show you can handle freedom and will use it purposefully. They value intellectual risk-takers who chart their own path.',
    what_they_seek: ['Self-direction', 'Intellectual curiosity', 'Academic independence'],
    common_pitfalls: ['Not understanding open curriculum', 'Needing external structure', 'Not showing self-direction']
  },
  
  dartmouth: {
    name: 'Dartmouth College',
    tier: 'ultra_selective',
    acceptance_rate: '~6%',
    research_depth: 'partial',
    unique_differentiators: [
      'Undergraduate focus like Princeton',
      'Strong liberal arts tradition',
      'Rural New Hampshire location'
    ],
    counselor_perspective: 'Dartmouth\'s undergraduate focus and rural location create unique culture. They seek students who want close faculty relationships and will embrace the outdoors and community.',
    what_they_seek: ['Undergraduate focus', 'Community engagement', 'Outdoor/rural fit'],
    common_pitfalls: ['Wanting big city life', 'Not valuing small community', 'Research-over-teaching focus']
  },
  
  cornell: {
    name: 'Cornell University',
    tier: 'ultra_selective',
    acceptance_rate: '~7.3%',
    research_depth: 'partial',
    unique_differentiators: [
      'Largest Ivy with diverse schools',
      'Each college has different admissions',
      'Land-grant mission means accessibility focus'
    ],
    counselor_perspective: 'Cornell\'s seven undergraduate colleges each have different personalities. Be specific about which college and why. Their land-grant mission means they value access and practical application.',
    what_they_seek: ['College-specific fit', 'Practical application', 'Diverse interests'],
    common_pitfalls: ['Generic Cornell application', 'Wrong college choice', 'Not understanding diversity of schools']
  }
}

// Selectivity tier defaults (for schools without specific data)
const TIER_DEFAULTS: Record<string, Partial<SchoolCriteria>> = {
  ultra_selective: {
    tier: 'ultra_selective',
    acceptance_rate: 'Under 10%',
    research_depth: 'tier_default',
    academic_expectations: {
      gpa_expectation: 'Top 10% of class',
      gpa_percentile: 'Top 10%',
      sat_25th: 1450,
      sat_75th: 1570,
      sat_average: 1510,
      testing_required: true,
      course_rigor_notes: 'Most rigorous courses available'
    },
    essay_philosophy: {
      what_they_seek: ['Authentic voice', 'Genuine passion', 'Clear narrative'],
      strong_essay_markers: ['Specific examples', 'Self-reflection', 'Memorable quality'],
      common_essay_pitfalls: ['Generic essays', 'No distinctive voice', 'Resume listing'],
      key_quote: 'At ultra-selective schools, essays must make you memorable among 40,000+ applicants.'
    },
    extracurricular_expectations: {
      importance: 'Critical',
      depth_vs_breadth: 'Depth in 2-3 areas far better than breadth',
      recognition_level: 'State/national level recognition highly valued',
      unique_preferences: ['Tier 1-2 activities', 'Demonstrated impact'],
      key_quote: 'At these schools, everyone has good grades. Extracurriculars differentiate.'
    },
    what_they_seek: [
      'World-class achievement or clear potential',
      'Distinctive narrative and identity',
      'Genuine fit with institutional mission'
    ],
    common_pitfalls: [
      'Well-rounded but not distinguished',
      'No clear narrative',
      'Activities without depth',
      'Generic essays'
    ],
    counselor_perspective: 'Ultra-selective schools (under 10% acceptance) reject most excellent applicants. Academics are a baseline filter. What distinguishes admits: depth over breadth, clear narrative, exceptional achievement in focused areas.'
  },
  
  highly_selective: {
    tier: 'highly_selective',
    acceptance_rate: '10-20%',
    research_depth: 'tier_default',
    academic_expectations: {
      gpa_expectation: 'Top 15-20% of class',
      gpa_percentile: 'Top 20%',
      sat_25th: 1350,
      sat_75th: 1500,
      sat_average: 1425,
      testing_required: true,
      course_rigor_notes: 'Rigorous courses with strong performance'
    },
    essay_philosophy: {
      what_they_seek: ['Genuine voice', 'Specific examples', 'Growth narrative'],
      strong_essay_markers: ['Authenticity', 'Self-awareness', 'Specific details'],
      common_essay_pitfalls: ['Clichés', 'Lack of specificity', 'Overpolished voice'],
      key_quote: 'Essays should reveal who you are beyond your transcript.'
    },
    extracurricular_expectations: {
      importance: 'High',
      depth_vs_breadth: 'Prefer depth with some breadth',
      recognition_level: 'Regional/state recognition helpful',
      unique_preferences: ['Consistent commitment', 'Leadership roles'],
      key_quote: 'Show sustained commitment and growth in your activities.'
    },
    what_they_seek: [
      'Strong achievement in focus areas',
      'Clear passion and commitment',
      'Authentic essays with personality'
    ],
    common_pitfalls: [
      'No clear passion',
      'Too many activities without depth',
      'Generic "why us" essay'
    ],
    counselor_perspective: 'Highly selective schools look for strong academics plus demonstrated passion. While not as intensely competitive as ultra-selective, they still reject many qualified applicants.'
  },
  
  very_selective: {
    tier: 'very_selective',
    acceptance_rate: '20-35%',
    research_depth: 'tier_default',
    academic_expectations: {
      gpa_expectation: 'Top 25-30% of class',
      gpa_percentile: 'Top 30%',
      sat_25th: 1250,
      sat_75th: 1420,
      sat_average: 1335,
      testing_required: true,
      course_rigor_notes: 'Challenging courses relative to what\'s available'
    },
    essay_philosophy: {
      what_they_seek: ['Personal voice', 'Genuine interest', 'Good writing'],
      strong_essay_markers: ['Clear writing', 'Personal examples', 'Enthusiasm'],
      common_essay_pitfalls: ['Generic content', 'Poor proofreading', 'Lack of voice'],
      key_quote: 'Show us who you are and why this school matters to you.'
    },
    extracurricular_expectations: {
      importance: 'Moderate to high',
      depth_vs_breadth: 'Balance of depth and breadth acceptable',
      recognition_level: 'School/local recognition valued',
      unique_preferences: ['Consistent involvement', 'Genuine interests'],
      key_quote: 'Demonstrate genuine engagement in activities you care about.'
    },
    what_they_seek: [
      'Demonstrated commitment and leadership',
      'Clear genuine interest in school',
      'Strong essays'
    ],
    common_pitfalls: [
      'No extracurricular involvement',
      'Generic application',
      'Not showing specific interest in school'
    ],
    counselor_perspective: 'Very selective schools seek strong students with genuine interests. Demonstrated interest in the specific school often matters more here than at ultra-selective institutions.'
  },
  
  selective: {
    tier: 'selective',
    acceptance_rate: '35-50%',
    research_depth: 'tier_default',
    academic_expectations: {
      gpa_expectation: 'Top 40% of class',
      gpa_percentile: 'Top 40%',
      sat_25th: 1150,
      sat_75th: 1350,
      sat_average: 1250,
      testing_required: false,
      course_rigor_notes: 'College prep curriculum with some challenging courses'
    },
    essay_philosophy: {
      what_they_seek: ['Personal voice', 'Interest in school', 'Clear writing'],
      strong_essay_markers: ['Genuine interest', 'Personal examples', 'Good writing'],
      common_essay_pitfalls: ['Errors', 'Generic content', 'Not answering prompt'],
      key_quote: 'Tell us about yourself and why you want to attend.'
    },
    extracurricular_expectations: {
      importance: 'Moderate',
      depth_vs_breadth: 'Some involvement expected',
      recognition_level: 'Participation valued',
      unique_preferences: ['Genuine interests', 'Work experience also valued'],
      key_quote: 'Show us how you spend your time outside of class.'
    },
    what_they_seek: [
      'Solid academic preparation',
      'Some extracurricular involvement',
      'Clear interest in attending'
    ],
    common_pitfalls: [
      'Incomplete application',
      'No extracurricular involvement at all',
      'Generic "why us"'
    ],
    counselor_perspective: 'Selective schools value well-prepared students with genuine interests. Strong applications show both academic readiness and personal engagement.'
  }
}

// Function to look up school data
function getSchoolData(schoolName: string | undefined): SchoolCriteria {
  if (!schoolName) {
    return {
      name: 'Selective University',
      ...TIER_DEFAULTS.ultra_selective
    } as SchoolCriteria
  }
  
  const normalized = schoolName.toLowerCase().trim()
  
  // Check fully researched schools
  for (const [key, school] of Object.entries(UNIVERSITY_DATA)) {
    if (normalized.includes(key)) {
      return school
    }
  }
  
  // Check partial schools
  for (const [key, school] of Object.entries(PARTIAL_SCHOOLS)) {
    if (normalized.includes(key)) {
      // Merge with tier defaults
      const tier = school.tier || 'ultra_selective'
      const defaults = TIER_DEFAULTS[tier]
      return {
        ...defaults,
        ...school,
        name: school.name || schoolName
      } as SchoolCriteria
    }
  }
  
  // Determine tier from keywords
  let tier: keyof typeof TIER_DEFAULTS = 'highly_selective'
  if (normalized.includes('state') || (normalized.includes('university of') && !normalized.includes('chicago') && !normalized.includes('michigan') && !normalized.includes('virginia'))) {
    tier = 'very_selective'
  }
  if (normalized.includes('community') || normalized.includes('cc')) {
    tier = 'selective'
  }
  
  return {
    name: schoolName,
    ...TIER_DEFAULTS[tier]
  } as SchoolCriteria
}

// Extract target schools from form data
function extractTargetSchool(formData: Record<string, unknown>): string | undefined {
  const fieldsToCheck = [
    'targetSchool', 'targetSchools', 'target_school', 
    'applyingTo', 'colleges', 'dreamSchool', 'firstChoice'
  ]
  
  for (const field of fieldsToCheck) {
    const value = formData[field]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  
  // Check essay content for school mentions
  const essayFields = ['personalStatement', 'whySchoolEssay', 'supplementalEssay', 'whyCollege']
  for (const field of essayFields) {
    const essay = formData[field]
    if (typeof essay === 'string') {
      const allSchools = [...Object.keys(UNIVERSITY_DATA), ...Object.keys(PARTIAL_SCHOOLS)]
      for (const school of allSchools) {
        if (essay.toLowerCase().includes(school)) {
          return school
        }
      }
    }
  }
  
  return undefined
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { applicationId }: ReviewRequest = await req.json()

    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: 'applicationId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing review for application: ${applicationId}`)

    // 1. Fetch the application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      console.error('Failed to fetch application:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Update application status to processing
    await supabase
      .from('applications')
      .update({ status: 'processing' })
      .eq('id', applicationId)

    // 3. Determine target school and build prompts
    const targetSchool = extractTargetSchool(application.form_data)
    const schoolData = getSchoolData(targetSchool)
    
    const systemPrompt = buildSystemPromptV2(application.program_type, schoolData)
    const userPrompt = buildUserPromptV2(application, schoolData)

    // 4. Call AI API
    let rawAiResponse: ReviewResult
    let modelUsed: string
    let tokensUsed: number | undefined
    let rawResponse: unknown

    if (anthropicApiKey) {
      // Prefer Anthropic for sophisticated reasoning
      const result = await callAnthropicV2(anthropicApiKey, systemPrompt, userPrompt)
      rawAiResponse = result.review
      modelUsed = result.model
      tokensUsed = result.tokensUsed
      rawResponse = result.rawResponse
    } else if (openaiApiKey) {
      const result = await callOpenAIV2(openaiApiKey, systemPrompt, userPrompt)
      rawAiResponse = result.review
      modelUsed = result.model
      tokensUsed = result.tokensUsed
      rawResponse = result.rawResponse
    } else {
      // Fallback: Generate sophisticated mock review
      console.log('No AI API key found, generating mock review')
      rawAiResponse = generateSophisticatedMockReview(application, schoolData)
      modelUsed = 'mock-v2'
      tokensUsed = 0
      rawResponse = { mock: true }
    }

    // 5. Convert to legacy format for compatibility with frontend
    const legacyResult = convertToLegacyFormat(rawAiResponse)

    const processingTime = Date.now() - startTime

    // 6. Store the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        application_id: applicationId,
        counselor_version: COUNSELOR_VERSION,
        counselor_type: targetSchool || 'general',
        model_used: modelUsed,
        overall_score: legacyResult.overallScore,
        decision: legacyResult.decision,
        category_scores: legacyResult.categoryScores,
        feedback_text: legacyResult.feedbackText,
        improvement_tips: legacyResult.improvementTips,
        raw_ai_request: { system: systemPrompt.substring(0, 2000), user: userPrompt.substring(0, 2000) },
        raw_ai_response: rawResponse,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to insert review:', insertError)
      throw insertError
    }

    // 7. Update application status to reviewed
    await supabase
      .from('applications')
      .update({ status: 'reviewed' })
      .eq('id', applicationId)

    // 8. Update user's free review count (if applicable)
    if (application.user_id) {
      await supabase.rpc('increment_free_reviews_used', { user_id: application.user_id })
    }

    console.log(`Review completed in ${processingTime}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        reviewId: review.id,
        overallScore: legacyResult.overallScore,
        decision: legacyResult.decision,
        processingTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating review:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate review', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Load comprehensive database from JSON
const comprehensiveDatabase = admissionsDatabase as AdmissionsDatabase
const universityMap = new Map<string, UniversityData>()

// Build university lookup map (by name variations)
comprehensiveDatabase.top_10_universities_deep_research.forEach(uni => {
  const nameKey = uni.university.toLowerCase().replace(/[^a-z]/g, '')
  universityMap.set(nameKey, uni)
  universityMap.set(uni.university.toLowerCase(), uni)

  // Add common short names
  if (uni.university.includes('MIT')) universityMap.set('mit', uni)
  if (uni.university.includes('Chicago')) universityMap.set('uchicago', uni)
  if (uni.university.includes('Pennsylvania')) universityMap.set('penn', uni)
  if (uni.university.includes('Northwestern')) universityMap.set('northwestern', uni)
})

// Convert comprehensive JSON data to SchoolCriteria format
function mapUniversityDataToSchoolCriteria(uniData: UniversityData): SchoolCriteria {
  // Parse SAT scores from range string (e.g., "1470-1570" or "1460-1580 (25th-75th percentile)")
  const parseSATRange = (rangeStr: string): { sat_25th: number; sat_75th: number; sat_average: number } => {
    const match = rangeStr.match(/(\d{4})-(\d{4})/)
    if (match) {
      const low = parseInt(match[1])
      const high = parseInt(match[2])
      return { sat_25th: low, sat_75th: high, sat_average: Math.round((low + high) / 2) }
    }
    return { sat_25th: 1470, sat_75th: 1580, sat_average: 1525 }
  }

  const satScores = parseSATRange(uniData.academic_criteria.test_scores.sat_range)

  // Determine tier based on acceptance rate
  let tier: 'ultra_selective' | 'highly_selective' | 'very_selective' | 'selective' = 'highly_selective'
  const acceptanceNum = parseFloat(uniData.acceptance_rate.replace(/[^0-9.]/g, ''))
  if (acceptanceNum < 5) tier = 'ultra_selective'
  else if (acceptanceNum < 10) tier = 'ultra_selective'
  else if (acceptanceNum < 15) tier = 'highly_selective'

  return {
    name: uniData.university,
    tier,
    acceptance_rate: uniData.acceptance_rate,
    research_depth: 'full',

    academic_expectations: {
      gpa_expectation: uniData.academic_criteria.gpa_expectations,
      gpa_percentile: 'Top 10%',
      sat_25th: satScores.sat_25th,
      sat_75th: satScores.sat_75th,
      sat_average: satScores.sat_average,
      testing_required: uniData.academic_criteria.test_scores.testing_policy.toLowerCase().includes('required'),
      course_rigor_notes: uniData.academic_criteria.course_rigor
    },

    essay_philosophy: {
      what_they_seek: uniData.essay_requirements.what_makes_strong_essays.slice(0, 4),
      strong_essay_markers: uniData.essay_requirements.what_makes_strong_essays,
      common_essay_pitfalls: uniData.essay_requirements.common_essay_mistakes,
      key_quote: uniData.essay_requirements.essay_philosophy
    },

    extracurricular_expectations: {
      importance: uniData.extracurriculars.importance,
      depth_vs_breadth: uniData.extracurriculars.depth_vs_breadth,
      recognition_level: uniData.extracurriculars.recognition_level,
      unique_preferences: uniData.extracurriculars.unique_preferences || uniData.counselor_perspectives.what_they_seek.slice(0, 3),
      key_quote: uniData.extracurriculars.leadership
    },

    what_they_seek: uniData.counselor_perspectives.what_they_seek,
    common_pitfalls: uniData.common_pitfalls,
    unique_differentiators: uniData.unique_insights,
    counselor_perspective: uniData.counselor_perspectives.overall_philosophy,

    evaluation_notes: {
      process: uniData.evaluation_rubrics.selection_process,
      committee_info: uniData.evaluation_rubrics.committee_review,
      key_insight: uniData.evaluation_rubrics.decision_framework
    },

    // Additional rich data from JSON
    red_flags: uniData.red_flags,
    letters_of_recommendation: uniData.letters_of_recommendation,
    demonstrated_interest: uniData.demonstrated_interest,
    admissions_urls: uniData.admissions_office_urls
  }
}

function extractTargetSchool(formData: Record<string, unknown>): string | null {
  // Check for school name in various fields
  const schoolFields = ['targetSchool', 'whyCollege', 'whySchool', 'college']

  for (const field of schoolFields) {
    if (formData[field] && typeof formData[field] === 'string') {
      const text = (formData[field] as string).toLowerCase()

      // First try JSON database (comprehensive data)
      for (const [key, uni] of universityMap) {
        if (text.includes(key) || text.includes(uni.university.toLowerCase())) {
          return uni.university // Return full university name
        }
      }

      // Fallback to legacy hardcoded data
      for (const school of Object.keys(UNIVERSITY_DATA)) {
        if (text.includes(school) || text.includes(UNIVERSITY_DATA[school].name.toLowerCase())) {
          return school
        }
      }
    }
  }

  return null
}

function getSchoolData(schoolKey: string | null): SchoolCriteria {
  if (schoolKey) {
    // Try to load from comprehensive JSON database first
    const searchKey = schoolKey.toLowerCase()
    const uniData = universityMap.get(searchKey) ||
                   universityMap.get(searchKey.replace(/[^a-z]/g, ''))

    if (uniData) {
      const criteria = mapUniversityDataToSchoolCriteria(uniData)
      return {
        ...criteria,
        key: searchKey
      }
    }

    // Fallback to legacy hardcoded data
    if (UNIVERSITY_DATA[schoolKey]) {
      return {
        ...UNIVERSITY_DATA[schoolKey],
        key: schoolKey
      }
    }
  }

  // Return default highly selective tier data
  return {
    name: 'Highly Selective University',
    key: 'general',
    ...TIER_DEFAULTS.top_20
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// V2 PROMPT BUILDERS - Supports Middle School, High School, and College
// ═══════════════════════════════════════════════════════════════════════════

function buildSystemPromptV2(programType: string, schoolData: ReturnType<typeof getSchoolData>): string {
  // Route to appropriate prompt based on program type
  if (programType === 'middle-school') {
    return buildMiddleSchoolPrompt(schoolData)
  } else if (programType === 'high-school') {
    return buildHighSchoolPrompt(schoolData)
  }
  
  // Default: College prompt
  return buildCollegePrompt(schoolData)
}

function buildMiddleSchoolPrompt(schoolData: ReturnType<typeof getSchoolData>): string {
  return `You are XCounselor v2, an experienced private middle school admissions counselor specializing in selective Bay Area independent schools. You have 15+ years of experience evaluating applications for schools like Harker, Nueva, Crystal Springs, Menlo, and BASIS.

## CRITICAL CONTEXT: These Are 10-12 Year Old Children

This is the most important thing to remember:
- These are CHILDREN, not college applicants
- Schools are looking for POTENTIAL, not polish
- Authenticity matters more than sophistication
- A child's voice should sound like a child
- An essay that sounds too adult is a RED FLAG, not a strength
- Parent involvement is expected but shouldn't overshadow the child

## Your Mission
Evaluate this application honestly but age-appropriately. Identify weaknesses and red flags that would concern admissions officers. Do NOT provide improvement suggestions—only honest assessment.

## Target School Context
- School Type: Selective Bay Area Private Middle School
- What These Schools Seek:
  * Genuine curiosity and love of learning
  * Age-appropriate maturity and self-awareness
  * At least one sustained interest (not just a list of activities)
  * Authentic child voice in essays
  * Supportive family that doesn't overshadow the child

## Evaluation Components

### Student Essays (Weight: 25%)
CRITICAL: Does this sound like a 10-12 year old wrote it?
- Child's Voice: Natural vocabulary, age-appropriate sentence structure
- Enthusiasm: Can you feel genuine excitement?
- Specificity: Real details about their life, not generic statements
- Personality: Does their character come through?
- RED FLAG: Essays that sound adult-written are the biggest problem

### Academic Profile (Weight: 30%)
- Strong performance in elementary subjects
- Teacher comments and learning style
- Growth trajectory matters more than perfection

### Activities & Interests (Weight: 20%)
Age-appropriate expectations:
- Genuine interests: What does this child LOVE to do?
- Any depth: Even one 2+ year commitment is notable at this age
- Over-scheduling is a RED FLAG: 10 activities at age 10 signals parent-driven, not child-driven
- Character evidence: Do activities show who they are?

### Parent Statement (Weight: 15%)
- Do parents know their child well?
- Authentic or sales pitch?
- Do they acknowledge both strengths AND growth areas?
- Does it align with child's self-description?

### Completeness (Weight: 10%)
- All sections addressed
- Appropriate length
- Required components included

## Weakness Categories to Check

HIGH PRIORITY:
1. Adult Voice in Essay - Sounds like parent or consultant wrote it
2. Over-Scheduled Child - Too many activities, no depth
3. No Child Personality Visible - Generic, checklist application
4. Parent-Child Mismatch - What they describe doesn't align

MEDIUM PRIORITY:
5. Exaggerated Achievements - Claims unrealistic for age
6. No Sustained Interest - All activities are 1 year or less
7. Generic Statements - Could apply to any child

RED FLAGS:
8. Clearly Parent-Written Essays
9. Helicopter Parenting Signals
10. Accomplishments Beyond What's Believable for Age

## Narrative Archetypes (Age-Appropriate)
- The Curious Explorer: Loves learning, asks questions
- The Dedicated Practitioner: Deep commitment to one area
- The Kind Connector: Empathy, helps others
- The Resilient Learner: Overcame challenges, growth mindset

## Output Format

Respond with valid JSON only:

{
  "target_school_analysis": {
    "school": "Selective Bay Area Middle School",
    "tier": "highly_selective_private",
    "acceptance_rate": "15-25%",
    "what_this_school_seeks": ["genuine curiosity", "authentic child voice", "sustained interests"]
  },
  "overall_assessment": {
    "score": 0-100,
    "rating": "STRONG CANDIDATE | COMPETITIVE | DEVELOPING | NEEDS WORK",
    "admission_likelihood": "Age-appropriate assessment of competitiveness"
  },
  "component_scores": {
    "academics": { "score": 0-100, "analysis": "Assessment" },
    "extracurriculars": { "score": 0-100, "analysis": "Assessment", "depth_assessment": "Sustained vs scattered" },
    "essays": { "score": 0-100, "analysis": "Assessment", "authenticity_assessment": "Does it sound like the child wrote it?" },
    "parent_statement": { "score": 0-100, "analysis": "Assessment" }
  },
  "narrative_assessment": {
    "has_clear_narrative": true/false,
    "archetype": "The Curious Explorer | The Dedicated Practitioner | The Kind Connector | The Resilient Learner | None Clear",
    "can_be_summarized_as": "This is the child who...",
    "coherence_issues": []
  },
  "weaknesses": [
    { "priority": "HIGH | MEDIUM", "category": "Category", "weakness": "Issue", "evidence": "What shows this", "school_expectation": "What schools want" }
  ],
  "red_flags": [
    { "flag": "Flag name", "severity": "critical | high | medium", "evidence": "What triggered this", "impact": "Effect on application" }
  ],
  "final_assessment": "2-3 paragraph assessment appropriate for family with 10-12 year old. Be honest but kind. These are children."
}

## Rules
1. NO improvement suggestions - identify weaknesses only
2. BE HONEST but AGE-APPROPRIATE in tone
3. REMEMBER these are children - schools want potential, not polish
4. DETECT inauthenticity - adult voice in essays is critical red flag
5. Over-scheduling is a WEAKNESS, not a strength at this age`
}

function buildHighSchoolPrompt(schoolData: ReturnType<typeof getSchoolData>): string {
  return `You are XCounselor v2, an experienced high school admissions counselor specializing in competitive Bay Area private high schools. You have 15+ years of experience evaluating applications for schools like Harker, Bellarmine, Menlo, Crystal Springs, and Lick-Wilmerding.

## CRITICAL CONTEXT: These Are 13-14 Year Olds (8th Graders)

- More maturity expected than middle school, but still developing
- Should sound like a thoughtful 14-year-old, not a mini-adult
- Schools want to see emerging leadership and sustained commitment
- Academic readiness for rigorous coursework is important

## Your Mission
Evaluate this application as a real admissions officer would. Identify weaknesses and explain exactly why the application received its rating. Do NOT provide improvement suggestions—only honest assessment.

## Target School Context
- Type: Competitive Bay Area Private High School
- Acceptance Rate: Typically 15-35%
- What These Schools Seek:
  * Strong academic preparation (GPA 3.5+, good ISEE/HSPT scores)
  * Sustained commitment to activities (2-4 years)
  * Evidence of leadership or initiative
  * Authentic voice showing self-awareness
  * Clear fit with school's culture and values

## Evaluation Components

### Academics (Weight: 30%)
- GPA in context (top 10-20% of class expected)
- Test scores (ISEE/HSPT)
- Course rigor if available
- Academic recognition

### Essays (Weight: 25%)
- Authentic teenage voice (sounds like mature 14-year-old)
- Specific stories and examples
- Evidence of self-reflection
- Clear connection to target school ("Why Us")

### Activities (Weight: 25%)
- 2-3 sustained commitments (2+ years each)
- State/regional recognition is impressive
- Leadership roles expected by 8th grade
- Genuine passion visible

### Recommendations/Completeness (Weight: 20%)
- Strong teacher support implied
- All sections complete
- Appropriate depth

## Weakness Categories

HIGH PRIORITY:
1. Breadth Over Depth - Many activities, no sustained commitment
2. Essay Doesn't Sound Like a 14-Year-Old - Too polished or adult
3. Generic "Why This School" - Could apply anywhere
4. No Coherent Story - Application pieces don't connect

MEDIUM PRIORITY:
5. Academic Profile Below Target - GPA/scores below typical range
6. No Leadership Evidence - All participation, no initiative
7. Activities Don't Match Interests - Says one thing, does another

RED FLAGS:
8. Adult-Written Essays
9. Inflated Achievements
10. No Course Rigor When Available

## Narrative Archetypes
- The STEM Leader: Strong in robotics, math competitions, science
- The Scholar Athlete: Academics + athletic excellence
- The Artist Intellectual: Creative pursuits + academics
- The Community Builder: Service, leadership, helping others

## Output Format

Respond with valid JSON:

{
  "target_school_analysis": {
    "school": "Competitive Bay Area High School",
    "tier": "selective_private",
    "acceptance_rate": "15-35%",
    "what_this_school_seeks": ["academic readiness", "sustained commitment", "authentic voice"]
  },
  "overall_assessment": {
    "score": 0-100,
    "rating": "HIGHLY COMPETITIVE | COMPETITIVE | POSSIBLE BUT WEAK | UNLIKELY",
    "admission_likelihood": "Realistic assessment for competitive high schools"
  },
  "component_scores": {
    "academics": { "score": 0-100, "analysis": "Assessment", "competitive_context": "Where this falls" },
    "extracurriculars": { "score": 0-100, "analysis": "Assessment", "tier_assessment": "Highest level achieved" },
    "essays": { "score": 0-100, "analysis": "Assessment", "authenticity_assessment": "Does it sound like a 14-year-old?" },
    "school_fit": { "score": 0-100, "analysis": "Assessment" }
  },
  "narrative_assessment": {
    "has_clear_narrative": true/false,
    "archetype": "The STEM Leader | The Scholar Athlete | The Artist Intellectual | The Community Builder | None Clear",
    "can_be_summarized_as": "This is the student who...",
    "coherence_issues": []
  },
  "weaknesses": [
    { "priority": "HIGH | MEDIUM", "category": "Category", "weakness": "Issue", "evidence": "What shows this", "school_expectation": "What schools want" }
  ],
  "red_flags": [],
  "final_assessment": "2-3 paragraph comprehensive assessment. Be honest and specific."
}

## Rules
1. NO improvement suggestions
2. BE HONEST about competitive standing
3. Remember these are 14-year-olds - mature but still developing
4. DETECT inauthenticity in essays
5. State/regional achievement is impressive at this age; national is exceptional`
}

function buildCollegePrompt(schoolData: SchoolCriteria): string {
  // Build school-specific context
  const hasFullResearch = schoolData.research_depth === 'full'
  const schoolSpecificContext = hasFullResearch ? `
## ═══════════════════════════════════════════════════════════════
## TARGET SCHOOL: ${schoolData.name} (COMPREHENSIVE DATA AVAILABLE)
## ═══════════════════════════════════════════════════════════════

### School Profile
- **Tier**: ${schoolData.tier}
- **Acceptance Rate**: ${schoolData.acceptance_rate}
- **Research Depth**: Full - use school-specific criteria below

### What ${schoolData.name} Seeks
${schoolData.what_they_seek?.map(item => `- ${item}`).join('\n')}

### Counselor Perspective (Direct from Admissions Research)
${schoolData.counselor_perspective}

### Common Pitfalls at ${schoolData.name}
${schoolData.common_pitfalls?.map(item => `- ❌ ${item}`).join('\n')}

### Unique Differentiators for ${schoolData.name}
${schoolData.unique_differentiators?.map(item => `- ${item}`).join('\n')}

### Academic Expectations (${schoolData.name}-Specific)
- GPA: ${schoolData.academic_expectations?.gpa_expectation}
- SAT Range: ${schoolData.academic_expectations?.sat_25th}-${schoolData.academic_expectations?.sat_75th}
- Testing Required: ${schoolData.academic_expectations?.testing_required ? 'Yes' : 'No'}
- Notes: ${schoolData.academic_expectations?.course_rigor_notes}

### Essay Philosophy (${schoolData.name}-Specific)
**What they seek in essays:**
${schoolData.essay_philosophy?.what_they_seek?.map(item => `- ${item}`).join('\n')}

**Strong essay markers:**
${schoolData.essay_philosophy?.strong_essay_markers?.map(item => `- ✓ ${item}`).join('\n')}

**Essay pitfalls at ${schoolData.name}:**
${schoolData.essay_philosophy?.common_essay_pitfalls?.map(item => `- ❌ ${item}`).join('\n')}

**Key Quote**: "${schoolData.essay_philosophy?.key_quote}"

### Extracurricular Expectations (${schoolData.name}-Specific)
- **Importance**: ${schoolData.extracurricular_expectations?.importance}
- **Depth vs Breadth**: ${schoolData.extracurricular_expectations?.depth_vs_breadth}
- **Recognition Level**: ${schoolData.extracurricular_expectations?.recognition_level}
- **Unique Preferences**:
${schoolData.extracurricular_expectations?.unique_preferences?.map(item => `  - ${item}`).join('\n')}

**Key Quote**: "${schoolData.extracurricular_expectations?.key_quote}"

### Evaluation Process at ${schoolData.name}
- **Process**: ${schoolData.evaluation_notes?.process}
- **Committee**: ${schoolData.evaluation_notes?.committee_info}
- **Key Insight**: ${schoolData.evaluation_notes?.key_insight}
${schoolData.letters_of_recommendation ? `
### Letters of Recommendation (${schoolData.name}-Specific)
- **Requirements**: ${schoolData.letters_of_recommendation.requirements}
- **Importance**: ${schoolData.letters_of_recommendation.importance}
- **What Reviewers Look For**:
${schoolData.letters_of_recommendation.what_reviewers_look_for.map(item => `  - ${item}`).join('\n')}
` : ''}
${schoolData.demonstrated_interest ? `
### Demonstrated Interest at ${schoolData.name}
- **Tracked**: ${schoolData.demonstrated_interest.tracked ? 'Yes - showing interest helps' : 'No - pure merit-based'}
- **Interviews**: ${schoolData.demonstrated_interest.interviews}
` : ''}
` : `
## TARGET SCHOOL: ${schoolData.name}
- Tier: ${schoolData.tier}
- Acceptance Rate: ${schoolData.acceptance_rate}
- What They Seek: ${schoolData.what_they_seek?.join(', ')}
${schoolData.counselor_perspective ? `\nCounselor Perspective: ${schoolData.counselor_perspective}` : ''}
${schoolData.common_pitfalls ? `\nCommon Pitfalls: ${schoolData.common_pitfalls.join(', ')}` : ''}

### Academic Expectations
- GPA: ${schoolData.academic_expectations?.gpa_expectation || 'Top 10%'}
- SAT Range: ${schoolData.academic_expectations?.sat_25th || 1470}-${schoolData.academic_expectations?.sat_75th || 1580}
`

  return `You are XCounselor v2, a senior college admissions evaluator with 20+ years of experience at highly selective institutions. You have personally reviewed over 50,000 applications and have deep knowledge of how specific schools evaluate candidates.

## Your Mission
Evaluate this application AS IF YOU WERE AN ADMISSIONS OFFICER AT ${schoolData.name.toUpperCase()}. Identify every weakness using the school's specific criteria. Explain exactly why the application received its rating relative to THIS school's standards. Do NOT provide improvement suggestions—only honest, school-calibrated assessment.

## Critical Mindset for ${schoolData.tier === 'ultra_selective' ? 'Ultra-Selective Schools' : 'Selective Schools'}
${schoolData.tier === 'ultra_selective' ? `
At ${schoolData.name} (${schoolData.acceptance_rate} acceptance), the question is NOT "Is this a good student?" but "Why THIS student over the ${schoolData.acceptance_rate === '~3%' ? '40,000+' : '30,000+'} other excellent applicants?"

- Academics are a BASELINE FILTER, not a differentiator
- Most REJECTED applicants have perfect or near-perfect GPAs
- What distinguishes admits: narrative, distinctiveness, authenticity, and FIT WITH ${schoolData.name.toUpperCase()}
- Well-rounded is a WEAKNESS; "well-lopsided" (exceptional in 1-2 areas) is a STRENGTH
` : `
At ${schoolData.name} (${schoolData.acceptance_rate} acceptance):
- Strong academics are expected but allow more flexibility
- Clear passion and fit with the school matter greatly
- Demonstrated interest often factors into decisions
`}
${schoolSpecificContext}

## Evaluation Components

### Academics (Score 0-100)
Score relative to ${schoolData.name}'s specific expectations:
- Compare GPA to expectation: ${schoolData.academic_expectations?.gpa_expectation || 'Top 10%'}
- Compare test scores to ${schoolData.name}'s range: ${schoolData.academic_expectations?.sat_25th || 1470}-${schoolData.academic_expectations?.sat_75th || 1580} SAT
- At 25th percentile = most admits scored higher (score 70)
- At 50th percentile = middle of the pack (score 80)
- At 75th percentile = above most admits (score 90)
- Evaluate course rigor: ${schoolData.academic_expectations?.course_rigor_notes || 'Most rigorous available'}

### Extracurriculars (Score 0-100)
Use tier system, calibrated to ${schoolData.name}'s expectations:
- Tier 1 (Exceptional): National/international level, founded impactful org, published research
- Tier 2 (State/Regional): State competition finalist, All-State honors, significant leadership
- Tier 3 (School/Local): President/Captain, varsity athlete, consistent commitment
- Tier 4 (Participation): Club member, no leadership, minimal commitment

${schoolData.name === 'Massachusetts Institute of Technology' ? `
**MIT-SPECIFIC**: Look for evidence of MAKING and BUILDING. Hands-on projects, things they've created, collaborative problem-solving. The ideal MIT student has a garage full of half-finished projects.
` : schoolData.name === 'Harvard University' ? `
**HARVARD-SPECIFIC**: Look for DISTINCTION and NARRATIVE ARC. Can you summarize this student as "the notable scientist" or "the future leader" or "the bridge-builder"?
` : schoolData.name === 'Stanford University' ? `
**STANFORD-SPECIFIC**: Look for INTELLECTUAL VITALITY. Is there evidence of genuine curiosity beyond requirements? Innovation? Entrepreneurial thinking?
` : schoolData.name === 'Yale University' ? `
**YALE-SPECIFIC**: Look for HUMANITIES-DRIVEN CURIOSITY. Deep thinking? Strong writing? Engagement with ideas beyond STEM?
` : ''}

Key questions:
- DEPTH vs BREADTH: Does ${schoolData.name} value 2-3 deep commitments or breadth?
- LEADERSHIP: Did they lead, create, or just participate?
- IMPACT: Quantifiable results? Community contribution?
- AUTHENTICITY: Genuine passion or resume-building?

### Essays (Score 0-100)
Evaluate against ${schoolData.name}'s essay philosophy:
${schoolData.essay_philosophy?.what_they_seek?.map(item => `- ${item}`).join('\n') || '- Authenticity\n- Narrative structure\n- Specificity'}

Key question: "${schoolData.essay_philosophy?.key_quote || 'Does this essay make the applicant memorable?'}"

### University Fit (Score 0-100)
**CRITICAL: This is about FIT ANALYSIS - matching the applicant's profile against what ${schoolData.name} specifically seeks.**

**What ${schoolData.name} Seeks (from comprehensive research):**
${schoolData.what_they_seek?.map(item => `- ${item}`).join('\n')}

**Fit Analysis Questions:**
1. **Alignment Check**: For EACH criterion above, does the applicant demonstrate it?
   - If yes: Cite specific evidence from their application
   - If no: Note this as a fit weakness
2. **Cultural Fit**: Would they THRIVE in ${schoolData.name}'s specific culture?
   - ${schoolData.name === 'MIT' ? 'MIT: Collaborative, hands-on, maker culture' : ''}
   - ${schoolData.name === 'Harvard University' ? 'Harvard: Leadership-oriented, high-achieving, diverse interests' : ''}
   - ${schoolData.name === 'Stanford University' ? 'Stanford: Entrepreneurial, innovative, intellectually vital' : ''}
   - ${schoolData.name === 'Yale University' ? 'Yale: Residential colleges, humanities focus, intellectual community' : ''}
   - ${schoolData.name === 'University of Chicago' ? 'UChicago: Intellectual, quirky, life of the mind' : ''}
3. **Demonstrated Knowledge**: Do they understand what makes ${schoolData.name} unique?
   - Mentioned specific programs, professors, opportunities?
   - Generic response that could apply to any top school? (RED FLAG)
4. **Values Alignment**: Do their stated values/goals align with ${schoolData.name}'s mission?

**Scoring Guide:**
- 90-100: Strong fit - applicant embodies most of what ${schoolData.name} seeks
- 70-89: Good fit - aligns with several key criteria
- 50-69: Moderate fit - some alignment but gaps exist
- Below 50: Poor fit - significant misalignment with what ${schoolData.name} values

## Weakness Categories (${schoolData.name}-Calibrated)

HIGH PRIORITY WEAKNESSES:
${schoolData.common_pitfalls?.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n') || `1. Well-Rounded But Not Distinguished
2. No Clear Narrative Arc
3. Generic Essays Lacking Authentic Voice`}
4. Activities lack depth or Tier 1-2 achievement
5. No clear fit with ${schoolData.name}'s specific culture

MEDIUM PRIORITY WEAKNESSES:
6. Test scores below ${schoolData.academic_expectations?.sat_25th || 1470} (${schoolData.name}'s 25th percentile)
7. Generic "Why ${schoolData.name}" response that could apply to any school
8. Activities don't support stated interests or intended major

RED FLAGS (${schoolData.name}-Specific):
${schoolData.red_flags && schoolData.red_flags.length > 0 ? schoolData.red_flags.map((flag, i) => `${i + 9}. ${flag}`).join('\n') : `9. Essay sounds adult-written or consultant-polished
10. Inflated or unverifiable achievements
11. Avoided academic rigor when challenging courses were available
12. Application feels assembled rather than authentic`}

## Output Format

Respond with valid JSON only:

{
  "target_school_analysis": {
    "school": "School name",
    "tier": "tier name",
    "acceptance_rate": "X%",
    "what_this_school_seeks": ["trait1", "trait2", "trait3"]
  },
  "overall_assessment": {
    "score": 0-100,
    "rating": "HIGHLY COMPETITIVE | COMPETITIVE | POSSIBLE BUT WEAK | UNLIKELY | NOT COMPETITIVE",
    "admission_likelihood": "Description of realistic chances"
  },
  "component_scores": {
    "academics": {
      "score": 0-100,
      "analysis": "Assessment of academic profile",
      "percentile_context": "Where this falls relative to admitted students"
    },
    "extracurriculars": {
      "score": 0-100,
      "analysis": "Assessment of activity profile",
      "tier_assessment": "Highest tier activities identified",
      "depth_vs_breadth": "Commitment depth assessment"
    },
    "essays": {
      "score": 0-100,
      "analysis": "Assessment of essay quality",
      "authenticity_assessment": "Does this sound like the student?",
      "distinctiveness": "Would this be remembered?"
    },
    "university_fit": {
      "score": 0-100,
      "analysis": "Comprehensive fit assessment",
      "alignment_with_what_school_seeks": [
        {
          "criterion": "What the school seeks (from database)",
          "demonstrated": true/false,
          "evidence": "Specific evidence from application or 'Not evident'"
        }
      ],
      "cultural_fit_assessment": "Would they thrive in this school's culture?",
      "knowledge_of_school": "Did they show understanding of what makes this school unique?",
      "values_alignment": "Do their values align with school's mission?"
    }
  },
  "narrative_assessment": {
    "has_clear_narrative": true/false,
    "archetype": "The Specialist | The Entrepreneur | The Overcomer | The Connector | None Clear",
    "can_be_summarized_as": "This is the student who...",
    "coherence_issues": ["List disconnects"]
  },
  "weaknesses": [
    {
      "priority": "HIGH | MEDIUM | LOW",
      "category": "Category name",
      "weakness": "Specific weakness",
      "evidence": "What shows this",
      "school_expectation": "What this school expects"
    }
  ],
  "red_flags": [
    {
      "flag": "Flag name",
      "severity": "critical | high | medium",
      "evidence": "What triggered this",
      "impact": "How this affects application"
    }
  ],
  "final_assessment": "2-3 paragraph comprehensive assessment. Reference specific weaknesses. Do NOT suggest improvements."
}

## Rules
1. NO improvement suggestions - identify weaknesses only
2. BE HONEST - this is practice
3. BE SPECIFIC - cite evidence
4. CONTEXT - frame relative to target school
5. REMEMBER - comparing to 40,000+ excellent applicants

## CRITICAL: FIT ANALYSIS REQUIREMENT
For the "alignment_with_what_school_seeks" array in university_fit:
- Create one object for EACH criterion in "What ${schoolData.name} Seeks" above
- For each criterion, determine if the applicant demonstrates it
- Provide specific evidence from their application (essays, activities, achievements)
- If not demonstrated, mark as false and note "Not evident in application"
- This is THE MOST IMPORTANT part of the evaluation - it shows if they match what the school wants

## CRITICAL: COMMON PITFALLS DETECTION
You MUST actively check the application against the ${schoolData.common_pitfalls?.length || 5} common pitfalls listed above:
${schoolData.common_pitfalls?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Check for generic common pitfalls'}

For EACH pitfall:
- Scan the application to see if this pitfall applies
- If it does, add it to the "weaknesses" array with priority "HIGH"
- In the weakness, cite specific evidence showing why this pitfall applies
- Reference the exact pitfall name in the "category" field
- In "school_expectation", explain what ${schoolData.name} wants instead

Example:
If pitfall is "Well-rounded but not distinguished" and applicant has 10 shallow activities:
{
  "priority": "HIGH",
  "category": "Common Pitfall: Well-rounded but not distinguished",
  "weakness": "Applicant lists 10 different activities but shows no depth or distinction in any area",
  "evidence": "Activities list shows club membership without leadership, brief participation spans",
  "school_expectation": "${schoolData.name} seeks students with 'spikes' - exceptional depth in 1-2 areas rather than breadth"
}

## CRITICAL: RED FLAGS DETECTION
You MUST actively scan for the ${schoolData.red_flags?.length || 4} RED FLAGS specific to ${schoolData.name}:
${schoolData.red_flags && schoolData.red_flags.length > 0 ? schoolData.red_flags.map((flag, i) => `${i + 1}. ${flag}`).join('\n') : `1. Essay sounds adult-written or consultant-polished
2. Inflated or unverifiable achievements
3. Avoided academic rigor when challenging courses were available
4. Application feels assembled rather than authentic`}

For EACH red flag:
- Carefully examine the application for signs of this red flag
- Red flags are SERIOUS issues that often lead to rejection
- If detected, add to "red_flags" array with severity: "critical" or "high"
- Be conservative - only flag if there's clear evidence
- In "evidence", cite specific examples that triggered the flag
- In "impact", explain how this hurts their chances at ${schoolData.name}

Example:
If red flag is "Test scores far below 25th percentile without compelling narrative" and applicant has 1350 SAT with no explanation:
{
  "flag": "Test scores far below 25th percentile without compelling narrative",
  "severity": "critical",
  "evidence": "SAT 1350 is 120 points below ${schoolData.name}'s 25th percentile (${schoolData.academic_expectations?.sat_25th}). No explanation or compelling story provided.",
  "impact": "At ultra-selective schools, scores this far below range typically require extraordinary circumstances or achievements to overcome. Without that narrative, this is a near-automatic rejection factor."
}`
}

function buildUserPromptV2(application: { program_type: string; form_data: Record<string, unknown> }, schoolData: ReturnType<typeof getSchoolData>): string {
  const formData = application.form_data
  
  let prompt = `Please evaluate this ${application.program_type} application for ${schoolData.name}:\n\n`
  
  // Format form data into readable sections
  const sections: Record<string, string[]> = {
    'Student Information': ['firstName', 'lastName', 'currentGrade', 'applyingGrade', 'gpa', 'courseRigor', 'intendedMajor'],
    'Activities & Achievements': ['activity1', 'activity2', 'activity3', 'activity4', 'activity5', 'honors', 'leadershipRoles', 'otherInterests'],
    'Essays': ['personalStatement', 'personalEssay', 'challenge', 'whySchool', 'whyCollege', 'whyMajor', 'uniqueQuality', 'academicInterest', 'additionalInfo'],
    'Parent/Family': ['parentStatement', 'growthAreas']
  }
  
  for (const [sectionName, fields] of Object.entries(sections)) {
    const sectionContent: string[] = []
    for (const field of fields) {
      if (formData[field] && typeof formData[field] === 'string' && (formData[field] as string).trim()) {
        const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        sectionContent.push(`**${label}:**\n${formData[field]}\n`)
      }
    }
    if (sectionContent.length > 0) {
      prompt += `## ${sectionName}\n${sectionContent.join('\n')}\n`
    }
  }
  
  prompt += `\n---\n\nEvaluate this application thoroughly. Remember: This is for a ${schoolData.tier.replace('_', ' ')} school with ${schoolData.acceptance_rate} acceptance rate. Be honest about weaknesses.`
  
  return prompt
}

// ═══════════════════════════════════════════════════════════════════════════
// AI API CALLS
// ═══════════════════════════════════════════════════════════════════════════

async function callAnthropicV2(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ review: ReviewResult; model: string; tokensUsed: number; rawResponse: unknown }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 6000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()
  const content = data.content[0].text
  
  // Extract JSON from Claude's response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Anthropic response')
  }
  
  const review = JSON.parse(jsonMatch[0]) as ReviewResult

  return {
    review,
    model: data.model,
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    rawResponse: data,
  }
}

async function callOpenAIV2(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ review: ReviewResult; model: string; tokensUsed: number; rawResponse: unknown }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const review = JSON.parse(data.choices[0].message.content) as ReviewResult

  return {
    review,
    model: data.model,
    tokensUsed: data.usage?.total_tokens,
    rawResponse: data,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SOPHISTICATED MOCK REVIEW - Supports All Program Types
// ═══════════════════════════════════════════════════════════════════════════

function generateSophisticatedMockReview(
  application: { form_data: Record<string, unknown>; program_type?: string },
  schoolData: ReturnType<typeof getSchoolData>
): ReviewResult {
  const formData = application.form_data
  const programType = application.program_type || 'college'
  
  // Use program-type-specific analysis
  if (programType === 'middle-school') {
    return generateMiddleSchoolMockReview(formData, schoolData)
  } else if (programType === 'high-school') {
    return generateHighSchoolMockReview(formData, schoolData)
  }
  
  // Default: College review
  return generateCollegeMockReview(formData, schoolData)
}

function generateMiddleSchoolMockReview(
  formData: Record<string, unknown>,
  schoolData: ReturnType<typeof getSchoolData>
): ReviewResult {
  // Middle school specific analysis - age-appropriate expectations
  const essaysScore = analyzeMiddleSchoolEssays(formData)
  const activitiesScore = analyzeMiddleSchoolActivities(formData)
  const academicsScore = analyzeMiddleSchoolAcademics(formData)
  const parentScore = analyzeParentStatement(formData)
  
  // Middle school weights
  const overallScore = Math.round(
    essaysScore.score * 0.25 +
    academicsScore.score * 0.30 +
    activitiesScore.score * 0.20 +
    parentScore.score * 0.15 +
    80 * 0.10 // Completeness assumed
  )
  
  // Middle school rating scale (more encouraging)
  let rating: string
  let admission_likelihood: string
  if (overallScore >= 80) {
    rating = 'STRONG CANDIDATE'
    admission_likelihood = 'This child shows genuine promise and would likely receive serious consideration'
  } else if (overallScore >= 65) {
    rating = 'COMPETITIVE'
    admission_likelihood = 'Solid application with areas that could be strengthened'
  } else if (overallScore >= 50) {
    rating = 'DEVELOPING'
    admission_likelihood = 'Application shows potential but has notable gaps'
  } else {
    rating = 'NEEDS WORK'
    admission_likelihood = 'Application needs significant development before being competitive'
  }
  
  const weaknesses = detectMiddleSchoolWeaknesses(formData, essaysScore, activitiesScore, parentScore)
  const redFlags = detectMiddleSchoolRedFlags(formData, essaysScore)
  const narrativeAssessment = assessMiddleSchoolNarrative(formData)
  
  return {
    target_school_analysis: {
      school: 'Selective Bay Area Middle School',
      tier: 'highly_selective_private',
      acceptance_rate: '15-25%',
      what_this_school_seeks: ['genuine curiosity', 'authentic child voice', 'sustained interests', 'growth potential']
    },
    overall_assessment: { score: overallScore, rating, admission_likelihood },
    component_scores: {
      academics: academicsScore,
      extracurriculars: activitiesScore,
      essays: essaysScore,
      university_fit: parentScore // Repurposing for parent statement in middle school
    },
    narrative_assessment: narrativeAssessment,
    weaknesses,
    red_flags: redFlags,
    final_assessment: generateMiddleSchoolFinalAssessment(overallScore, rating, weaknesses, redFlags)
  }
}

function generateHighSchoolMockReview(
  formData: Record<string, unknown>,
  schoolData: ReturnType<typeof getSchoolData>
): ReviewResult {
  // High school specific analysis
  const essaysScore = analyzeHighSchoolEssays(formData)
  const activitiesScore = analyzeHighSchoolActivities(formData)
  const academicsScore = analyzeHighSchoolAcademics(formData)
  const fitScore = analyzeFit(formData, schoolData)
  
  // High school weights
  const overallScore = Math.round(
    academicsScore.score * 0.30 +
    essaysScore.score * 0.25 +
    activitiesScore.score * 0.25 +
    fitScore.score * 0.20
  )
  
  let rating: string
  let admission_likelihood: string
  if (overallScore >= 85) {
    rating = 'HIGHLY COMPETITIVE'
    admission_likelihood = 'Strong candidate for competitive private high schools'
  } else if (overallScore >= 70) {
    rating = 'COMPETITIVE'
    admission_likelihood = 'In the running for selective schools, some areas to address'
  } else if (overallScore >= 55) {
    rating = 'POSSIBLE BUT WEAK'
    admission_likelihood = 'Has gaps that may limit options at most selective schools'
  } else {
    rating = 'UNLIKELY'
    admission_likelihood = 'Significant weaknesses for competitive private schools'
  }
  
  const weaknesses = detectHighSchoolWeaknesses(formData, essaysScore, activitiesScore, academicsScore)
  // Create a high school default for red flag detection
  const highSchoolDefaults = {
    name: 'Competitive Bay Area High School',
    tier: 'highly_selective' as const,
    acceptance_rate: '15-35%',
    research_depth: 'tier_default' as const,
    common_pitfalls: ['Overpolished essays', 'Lack of genuine voice', 'No sustained interests']
  } as SchoolCriteria
  const redFlags = detectRedFlags(formData, essaysScore, highSchoolDefaults)
  const narrativeAssessment = assessNarrative(formData)
  
  return {
    target_school_analysis: {
      school: 'Competitive Bay Area High School',
      tier: 'selective_private',
      acceptance_rate: '15-35%',
      what_this_school_seeks: ['academic readiness', 'sustained commitment', 'leadership', 'authentic voice']
    },
    overall_assessment: { score: overallScore, rating, admission_likelihood },
    component_scores: {
      academics: academicsScore,
      extracurriculars: activitiesScore,
      essays: essaysScore,
      university_fit: fitScore
    },
    narrative_assessment: narrativeAssessment,
    weaknesses,
    red_flags: redFlags,
    final_assessment: generateFinalAssessment(overallScore, rating, weaknesses, redFlags, schoolData)
  }
}

function generateCollegeMockReview(
  formData: Record<string, unknown>,
  schoolData: ReturnType<typeof getSchoolData>
): ReviewResult {
  // Original college review logic
  const academicsScore = analyzeAcademics(formData, schoolData)
  const extracurricularsScore = analyzeExtracurriculars(formData)
  const essaysScore = analyzeEssays(formData)
  const fitScore = analyzeFit(formData, schoolData)
  
  const overallScore = Math.round(
    academicsScore.score * 0.25 +
    extracurricularsScore.score * 0.30 +
    essaysScore.score * 0.25 +
    fitScore.score * 0.20
  )
  
  // Determine rating
  let rating: string
  let admission_likelihood: string
  if (overallScore >= 85) {
    rating = 'HIGHLY COMPETITIVE'
    admission_likelihood = 'Strong contender, but nothing is guaranteed at this selectivity level'
  } else if (overallScore >= 70) {
    rating = 'COMPETITIVE'
    admission_likelihood = 'In the running but would benefit from strengthening key areas'
  } else if (overallScore >= 55) {
    rating = 'POSSIBLE BUT WEAK'
    admission_likelihood = 'Significant gaps that make admission unlikely without improvements'
  } else if (overallScore >= 40) {
    rating = 'UNLIKELY'
    admission_likelihood = 'Application has substantial weaknesses for this tier of school'
  } else {
    rating = 'NOT COMPETITIVE'
    admission_likelihood = 'Does not meet baseline expectations for this school'
  }
  
  // Detect weaknesses
  const weaknesses = detectWeaknesses(formData, academicsScore, extracurricularsScore, essaysScore, fitScore, schoolData)
  
  // Detect red flags (school-specific)
  const redFlags = detectRedFlags(formData, essaysScore, schoolData)
  
  // Build narrative assessment
  const narrativeAssessment = assessNarrative(formData)
  
  return {
    target_school_analysis: {
      school: schoolData.name,
      tier: schoolData.tier,
      acceptance_rate: schoolData.acceptance_rate,
      what_this_school_seeks: schoolData.what_they_seek || []
    },
    overall_assessment: {
      score: overallScore,
      rating,
      admission_likelihood
    },
    component_scores: {
      academics: academicsScore,
      extracurriculars: extracurricularsScore,
      essays: essaysScore,
      university_fit: fitScore
    },
    narrative_assessment: narrativeAssessment,
    weaknesses,
    red_flags: redFlags,
    final_assessment: generateFinalAssessment(overallScore, rating, weaknesses, redFlags, schoolData)
  }
}

function getEssayContent(formData: Record<string, unknown>): string {
  const essayFields = ['personalStatement', 'personalEssay', 'challenge', 'whySchool', 'whyCollege', 'whyMajor']
  return essayFields
    .map(f => formData[f])
    .filter(v => v && typeof v === 'string')
    .join(' ')
}

function getActivityContent(formData: Record<string, unknown>): string {
  const activityFields = ['activity1', 'activity2', 'activity3', 'activity4', 'activity5', 'honors', 'leadershipRoles']
  return activityFields
    .map(f => formData[f])
    .filter(v => v && typeof v === 'string')
    .join(' ')
}

function analyzeAcademics(formData: Record<string, unknown>, schoolData: SchoolCriteria): ComponentScore {
  const gpa = formData.gpa ? parseFloat(String(formData.gpa)) : 0
  const sat = formData.satScore ? parseInt(String(formData.satScore)) : 0
  const act = formData.actScore ? parseInt(String(formData.actScore)) : 0
  const courseRigor = formData.courseRigor ? String(formData.courseRigor).toLowerCase() : ''
  
  // School-specific expectations
  const expectedGPA = schoolData.tier === 'ultra_selective' ? 3.9 : 
                      schoolData.tier === 'highly_selective' ? 3.7 : 3.5
  const sat25th = schoolData.academic_expectations?.sat_25th || 1450
  const sat75th = schoolData.academic_expectations?.sat_75th || 1550
  const satMid = (sat25th + sat75th) / 2
  
  let score = 50 // Base score
  const details: string[] = []
  
  // GPA analysis calibrated to school
  if (gpa >= 3.95) {
    score += 30
    details.push(`GPA of ${gpa} is excellent, meeting ${schoolData.name}'s expectations`)
  } else if (gpa >= expectedGPA) {
    score += 20
    details.push(`GPA of ${gpa} meets ${schoolData.name}'s baseline (${expectedGPA}+)`)
  } else if (gpa >= 3.5) {
    score += 10
    details.push(`GPA of ${gpa} is below ${schoolData.name}'s typical admit (${expectedGPA}+)`)
  } else if (gpa > 0) {
    score -= 10
    details.push(`GPA of ${gpa} is significantly below expectations for ${schoolData.tier} schools`)
  } else {
    details.push('GPA not provided')
  }
  
  // SAT analysis calibrated to school's specific range
  if (sat > 0) {
    if (sat >= sat75th) {
      score += 15
      details.push(`SAT ${sat} is above ${schoolData.name}'s 75th percentile (${sat75th})`)
    } else if (sat >= satMid) {
      score += 10
      details.push(`SAT ${sat} is at ${schoolData.name}'s median range`)
    } else if (sat >= sat25th) {
      score += 5
      details.push(`SAT ${sat} is at ${schoolData.name}'s 25th percentile - most admits scored higher`)
    } else {
      score -= 5
      details.push(`SAT ${sat} is BELOW ${schoolData.name}'s 25th percentile (${sat25th})`)
    }
  }
  
  // Course rigor analysis
  if (courseRigor.includes('ap') || courseRigor.includes('ib')) {
    const apCount = (courseRigor.match(/\d+/) || ['0'])[0]
    const apNum = parseInt(apCount)
    
    // Ultra-selective schools expect maximum rigor
    if (schoolData.tier === 'ultra_selective') {
      if (apNum >= 10) {
        score += 15
        details.push(`Strong course rigor with ${apNum} AP/IB courses`)
      } else if (apNum >= 6) {
        score += 8
        details.push(`Moderate course rigor (${apNum} AP/IB) - ${schoolData.name} admits typically take 8+`)
      } else {
        score += 3
        details.push(`Limited AP/IB courses (${apNum}) may raise concerns about academic rigor`)
      }
    } else {
      if (apNum >= 6) score += 15
      else if (apNum >= 3) score += 10
      details.push(`${apNum} AP/IB courses noted`)
    }
  }
  
  score = Math.min(100, Math.max(0, score))
  
  // Generate school-calibrated analysis
  const isCompetitive = score >= 75
  const percentileContext = sat > 0 
    ? sat >= sat75th ? 'Above 75th percentile for ' + schoolData.name
    : sat >= satMid ? 'At median for ' + schoolData.name
    : sat >= sat25th ? 'At 25th percentile for ' + schoolData.name
    : 'Below 25th percentile for ' + schoolData.name
    : 'Test scores not provided'
  
  return {
    score,
    analysis: details.join('. ') + '.',
    percentile_context: percentileContext,
    gpa_assessment: gpa >= expectedGPA ? 'Meets expectations' : 'Below typical admit',
    test_assessment: sat >= sat25th ? 'Within range' : sat > 0 ? 'Below range' : 'Not provided',
    rigor_assessment: courseRigor ? 'Course rigor documented' : 'Course rigor unclear',
    school_calibration: `Evaluated against ${schoolData.name}'s specific requirements (GPA ${expectedGPA}+, SAT ${sat25th}-${sat75th})`
  }
}

function analyzeExtracurriculars(formData: Record<string, unknown>, schoolData: SchoolCriteria): ComponentScore {
  const activities: string[] = []
  for (let i = 1; i <= 5; i++) {
    if (formData[`activity${i}`]) activities.push(String(formData[`activity${i}`]))
  }
  
  // Also check for other activity field formats
  if (formData.activities) {
    if (Array.isArray(formData.activities)) {
      activities.push(...formData.activities.map(String))
    } else if (typeof formData.activities === 'string') {
      activities.push(formData.activities)
    }
  }
  
  let score = 40 // Base score
  let highestTier = 4
  const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
  const details: string[] = []
  
  const content = activities.join(' ').toLowerCase()
  
  // Tier 1 indicators (National/International level)
  const tier1Indicators = [
    'national', 'international', 'published', 'founded', 'usa', 'usamo', 'usabo',
    'isef', 'olympiad', 'intel', 'siemens', 'research at', 'mit', 'stanford',
    'rsi', 'ssp', 'tasp', 'telluride', 'yygs', 'mostec', 'simr'
  ]
  
  // Tier 2 indicators (State/Regional level)
  const tier2Indicators = [
    'state', 'regional', 'president', 'captain', 'editor-in-chief', 'editor in chief',
    'all-state', 'all state', 'finalist', 'semifinal', 'quarter-final', 'concertmaster'
  ]
  
  // Tier 3 indicators (School/Local level)
  const tier3Indicators = [
    'varsity', 'lead', 'officer', 'treasurer', 'secretary', 'vice president',
    'vice-president', 'club leader', 'section leader', 'team captain'
  ]
  
  // Count tiers for each activity
  for (const activity of activities) {
    const actLower = activity.toLowerCase()
    if (tier1Indicators.some(ind => actLower.includes(ind))) {
      tierCounts[1]++
      highestTier = Math.min(highestTier, 1)
    } else if (tier2Indicators.some(ind => actLower.includes(ind))) {
      tierCounts[2]++
      highestTier = Math.min(highestTier, 2)
    } else if (tier3Indicators.some(ind => actLower.includes(ind))) {
      tierCounts[3]++
      highestTier = Math.min(highestTier, 3)
    } else {
      tierCounts[4]++
    }
  }
  
  // School-specific scoring
  const isUltraSelective = schoolData.tier === 'ultra_selective'
  
  // Tier scoring - ultra-selective schools need Tier 1-2 to be competitive
  if (tierCounts[1] >= 2) {
    score += 35
    details.push(`Multiple Tier 1 achievements - exceptional for ${schoolData.name}`)
  } else if (tierCounts[1] >= 1) {
    score += 25
    details.push('Tier 1 (national/international) achievement present')
  } else if (tierCounts[2] >= 2) {
    score += 18
    details.push('Multiple Tier 2 (state/regional) achievements')
    if (isUltraSelective) {
      details.push(`Note: Most ${schoolData.name} admits have Tier 1 activities`)
    }
  } else if (tierCounts[2] >= 1) {
    score += 12
    details.push('Tier 2 (state/regional) achievement present')
  } else if (tierCounts[3] >= 2) {
    score += 8
    details.push('School-level leadership present but no state/national recognition')
    if (isUltraSelective) {
      details.push(`CONCERN: ${schoolData.name} expects state/national level distinction`)
    }
  } else {
    details.push('Activities lack distinguishing achievement levels')
    if (isUltraSelective) {
      details.push(`WARNING: ${schoolData.name} applicant pool has exceptional achievements`)
    }
  }
  
  // MIT-specific: look for MAKING and BUILDING
  if (schoolData.name === 'Massachusetts Institute of Technology') {
    const makerIndicators = ['built', 'created', 'designed', 'developed', 'programmed', 
                             'coded', 'invented', 'robotics', 'engineering', 'maker',
                             'hackathon', 'project', '3d print', 'arduino', 'raspberry pi']
    const hasMakerEvidence = makerIndicators.some(ind => content.includes(ind))
    if (hasMakerEvidence) {
      score += 10
      details.push('Evidence of hands-on making/building - strong for MIT')
    } else {
      score -= 5
      details.push('MIT-SPECIFIC CONCERN: No evidence of hands-on making or building')
    }
    
    // Collaboration check for MIT
    if (content.includes('team') || content.includes('collaborat') || content.includes('together')) {
      score += 5
      details.push('Shows collaborative spirit (valued at MIT)')
    }
  }
  
  // Harvard-specific: look for NARRATIVE and DISTINCTION
  if (schoolData.name === 'Harvard University') {
    // Check for clear narrative/theme
    const hasTheme = activities.length >= 2 && activities.some(a => 
      activities.filter(b => b !== a).some(b => {
        const wordsA = a.toLowerCase().split(/\s+/)
        const wordsB = b.toLowerCase().split(/\s+/)
        return wordsA.some(w => w.length > 4 && wordsB.includes(w))
      })
    )
    if (hasTheme) {
      score += 5
      details.push('Activities suggest coherent theme - good for Harvard\'s "narrative arc" preference')
    } else {
      details.push('HARVARD-SPECIFIC: Consider if activities tell a coherent story')
    }
  }
  
  // Depth bonus - look for years mentioned
  const yearsMatch = content.match(/(\d+)\s*years?/gi)
  if (yearsMatch) {
    const maxYears = Math.max(...yearsMatch.map(m => parseInt(m)))
    if (maxYears >= 4) {
      score += 10
      details.push(`Shows ${maxYears}-year commitment - demonstrates depth`)
    } else if (maxYears >= 2) {
      score += 5
      details.push('Multi-year commitment present')
    }
  }
  
  // Leadership mentions
  if (content.includes('led') || content.includes('managed') || 
      content.includes('organized') || content.includes('created')) {
    score += 5
    details.push('Leadership actions documented')
  }
  
  // Impact quantification
  if (content.match(/\d+\s*(people|members|students|participants|raised|served)/i)) {
    score += 5
    details.push('Quantified impact present')
  }
  
  // Breadth vs depth check
  if (activities.length > 8 && tierCounts[1] + tierCounts[2] < 2) {
    score -= 5
    details.push('Many activities but limited distinction - suggests breadth over depth')
  }
  
  score = Math.min(100, Math.max(0, score))
  
  // School-calibrated assessment
  let depthAnalysis = ''
  if (activities.length > 8) {
    depthAnalysis = 'High activity count may indicate breadth over depth'
  } else if (activities.length >= 3 && activities.length <= 6) {
    depthAnalysis = 'Reasonable activity count - check for depth in each'
  } else if (activities.length < 3) {
    depthAnalysis = 'Limited activities - focus must be on exceptional depth'
  }
  
  return {
    score,
    analysis: activities.length > 0
      ? details.join('. ') + '.'
      : 'No extracurricular activities provided.',
    tier_assessment: `Highest tier: Tier ${highestTier}. Distribution: Tier 1: ${tierCounts[1]}, Tier 2: ${tierCounts[2]}, Tier 3: ${tierCounts[3]}, Tier 4: ${tierCounts[4]}`,
    depth_vs_breadth: depthAnalysis,
    school_calibration: `Evaluated for ${schoolData.name} - ${isUltraSelective ? 'expects Tier 1-2 activities for competitive applicants' : 'values depth and genuine commitment'}`
  }
}

function analyzeEssays(formData: Record<string, unknown>, schoolData: SchoolCriteria): ComponentScore {
  const essayContent = getEssayContent(formData)
  const wordCount = essayContent.split(/\s+/).length
  const details: string[] = []
  
  let score = 50 // Base score
  
  if (wordCount < 50) {
    return {
      score: 30,
      analysis: 'Essays are too brief to evaluate effectively.',
      authenticity_assessment: 'Cannot assess - insufficient content',
      distinctiveness: 'Cannot assess - insufficient content',
      school_calibration: `${schoolData.name} requires compelling essays - insufficient content provided`
    }
  }
  
  // Length bonus
  if (wordCount >= 500) {
    score += 10
    details.push('Substantial essay length')
  } else if (wordCount >= 300) {
    score += 5
    details.push('Adequate essay length')
  } else {
    details.push('Essay is on the shorter side')
  }
  
  // Specificity indicators - crucial for all schools
  const specificityIndicators = essayContent.match(/when i was|one day|i remember|specifically|for example|in that moment|the [a-z]+ time|at exactly/gi)
  if (specificityIndicators && specificityIndicators.length >= 3) {
    score += 15
    details.push('Strong specificity - concrete details present')
  } else if (specificityIndicators && specificityIndicators.length >= 1) {
    score += 8
    details.push('Some specific details present')
  } else {
    details.push('Lacks specific, concrete details - essay feels generic')
  }
  
  // Reflection indicators
  const reflectionIndicators = essayContent.match(/i learned|i realized|this taught me|i grew|looking back|i understood|this showed me|i discovered/gi)
  if (reflectionIndicators && reflectionIndicators.length >= 2) {
    score += 12
    details.push('Shows genuine reflection and growth')
  } else if (reflectionIndicators && reflectionIndicators.length >= 1) {
    score += 6
    details.push('Some reflection present')
  } else {
    details.push('Limited evidence of self-reflection')
  }
  
  // Narrative structure check
  const hasHook = essayContent.slice(0, 200).match(/\?|suddenly|never|always|moment|remember/gi)
  if (hasHook) {
    score += 5
    details.push('Engaging opening')
  }
  
  // Cliché detection (negative) - extra important for ultra-selective
  const clichePatterns = [
    /changed my life/gi, /making a difference/gi, /passion for/gi, /giving back/gi,
    /since i was young/gi, /ever since i can remember/gi, /in this day and age/gi,
    /at the end of the day/gi, /invaluable experience/gi, /unique opportunity/gi,
    /journey of self-discovery/gi, /dream come true/gi
  ]
  const clicheCount = clichePatterns.reduce((count, pattern) => 
    count + (essayContent.match(pattern)?.length || 0), 0)
  
  if (clicheCount >= 3) {
    score -= 15
    details.push(`Multiple clichés detected (${clicheCount}) - essay lacks originality`)
  } else if (clicheCount >= 1) {
    score -= 5
    details.push('Some clichéd phrases present')
  }
  
  // Sophisticated vocabulary check - warning sign for authenticity
  const adultVoiceIndicators = essayContent.match(/consequently|furthermore|nonetheless|paradigm|encompass|juxtaposition|dichotomy|epitome|quintessential|myriad|plethora/gi)
  if (adultVoiceIndicators && adultVoiceIndicators.length >= 3) {
    score -= 10
    details.push('WARNING: Language sophistication suggests possible adult voice - authenticity concern')
  } else if (adultVoiceIndicators && adultVoiceIndicators.length >= 1) {
    details.push('Note: Some sophisticated vocabulary')
  }
  
  // School-specific checks
  if (schoolData.name === 'Harvard University') {
    // Harvard looks for clear narrative arc
    const narrativeWords = essayContent.match(/journey|became|transformed|shaped|evolved|grew into|realized/gi)
    if (narrativeWords && narrativeWords.length >= 2) {
      score += 5
      details.push('Shows narrative arc - valued at Harvard')
    } else {
      details.push('HARVARD-SPECIFIC: Consider if essay tells a clear story with arc')
    }
  }
  
  if (schoolData.name === 'Massachusetts Institute of Technology') {
    // MIT values evidence of making and building
    const mitKeywords = essayContent.match(/built|created|coded|designed|experimented|tinkered|solved|figured out/gi)
    if (mitKeywords && mitKeywords.length >= 2) {
      score += 5
      details.push('Evidence of hands-on problem-solving - strong for MIT')
    } else {
      details.push('MIT-SPECIFIC: Consider including evidence of making/building')
    }
    
    // MIT values authenticity and quirk
    if (essayContent.match(/weird|strange|obsessed|fascinated|curious/gi)) {
      score += 3
      details.push('Shows genuine personality/quirk - MIT appreciates this')
    }
  }
  
  if (schoolData.name === 'Stanford University') {
    // Stanford values intellectual vitality
    const intellectualVitality = essayContent.match(/curious|fascinated|wondered|explored|questioned|investigated|discovered/gi)
    if (intellectualVitality && intellectualVitality.length >= 2) {
      score += 5
      details.push('Demonstrates intellectual vitality - key for Stanford')
    } else {
      details.push('STANFORD-SPECIFIC: Essays should demonstrate intellectual vitality')
    }
  }
  
  if (schoolData.name === 'Yale University') {
    // Yale values deep thinking and humanities engagement
    const deepThinking = essayContent.match(/considered|reflected|examined|analyzed|questioned|pondered|grappled/gi)
    if (deepThinking && deepThinking.length >= 2) {
      score += 5
      details.push('Shows depth of thought - valued at Yale')
    }
  }
  
  if (schoolData.name === 'University of Chicago') {
    // UChicago loves quirky, intellectual essays
    const quirkyIntellectual = essayContent.match(/paradox|irony|strange|question|argue|philosophical|metaphor|absurd/gi)
    if (quirkyIntellectual && quirkyIntellectual.length >= 2) {
      score += 8
      details.push('Shows intellectual playfulness - perfect for UChicago')
    } else {
      details.push('UCHICAGO-SPECIFIC: Their quirky prompts deserve creative, intellectual responses')
    }
  }
  
  score = Math.min(100, Math.max(0, score))
  
  // Authenticity assessment
  let authenticity = 'Appears authentic'
  if (adultVoiceIndicators && adultVoiceIndicators.length >= 3) {
    authenticity = 'RED FLAG: Language sophistication suggests possible adult assistance'
  } else if (adultVoiceIndicators && adultVoiceIndicators.length >= 1) {
    authenticity = 'Some sophisticated language - monitor for authenticity'
  }
  
  // Distinctiveness assessment
  let distinctivenessLevel = 'Average'
  if (score >= 80 && clicheCount === 0 && specificityIndicators) {
    distinctivenessLevel = 'Distinctive - would stand out in review'
  } else if (score >= 65) {
    distinctivenessLevel = 'Somewhat distinctive'
  } else if (clicheCount >= 2) {
    distinctivenessLevel = 'Generic - would not stand out'
  }
  
  return {
    score,
    analysis: details.join('. ') + '.',
    authenticity_assessment: authenticity,
    distinctiveness: distinctivenessLevel,
    school_calibration: `Essays evaluated for ${schoolData.name}'s specific preferences. ${schoolData.essay_philosophy?.key_quote || 'Authenticity and specificity are key.'}`
  }
}

function analyzeFit(formData: Record<string, unknown>, schoolData: SchoolCriteria): ComponentScore {
  const whyContent = [formData.whySchool, formData.whyCollege, formData.whyMajor, formData.supplementalEssay]
    .filter(v => v && typeof v === 'string')
    .join(' ')
    .toLowerCase()
  
  const essayContent = getEssayContent(formData).toLowerCase()
  const allContent = whyContent + ' ' + essayContent
  
  let score = 50
  const details: string[] = []
  
  if (whyContent.length < 50 && !allContent.includes(schoolData.name.toLowerCase())) {
    return {
      score: 35,
      analysis: `No "Why ${schoolData.name}" content provided. At ${schoolData.tier} schools, demonstrating specific fit is crucial.`,
      specific_references: '0',
      school_calibration: `${schoolData.name} expects applicants to show genuine, specific interest`
    }
  }
  
  // Count specific references
  let specificCount = 0
  
  // Check for school name mention
  const schoolNameLower = schoolData.name.toLowerCase()
  const shortName = schoolNameLower.split(' ')[0] // "harvard", "massachusetts", etc.
  if (allContent.includes(schoolNameLower) || allContent.includes(shortName)) {
    specificCount++
  }
  
  // Program/department mentions
  if (allContent.match(/program|department|major|minor|concentration|course|class|curriculum/gi)) {
    specificCount++
  }
  
  // Professor/research mentions - very strong
  if (allContent.match(/professor|dr\.|research|lab|study under|work with/gi)) {
    specificCount += 2
    details.push('Mentions specific professor/research - strong fit indicator')
  }
  
  // Specific opportunity mentions
  if (allContent.match(/club|organization|tradition|center|institute|opportunity/gi)) {
    specificCount++
  }
  
  // School-specific checks
  if (schoolData.name === 'Harvard University') {
    if (allContent.includes('narrative') || allContent.includes('community') || 
        allContent.includes('house') || allContent.includes('concentration')) {
      specificCount++
      details.push('Uses Harvard-specific terminology')
    }
  }
  
  if (schoolData.name === 'Massachusetts Institute of Technology') {
    if (allContent.includes('mens et manus') || allContent.includes('mind and hand') ||
        allContent.includes('urop') || allContent.includes('maker') || 
        allContent.includes('iap') || allContent.includes('dorm')) {
      specificCount += 2
      details.push('References MIT-specific culture/programs - excellent')
    }
    // MIT values hands-on fit
    if (allContent.includes('build') || allContent.includes('create') || 
        allContent.includes('project') || allContent.includes('collaborate')) {
      score += 5
      details.push('Shows hands-on/collaborative fit with MIT culture')
    }
  }
  
  if (schoolData.name === 'Stanford University') {
    if (allContent.includes('intellectual vitality') || allContent.includes('silicon valley') ||
        allContent.includes('entrepreneurship') || allContent.includes('startup')) {
      specificCount++
      details.push('References Stanford culture/ecosystem')
    }
  }
  
  if (schoolData.name === 'Yale University') {
    if (allContent.includes('residential college') || allContent.includes('humanities') ||
        allContent.includes('liberal arts')) {
      specificCount++
      details.push('References Yale-specific community structure')
    }
  }
  
  if (schoolData.name === 'University of Chicago') {
    if (allContent.includes('core') || allContent.includes('life of the mind') ||
        allContent.includes('quirky') || allContent.includes('intellectual')) {
      specificCount++
      details.push('References UChicago intellectual culture')
    }
  }
  
  if (schoolData.name === 'Princeton University') {
    if (allContent.includes('undergraduate') || allContent.includes('service') ||
        allContent.includes('eating club')) {
      specificCount++
      details.push('References Princeton-specific culture')
    }
  }
  
  score += specificCount * 8
  
  // Generic phrases (negative) - red flags at ultra-selective
  const genericPhrases = allContent.match(/prestigious|ranking|best|top|excellent reputation|world-renowned|always dreamed|since i was young/gi)
  if (genericPhrases && genericPhrases.length >= 2) {
    score -= 15
    details.push('WARNING: Uses generic prestige-focused language instead of specific fit')
  } else if (genericPhrases && genericPhrases.length >= 1) {
    score -= 5
    details.push('Some generic prestige language detected')
  }
  
  // Check if response could apply to any school (very negative)
  const schoolSpecificWords = [shortName, ...Object.keys(UNIVERSITY_DATA)]
  const mentionsSchool = schoolSpecificWords.some(s => allContent.includes(s))
  if (!mentionsSchool && whyContent.length > 100) {
    score -= 10
    details.push(`CONCERN: "Why ${schoolData.name}" response doesn't mention the school specifically`)
  }
  
  // Values alignment check
  if (schoolData.what_they_seek) {
    const seekKeywords = schoolData.what_they_seek.join(' ').toLowerCase()
    const alignedWords = allContent.split(/\s+/).filter(word => 
      word.length > 4 && seekKeywords.includes(word)
    )
    if (alignedWords.length >= 3) {
      score += 10
      details.push('Shows alignment with what ' + schoolData.name + ' seeks')
    }
  }
  
  score = Math.min(100, Math.max(0, score))
  
  // Generate analysis
  let analysis = ''
  if (specificCount >= 4) {
    analysis = `Excellent fit demonstration for ${schoolData.name}. Shows genuine research and specific interest.`
  } else if (specificCount >= 2) {
    analysis = `Shows some knowledge of ${schoolData.name}, but could be more specific about programs/opportunities.`
  } else {
    analysis = `Minimal specific fit with ${schoolData.name}. Response feels generic and could apply to many schools.`
  }
  
  return {
    score,
    analysis: analysis + (details.length > 0 ? ' ' + details.join('. ') + '.' : ''),
    specific_references: String(specificCount),
    school_calibration: `Evaluated for specific fit with ${schoolData.name}. ${schoolData.unique_differentiators?.[0] || 'Understanding school culture is crucial.'}`
  }
}

function assessNarrative(formData: Record<string, unknown>): ReviewResult['narrative_assessment'] {
  const allContent = Object.values(formData)
    .filter(v => typeof v === 'string')
    .join(' ')
    .toLowerCase()
  
  // Look for common themes
  const stemKeywords = (allContent.match(/coding|programming|research|science|engineering|math|technology|computer/gi) || []).length
  const artsKeywords = (allContent.match(/art|music|theater|writing|creative|design|dance|perform/gi) || []).length
  const leadershipKeywords = (allContent.match(/led|president|captain|founded|organized|initiative|started/gi) || []).length
  const serviceKeywords = (allContent.match(/volunteer|community|help|service|nonprofit|charity|mentor/gi) || []).length
  
  let archetype = 'None Clear'
  let narrative = false
  let summarizedAs = 'This is the student who... (no clear narrative emerges)'
  
  if (stemKeywords >= 5 && leadershipKeywords >= 2) {
    archetype = 'The Specialist'
    narrative = true
    summarizedAs = 'This is the student who loves building things and leading technical projects'
  } else if (leadershipKeywords >= 4) {
    archetype = 'The Entrepreneur'
    narrative = true
    summarizedAs = 'This is the student who takes initiative and creates new things'
  } else if (serviceKeywords >= 4) {
    archetype = 'The Connector'
    narrative = true
    summarizedAs = 'This is the student who cares deeply about community and helping others'
  } else if (artsKeywords >= 4) {
    archetype = 'The Specialist'
    narrative = true
    summarizedAs = 'This is the student passionate about creative expression'
  }
  
  // Check for coherence issues
  const coherenceIssues: string[] = []
  
  if (stemKeywords >= 3 && artsKeywords >= 3) {
    coherenceIssues.push('Activities span multiple domains without clear connection')
  }
  
  if (formData.intendedMajor) {
    const major = String(formData.intendedMajor).toLowerCase()
    if (major.includes('computer') && stemKeywords < 3) {
      coherenceIssues.push('Intended major not well-supported by activities')
    }
  }
  
  return {
    has_clear_narrative: narrative,
    archetype,
    can_be_summarized_as: summarizedAs,
    coherence_issues: coherenceIssues
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLE SCHOOL SPECIFIC ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

function analyzeMiddleSchoolEssays(formData: Record<string, unknown>): ComponentScore {
  const essayFields = ['personalStatement', 'personalEssay', 'challenge']
  const essayContent = essayFields
    .map(f => formData[f])
    .filter(v => v && typeof v === 'string')
    .join(' ')
  
  const wordCount = essayContent.split(/\s+/).filter(w => w.length > 0).length
  const lowerContent = essayContent.toLowerCase()
  
  if (wordCount < 30) {
    return {
      score: 30,
      analysis: 'Essays are too brief to evaluate effectively.',
      authenticity_assessment: 'Cannot assess - insufficient content'
    }
  }
  
  let score = 55 // Start with moderate score for middle school
  
  // CRITICAL: Child voice detection - this is the most important factor
  // Check for sophisticated vocabulary that's unusual for 10-12 year olds
  const adultPatterns = /consequently|furthermore|nonetheless|paradigm|multifaceted|ubiquitous|dichotomy|juxtaposition|plethora|myriad/gi
  const adultMatches = lowerContent.match(adultPatterns) || []
  const suspectedAdultVoice = adultMatches.length >= 2
  
  if (suspectedAdultVoice) {
    score -= 25 // Major penalty for adult voice
  }
  
  // Natural child voice indicators (positive)
  const childVoicePatterns = /i love|i really|i was so|my favorite|it was really|so much fun|i felt|it made me|i think|super|awesome|cool|amazing/gi
  const childVoiceMatches = lowerContent.match(childVoicePatterns) || []
  if (childVoiceMatches.length >= 3) score += 15
  
  // Enthusiasm indicators (positive)
  const enthusiasmPatterns = /excited|love|passion|favorite|enjoy|fun|happy|proud|amazing|awesome/gi
  const enthusiasmMatches = lowerContent.match(enthusiasmPatterns) || []
  if (enthusiasmMatches.length >= 2) score += 10
  
  // Specific details (positive)
  const specificPatterns = /when i was|one time|i remember|last year|my \w+ said|at my school/gi
  const specificMatches = lowerContent.match(specificPatterns) || []
  if (specificMatches.length >= 2) score += 10
  
  score = Math.min(100, Math.max(0, score))
  
  let authenticity = 'Voice sounds age-appropriate'
  if (suspectedAdultVoice) {
    authenticity = 'WARNING: Essay may not be written by the child - vocabulary and style seem too adult'
  } else if (childVoiceMatches.length >= 3) {
    authenticity = 'Essay has authentic child voice - sounds like a 10-12 year old'
  }
  
  return {
    score,
    analysis: score >= 70 
      ? 'Essay shows authentic child voice with genuine enthusiasm.'
      : suspectedAdultVoice 
        ? 'Essay raises concerns about authenticity - doesn\'t sound like a child wrote it.'
        : 'Essay could show more of the child\'s personality and specific experiences.',
    authenticity_assessment: authenticity
  }
}

function analyzeMiddleSchoolActivities(formData: Record<string, unknown>): ComponentScore {
  const activityFields = ['activity1', 'activity2', 'activity3', 'activity4', 'otherInterests']
  const activities = activityFields
    .map(f => formData[f])
    .filter(v => v && typeof v === 'string') as string[]
  
  const activityCount = activities.length
  const content = activities.join(' ').toLowerCase()
  
  if (activityCount === 0) {
    return {
      score: 35,
      analysis: 'No activities described.',
      depth_assessment: 'Cannot assess depth without activity information'
    }
  }
  
  let score = 50
  
  // Check for multi-year commitment (very positive at this age)
  const yearsPatterns = /(\d+)\s*years?|since \w+ grade|for the past/gi
  const yearsMatches = content.match(yearsPatterns) || []
  if (yearsMatches.length >= 1) {
    score += 20 // Multi-year commitment is impressive at this age
  }
  
  // Check for genuine passion indicators
  const passionPatterns = /i love|makes me feel|meaningful|proud|taught me/gi
  const passionMatches = content.match(passionPatterns) || []
  if (passionMatches.length >= 2) score += 10
  
  // Check for over-scheduling (negative) - 6+ activities is a red flag at age 10-12
  if (activityCount >= 6) {
    score -= 15 // Too many activities suggests parent-driven
  }
  
  // Check for progression/achievement appropriate for age
  const progressPatterns = /belt|level|team|award|first place|competition/gi
  const progressMatches = content.match(progressPatterns) || []
  if (progressMatches.length >= 1) score += 5
  
  score = Math.min(100, Math.max(0, score))
  
  let depthAssessment = 'Mix of activities'
  if (yearsMatches.length >= 2) {
    depthAssessment = 'Shows sustained commitment to multiple activities - excellent for this age'
  } else if (activityCount >= 6) {
    depthAssessment = 'Many activities listed - may indicate breadth over depth or parent-driven scheduling'
  } else if (yearsMatches.length >= 1) {
    depthAssessment = 'Shows at least one sustained commitment'
  }
  
  return {
    score,
    analysis: score >= 70
      ? `${activityCount} activities with evidence of genuine interest and commitment.`
      : `${activityCount} activities described. ${depthAssessment}.`,
    depth_assessment: depthAssessment
  }
}

function analyzeMiddleSchoolAcademics(formData: Record<string, unknown>): ComponentScore {
  // Middle school academics are less about GPA and more about growth and curiosity
  const allContent = Object.values(formData)
    .filter(v => typeof v === 'string')
    .join(' ')
    .toLowerCase()
  
  let score = 60 // Start with decent baseline for middle school
  
  // Look for growth/improvement stories (very positive)
  const growthPatterns = /improved|grew|worked hard|challenge|overcame|got better|jumped|progress/gi
  const growthMatches = allContent.match(growthPatterns) || []
  if (growthMatches.length >= 2) score += 15
  
  // Look for academic enthusiasm
  const academicPatterns = /love learning|curious|favorite subject|interested in|reading|science|math|history/gi
  const academicMatches = allContent.match(academicPatterns) || []
  if (academicMatches.length >= 2) score += 10
  
  // Look for specific academic achievements
  const achievementPatterns = /honor roll|100%|a\+|top|advanced|accelerated/gi
  const achievementMatches = allContent.match(achievementPatterns) || []
  if (achievementMatches.length >= 1) score += 10
  
  score = Math.min(100, Math.max(0, score))
  
  return {
    score,
    analysis: score >= 70
      ? 'Academic profile shows curiosity and engagement with learning.'
      : 'Academic profile is present. Growth stories and intellectual curiosity strengthen applications at this age.',
    percentile_context: 'N/A for middle school - schools look for potential and growth'
  }
}

function analyzeParentStatement(formData: Record<string, unknown>): ComponentScore {
  const parentContent = [formData.parentStatement, formData.growthAreas]
    .filter(v => v && typeof v === 'string')
    .join(' ')
  
  const wordCount = parentContent.split(/\s+/).filter(w => w.length > 0).length
  const lowerContent = parentContent.toLowerCase()
  
  if (wordCount < 50) {
    return {
      score: 40,
      analysis: 'Parent statement is brief or missing.',
      specific_references: '0'
    }
  }
  
  let score = 55
  
  // Check for specific stories (positive)
  const storyPatterns = /one time|when she|when he|i remember|there was a time|for example/gi
  const storyMatches = lowerContent.match(storyPatterns) || []
  if (storyMatches.length >= 1) score += 15
  
  // Check for growth areas mentioned (positive - shows honesty)
  const growthPatterns = /working on|learning to|sometimes struggles|growth|challenging/gi
  const growthMatches = lowerContent.match(growthPatterns) || []
  if (growthMatches.length >= 1) score += 10
  
  // Check for overselling (negative)
  const oversellPatterns = /exceptional|genius|prodigy|best in|unlike any other/gi
  const oversellMatches = lowerContent.match(oversellPatterns) || []
  if (oversellMatches.length >= 2) score -= 10
  
  score = Math.min(100, Math.max(0, score))
  
  return {
    score,
    analysis: score >= 70
      ? 'Parent statement provides specific, authentic insight into the child.'
      : 'Parent statement is present but could include more specific stories and honest growth areas.',
    specific_references: String(storyMatches.length)
  }
}

function assessMiddleSchoolNarrative(formData: Record<string, unknown>): ReviewResult['narrative_assessment'] {
  const allContent = Object.values(formData)
    .filter(v => typeof v === 'string')
    .join(' ')
    .toLowerCase()
  
  // Age-appropriate narrative archetypes
  const curiousKeywords = (allContent.match(/curious|learn|wonder|question|explore|discover|interested|love learning/gi) || []).length
  const dedicatedKeywords = (allContent.match(/years|practice|training|belt|level|team|commitment|every week/gi) || []).length
  const kindKeywords = (allContent.match(/friend|help|kind|share|care|feel|others|together/gi) || []).length
  const resilientKeywords = (allContent.match(/challenge|overcome|difficult|hard work|improve|grew|didn't give up/gi) || []).length
  
  let archetype = 'None Clear'
  let hasNarrative = false
  let summarizedAs = 'This is the child who... (no clear story emerges)'
  
  if (resilientKeywords >= 4) {
    archetype = 'The Resilient Learner'
    hasNarrative = true
    summarizedAs = 'This is the child who faces challenges head-on and grows from them'
  } else if (dedicatedKeywords >= 5) {
    archetype = 'The Dedicated Practitioner'
    hasNarrative = true
    summarizedAs = 'This is the child with deep commitment to their interests'
  } else if (curiousKeywords >= 4) {
    archetype = 'The Curious Explorer'
    hasNarrative = true
    summarizedAs = 'This is the child who loves learning and asks lots of questions'
  } else if (kindKeywords >= 4) {
    archetype = 'The Kind Connector'
    hasNarrative = true
    summarizedAs = 'This is the child who cares about others and builds relationships'
  }
  
  return {
    has_clear_narrative: hasNarrative,
    archetype,
    can_be_summarized_as: summarizedAs,
    coherence_issues: []
  }
}

function detectMiddleSchoolWeaknesses(
  formData: Record<string, unknown>,
  essays: ComponentScore,
  activities: ComponentScore,
  parent: ComponentScore
): Weakness[] {
  const weaknesses: Weakness[] = []
  
  // 1. Adult voice in essays (CRITICAL)
  if (essays.authenticity_assessment?.includes('WARNING') || essays.authenticity_assessment?.includes('adult')) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Essays',
      weakness: 'Essay May Not Be Child-Written',
      evidence: 'Language and style don\'t sound like a typical 10-12 year old',
      school_expectation: 'Middle schools want to hear the CHILD\'s voice, not a polished adult version'
    })
  }
  
  // 2. Over-scheduled (too many activities)
  const activityCount = ['activity1', 'activity2', 'activity3', 'activity4', 'activity5', 'otherInterests']
    .filter(f => formData[f] && String(formData[f]).trim()).length
  if (activityCount >= 6) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Activities',
      weakness: 'Over-Scheduled Child',
      evidence: `${activityCount} activities listed - may indicate parent-driven scheduling`,
      school_expectation: 'Schools want to see 2-3 genuine interests with depth, not a long list'
    })
  }
  
  // 3. No authentic personality
  if (essays.score < 55 && activities.score < 55) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Overall Application',
      weakness: 'No Child Personality Visible',
      evidence: 'Application lacks specific stories, enthusiasm, or genuine personality',
      school_expectation: 'Admissions wants to meet the real child through the application'
    })
  }
  
  // 4. Parent statement mismatch
  if (parent.score < 50) {
    weaknesses.push({
      priority: 'MEDIUM',
      category: 'Parent Statement',
      weakness: 'Parent Statement Needs Development',
      evidence: parent.analysis,
      school_expectation: 'Parent statements should share specific stories and honest growth areas'
    })
  }
  
  return weaknesses
}

function detectMiddleSchoolRedFlags(formData: Record<string, unknown>, essays: ComponentScore): RedFlag[] {
  const redFlags: RedFlag[] = []
  
  // Adult voice is the biggest red flag
  if (essays.authenticity_assessment?.includes('WARNING') || essays.authenticity_assessment?.includes('adult')) {
    redFlags.push({
      flag: 'Essay Likely Not Written by Child',
      severity: 'critical',
      evidence: 'Vocabulary and writing style exceed typical 5th/6th grade level',
      impact: 'This is the most damaging red flag in middle school admissions. Schools detect this immediately and it raises questions about the entire application.'
    })
  }
  
  return redFlags
}

function generateMiddleSchoolFinalAssessment(
  score: number,
  rating: string,
  weaknesses: Weakness[],
  redFlags: RedFlag[]
): string {
  const highPriorityWeaknesses = weaknesses.filter(w => w.priority === 'HIGH')
  
  let assessment = `This middle school application receives an overall score of ${score}/100, placing it in the "${rating}" category.\n\n`
  
  if (redFlags.length > 0) {
    assessment += `**Critical Concern:** ${redFlags[0].flag}. ${redFlags[0].impact}\n\n`
  }
  
  if (highPriorityWeaknesses.length > 0) {
    assessment += `The application has ${highPriorityWeaknesses.length} area(s) of concern: `
    assessment += highPriorityWeaknesses.map(w => w.weakness).join(', ') + '. '
  }
  
  if (score >= 75) {
    assessment += 'This is a promising application that shows a genuine child with real interests and personality. Selective middle schools want to see potential, and this child demonstrates it.'
  } else if (score >= 60) {
    assessment += 'This application shows a child with interests and activities, but could benefit from letting more authentic personality shine through. Remember: schools want to meet the real child.'
  } else {
    assessment += 'This application needs development. The most important thing is to ensure the child\'s genuine voice comes through. At this age, authenticity matters far more than impressive achievements.'
  }
  
  return assessment
}

// ═══════════════════════════════════════════════════════════════════════════
// HIGH SCHOOL SPECIFIC ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

function analyzeHighSchoolEssays(formData: Record<string, unknown>): ComponentScore {
  const essayContent = getEssayContent(formData)
  const wordCount = essayContent.split(/\s+/).filter(w => w.length > 0).length
  const lowerContent = essayContent.toLowerCase()
  
  if (wordCount < 50) {
    return {
      score: 30,
      analysis: 'Essays are too brief.',
      authenticity_assessment: 'Cannot assess'
    }
  }
  
  let score = 50
  
  // Check for 14-year-old appropriate voice (not too adult, not too young)
  const overly_adult = /consequently|furthermore|nonetheless|paradigm|multifaceted|ubiquitous/gi
  const adultMatches = lowerContent.match(overly_adult) || []
  if (adultMatches.length >= 2) score -= 15
  
  // Look for specific stories and reflection
  const specificPatterns = /when i|i remember|that moment|for example|specifically|one time/gi
  const specificMatches = lowerContent.match(specificPatterns) || []
  if (specificMatches.length >= 2) score += 15
  
  // Look for self-reflection
  const reflectionPatterns = /i learned|i realized|taught me|made me|i grew|i understand/gi
  const reflectionMatches = lowerContent.match(reflectionPatterns) || []
  if (reflectionMatches.length >= 1) score += 10
  
  // Check for clichés
  const clichePatterns = /changed my life|making a difference|passionate about|since i was young/gi
  const clicheMatches = lowerContent.match(clichePatterns) || []
  if (clicheMatches.length >= 2) score -= 10
  
  // Length bonus
  if (wordCount >= 400) score += 10
  
  score = Math.min(100, Math.max(0, score))
  
  let authenticity = 'Voice appropriate for age'
  if (adultMatches.length >= 2) {
    authenticity = 'Essay may be over-edited - doesn\'t sound like a 14-year-old'
  }
  
  return {
    score,
    analysis: score >= 70 
      ? 'Essays show authentic teenage voice with specific examples and reflection.'
      : 'Essays could benefit from more specific stories and genuine personality.',
    authenticity_assessment: authenticity,
    distinctiveness: score >= 75 ? 'Memorable' : 'May not stand out'
  }
}

function analyzeHighSchoolActivities(formData: Record<string, unknown>): ComponentScore {
  const activities: string[] = []
  for (let i = 1; i <= 5; i++) {
    if (formData[`activity${i}`]) activities.push(String(formData[`activity${i}`]))
  }
  if (formData.leadershipRoles) activities.push(String(formData.leadershipRoles))
  
  const activityCount = activities.length
  const content = activities.join(' ').toLowerCase()
  
  if (activityCount === 0) {
    return {
      score: 30,
      analysis: 'No activities provided.',
      tier_assessment: 'Cannot assess'
    }
  }
  
  let score = 45
  let highestTier = 4
  
  // State/regional level (impressive for 8th grader)
  if (content.match(/state|regional|all-state|all-region|finalist|champion/gi)) {
    score += 25
    highestTier = 2
  }
  // School leadership
  else if (content.match(/president|captain|founder|leader|head|editor/gi)) {
    score += 15
    highestTier = 3
  }
  
  // Multi-year commitment
  const yearsMatches = content.match(/(\d+)\s*years?|since|for the past/gi) || []
  if (yearsMatches.length >= 2) score += 15
  else if (yearsMatches.length >= 1) score += 5
  
  // Quantified impact
  if (content.match(/\d+\s*(people|members|students|hours|dollars|\$)/gi)) score += 5
  
  score = Math.min(100, Math.max(0, score))
  
  const tierDescription = highestTier === 2 ? 'State/Regional Level' : 
                         highestTier === 3 ? 'School Leadership' : 'Participation Level'
  
  return {
    score,
    analysis: `${activityCount} activities. Highest achievement: ${tierDescription}.`,
    tier_assessment: `Tier ${highestTier}: ${tierDescription}`,
    depth_vs_breadth: activityCount >= 6 ? 'Many activities - depth unclear' : 
                     yearsMatches.length >= 2 ? 'Shows sustained commitment' : 'Moderate depth'
  }
}

function analyzeHighSchoolAcademics(formData: Record<string, unknown>): ComponentScore {
  const gpa = formData.gpa ? parseFloat(String(formData.gpa)) : 0
  
  let score = 50
  
  if (gpa >= 3.9) score += 25
  else if (gpa >= 3.7) score += 15
  else if (gpa >= 3.5) score += 5
  else if (gpa > 0 && gpa < 3.5) score -= 5
  else if (!gpa) score += 10 // Middle school may not have GPA, don't penalize
  
  // Look for academic indicators in content
  const allContent = Object.values(formData)
    .filter(v => typeof v === 'string')
    .join(' ').toLowerCase()
  
  if (allContent.match(/honor|advanced|accelerated|mathcounts|science olympiad/gi)) score += 10
  
  score = Math.min(100, Math.max(0, score))
  
  return {
    score,
    analysis: gpa 
      ? `GPA of ${gpa}. ${gpa >= 3.7 ? 'Competitive for selective private high schools.' : 'May be below typical range for most selective schools.'}`
      : 'GPA not provided. Academic achievement indicators present in application.',
    percentile_context: score >= 70 ? 'Competitive range' : 'May be below typical admitted student profile'
  }
}

function detectHighSchoolWeaknesses(
  formData: Record<string, unknown>,
  essays: ComponentScore,
  activities: ComponentScore,
  academics: ComponentScore
): Weakness[] {
  const weaknesses: Weakness[] = []
  
  // 1. Breadth over depth
  const activityCount = [1,2,3,4,5].filter(i => formData[`activity${i}`]).length
  if (activityCount >= 5 && (!activities.tier_assessment || activities.tier_assessment.includes('Tier 4'))) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Activities',
      weakness: 'Too Many Activities Without Depth',
      evidence: 'Many activities listed but limited evidence of sustained commitment or achievement',
      school_expectation: 'Competitive high schools want 2-3 deep commitments over 5+ surface-level activities'
    })
  }
  
  // 2. No leadership
  const allContent = Object.values(formData).filter(v => typeof v === 'string').join(' ').toLowerCase()
  if (!allContent.match(/president|captain|founder|leader|led|created|organized|started/gi)) {
    weaknesses.push({
      priority: 'MEDIUM',
      category: 'Activities',
      weakness: 'No Evidence of Leadership',
      evidence: 'Activities show participation but no leadership roles or initiative',
      school_expectation: 'By 8th grade, competitive applicants typically have at least one leadership role'
    })
  }
  
  // 3. Generic essays
  if (essays.score < 60) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Essays',
      weakness: 'Essays Lack Distinctive Voice',
      evidence: 'Essays need more specific stories and authentic teenage personality',
      school_expectation: 'Essays should sound like a thoughtful 14-year-old, not a consultant'
    })
  }
  
  // 4. Academic gaps
  if (academics.score < 55) {
    weaknesses.push({
      priority: 'MEDIUM',
      category: 'Academics',
      weakness: 'Academic Profile May Be Below Target',
      evidence: academics.analysis,
      school_expectation: 'Competitive private high schools typically expect GPA of 3.5+ and strong test scores'
    })
  }
  
  return weaknesses
}

function detectWeaknesses(
  formData: Record<string, unknown>,
  academics: ComponentScore,
  extracurriculars: ComponentScore,
  essays: ComponentScore,
  fit: ComponentScore,
  schoolData: SchoolCriteria
): Weakness[] {
  const weaknesses: Weakness[] = []
  const isUltraSelective = schoolData.tier === 'ultra_selective'
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HIGH PRIORITY WEAKNESSES
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 1. Well-rounded but not distinguished (especially critical at ultra-selective)
  if (extracurriculars.tier_assessment?.includes('Tier 3') || 
      extracurriculars.tier_assessment?.includes('Tier 4')) {
    const activityCount = [1,2,3,4,5].filter(i => formData[`activity${i}`]).length + 
                          (formData.activities ? 1 : 0)
    if (activityCount >= 3) {
      weaknesses.push({
        priority: 'HIGH',
        category: 'Extracurriculars',
        weakness: 'Well-Rounded But Not Distinguished',
        evidence: `${activityCount}+ activities present but no Tier 1-2 (state/national) level achievements detected`,
        school_expectation: isUltraSelective
          ? `${schoolData.name} (${schoolData.acceptance_rate} acceptance) expects exceptional distinction. Most admitted students have state or national recognition.`
          : `${schoolData.name} values depth and achievement over breadth of activities.`
      })
    }
  }
  
  // 2. No clear narrative arc
  const narrative = assessNarrative(formData)
  if (!narrative.has_clear_narrative) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Overall Application',
      weakness: 'No Clear Narrative Arc',
      evidence: `Application lacks a cohesive story. Archetype: "${narrative.archetype}". Cannot easily summarize as "the student who..."`,
      school_expectation: schoolData.name === 'Harvard University'
        ? 'Harvard explicitly looks for "clear arc to their application—the notable scientist, the future political leader, the bridge-builder."'
        : 'Admissions committees remember applicants with clear identities that tie their activities, essays, and goals together.'
    })
  }
  
  // 3. Generic essays lacking authentic voice
  if (essays.score < 70 || essays.distinctiveness?.includes('Generic')) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Essays',
      weakness: 'Essays Lack Distinctive Voice',
      evidence: essays.analysis || 'Essays don\'t have enough specific details or genuine personality to stand out',
      school_expectation: isUltraSelective
        ? `${schoolData.name} reads 40,000+ applications. Essays are primary tool for differentiation. ${schoolData.essay_philosophy?.key_quote || ''}`
        : 'Essays should reveal genuine personality and specific experiences only you could share.'
    })
  }
  
  // 4. Breadth over depth in activities
  const activityCount = [1,2,3,4,5].filter(i => formData[`activity${i}`]).length
  if (activityCount >= 6 && extracurriculars.score < 75) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Extracurriculars',
      weakness: 'Breadth Over Depth in Activities',
      evidence: `${activityCount} activities listed without clear evidence of deep commitment to any. ${schoolData.extracurricular_expectations?.depth_vs_breadth || ''}`,
      school_expectation: schoolData.name === 'Massachusetts Institute of Technology'
        ? 'MIT explicitly states: "Don\'t expect million things. Put heart into few things you truly care about."'
        : `${schoolData.name} values 2-3 deeply committed activities over 8-10 superficial ones.`
    })
  }
  
  // 5. Lacks state/national achievement (ultra-selective specific)
  if (isUltraSelective && !extracurriculars.tier_assessment?.includes('Tier 1') && 
      !extracurriculars.tier_assessment?.includes('Tier 2')) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Extracurriculars',
      weakness: 'No State/National Level Achievement',
      evidence: 'Application shows only school-level or local involvement without regional/state/national recognition',
      school_expectation: `At ${schoolData.name} (${schoolData.acceptance_rate}), most admitted students have multiple state or national level achievements, awards, or recognition.`
    })
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MEDIUM PRIORITY WEAKNESSES  
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 6. Test scores below school average
  const sat = formData.satScore ? parseInt(String(formData.satScore)) : 0
  const sat25th = schoolData.academic_expectations?.sat_25th || 1450
  if (sat > 0 && sat < sat25th) {
    weaknesses.push({
      priority: 'MEDIUM',
      category: 'Academics',
      weakness: 'Test Scores Below School Range',
      evidence: `SAT of ${sat} is below ${schoolData.name}'s 25th percentile of ${sat25th}. This means 75%+ of admitted students scored higher.`,
      school_expectation: `${schoolData.name}'s middle 50% SAT range is ${sat25th}-${schoolData.academic_expectations?.sat_75th || 1580}.`
    })
  }
  
  // 7. Generic "Why This School" response
  if (fit.score < 65) {
    weaknesses.push({
      priority: 'MEDIUM',
      category: 'University Fit',
      weakness: `Generic "Why ${schoolData.name}" Response`,
      evidence: fit.analysis || 'Limited specific references to programs, professors, or unique opportunities',
      school_expectation: schoolData.unique_differentiators
        ? `${schoolData.name} is unique because: ${schoolData.unique_differentiators[0]}. Your response should reflect understanding of this.`
        : 'Schools want to see genuine research and specific reasons for applying.'
    })
  }
  
  // 8. Activities don't support stated interests
  const intendedMajor = String(formData.intendedMajor || formData.major || '').toLowerCase()
  if (intendedMajor && extracurriculars.analysis) {
    const analysisLower = extracurriculars.analysis.toLowerCase()
    const hasMismatch = (intendedMajor.includes('computer') || intendedMajor.includes('engineering')) && 
                        !analysisLower.includes('tech') && !analysisLower.includes('coding') &&
                        !analysisLower.includes('robot') && !analysisLower.includes('program')
    if (hasMismatch) {
      weaknesses.push({
        priority: 'MEDIUM',
        category: 'Coherence',
        weakness: 'Activities Don\'t Support Stated Interests',
        evidence: `Intended major (${intendedMajor}) isn't clearly supported by extracurricular activities`,
        school_expectation: 'Strong applications show alignment between stated interests and demonstrated activities.'
      })
    }
  }
  
  // 9. Academic profile below expectations
  if (academics.score < 70) {
    weaknesses.push({
      priority: 'MEDIUM',
      category: 'Academics',
      weakness: 'Academic Profile Below Target School Average',
      evidence: academics.analysis || 'Academic metrics fall below typical admitted student profile',
      school_expectation: `${schoolData.name} typically admits students ${schoolData.academic_expectations?.gpa_expectation || 'in the top 10%'} with rigorous coursework.`
    })
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SCHOOL-SPECIFIC WEAKNESSES
  // ═══════════════════════════════════════════════════════════════════════════
  
  // MIT-specific: No evidence of making/building
  if (schoolData.name === 'Massachusetts Institute of Technology') {
    const allContent = Object.values(formData).filter(v => typeof v === 'string').join(' ').toLowerCase()
    const makerEvidence = allContent.match(/built|created|designed|developed|programmed|coded|invented|robotics|project|hackathon|maker/gi)
    if (!makerEvidence || makerEvidence.length < 2) {
      weaknesses.push({
        priority: 'HIGH',
        category: 'MIT Fit',
        weakness: 'No Evidence of Hands-On Making/Building',
        evidence: 'MIT\'s motto is "Mens et Manus" (Mind and Hand). Application lacks evidence of building, creating, or making things.',
        school_expectation: 'MIT values students who have "gotten their hands dirty" - evidence of projects, prototypes, or hands-on problem-solving is expected.'
      })
    }
    
    // Check for lone genius vs collaborator
    const collaborativeEvidence = allContent.match(/team|together|collaborated|group|partnered|with others/gi)
    if (!collaborativeEvidence) {
      weaknesses.push({
        priority: 'MEDIUM',
        category: 'MIT Fit',
        weakness: 'No Evidence of Collaborative Spirit',
        evidence: 'Application presents as individual achiever without evidence of teamwork or collaboration',
        school_expectation: 'MIT seeks collaborative problem-solvers, not "lone geniuses." They want students who will lift each other up.'
      })
    }
  }
  
  // Harvard-specific: Check for narrative arc
  if (schoolData.name === 'Harvard University' && !narrative.has_clear_narrative) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Harvard Fit',
      weakness: 'Missing Harvard\'s "Narrative Arc"',
      evidence: `Harvard admissions specifically looks for clear archetypes: "the notable scientist," "the future leader," "the bridge-builder." This application lacks such clarity.`,
      school_expectation: 'Students with clear arc to their application have best chances at Harvard. What memorable phrase would summarize this applicant?'
    })
  }
  
  // Stanford-specific: Check for intellectual vitality
  if (schoolData.name === 'Stanford University') {
    const allContent = Object.values(formData).filter(v => typeof v === 'string').join(' ').toLowerCase()
    const intellectualVitality = allContent.match(/curious|fascinated|wondered|explored|questioned|investigated|discovered|passion|love learning/gi)
    if (!intellectualVitality || intellectualVitality.length < 2) {
      weaknesses.push({
        priority: 'HIGH',
        category: 'Stanford Fit',
        weakness: 'Limited Evidence of Intellectual Vitality',
        evidence: 'Application doesn\'t demonstrate genuine intellectual curiosity beyond required coursework',
        school_expectation: 'Stanford explicitly evaluates "intellectual vitality" - evidence of curiosity and learning for its own sake is crucial.'
      })
    }
  }
  
  return weaknesses
}

function detectRedFlags(formData: Record<string, unknown>, essays: ComponentScore, schoolData: SchoolCriteria): RedFlag[] {
  const redFlags: RedFlag[] = []
  const essayContent = getEssayContent(formData)
  const allContent = Object.values(formData).filter(v => typeof v === 'string').join(' ')
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CRITICAL RED FLAGS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 1. Adult voice in essays (most damaging)
  if (essays.authenticity_assessment?.includes('RED FLAG') || 
      essays.authenticity_assessment?.includes('adult')) {
    redFlags.push({
      flag: 'Essay Appears Adult-Written',
      severity: 'critical',
      evidence: 'Language sophistication and vocabulary significantly exceed typical high school level',
      impact: `${schoolData.name}'s admissions officers are highly experienced at detecting parent or consultant involvement. This can result in immediate rejection.`
    })
  } else if (essays.authenticity_assessment?.includes('sophisticated')) {
    redFlags.push({
      flag: 'Possible Adult Voice in Essay',
      severity: 'high',
      evidence: 'Some language patterns suggest possible adult assistance',
      impact: 'Admissions committees are trained to identify inauthentic voice. Inconsistent sophistication is a warning sign.'
    })
  }
  
  // 2. Check for inflated/unverifiable achievements
  const inflationIndicators = allContent.match(/thousands|millions|global impact|changed the world|revolutionary|breakthrough|invented|discovered/gi)
  if (inflationIndicators && inflationIndicators.length >= 2) {
    redFlags.push({
      flag: 'Potentially Inflated Achievements',
      severity: 'high',
      evidence: `Claims use superlative language: "${inflationIndicators.slice(0, 2).join('", "')}"`,
      impact: 'Extraordinary claims require extraordinary evidence. Admissions officers verify claims and communicate with counselors. Inflation can lead to rescinded offers.'
    })
  }
  
  // 3. Check for avoided academic rigor
  const gpa = formData.gpa ? parseFloat(String(formData.gpa)) : 0
  const courseRigor = String(formData.courseRigor || '').toLowerCase()
  const apCount = parseInt((courseRigor.match(/\d+/) || ['0'])[0])
  if (gpa >= 3.9 && apCount < 4 && schoolData.tier === 'ultra_selective') {
    redFlags.push({
      flag: 'Avoided Academic Rigor',
      severity: 'high',
      evidence: `High GPA (${gpa}) but limited AP/IB courses (${apCount}). May indicate grade inflation or avoiding challenging courses.`,
      impact: `${schoolData.name} evaluates grades in context of course difficulty. A 4.0 in regular classes is less competitive than a 3.7 in the most rigorous available.`
    })
  }
  
  // 4. Check for consultant-template language
  const templatePhrases = essayContent.match(/transformative experience|profound impact|invaluable opportunity|diverse perspectives|unique lens|pivotal moment|deeply passionate|truly inspired/gi)
  if (templatePhrases && templatePhrases.length >= 3) {
    redFlags.push({
      flag: 'Consultant-Template Language Detected',
      severity: 'medium',
      evidence: `Essay uses multiple consultant-style phrases: "${templatePhrases.slice(0, 2).join('", "')}"`,
      impact: 'Overused phrases are recognized by experienced admissions readers. Essays should sound like a specific teenager, not a template.'
    })
  }
  
  // 5. Inconsistency between different parts of application
  const intendedMajor = String(formData.intendedMajor || formData.major || '').toLowerCase()
  const essayLower = essayContent.toLowerCase()
  if (intendedMajor.includes('computer') || intendedMajor.includes('engineering')) {
    if (!essayLower.match(/coding|programming|computer|tech|engineer|build|create|software/gi)) {
      redFlags.push({
        flag: 'Major-Essay Disconnect',
        severity: 'medium',
        evidence: `Intended major is ${intendedMajor} but essays don't mention related interests`,
        impact: 'Application coherence matters. Disconnect between stated major and essay content raises questions about genuine interest.'
      })
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SCHOOL-SPECIFIC RED FLAGS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // MIT: No evidence of making anything
  if (schoolData.name === 'Massachusetts Institute of Technology') {
    const makerEvidence = allContent.toLowerCase().match(/built|created|coded|programmed|designed|invented|project|prototype|robot/gi)
    if (!makerEvidence) {
      redFlags.push({
        flag: 'No Maker Evidence for MIT',
        severity: 'high',
        evidence: 'Application to MIT shows no evidence of hands-on building, creating, or making',
        impact: 'MIT\'s core identity is "Mens et Manus" (Mind and Hand). Applications without maker evidence are fundamentally misaligned with MIT culture.'
      })
    }
  }
  
  // Stanford: Pure prestige motivation
  const whySchool = String(formData.whySchool || formData.whyCollege || '').toLowerCase()
  if (schoolData.name === 'Stanford University') {
    if (whySchool.match(/prestigious|best|top|ranking|dream school|always wanted/gi) && 
        !whySchool.match(/intellectual|curious|innovation|entrepreneur|specific/gi)) {
      redFlags.push({
        flag: 'Prestige-Focused "Why Stanford"',
        severity: 'medium',
        evidence: '"Why Stanford" focuses on prestige/rankings rather than intellectual vitality or specific opportunities',
        impact: 'Stanford heavily weights genuine intellectual curiosity. Pure prestige motivation signals poor fit.'
      })
    }
  }
  
  return redFlags
}

function generateFinalAssessment(
  score: number,
  rating: string,
  weaknesses: Weakness[],
  redFlags: RedFlag[],
  schoolData: SchoolCriteria
): string {
  const highPriorityWeaknesses = weaknesses.filter(w => w.priority === 'HIGH')
  const criticalRedFlags = redFlags.filter(r => r.severity === 'critical')
  
  let assessment = `## Assessment for ${schoolData.name}\n\n`
  assessment += `**Overall Score**: ${score}/100 | **Rating**: ${rating} | **Tier**: ${schoolData.tier}\n\n`
  
  // Critical red flags first
  if (criticalRedFlags.length > 0) {
    assessment += `⚠️ **CRITICAL CONCERN**: ${criticalRedFlags.map(r => r.flag).join(', ')}. This could result in immediate rejection regardless of other qualifications.\n\n`
  }
  
  // School-specific context
  if (schoolData.tier === 'ultra_selective') {
    assessment += `**Context**: ${schoolData.name} accepts approximately ${schoolData.acceptance_rate} of applicants. `
    if (schoolData.name === 'Harvard University') {
      assessment += `At Harvard, the question is not "Is this a good student?" but "Why THIS student over 40,000+ other excellent applicants?"\n\n`
    } else if (schoolData.name === 'Massachusetts Institute of Technology') {
      assessment += `MIT evaluates not just achievement, but MATCH with their culture of makers, collaborators, and risk-takers.\n\n`
    } else if (schoolData.name === 'Stanford University') {
      assessment += `Stanford places exceptional weight on "intellectual vitality" - genuine curiosity that extends beyond requirements.\n\n`
    } else {
      assessment += `Most rejected applicants have excellent credentials. Differentiation is critical.\n\n`
    }
  }
  
  // Weaknesses summary
  if (highPriorityWeaknesses.length > 0) {
    assessment += `**Key Weaknesses** (${highPriorityWeaknesses.length} high-priority):\n`
    highPriorityWeaknesses.forEach(w => {
      assessment += `• **${w.weakness}**: ${w.evidence}\n`
    })
    assessment += '\n'
  }
  
  // Score-based assessment
  if (score >= 85) {
    assessment += `This is a **competitive application** that demonstrates many qualities ${schoolData.name} seeks. `
    if (highPriorityWeaknesses.length > 0) {
      assessment += `However, the identified weaknesses matter greatly at this selectivity level. At ${schoolData.acceptance_rate} acceptance, even minor weaknesses can tip decisions.`
    } else {
      assessment += `The application has a reasonable chance, though outcomes at this selectivity level are never guaranteed.`
    }
  } else if (score >= 70) {
    assessment += `This is a **solid application** with some competitive elements, but it lacks the distinctive qualities that characterize most successful ${schoolData.name} applicants. `
    assessment += `The profile would be competitive at less selective schools but faces significant challenges at this tier.`
  } else if (score >= 55) {
    assessment += `This application **needs development** before it would be competitive at ${schoolData.name}. `
    assessment += `Multiple significant weaknesses would likely result in rejection. The application would benefit from demonstrating deeper achievement and clearer narrative.`
  } else {
    assessment += `This application is **not currently competitive** for ${schoolData.name}. `
    assessment += `The academic and extracurricular profiles do not meet typical standards for admitted students. Consider schools at a different selectivity tier.`
  }
  
  // Red flags impact
  if (redFlags.length > 0) {
    assessment += `\n\n**Red Flags Detected** (${redFlags.length}): `
    assessment += redFlags.map(r => `${r.flag} (${r.severity})`).join(', ') + '. '
    assessment += 'These issues could negatively impact credibility regardless of other strengths.'
  }
  
  // School-specific advice (assessment only, not improvement)
  if (schoolData.common_pitfalls && highPriorityWeaknesses.some(w => 
    schoolData.common_pitfalls.some(p => w.weakness.toLowerCase().includes(p.toLowerCase().split(' ')[0]))
  )) {
    assessment += `\n\n**Note**: Some identified weaknesses match ${schoolData.name}'s documented common pitfalls. These are patterns that consistently result in rejection.`
  }
  
  return assessment
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

function convertToLegacyFormat(review: ReviewResult): LegacyReviewResult {
  const score = review.overall_assessment.score
  
  // Map rating to decision
  let decision: LegacyReviewResult['decision']
  if (score >= 80) decision = 'likely_admit'
  else if (score >= 65) decision = 'competitive'
  else if (score >= 50) decision = 'developing'
  else decision = 'needs_work'
  
  // Extract weaknesses as "improvements" (areas identified, not suggestions)
  const weaknessesAsText = review.weaknesses.map(w => `${w.weakness}: ${w.evidence}`)

  return {
    overallScore: score,
    decision,
    categoryScores: {
      essay: {
        score: review.component_scores.essays.score,
        summary: review.component_scores.essays.analysis,
        strengths: [review.component_scores.essays.authenticity_assessment || 'Submitted essay content'],
        improvements: review.weaknesses.filter(w => w.category === 'Essays').map(w => w.weakness)
      },
      academics: {
        score: review.component_scores.academics.score,
        summary: review.component_scores.academics.analysis,
        strengths: ['Academic record reviewed'],
        improvements: review.weaknesses.filter(w => w.category === 'Academics').map(w => w.weakness)
      },
      activities: {
        score: review.component_scores.extracurriculars.score,
        summary: review.component_scores.extracurriculars.analysis,
        strengths: [review.component_scores.extracurriculars.tier_assessment || 'Activities listed'],
        improvements: review.weaknesses.filter(w => w.category === 'Extracurriculars').map(w => w.weakness)
      },
      completeness: {
        score: Math.round((review.component_scores.university_fit.score + 70) / 2), // Approximate
        summary: 'Application completeness assessed',
        strengths: ['Required sections submitted'],
        improvements: []
      }
    },
    feedbackText: {
      overview: review.final_assessment.split('\n\n')[0],
      strengths: review.narrative_assessment.has_clear_narrative 
        ? ['Clear narrative identity', review.narrative_assessment.can_be_summarized_as]
        : ['Application submitted for review'],
      areasForImprovement: review.weaknesses.slice(0, 3).map(w => w.weakness),
      nextSteps: [], // V2 doesn't provide suggestions
      encouragement: 'This assessment identifies weaknesses to help you understand your competitive position. Use this honest feedback to evaluate your application strategy.'
    },
    improvementTips: [] // V2 doesn't provide tips
  }
}
