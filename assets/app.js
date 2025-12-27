// ═══════════════════════════════════════════════════════════════
// APPLICATION DATA - Checklists and Form Fields for Each Program
// ═══════════════════════════════════════════════════════════════

const PROGRAM_DATA = {
  'middle-school': {
    name: 'Middle School',
    icon: '🏫',
    steps: [
      {
        id: 'student-info',
        title: 'Student Information',
        icon: '👤',
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { id: 'birthDate', label: 'Date of Birth', type: 'date', required: true },
          { id: 'currentGrade', label: 'Current Grade', type: 'select', required: true, 
            options: ['4th Grade', '5th Grade', '6th Grade', '7th Grade'] },
          { id: 'currentSchool', label: 'Current School Name', type: 'text', required: true },
          { id: 'applyingGrade', label: 'Grade Applying For', type: 'select', required: true,
            options: ['6th Grade', '7th Grade', '8th Grade'] }
        ]
      },
      {
        id: 'academics',
        title: 'Academic Information',
        icon: '📚',
        fields: [
          { id: 'gpa', label: 'Current GPA (if available)', type: 'text', required: false },
          { id: 'favoriteSubject', label: 'Favorite Subject', type: 'text', required: true },
          { id: 'academicStrengths', label: 'Academic Strengths', type: 'textarea', required: true,
            hint: 'Describe areas where the student excels academically (200-400 words)', maxLength: 2000 },
          { id: 'learningStyle', label: 'Learning Style & Needs', type: 'textarea', required: false,
            hint: 'Describe any special learning considerations', maxLength: 1000 }
        ]
      },
      {
        id: 'activities',
        title: 'Activities & Interests',
        icon: '⚽',
        fields: [
          { id: 'extracurriculars', label: 'Extracurricular Activities', type: 'textarea', required: true,
            hint: 'List sports, clubs, hobbies, and other activities (one per line)', maxLength: 2000 },
          { id: 'specialTalents', label: 'Special Talents or Achievements', type: 'textarea', required: false,
            hint: 'Awards, competitions, performances, etc.', maxLength: 1500 },
          { id: 'communityService', label: 'Community Service', type: 'textarea', required: false,
            hint: 'Volunteer work or community involvement', maxLength: 1000 }
        ]
      },
      {
        id: 'student-essay',
        title: 'Student Questionnaire',
        icon: '✏️',
        fields: [
          { id: 'whySchool', label: 'Why do you want to attend this school?', type: 'textarea', required: true,
            hint: 'Write in your own words (150-300 words)', maxLength: 2000 },
          { id: 'challenge', label: 'Describe a challenge you overcame', type: 'textarea', required: true,
            hint: 'Tell us about a difficult situation and how you handled it (150-300 words)', maxLength: 2000 },
          { id: 'goals', label: 'What are your goals for middle school?', type: 'textarea', required: true,
            hint: 'Academic, personal, or extracurricular goals (100-200 words)', maxLength: 1500 }
        ]
      },
      {
        id: 'parent-statement',
        title: 'Parent Statement',
        icon: '👨‍👩‍👧',
        fields: [
          { id: 'parentName', label: 'Parent/Guardian Name', type: 'text', required: true },
          { id: 'parentEmail', label: 'Parent Email', type: 'email', required: true },
          { id: 'parentPhone', label: 'Parent Phone', type: 'tel', required: true },
          { id: 'parentStatement', label: 'Parent Statement', type: 'textarea', required: true,
            hint: 'Describe your child\'s character, strengths, and why this school is a good fit (300-500 words)', maxLength: 3000 },
          { id: 'additionalInfo', label: 'Additional Information', type: 'textarea', required: false,
            hint: 'Anything else the admissions committee should know', maxLength: 1500 }
        ]
      },
      {
        id: 'documents',
        title: 'Document Upload',
        icon: '📎',
        fields: [
          { id: 'reportCards', label: 'Report Cards (Last 2 years)', type: 'file', required: true,
            accept: '.pdf,.jpg,.jpeg,.png', hint: 'Upload PDF or images of report cards' },
          { id: 'recommendations', label: 'Teacher Recommendation Letter', type: 'file', required: false,
            accept: '.pdf,.doc,.docx', hint: 'Optional: Upload recommendation letter' },
          { id: 'testScores', label: 'Standardized Test Scores (if any)', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png', hint: 'Optional: Upload test score reports' }
        ]
      }
    ]
  },
  'high-school': {
    name: 'High School',
    icon: '🎓',
    steps: [
      {
        id: 'student-info',
        title: 'Student Information',
        icon: '👤',
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { id: 'birthDate', label: 'Date of Birth', type: 'date', required: true },
          { id: 'currentGrade', label: 'Current Grade', type: 'select', required: true,
            options: ['7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade'] },
          { id: 'currentSchool', label: 'Current School Name', type: 'text', required: true },
          { id: 'applyingGrade', label: 'Grade Applying For', type: 'select', required: true,
            options: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'] }
        ]
      },
      {
        id: 'academics',
        title: 'Academic Profile',
        icon: '📚',
        fields: [
          { id: 'gpa', label: 'Cumulative GPA', type: 'text', required: true },
          { id: 'gpaScale', label: 'GPA Scale', type: 'select', required: true,
            options: ['4.0 Unweighted', '4.0 Weighted', '5.0 Weighted', '100-point scale'] },
          { id: 'classRank', label: 'Class Rank (if available)', type: 'text', required: false },
          { id: 'honorsAP', label: 'Honors/AP/IB Courses', type: 'textarea', required: true,
            hint: 'List all advanced courses taken or currently taking', maxLength: 2000 },
          { id: 'academicAwards', label: 'Academic Awards & Honors', type: 'textarea', required: false,
            hint: 'List any academic recognitions', maxLength: 1500 }
        ]
      },
      {
        id: 'test-scores',
        title: 'Test Scores',
        icon: '📊',
        fields: [
          { id: 'ssatScore', label: 'SSAT Score (if taken)', type: 'text', required: false,
            hint: 'Format: Percentile (e.g., 85th percentile)' },
          { id: 'iseeScore', label: 'ISEE Score (if taken)', type: 'text', required: false },
          { id: 'otherTests', label: 'Other Standardized Tests', type: 'textarea', required: false,
            hint: 'PSAT, state tests, etc.', maxLength: 1000 }
        ]
      },
      {
        id: 'activities',
        title: 'Extracurricular Activities',
        icon: '🏆',
        fields: [
          { id: 'activity1', label: 'Activity 1 (Most Important)', type: 'textarea', required: true,
            hint: 'Name, role, years, hours/week, and achievements', maxLength: 1000 },
          { id: 'activity2', label: 'Activity 2', type: 'textarea', required: true,
            hint: 'Name, role, years, hours/week, and achievements', maxLength: 1000 },
          { id: 'activity3', label: 'Activity 3', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity4', label: 'Activity 4', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity5', label: 'Activity 5', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'leadershipRoles', label: 'Leadership Positions', type: 'textarea', required: false,
            hint: 'Describe any leadership roles held', maxLength: 1500 }
        ]
      },
      {
        id: 'personal-essay',
        title: 'Personal Essay',
        icon: '✍️',
        fields: [
          { id: 'essayPrompt', label: 'Essay Prompt', type: 'select', required: true,
            options: [
              'Tell us about a challenge you\'ve overcome',
              'Describe a person who has influenced you',
              'What do you hope to contribute to our school community?',
              'Discuss something you\'re passionate about',
              'Choose your own topic'
            ]},
          { id: 'personalEssay', label: 'Your Essay', type: 'textarea', required: true,
            hint: 'Write a thoughtful, personal essay (400-600 words)', maxLength: 4000 }
        ]
      },
      {
        id: 'short-answers',
        title: 'Short Answer Questions',
        icon: '💬',
        fields: [
          { id: 'whySchool', label: 'Why are you interested in our school?', type: 'textarea', required: true,
            hint: '150-250 words', maxLength: 1500 },
          { id: 'uniqueQuality', label: 'What unique quality will you bring?', type: 'textarea', required: true,
            hint: '100-200 words', maxLength: 1200 },
          { id: 'academicInterest', label: 'What academic subject excites you most and why?', type: 'textarea', required: true,
            hint: '100-200 words', maxLength: 1200 }
        ]
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        icon: '📝',
        fields: [
          { id: 'mathTeacher', label: 'Math Teacher Recommender Name', type: 'text', required: true },
          { id: 'mathTeacherEmail', label: 'Math Teacher Email', type: 'email', required: true },
          { id: 'englishTeacher', label: 'English Teacher Recommender Name', type: 'text', required: true },
          { id: 'englishTeacherEmail', label: 'English Teacher Email', type: 'email', required: true },
          { id: 'additionalRec', label: 'Additional Recommender (optional)', type: 'text', required: false }
        ]
      },
      {
        id: 'documents',
        title: 'Document Upload',
        icon: '📎',
        fields: [
          { id: 'transcript', label: 'Official Transcript', type: 'file', required: true,
            accept: '.pdf', hint: 'Upload official school transcript' },
          { id: 'testScoreReport', label: 'Test Score Reports', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png', hint: 'SSAT, ISEE, or other test scores' },
          { id: 'resume', label: 'Activity Resume (optional)', type: 'file', required: false,
            accept: '.pdf,.doc,.docx', hint: 'Detailed activity resume if available' }
        ]
      }
    ]
  },
  'college': {
    name: 'College',
    icon: '🎯',
    steps: [
      {
        id: 'personal-info',
        title: 'Personal Information',
        icon: '👤',
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { id: 'preferredName', label: 'Preferred Name', type: 'text', required: false },
          { id: 'birthDate', label: 'Date of Birth', type: 'date', required: true },
          { id: 'citizenship', label: 'Citizenship Status', type: 'select', required: true,
            options: ['US Citizen', 'Permanent Resident', 'International Student', 'DACA/Undocumented'] },
          { id: 'intendedMajor', label: 'Intended Major', type: 'text', required: true },
          { id: 'alternativeMajor', label: 'Alternative Major', type: 'text', required: false }
        ]
      },
      {
        id: 'academics',
        title: 'Academic Profile',
        icon: '📚',
        fields: [
          { id: 'gpa', label: 'Cumulative GPA', type: 'text', required: true },
          { id: 'gpaScale', label: 'GPA Scale', type: 'select', required: true,
            options: ['4.0 Unweighted', '4.0 Weighted', '5.0 Weighted', '100-point scale'] },
          { id: 'classRank', label: 'Class Rank', type: 'text', required: false,
            hint: 'e.g., 15 out of 450' },
          { id: 'classSize', label: 'Class Size', type: 'text', required: false },
          { id: 'courseRigor', label: 'Course Rigor Description', type: 'textarea', required: true,
            hint: 'Describe the rigor of your course load (AP, IB, Honors, Dual Enrollment)', maxLength: 2000 },
          { id: 'seniorCourses', label: 'Senior Year Courses', type: 'textarea', required: true,
            hint: 'List all courses you\'re taking senior year', maxLength: 1500 }
        ]
      },
      {
        id: 'test-scores',
        title: 'Standardized Tests',
        icon: '📊',
        fields: [
          { id: 'satTotal', label: 'SAT Total Score', type: 'text', required: false,
            hint: 'Leave blank if not taken' },
          { id: 'satERW', label: 'SAT Evidence-Based Reading & Writing', type: 'text', required: false },
          { id: 'satMath', label: 'SAT Math', type: 'text', required: false },
          { id: 'actComposite', label: 'ACT Composite Score', type: 'text', required: false },
          { id: 'apScores', label: 'AP Exam Scores', type: 'textarea', required: false,
            hint: 'List all AP exams and scores (e.g., AP Calculus BC: 5)', maxLength: 1500 },
          { id: 'ibScores', label: 'IB Exam Scores', type: 'textarea', required: false, maxLength: 1000 }
        ]
      },
      {
        id: 'activities',
        title: 'Extracurricular Activities',
        icon: '🏆',
        fields: [
          { id: 'activity1', label: 'Activity 1 (Most Meaningful)', type: 'textarea', required: true,
            hint: 'Organization, Position, Grade levels, Hours/week, Weeks/year, Description', maxLength: 1000 },
          { id: 'activity2', label: 'Activity 2', type: 'textarea', required: true, maxLength: 1000 },
          { id: 'activity3', label: 'Activity 3', type: 'textarea', required: true, maxLength: 1000 },
          { id: 'activity4', label: 'Activity 4', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity5', label: 'Activity 5', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity6', label: 'Activity 6', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity7', label: 'Activity 7', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity8', label: 'Activity 8', type: 'textarea', required: false, maxLength: 1000 }
        ]
      },
      {
        id: 'honors',
        title: 'Honors & Awards',
        icon: '🏅',
        fields: [
          { id: 'honor1', label: 'Honor/Award 1', type: 'textarea', required: false,
            hint: 'Name, level (school/state/national/international), grade received', maxLength: 500 },
          { id: 'honor2', label: 'Honor/Award 2', type: 'textarea', required: false, maxLength: 500 },
          { id: 'honor3', label: 'Honor/Award 3', type: 'textarea', required: false, maxLength: 500 },
          { id: 'honor4', label: 'Honor/Award 4', type: 'textarea', required: false, maxLength: 500 },
          { id: 'honor5', label: 'Honor/Award 5', type: 'textarea', required: false, maxLength: 500 }
        ]
      },
      {
        id: 'personal-essay',
        title: 'Personal Statement',
        icon: '✍️',
        fields: [
          { id: 'essayPrompt', label: 'Essay Prompt', type: 'select', required: true,
            options: [
              'Some students have a background, identity, interest, or talent that is so meaningful...',
              'The lessons we take from obstacles we encounter can be fundamental...',
              'Reflect on a time when you questioned or challenged a belief or idea...',
              'Reflect on something that someone has done for you that has made you happy...',
              'Discuss an accomplishment, event, or realization that sparked personal growth...',
              'Describe a topic, idea, or concept you find so engaging...',
              'Share an essay on any topic of your choice'
            ]},
          { id: 'personalStatement', label: 'Personal Statement', type: 'textarea', required: true,
            hint: 'Your main Common App essay (250-650 words)', maxLength: 4500 }
        ]
      },
      {
        id: 'supplemental',
        title: 'Supplemental Essays',
        icon: '📝',
        fields: [
          { id: 'whyCollege', label: 'Why This College?', type: 'textarea', required: true,
            hint: 'Why are you interested in this particular institution? (200-400 words)', maxLength: 2500 },
          { id: 'whyMajor', label: 'Why This Major?', type: 'textarea', required: true,
            hint: 'What draws you to your intended field of study? (200-400 words)', maxLength: 2500 },
          { id: 'additionalInfo', label: 'Additional Information (Optional)', type: 'textarea', required: false,
            hint: 'Anything else you want the admissions committee to know', maxLength: 3000 }
        ]
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        icon: '💌',
        fields: [
          { id: 'counselorName', label: 'School Counselor Name', type: 'text', required: true },
          { id: 'counselorEmail', label: 'School Counselor Email', type: 'email', required: true },
          { id: 'teacher1Name', label: 'Teacher Recommender 1 (Academic)', type: 'text', required: true },
          { id: 'teacher1Email', label: 'Teacher 1 Email', type: 'email', required: true },
          { id: 'teacher1Subject', label: 'Teacher 1 Subject', type: 'text', required: true },
          { id: 'teacher2Name', label: 'Teacher Recommender 2 (Academic)', type: 'text', required: true },
          { id: 'teacher2Email', label: 'Teacher 2 Email', type: 'email', required: true },
          { id: 'teacher2Subject', label: 'Teacher 2 Subject', type: 'text', required: true },
          { id: 'additionalRecName', label: 'Additional Recommender (Optional)', type: 'text', required: false },
          { id: 'additionalRecEmail', label: 'Additional Recommender Email', type: 'email', required: false }
        ]
      },
      {
        id: 'documents',
        title: 'Document Upload',
        icon: '📎',
        fields: [
          { id: 'transcript', label: 'Unofficial Transcript', type: 'file', required: true,
            accept: '.pdf', hint: 'Upload your high school transcript' },
          { id: 'testScores', label: 'Test Score Reports', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png', hint: 'SAT, ACT, or AP score reports' },
          { id: 'resume', label: 'Resume/CV', type: 'file', required: false,
            accept: '.pdf,.doc,.docx', hint: 'Optional comprehensive resume' },
          { id: 'portfolio', label: 'Portfolio/Supplemental Materials', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png,.mp3,.mp4', hint: 'Art portfolio, music samples, etc.' }
        ]
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// APPLICATION STATE
// ═══════════════════════════════════════════════════════════════

let appState = {
  currentProgram: null,
  currentStep: 0,
  formData: {},
  uploadedFiles: {}
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function scrollToPrograms() {
  document.getElementById('admission-types').scrollIntoView({ behavior: 'smooth' });
}

function goBack() {
  if (appState.currentStep > 0) {
    appState.currentStep--;
    renderCurrentStep();
  } else {
    showLandingPage();
  }
}

function showLandingPage() {
  document.getElementById('landing-page').classList.remove('hidden');
  document.getElementById('application-page').classList.add('hidden');
  document.getElementById('results-page').classList.add('hidden');
  document.getElementById('demo-page').classList.add('hidden');
  document.getElementById('landing-footer').classList.remove('hidden');
  appState.currentProgram = null;
  appState.currentStep = 0;
  appState.formData = {};
  appState.uploadedFiles = {};
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════════════
// DEMO PAGE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function showDemo() {
  document.getElementById('landing-page').classList.add('hidden');
  document.getElementById('application-page').classList.add('hidden');
  document.getElementById('results-page').classList.add('hidden');
  document.getElementById('demo-page').classList.remove('hidden');
  document.getElementById('landing-footer').classList.add('hidden');
  
  // Reset to application tab
  showDemoTab('application');
  window.scrollTo(0, 0);
}

function hideDemo() {
  document.getElementById('demo-page').classList.add('hidden');
  document.getElementById('landing-page').classList.remove('hidden');
  document.getElementById('landing-footer').classList.remove('hidden');
  window.scrollTo(0, 0);
}

function showDemoTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.demo-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Find and activate the clicked tab
  const tabs = document.querySelectorAll('.demo-tab');
  if (tabName === 'application') {
    tabs[0].classList.add('active');
  } else {
    tabs[1].classList.add('active');
  }
  
  // Update content visibility
  const applicationContent = document.getElementById('demo-application');
  const reviewContent = document.getElementById('demo-review');
  
  if (tabName === 'application') {
    applicationContent.classList.remove('hidden');
    reviewContent.classList.add('hidden');
  } else {
    applicationContent.classList.add('hidden');
    reviewContent.classList.remove('hidden');
  }
  
  window.scrollTo(0, 0);
}

function selectProgram(programId) {
  appState.currentProgram = programId;
  appState.currentStep = 0;
  appState.formData = {};
  appState.uploadedFiles = {};
  
  document.getElementById('landing-page').classList.add('hidden');
  document.getElementById('application-page').classList.remove('hidden');
  document.getElementById('landing-footer').classList.add('hidden');
  
  renderChecklist();
  renderProgressSteps();
  renderCurrentStep();
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════════════
// RENDERING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function renderChecklist() {
  const program = PROGRAM_DATA[appState.currentProgram];
  const container = document.getElementById('checklist-items');
  
  container.innerHTML = program.steps.map((step, index) => {
    const isCompleted = index < appState.currentStep;
    const isActive = index === appState.currentStep;
    const statusClass = isCompleted ? 'completed' : (isActive ? 'active' : '');
    
    return `
      <div class="checklist-item ${statusClass}" onclick="goToStep(${index})">
        <span class="checklist-icon">${isCompleted ? '✓' : step.icon}</span>
        <span>${step.title}</span>
      </div>
    `;
  }).join('');
}

function renderProgressSteps() {
  const program = PROGRAM_DATA[appState.currentProgram];
  const container = document.getElementById('progress-steps');
  
  container.innerHTML = program.steps.map((step, index) => {
    const isCompleted = index < appState.currentStep;
    const isActive = index === appState.currentStep;
    const statusClass = isCompleted ? 'completed' : (isActive ? 'active' : '');
    
    return `
      <div class="progress-step ${statusClass}">
        <span class="progress-step-number">${isCompleted ? '✓' : index + 1}</span>
        <span class="progress-step-label">${step.title}</span>
      </div>
    `;
  }).join('');
  
  // Update progress bar
  const progress = ((appState.currentStep) / program.steps.length) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;
}

function goToStep(stepIndex) {
  // Only allow going to completed steps or current step
  if (stepIndex <= appState.currentStep) {
    appState.currentStep = stepIndex;
    renderCurrentStep();
    renderChecklist();
    renderProgressSteps();
  }
}

function renderCurrentStep() {
  const program = PROGRAM_DATA[appState.currentProgram];
  const step = program.steps[appState.currentStep];
  const container = document.getElementById('application-form');
  
  let fieldsHTML = step.fields.map(field => renderField(field)).join('');
  
  const isLastStep = appState.currentStep === program.steps.length - 1;
  
  container.innerHTML = `
    <div class="form-section">
      <h2>${step.icon} ${step.title}</h2>
      <p class="section-description">Complete all required fields to proceed.</p>
      ${fieldsHTML}
    </div>
    
    <div class="form-navigation">
      <button class="btn btn-secondary" onclick="goBack()">
        ← ${appState.currentStep === 0 ? 'Back to Programs' : 'Previous'}
      </button>
      <button class="btn btn-primary" onclick="${isLastStep ? 'submitApplication()' : 'nextStep()'}">
        ${isLastStep ? 'Submit for Review' : 'Save & Continue'} →
      </button>
    </div>
  `;
  
  // Restore saved values
  restoreFormValues();
  
  // Setup file upload handlers
  setupFileUploads();
  
  // Setup character counters
  setupCharCounters();
}

function renderField(field) {
  const required = field.required ? '<span class="required">*</span>' : '';
  const savedValue = appState.formData[field.id] || '';
  
  if (field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'date') {
    return `
      <div class="form-group">
        <label for="${field.id}">${field.label} ${required}</label>
        <input type="${field.type}" id="${field.id}" class="form-control" 
               placeholder="Enter ${field.label.toLowerCase()}" 
               ${field.required ? 'required' : ''}
               value="${savedValue}">
        ${field.hint ? `<p class="form-hint">${field.hint}</p>` : ''}
      </div>
    `;
  }
  
  if (field.type === 'select') {
    const options = field.options.map(opt => 
      `<option value="${opt}" ${savedValue === opt ? 'selected' : ''}>${opt}</option>`
    ).join('');
    
    return `
      <div class="form-group">
        <label for="${field.id}">${field.label} ${required}</label>
        <select id="${field.id}" class="form-control" ${field.required ? 'required' : ''}>
          <option value="">Select ${field.label}</option>
          ${options}
        </select>
        ${field.hint ? `<p class="form-hint">${field.hint}</p>` : ''}
      </div>
    `;
  }
  
  if (field.type === 'textarea') {
    return `
      <div class="form-group">
        <label for="${field.id}">${field.label} ${required}</label>
        <textarea id="${field.id}" class="form-control" 
                  placeholder="Enter ${field.label.toLowerCase()}"
                  ${field.required ? 'required' : ''}
                  data-maxlength="${field.maxLength || 2000}">${savedValue}</textarea>
        ${field.hint ? `<p class="form-hint">${field.hint}</p>` : ''}
        <div class="char-count" id="${field.id}-count">0 / ${field.maxLength || 2000} characters</div>
      </div>
    `;
  }
  
  if (field.type === 'file') {
    const uploadedFile = appState.uploadedFiles[field.id];
    const uploadedFilesHTML = uploadedFile ? `
      <div class="uploaded-files">
        <div class="uploaded-file">
          <span class="uploaded-file-icon">📄</span>
          <div class="uploaded-file-info">
            <div class="uploaded-file-name">${uploadedFile.name}</div>
            <div class="uploaded-file-size">${formatFileSize(uploadedFile.size)}</div>
          </div>
          <button class="uploaded-file-remove" onclick="removeFile('${field.id}')">✕</button>
        </div>
      </div>
    ` : '';
    
    return `
      <div class="form-group">
        <label for="${field.id}">${field.label} ${required}</label>
        <div class="file-upload-area" id="${field.id}-dropzone" data-field-id="${field.id}" data-accept="${field.accept || '*'}">
          <div class="file-upload-icon">📁</div>
          <div class="file-upload-text">
            <strong>Click to upload</strong> or drag and drop
          </div>
          <div class="file-upload-hint">${field.hint || `Accepted: ${field.accept || 'Any file'}`}</div>
          <input type="file" id="${field.id}" accept="${field.accept || '*'}" style="display: none;">
        </div>
        ${uploadedFilesHTML}
      </div>
    `;
  }
  
  return '';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function restoreFormValues() {
  const program = PROGRAM_DATA[appState.currentProgram];
  const step = program.steps[appState.currentStep];
  
  step.fields.forEach(field => {
    if (field.type !== 'file') {
      const element = document.getElementById(field.id);
      if (element && appState.formData[field.id]) {
        element.value = appState.formData[field.id];
      }
    }
  });
}

function setupFileUploads() {
  document.querySelectorAll('.file-upload-area').forEach(dropzone => {
    const fieldId = dropzone.dataset.fieldId;
    const input = document.getElementById(fieldId);
    
    dropzone.addEventListener('click', () => input.click());
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        handleFileUpload(fieldId, e.dataTransfer.files[0]);
      }
    });
    
    input.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleFileUpload(fieldId, e.target.files[0]);
      }
    });
  });
}

function handleFileUpload(fieldId, file) {
  appState.uploadedFiles[fieldId] = {
    name: file.name,
    size: file.size,
    type: file.type,
    file: file
  };
  renderCurrentStep();
}

function removeFile(fieldId) {
  delete appState.uploadedFiles[fieldId];
  renderCurrentStep();
}

function setupCharCounters() {
  document.querySelectorAll('textarea[data-maxlength]').forEach(textarea => {
    const maxLength = parseInt(textarea.dataset.maxlength);
    const countEl = document.getElementById(`${textarea.id}-count`);
    
    const updateCount = () => {
      const length = textarea.value.length;
      countEl.textContent = `${length} / ${maxLength} characters`;
      countEl.className = 'char-count';
      if (length > maxLength * 0.9) countEl.classList.add('warning');
      if (length > maxLength) countEl.classList.add('error');
    };
    
    textarea.addEventListener('input', updateCount);
    updateCount();
  });
}

function saveCurrentStepData() {
  const program = PROGRAM_DATA[appState.currentProgram];
  const step = program.steps[appState.currentStep];
  
  step.fields.forEach(field => {
    if (field.type !== 'file') {
      const element = document.getElementById(field.id);
      if (element) {
        appState.formData[field.id] = element.value;
      }
    }
  });
}

function validateCurrentStep() {
  const program = PROGRAM_DATA[appState.currentProgram];
  const step = program.steps[appState.currentStep];
  
  for (const field of step.fields) {
    if (field.required) {
      if (field.type === 'file') {
        if (!appState.uploadedFiles[field.id]) {
          alert(`Please upload: ${field.label}`);
          return false;
        }
      } else {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
          alert(`Please fill in: ${field.label}`);
          element?.focus();
          return false;
        }
      }
    }
  }
  return true;
}

function nextStep() {
  saveCurrentStepData();
  
  if (!validateCurrentStep()) return;
  
  const program = PROGRAM_DATA[appState.currentProgram];
  if (appState.currentStep < program.steps.length - 1) {
    appState.currentStep++;
    renderCurrentStep();
    renderChecklist();
    renderProgressSteps();
    window.scrollTo(0, 0);
  }
}

// ═══════════════════════════════════════════════════════════════
// SUBMISSION AND REVIEW
// ═══════════════════════════════════════════════════════════════

function submitApplication() {
  saveCurrentStepData();
  
  if (!validateCurrentStep()) return;
  
  // Show loading state
  document.getElementById('application-page').classList.add('hidden');
  document.getElementById('results-page').classList.remove('hidden');
  
  const resultsContainer = document.querySelector('.results-container');
  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 100px 0;">
      <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
      <h2>Analyzing Your Application...</h2>
      <p style="color: var(--color-text-secondary);">Our AI is reviewing your materials</p>
    </div>
  `;
  
  // Simulate AI review (in production, this would call an API)
  setTimeout(() => {
    const results = generateMockReview();
    renderResults(results);
  }, 2500);
}

function generateMockReview() {
  const program = PROGRAM_DATA[appState.currentProgram];
  
  // Generate scores for each category
  const categories = [];
  
  // Essay Quality
  const essayFields = ['personalEssay', 'personalStatement', 'whySchool', 'challenge', 'whyCollege'];
  let essayContent = '';
  essayFields.forEach(f => { if (appState.formData[f]) essayContent += appState.formData[f]; });
  const essayScore = Math.min(100, Math.max(40, 50 + (essayContent.length / 50) + Math.random() * 30));
  
  categories.push({
    name: 'Essay Quality',
    icon: '✍️',
    score: Math.round(essayScore),
    feedback: generateEssayFeedback(essayScore),
    tips: [
      'Use specific examples and anecdotes',
      'Show don\'t tell - demonstrate qualities through stories',
      'Ensure your unique voice comes through',
      'Proofread carefully for grammar and spelling'
    ]
  });
  
  // Academic Profile
  const hasGPA = appState.formData.gpa && parseFloat(appState.formData.gpa) > 0;
  const academicScore = hasGPA ? Math.min(100, Math.max(50, 60 + Math.random() * 35)) : 65;
  
  categories.push({
    name: 'Academic Profile',
    icon: '📚',
    score: Math.round(academicScore),
    feedback: generateAcademicFeedback(academicScore, appState.formData.gpa),
    tips: [
      'Highlight course rigor and upward grade trends',
      'Explain any extenuating circumstances',
      'Show intellectual curiosity beyond grades',
      'Connect academics to future goals'
    ]
  });
  
  // Extracurriculars
  const activityFields = ['activity1', 'activity2', 'activity3', 'extracurriculars'];
  let activityContent = '';
  activityFields.forEach(f => { if (appState.formData[f]) activityContent += appState.formData[f]; });
  const activityScore = Math.min(100, Math.max(45, 55 + (activityContent.length / 40) + Math.random() * 25));
  
  categories.push({
    name: 'Extracurricular Impact',
    icon: '🏆',
    score: Math.round(activityScore),
    feedback: generateActivityFeedback(activityScore),
    tips: [
      'Emphasize depth over breadth',
      'Show leadership and initiative',
      'Quantify impact when possible',
      'Connect activities to personal growth'
    ]
  });
  
  // Application Completeness
  let completedFields = 0;
  let totalRequired = 0;
  program.steps.forEach(step => {
    step.fields.forEach(field => {
      if (field.required) {
        totalRequired++;
        if (field.type === 'file') {
          if (appState.uploadedFiles[field.id]) completedFields++;
        } else if (appState.formData[field.id] && appState.formData[field.id].trim()) {
          completedFields++;
        }
      }
    });
  });
  const completenessScore = Math.round((completedFields / totalRequired) * 100);
  
  categories.push({
    name: 'Application Completeness',
    icon: '📋',
    score: completenessScore,
    feedback: completenessScore === 100 
      ? 'Excellent! All required materials have been submitted.'
      : `Some required materials are missing. You completed ${completedFields} of ${totalRequired} required items.`,
    tips: [
      'Double-check all required documents',
      'Follow word/character limits',
      'Submit before deadlines',
      'Keep copies of everything submitted'
    ]
  });
  
  // Overall Impression
  const overallScore = Math.round((essayScore + academicScore + activityScore + completenessScore) / 4);
  
  categories.push({
    name: 'Overall Presentation',
    icon: '✨',
    score: Math.round(Math.min(100, overallScore + Math.random() * 10 - 5)),
    feedback: generateOverallFeedback(overallScore),
    tips: [
      'Ensure consistent messaging across application',
      'Let your authentic personality shine through',
      'Address the "why us" question compellingly',
      'Demonstrate genuine interest in the institution'
    ]
  });
  
  // Calculate final decision
  const finalScore = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
  let decision = 'reject';
  if (finalScore >= 80) decision = 'accept';
  else if (finalScore >= 65) decision = 'waitlist';
  
  return {
    decision,
    finalScore,
    categories,
    programName: program.name
  };
}

function generateEssayFeedback(score) {
  if (score >= 85) {
    return 'Your essays demonstrate strong writing ability and personal insight. The narrative is compelling and effectively communicates your unique perspective.';
  } else if (score >= 70) {
    return 'Your essays show good effort with clear ideas. Consider adding more specific examples and deeper reflection to strengthen the impact.';
  } else if (score >= 55) {
    return 'Your essays cover the basics but could benefit from more depth. Focus on showing rather than telling, and include specific anecdotes.';
  }
  return 'Your essays need significant development. Consider what makes you unique and use concrete examples to illustrate your points.';
}

function generateAcademicFeedback(score, gpa) {
  if (score >= 85) {
    return `Your academic profile is strong with competitive grades and rigorous coursework. This demonstrates excellent preparation for the next level.`;
  } else if (score >= 70) {
    return `Your academic record shows solid achievement. Highlighting course rigor and any upward trends could strengthen your profile.`;
  }
  return `Your academic profile has room for improvement. Focus on explaining any context and showing intellectual growth beyond grades.`;
}

function generateActivityFeedback(score) {
  if (score >= 85) {
    return 'Your extracurricular involvement shows meaningful commitment and leadership. The activities demonstrate clear passion and impact.';
  } else if (score >= 70) {
    return 'You have a good foundation of activities. Consider emphasizing depth of involvement and tangible achievements in key areas.';
  }
  return 'Your extracurricular profile could be stronger. Focus on quality over quantity and highlight any leadership or initiative.';
}

function generateOverallFeedback(score) {
  if (score >= 85) {
    return 'This is a compelling application that presents a well-rounded, authentic candidate with clear strengths and goals.';
  } else if (score >= 70) {
    return 'This is a solid application with good potential. Strengthening specific areas could move it into the top tier.';
  } else if (score >= 55) {
    return 'This application has merit but needs refinement. Focus on showcasing your unique qualities more effectively.';
  }
  return 'This application needs significant improvement. Consider working with mentors or counselors to strengthen all components.';
}

function renderResults(results) {
  const resultsContainer = document.querySelector('.results-container');
  
  const decisionText = {
    accept: 'Likely Admit',
    waitlist: 'Competitive Range',
    reject: 'Needs Improvement'
  };
  
  const decisionEmoji = {
    accept: '🎉',
    waitlist: '📊',
    reject: '📝'
  };
  
  resultsContainer.innerHTML = `
    <div class="results-header">
      <div class="decision-badge ${results.decision}">
        ${decisionEmoji[results.decision]} ${decisionText[results.decision]}
      </div>
      <h1>${results.programName} Application Review</h1>
      <p>Here's our detailed analysis of your mock application. Use this feedback to strengthen your actual submission.</p>
    </div>
    
    <div class="overall-score">
      <div class="score-circle" style="--score-percent: ${results.finalScore}%;">
        <span class="score-value">${results.finalScore}</span>
        <span class="score-label">/ 100</span>
      </div>
      <h3>Overall Application Score</h3>
      <p style="color: var(--color-text-secondary); max-width: 500px; margin: var(--space-4) auto 0;">
        This score is based on essay quality, academic profile, activities, and application completeness.
      </p>
    </div>
    
    <h2 style="font-family: var(--font-display); margin-bottom: var(--space-6);">📊 Detailed Feedback</h2>
    
    <div class="feedback-grid">
      ${results.categories.map(category => renderFeedbackCard(category)).join('')}
    </div>
    
    <div class="results-actions">
      <button class="btn btn-primary btn-lg" onclick="showLandingPage()">
        Start New Review
      </button>
      <button class="btn btn-outline btn-lg" onclick="window.print()">
        Print Results
      </button>
    </div>
  `;
  
  window.scrollTo(0, 0);
}

function renderFeedbackCard(category) {
  let scoreClass = 'poor';
  if (category.score >= 80) scoreClass = 'excellent';
  else if (category.score >= 65) scoreClass = 'good';
  else if (category.score >= 50) scoreClass = 'needs-work';
  
  return `
    <div class="feedback-card">
      <div class="feedback-header">
        <h3>${category.icon} ${category.name}</h3>
        <span class="feedback-score ${scoreClass}">${category.score}/100</span>
      </div>
      <div class="feedback-body">
        <p>${category.feedback}</p>
        <div class="feedback-tips">
          <h4>💡 Tips for Improvement</h4>
          <ul>
            ${category.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // App is ready
  console.log('ReviewMyApplication.org loaded successfully');
});

