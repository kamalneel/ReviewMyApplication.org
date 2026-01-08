// School-specific criteria lookup for college admissions counselor v2
// Based on deep research from college_admissions_database.json

export interface SchoolCriteria {
  name: string
  aliases: string[]
  tier: 'ultra_selective' | 'highly_selective' | 'very_selective' | 'selective'
  acceptance_rate: string
  
  academic_expectations: {
    gpa_expectation: string
    gpa_percentile: string
    sat_25th: number
    sat_75th: number
    sat_average: number
    act_25th: number
    act_75th: number
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
    leadership_expectations: string
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
}

// ═══════════════════════════════════════════════════════════════════════════
// FULLY RESEARCHED SCHOOLS (Harvard, MIT)
// ═══════════════════════════════════════════════════════════════════════════

export const HARVARD: SchoolCriteria = {
  name: "Harvard University",
  aliases: ["harvard", "harvard university", "harvard college"],
  tier: "ultra_selective",
  acceptance_rate: "~3%",
  
  academic_expectations: {
    gpa_expectation: "Top 10% of graduating class (vast majority)",
    gpa_percentile: "Top 10%",
    sat_25th: 1470,
    sat_75th: 1600,
    sat_average: 1540,
    act_25th: 32,
    act_75th: 35,
    testing_required: true,
    course_rigor_notes: "Most rigorous courses available at high school, especially strong academic record"
  },
  
  essay_philosophy: {
    what_they_seek: [
      "Authenticity and genuine voice",
      "Reflection on life experiences",
      "How experiences shaped the applicant",
      "Clear vision for engagement at Harvard",
      "Future aspirations"
    ],
    strong_essay_markers: [
      "Clear narrative arc - 'the notable scientist,' 'the future leader,' 'the bridge-builder'",
      "Specific examples only this person would know",
      "Evidence of overcoming adversity",
      "Genuine self-reflection and growth"
    ],
    common_essay_pitfalls: [
      "Generic essays without authentic voice",
      "No clear identity or memorable quality",
      "Listing achievements instead of reflecting on them",
      "Essays that could be written by anyone"
    ],
    key_quote: "Students with clear arc to their application—the notable scientist, the future political leader, the bridge-builder in times of division—have best chances."
  },
  
  extracurricular_expectations: {
    importance: "Critical - distinction in extracurricular activities is key differentiator",
    depth_vs_breadth: "Depth and distinction matter more than breadth",
    leadership_expectations: "Leadership and community involvement highly valued",
    recognition_level: "Many admitted students have state or national-level recognition in their craft",
    unique_preferences: [
      "Community involvement and contribution",
      "Demonstrated impact on others",
      "Initiative beyond just participation",
      "Activities that show character"
    ],
    key_quote: "Distinction in extracurricular activities is key differentiator. Depth matters more than breadth."
  },
  
  what_they_seek: [
    "Academic accomplishment in high school",
    "Community involvement",
    "Leadership and distinction in extracurricular activities",
    "Personal qualities and character",
    "Ability to overcome adversity",
    "Students who will contribute to Harvard's mission"
  ],
  
  common_pitfalls: [
    "Being 'just' a well-rounded student with good scores",
    "Lacking clear passion or specialization",
    "Not demonstrating impact or achievement beyond grades",
    "Generic essays without authentic voice",
    "Spreading activities too thin without depth"
  ],
  
  unique_differentiators: [
    "Looks for clear 'narrative arc' in applications",
    "Values students who can be summarized in a memorable way",
    "Emphasizes contribution to Harvard community",
    "Considers first-generation status positively",
    "62% of cross-admits choose Harvard over Stanford"
  ],
  
  counselor_perspective: "At Harvard, there is no formula for gaining admission. Academic accomplishment is important, but the admissions committee considers community involvement, leadership, distinction in extracurricular activities, and personal qualities and character. Harvard admits ~3% of applicants—most competitive in nation. Students who demonstrate deep passion, grit, and work ethic have best chances.",
  
  evaluation_notes: {
    process: "Applications discussed after initial review, candidates must stand out beyond just good test scores and grades",
    committee_info: "Holistic review by admissions committee with consensus-based decisions",
    key_insight: "Test scores and grades are baseline filters, not sufficient for admission"
  }
}

export const MIT: SchoolCriteria = {
  name: "Massachusetts Institute of Technology",
  aliases: ["mit", "massachusetts institute of technology", "m.i.t."],
  tier: "ultra_selective",
  acceptance_rate: "~4%",
  
  academic_expectations: {
    gpa_expectation: "Top 10% of class",
    gpa_percentile: "Top 10% (100% of admitted students who submitted class rank)",
    sat_25th: 1510,
    sat_75th: 1570,
    sat_average: 1540,
    act_25th: 34,
    act_75th: 36,
    testing_required: true,
    course_rigor_notes: "Most demanding courses available, especially in math and science. All students take foundational math/science regardless of major."
  },
  
  essay_philosophy: {
    what_they_seek: [
      "Demonstrating hands-on experience and making",
      "Showing collaborative spirit",
      "Evidence of taking thoughtful risks",
      "Balance between academics and personal interests",
      "Quality over quantity in activities"
    ],
    strong_essay_markers: [
      "Evidence of building, creating, or making things",
      "Stories of collaborative problem-solving",
      "Examples of taking risks and learning from failure",
      "Genuine passion, not resume-building",
      "Balance - MIT is NOT all work"
    ],
    common_essay_pitfalls: [
      "Focusing solely on academic achievement without showing hands-on making",
      "Not demonstrating collaborative spirit or community care",
      "Appearing to do activities just for resume building",
      "Lacking balance between work and personal interests"
    ],
    key_quote: "Don't expect million things. Put heart into few things you truly care about."
  },
  
  extracurricular_expectations: {
    importance: "Very high - evaluated on tier system",
    depth_vs_breadth: "Quality over quantity - depth in few areas beats breadth",
    leadership_expectations: "Students apply theoretical knowledge to real-world problems, must show hands-on engagement",
    recognition_level: "Tier 1 (national/international) most competitive, but impact matters more than level",
    unique_preferences: [
      "Hands-on makers who build and create",
      "Collaborative problem-solvers",
      "Risk-takers who learn from failure",
      "Students who get 'metaphorically or literally' dirty trying something new",
      "Impact doesn't require curing diseases - tutoring a kid in math changes the world"
    ],
    key_quote: "Impact doesn't require curing diseases—tutoring a kid in math changes the world, advocating for change matters."
  },
  
  what_they_seek: [
    "Alignment with MIT culture ('Mens et Manus' - Mind and Hand)",
    "Hands-on makers and doers",
    "Initiative and impact-makers",
    "Collaborative spirit",
    "Risk-takers and resilient students",
    "Balance between work and life",
    "Trailblazers who challenge themselves"
  ],
  
  common_pitfalls: [
    "Focusing solely on academic achievement without showing hands-on making",
    "Not demonstrating collaborative spirit or community care",
    "Appearing to do activities just for resume building",
    "Lacking balance between work and personal interests",
    "Not showing resilience or willingness to take risks",
    "Focusing on breadth over depth in activities"
  ],
  
  unique_differentiators: [
    "Latin motto 'Mens et Manus' (Mind and Hand) reflects hands-on philosophy",
    "Innovation is risky and messy - MIT values students who embrace this",
    "Community values are critical: thoughtful people who lift each other up",
    "Reinstated testing requirement based on equity research",
    "At least dozen people significantly discuss and debate each application before admit"
  ],
  
  counselor_perspective: "While grades and scores are important in understanding academic preparedness for MIT, it's really the match between applicant and the Institute that drives our selection process. MIT's mission is to use science, technology, and other areas of scholarship to make the world better. We seek students who are hands-on makers, collaborative, and willing to take risks.",
  
  evaluation_notes: {
    process: "Application read by senior admissions officer holistically, strong applications read by additional officers who summarize for Admissions Committee",
    committee_info: "At least a dozen people significantly discuss and debate an application before admit pile",
    key_insight: "It's the MATCH between applicant and MIT culture that matters most"
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTIALLY RESEARCHED SCHOOLS (Framework with known insights)
// ═══════════════════════════════════════════════════════════════════════════

export const STANFORD: SchoolCriteria = {
  name: "Stanford University",
  aliases: ["stanford", "stanford university"],
  tier: "ultra_selective",
  acceptance_rate: "~4%",
  
  academic_expectations: {
    gpa_expectation: "Top 5% of class",
    gpa_percentile: "Top 5%",
    sat_25th: 1500,
    sat_75th: 1580,
    sat_average: 1540,
    act_25th: 33,
    act_75th: 35,
    testing_required: true,
    course_rigor_notes: "Highest rigor available, especially for intended major area"
  },
  
  essay_philosophy: {
    what_they_seek: [
      "Intellectual vitality and curiosity",
      "Evidence of innovation and entrepreneurship",
      "Authentic voice and genuine passion",
      "Forward-thinking mindset"
    ],
    strong_essay_markers: [
      "Intellectual curiosity that extends beyond classroom",
      "Evidence of innovation or creating something new",
      "Genuine passion that comes through in voice",
      "Vision for future impact"
    ],
    common_essay_pitfalls: [
      "Focusing on achievements without showing thought process",
      "Not demonstrating intellectual curiosity",
      "Generic essays that don't show personality"
    ],
    key_quote: "Stanford weighs essays and 'intellectual ethos' heavily in admissions decisions."
  },
  
  extracurricular_expectations: {
    importance: "Very high - innovation and entrepreneurship valued",
    depth_vs_breadth: "Deep commitment to areas of genuine interest",
    leadership_expectations: "Initiative and creating new things highly valued",
    recognition_level: "National/international level preferred but impact matters",
    unique_preferences: [
      "Entrepreneurial mindset",
      "Innovation and creating new things",
      "Silicon Valley connection/tech orientation",
      "Making impact beyond just participating"
    ],
    key_quote: "Stanford seeks students who will change the world through innovation."
  },
  
  what_they_seek: [
    "Intellectual vitality",
    "Innovative thinking",
    "Entrepreneurial spirit",
    "Authentic passion",
    "Future world-changers"
  ],
  
  common_pitfalls: [
    "Not showing intellectual curiosity beyond grades",
    "Lacking innovative or entrepreneurial examples",
    "Being well-rounded without distinction",
    "Not demonstrating forward-thinking mindset"
  ],
  
  unique_differentiators: [
    "Silicon Valley location creates tech/entrepreneurship culture",
    "Essays weighted very heavily",
    "Intellectual vitality is explicit criterion",
    "74% of cross-admits choose Stanford over Princeton"
  ],
  
  counselor_perspective: "Stanford looks for students who will shape the future. Intellectual vitality—genuine curiosity that extends beyond the classroom—is critical. They want students who will take advantage of their Silicon Valley location and entrepreneurial ecosystem.",
  
  evaluation_notes: {
    process: "Holistic review with emphasis on essays",
    committee_info: "Multiple readers with focus on intellectual vitality",
    key_insight: "Essays and intellectual ethos weighted more heavily than at peer institutions"
  }
}

export const YALE: SchoolCriteria = {
  name: "Yale University",
  aliases: ["yale", "yale university"],
  tier: "ultra_selective",
  acceptance_rate: "~4.5%",
  
  academic_expectations: {
    gpa_expectation: "Top 10% of class",
    gpa_percentile: "Top 10%",
    sat_25th: 1470,
    sat_75th: 1570,
    sat_average: 1520,
    act_25th: 33,
    act_75th: 35,
    testing_required: true, // Returned to test-required for 2024-2025
    course_rigor_notes: "Challenging courses with focus on intellectual depth"
  },
  
  essay_philosophy: {
    what_they_seek: [
      "Humanities-driven intellectual curiosity",
      "Deep thinking and analysis",
      "Genuine intellectual engagement",
      "Personal voice and perspective"
    ],
    strong_essay_markers: [
      "Evidence of deep, nuanced thinking",
      "Humanities/liberal arts engagement",
      "Genuine curiosity about ideas",
      "Strong personal voice"
    ],
    common_essay_pitfalls: [
      "Surface-level treatment of topics",
      "Not showing intellectual depth",
      "Focusing only on STEM without broader interests"
    ],
    key_quote: "Yale values humanities-driven intellectual curiosity and the life of the mind."
  },
  
  extracurricular_expectations: {
    importance: "High - but intellectual engagement matters most",
    depth_vs_breadth: "Depth in areas of genuine intellectual interest",
    leadership_expectations: "Leadership with intellectual dimension valued",
    recognition_level: "Achievement important but intellectual depth more so",
    unique_preferences: [
      "Intellectual pursuits beyond requirements",
      "Writing, debate, and humanities activities",
      "Community engagement with intellectual component"
    ],
    key_quote: "Yale seeks students who engage deeply with ideas and contribute to intellectual community."
  },
  
  what_they_seek: [
    "Intellectual curiosity",
    "Humanities orientation",
    "Deep thinkers",
    "Strong writers",
    "Community contributors"
  ],
  
  common_pitfalls: [
    "Not showing intellectual depth",
    "Focusing only on achievements without ideas",
    "Lacking humanities/liberal arts engagement",
    "Superficial treatment of interests"
  ],
  
  unique_differentiators: [
    "Returned to test-required for 2024-2025",
    "Humanities-driven intellectual curiosity emphasized",
    "54% of cross-admits choose Yale over Stanford",
    "Three recommendation letters required"
  ],
  
  counselor_perspective: "Yale values intellectual curiosity, especially with a humanities orientation. They seek students who will contribute to Yale's intellectual community and engage deeply with ideas. The residential college system means fit with Yale's collaborative culture matters.",
  
  evaluation_notes: {
    process: "Holistic review with three recommendation letters",
    committee_info: "Emphasis on intellectual fit with Yale community",
    key_insight: "Humanities-driven curiosity distinguishes Yale from peer institutions"
  }
}

export const PRINCETON: SchoolCriteria = {
  name: "Princeton University",
  aliases: ["princeton", "princeton university"],
  tier: "ultra_selective",
  acceptance_rate: "~5%",
  
  academic_expectations: {
    gpa_expectation: "Top 5-10% of class",
    gpa_percentile: "Top 10%",
    sat_25th: 1500,
    sat_75th: 1580,
    sat_average: 1540,
    act_25th: 33,
    act_75th: 35,
    testing_required: true,
    course_rigor_notes: "Most rigorous available, especially for STEM and policy interests"
  },
  
  essay_philosophy: {
    what_they_seek: [
      "Undergraduate focus and engagement",
      "Intellectual curiosity",
      "Community contribution",
      "Authentic voice"
    ],
    strong_essay_markers: [
      "Evidence of wanting undergraduate-focused experience",
      "Genuine intellectual interests",
      "How you'll contribute to Princeton community"
    ],
    common_essay_pitfalls: [
      "Not understanding Princeton's undergraduate focus",
      "Generic Ivy League essay",
      "Not showing specific Princeton fit"
    ],
    key_quote: "Princeton's undergraduate focus means they want students who will be fully engaged in the undergraduate experience."
  },
  
  extracurricular_expectations: {
    importance: "High - especially for STEM and public policy",
    depth_vs_breadth: "Depth in areas related to academic interests",
    leadership_expectations: "Leadership that connects to intellectual pursuits",
    recognition_level: "National level for competitive admits",
    unique_preferences: [
      "Research experience for STEM applicants",
      "Public service for policy-oriented applicants",
      "Community engagement"
    ],
    key_quote: "Princeton is particularly competitive for STEM and public policy majors."
  },
  
  what_they_seek: [
    "Strong undergraduate focus",
    "Academic excellence especially in STEM/policy",
    "Community contributors",
    "Service-oriented students"
  ],
  
  common_pitfalls: [
    "Not understanding undergraduate focus",
    "Applying without specific Princeton fit",
    "Lacking service/community component",
    "Generic Ivy approach"
  ],
  
  unique_differentiators: [
    "Ranked #1 by US News eleven times",
    "Particularly competitive for STEM and public policy",
    "Strong emphasis on undergraduate experience (no professional schools)",
    "75% of cross-admits choose Harvard over Princeton"
  ],
  
  counselor_perspective: "Princeton's unique positioning as purely undergraduate-focused Ivy means they seek students who will fully engage in the undergraduate experience. Particularly competitive for STEM and public policy. Service and community are valued.",
  
  evaluation_notes: {
    process: "Holistic review with undergraduate focus",
    committee_info: "Dean Richardson discusses testing, rigor, AI, and 'what we're really looking for'",
    key_insight: "The most undergraduate-focused Ivy - they want students who want THAT experience"
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER-BASED DEFAULTS (For schools without deep research)
// ═══════════════════════════════════════════════════════════════════════════

export const TIER_DEFAULTS: Record<string, Partial<SchoolCriteria>> = {
  ultra_selective: {
    tier: "ultra_selective",
    acceptance_rate: "Under 10%",
    academic_expectations: {
      gpa_expectation: "Top 10% of class",
      gpa_percentile: "Top 10%",
      sat_25th: 1450,
      sat_75th: 1570,
      sat_average: 1510,
      act_25th: 32,
      act_75th: 35,
      testing_required: true,
      course_rigor_notes: "Most rigorous courses available"
    },
    essay_philosophy: {
      what_they_seek: ["Authentic voice", "Genuine passion", "Clear narrative"],
      strong_essay_markers: ["Specific examples", "Self-reflection", "Memorable quality"],
      common_essay_pitfalls: ["Generic essays", "No distinctive voice", "Resume listing"],
      key_quote: "At ultra-selective schools, essays must make you memorable among 40,000+ applicants."
    },
    extracurricular_expectations: {
      importance: "Critical",
      depth_vs_breadth: "Depth in 2-3 areas far better than breadth",
      leadership_expectations: "Leadership or significant impact expected",
      recognition_level: "State/national level recognition highly valued",
      unique_preferences: ["Tier 1-2 activities", "Demonstrated impact"],
      key_quote: "At these schools, everyone has good grades. Extracurriculars differentiate."
    },
    common_pitfalls: [
      "Well-rounded but not distinguished",
      "No clear narrative",
      "Activities without depth",
      "Generic essays"
    ],
    counselor_perspective: "Ultra-selective schools (under 10% acceptance) reject most excellent applicants. Academics are a baseline filter. What distinguishes admits: depth over breadth, clear narrative, exceptional achievement in focused areas."
  },
  
  highly_selective: {
    tier: "highly_selective",
    acceptance_rate: "10-20%",
    academic_expectations: {
      gpa_expectation: "Top 15-20% of class",
      gpa_percentile: "Top 20%",
      sat_25th: 1350,
      sat_75th: 1500,
      sat_average: 1425,
      act_25th: 30,
      act_75th: 34,
      testing_required: true,
      course_rigor_notes: "Rigorous courses with strong performance"
    },
    essay_philosophy: {
      what_they_seek: ["Genuine voice", "Specific examples", "Growth narrative"],
      strong_essay_markers: ["Authenticity", "Self-awareness", "Specific details"],
      common_essay_pitfalls: ["Clichés", "Lack of specificity", "Overpolished voice"],
      key_quote: "Essays should reveal who you are beyond your transcript."
    },
    extracurricular_expectations: {
      importance: "High",
      depth_vs_breadth: "Prefer depth with some breadth",
      leadership_expectations: "Leadership roles valued",
      recognition_level: "Regional/state recognition helpful",
      unique_preferences: ["Consistent commitment", "Leadership roles"],
      key_quote: "Show sustained commitment and growth in your activities."
    },
    common_pitfalls: [
      "No clear passion",
      "Too many activities without depth",
      "Generic 'why us' essay"
    ],
    counselor_perspective: "Highly selective schools look for strong academics plus demonstrated passion. While not as intensely competitive as ultra-selective, they still reject many qualified applicants."
  },
  
  very_selective: {
    tier: "very_selective",
    acceptance_rate: "20-35%",
    academic_expectations: {
      gpa_expectation: "Top 25-30% of class",
      gpa_percentile: "Top 30%",
      sat_25th: 1250,
      sat_75th: 1420,
      sat_average: 1335,
      act_25th: 27,
      act_75th: 32,
      testing_required: true,
      course_rigor_notes: "Challenging courses relative to what's available"
    },
    essay_philosophy: {
      what_they_seek: ["Personal voice", "Genuine interest", "Good writing"],
      strong_essay_markers: ["Clear writing", "Personal examples", "Enthusiasm"],
      common_essay_pitfalls: ["Generic content", "Poor proofreading", "Lack of voice"],
      key_quote: "Show us who you are and why this school matters to you."
    },
    extracurricular_expectations: {
      importance: "Moderate to high",
      depth_vs_breadth: "Balance of depth and breadth acceptable",
      leadership_expectations: "Some leadership helpful",
      recognition_level: "School/local recognition valued",
      unique_preferences: ["Consistent involvement", "Genuine interests"],
      key_quote: "Demonstrate genuine engagement in activities you care about."
    },
    common_pitfalls: [
      "No extracurricular involvement",
      "Generic application",
      "Not showing specific interest in school"
    ],
    counselor_perspective: "Very selective schools seek strong students with genuine interests. Demonstrated interest in the specific school often matters more here than at ultra-selective institutions."
  },
  
  selective: {
    tier: "selective",
    acceptance_rate: "35-50%",
    academic_expectations: {
      gpa_expectation: "Top 40% of class",
      gpa_percentile: "Top 40%",
      sat_25th: 1150,
      sat_75th: 1350,
      sat_average: 1250,
      act_25th: 24,
      act_75th: 30,
      testing_required: false,
      course_rigor_notes: "College prep curriculum with some challenging courses"
    },
    essay_philosophy: {
      what_they_seek: ["Personal voice", "Interest in school", "Clear writing"],
      strong_essay_markers: ["Genuine interest", "Personal examples", "Good writing"],
      common_essay_pitfalls: ["Errors", "Generic content", "Not answering prompt"],
      key_quote: "Tell us about yourself and why you want to attend."
    },
    extracurricular_expectations: {
      importance: "Moderate",
      depth_vs_breadth: "Some involvement expected",
      leadership_expectations: "Helpful but not required",
      recognition_level: "Participation valued",
      unique_preferences: ["Genuine interests", "Work experience also valued"],
      key_quote: "Show us how you spend your time outside of class."
    },
    common_pitfalls: [
      "Incomplete application",
      "No extracurricular involvement at all",
      "Generic 'why us'"
    ],
    counselor_perspective: "Selective schools value well-prepared students with genuine interests. Strong applications show both academic readiness and personal engagement."
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHOOL NAME MAPPING (for partial research schools)
// ═══════════════════════════════════════════════════════════════════════════

export const PARTIAL_SCHOOLS: Record<string, Partial<SchoolCriteria>> = {
  "columbia": {
    name: "Columbia University",
    aliases: ["columbia", "columbia university"],
    tier: "ultra_selective",
    acceptance_rate: "~4.2%",
    unique_differentiators: [
      "Core Curriculum is distinctive feature",
      "New York City location",
      "Second lowest Ivy acceptance rate after Harvard"
    ],
    counselor_perspective: "Columbia's Core Curriculum shapes admissions - they seek students excited about broad intellectual exploration. NYC location means they want students who'll engage with the city."
  },
  
  "penn": {
    name: "University of Pennsylvania",
    aliases: ["penn", "upenn", "university of pennsylvania", "wharton"],
    tier: "ultra_selective",
    acceptance_rate: "~4.2%",
    unique_differentiators: [
      "Wharton School is particularly competitive",
      "Interdisciplinary spirit is key value",
      "Different essays for different schools within Penn"
    ],
    counselor_perspective: "Penn values interdisciplinary thinking. Applicants to Wharton face especially stiff competition. Show how you'll take advantage of Penn's collaborative, cross-school culture."
  },
  
  "duke": {
    name: "Duke University",
    aliases: ["duke", "duke university"],
    tier: "ultra_selective",
    acceptance_rate: "~6%",
    unique_differentiators: [
      "Often called 'Southern Ivy'",
      "Strong campus pride and culture",
      "Pratt School of Engineering known for research"
    ],
    counselor_perspective: "Duke seeks students eager to connect learning with purpose. Campus culture and pride are important - show you understand and want to be part of Duke's community."
  },
  
  "uchicago": {
    name: "University of Chicago",
    aliases: ["uchicago", "university of chicago", "chicago"],
    tier: "ultra_selective",
    acceptance_rate: "~5%",
    unique_differentiators: [
      "Famous unconventional essay prompts",
      "Rigorous 'life of the mind' culture",
      "Core Curriculum like Columbia"
    ],
    counselor_perspective: "UChicago's quirky essay prompts are legendary. They seek students who genuinely love ideas and intellectual exploration. The 'life of the mind' is not just a slogan."
  },
  
  "northwestern": {
    name: "Northwestern University",
    aliases: ["northwestern", "northwestern university"],
    tier: "highly_selective",
    acceptance_rate: "~7%",
    unique_differentiators: [
      "Strong pre-professional programs",
      "Known for journalism, theater, interdisciplinary studies",
      "Near Chicago"
    ],
    counselor_perspective: "Northwestern balances academic rigor with pre-professional preparation. Strong in communications, theater, and interdisciplinary work. Show specific fit with their programs."
  },
  
  "caltech": {
    name: "California Institute of Technology",
    aliases: ["caltech", "california institute of technology", "cal tech"],
    tier: "ultra_selective",
    acceptance_rate: "~3%",
    unique_differentiators: [
      "Smallest elite research university",
      "Intense STEM focus",
      "Collaborative culture despite competition"
    ],
    counselor_perspective: "Caltech is for students who live and breathe STEM. Small size means intense academic environment. Research experience almost expected. Not for students unsure about science."
  },
  
  "brown": {
    name: "Brown University",
    aliases: ["brown", "brown university"],
    tier: "ultra_selective",
    acceptance_rate: "~5%",
    unique_differentiators: [
      "Open curriculum - no distribution requirements",
      "Student-driven academic experience",
      "Values intellectual risk-taking"
    ],
    counselor_perspective: "Brown's open curriculum attracts self-directed learners. Show you can handle freedom and will use it purposefully. They value intellectual risk-takers who chart their own path."
  },
  
  "dartmouth": {
    name: "Dartmouth College",
    aliases: ["dartmouth", "dartmouth college"],
    tier: "ultra_selective",
    acceptance_rate: "~6%",
    unique_differentiators: [
      "Undergraduate focus like Princeton",
      "Strong liberal arts tradition",
      "Rural New Hampshire location"
    ],
    counselor_perspective: "Dartmouth's undergraduate focus and rural location create unique culture. They seek students who want close faculty relationships and will embrace the outdoors and community."
  },
  
  "cornell": {
    name: "Cornell University",
    aliases: ["cornell", "cornell university"],
    tier: "ultra_selective",
    acceptance_rate: "~7.3%",
    unique_differentiators: [
      "Largest Ivy with diverse schools",
      "Each college has different admissions",
      "Land-grant mission means accessibility focus"
    ],
    counselor_perspective: "Cornell's seven undergraduate colleges each have different personalities. Be specific about which college and why. Their land-grant mission means they value access and practical application."
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOOKUP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const FULL_SCHOOLS: Record<string, SchoolCriteria> = {
  "harvard": HARVARD,
  "mit": MIT,
  "stanford": STANFORD,
  "yale": YALE,
  "princeton": PRINCETON
}

export function lookupSchool(schoolName: string): SchoolCriteria | null {
  const normalized = schoolName.toLowerCase().trim()
  
  // Check fully researched schools
  for (const [key, school] of Object.entries(FULL_SCHOOLS)) {
    if (normalized.includes(key) || school.aliases.some(alias => normalized.includes(alias))) {
      return school
    }
  }
  
  // Check partially researched schools
  for (const [key, partialSchool] of Object.entries(PARTIAL_SCHOOLS)) {
    if (normalized.includes(key) || partialSchool.aliases?.some(alias => normalized.includes(alias))) {
      // Merge with tier defaults
      const tier = partialSchool.tier || 'ultra_selective'
      const defaults = TIER_DEFAULTS[tier]
      return {
        ...defaults,
        ...partialSchool,
        name: partialSchool.name || schoolName,
        aliases: partialSchool.aliases || [normalized]
      } as SchoolCriteria
    }
  }
  
  return null
}

export function getSchoolOrDefault(schoolName: string | undefined): SchoolCriteria {
  if (!schoolName) {
    // Return ultra-selective defaults
    return {
      name: "Selective University",
      aliases: [],
      ...TIER_DEFAULTS.ultra_selective
    } as SchoolCriteria
  }
  
  const found = lookupSchool(schoolName)
  if (found) return found
  
  // Try to determine tier from common keywords
  const lower = schoolName.toLowerCase()
  let tier: keyof typeof TIER_DEFAULTS = 'highly_selective'
  
  // State schools are generally less selective
  if (lower.includes('state') || lower.includes('university of') && !lower.includes('michigan') && !lower.includes('virginia')) {
    tier = 'very_selective'
  }
  
  // Community colleges are selective tier
  if (lower.includes('community') || lower.includes('cc')) {
    tier = 'selective'
  }
  
  return {
    name: schoolName,
    aliases: [lower],
    ...TIER_DEFAULTS[tier]
  } as SchoolCriteria
}

export function extractTargetSchools(formData: Record<string, unknown>): string[] {
  const schools: string[] = []
  
  // Check common fields where target school might be
  const fieldsToCheck = [
    'targetSchool', 'targetSchools', 'target_school', 'target_schools',
    'applyingTo', 'applying_to', 'colleges', 'universities',
    'firstChoice', 'first_choice', 'dreamSchool', 'dream_school',
    'whySchool', 'why_school', 'whyCollege', 'why_college'
  ]
  
  for (const field of fieldsToCheck) {
    const value = formData[field]
    if (typeof value === 'string' && value.trim()) {
      // Could be comma-separated list
      const parsed = value.split(/[,;]/).map(s => s.trim()).filter(s => s)
      schools.push(...parsed)
    }
  }
  
  // Also check essay content for school mentions
  const essayFields = ['personalStatement', 'whySchoolEssay', 'supplementalEssay']
  for (const field of essayFields) {
    const essay = formData[field]
    if (typeof essay === 'string') {
      // Look for common school name patterns
      const schoolPatterns = Object.keys(FULL_SCHOOLS).concat(Object.keys(PARTIAL_SCHOOLS))
      for (const pattern of schoolPatterns) {
        if (essay.toLowerCase().includes(pattern)) {
          if (!schools.some(s => s.toLowerCase().includes(pattern))) {
            schools.push(pattern)
          }
        }
      }
    }
  }
  
  return [...new Set(schools)] // Remove duplicates
}

export function getResearchDepth(schoolName: string): 'full' | 'partial' | 'tier_default' {
  const normalized = schoolName.toLowerCase().trim()
  
  for (const [key, school] of Object.entries(FULL_SCHOOLS)) {
    if (normalized.includes(key) || school.aliases.some(alias => normalized.includes(alias))) {
      return 'full'
    }
  }
  
  for (const [key, partialSchool] of Object.entries(PARTIAL_SCHOOLS)) {
    if (normalized.includes(key) || partialSchool.aliases?.some(alias => normalized.includes(alias))) {
      return 'partial'
    }
  }
  
  return 'tier_default'
}

