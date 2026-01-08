// ═══════════════════════════════════════════════════════════════
// SUPABASE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://afxqhokwlhbqhpcpzxur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeHFob2t3bGhicWhwY3B6eHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NzY0MDIsImV4cCI6MjA4MjQ1MjQwMn0.Yne3uJKR6cs1bQKDashNknhkoP7TlAXO2Irw1z__i20';

// Simple Supabase client (no SDK needed for basic operations)
// NOTE: from(), select(), eq() must NOT be async - they return objects for chaining
// Only the terminal methods (insert, single) that make network calls should be async
const supabase = {
  from(table) {
    return {
      async insert(data) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
        const result = await response.json();
        return { data: result[0], error: null };
      },
      select(columns = '*') {  // NOT async - returns object for chaining
        return {
          eq(column, value) {  // NOT async - returns object for chaining
            return {
              async single() {  // async - makes the actual network call
                const response = await fetch(
                  `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`,
                  {
                    headers: {
                      'apikey': SUPABASE_ANON_KEY,
                      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                  }
                );
                const result = await response.json();
                return { data: result[0], error: null };
              }
            };
          }
        };
      }
    };
  },
  functions: {
    async invoke(functionName, options = {}) {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(options.body || {})
      });
      if (!response.ok) {
        const error = await response.text();
        return { data: null, error: { message: error } };
      }
      const data = await response.json();
      return { data, error: null };
    }
  }
};

// Generate anonymous session ID for non-logged-in users
function getSessionId() {
  let sessionId = localStorage.getItem('rma_session_id');
  if (!sessionId) {
    sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('rma_session_id', sessionId);
  }
  return sessionId;
}

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
        title: 'Student Profile',
        icon: '👤',
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { id: 'currentGrade', label: 'Current Grade', type: 'select', required: true, 
            options: ['4th Grade', '5th Grade', '6th Grade', '7th Grade'] },
          { id: 'applyingGrade', label: 'Grade Applying For', type: 'select', required: true,
            options: ['6th Grade', '7th Grade', '8th Grade'] },
          { id: 'personalityTraits', label: 'Three Words That Describe You', type: 'text', required: true,
            hint: 'e.g., Curious, Determined, Kind' }
        ]
      },
      {
        id: 'activities',
        title: 'Activities & Interests',
        icon: '🏆',
        fields: [
          { id: 'activity1', label: 'Primary Activity 1', type: 'textarea', required: true,
            hint: 'Name, years involved, hours/week, achievements, and why it\'s meaningful to you', maxLength: 1500 },
          { id: 'activity2', label: 'Primary Activity 2', type: 'textarea', required: true,
            hint: 'Name, years involved, hours/week, achievements, and why it\'s meaningful to you', maxLength: 1500 },
          { id: 'activity3', label: 'Activity 3 (Optional)', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity4', label: 'Activity 4 (Optional)', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'otherInterests', label: 'Other Hobbies & Interests', type: 'textarea', required: false,
            hint: 'Reading, gaming, cooking, etc. - things you do for fun', maxLength: 1000 }
        ]
      },
      {
        id: 'student-essay',
        title: 'Student Essays',
        icon: '✍️',
        fields: [
          { id: 'personalStatement', label: 'Tell Us About Yourself', type: 'textarea', required: true,
            hint: 'Introduce yourself! Share your interests, personality, and what makes you unique (200-400 words)', maxLength: 2500 },
          { id: 'challenge', label: 'A Challenge You Overcame', type: 'textarea', required: true,
            hint: 'Describe a difficult situation and what you learned from it (150-300 words)', maxLength: 2000 },
          { id: 'essayUpload', label: 'Or Upload Essay (Optional)', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', hint: 'Upload a PDF or image of your typed essay instead' }
        ]
      },
      {
        id: 'parent-statement',
        title: 'Parent Perspective',
        icon: '👨‍👩‍👧',
        fields: [
          { id: 'parentStatement', label: 'Tell us about your child at their best', type: 'textarea', required: true,
            hint: 'Share stories, character traits, growth moments, and what makes them special (300-500 words)', maxLength: 3500 },
          { id: 'growthAreas', label: 'Areas of Growth', type: 'textarea', required: false,
            hint: 'What challenges has your child worked through? How have they grown?', maxLength: 1500 },
          { id: 'parentEssayUpload', label: 'Or Upload Statement (Optional)', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', hint: 'Upload a PDF or image of your typed statement instead' }
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
        title: 'Student Profile',
        icon: '👤',
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { id: 'currentGrade', label: 'Current Grade', type: 'select', required: true,
            options: ['7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade'] },
          { id: 'applyingGrade', label: 'Grade Applying For', type: 'select', required: true,
            options: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'] },
          { id: 'gpa', label: 'Cumulative GPA', type: 'text', required: false,
            hint: 'e.g., 3.8/4.0 or 95/100' }
        ]
      },
      {
        id: 'activities',
        title: 'Extracurricular Activities',
        icon: '🏆',
        fields: [
          { id: 'activity1', label: 'Activity 1 (Most Meaningful)', type: 'textarea', required: true,
            hint: 'Name, role, years, hours/week, achievements, and why it matters to you', maxLength: 1200 },
          { id: 'activity2', label: 'Activity 2', type: 'textarea', required: true,
            hint: 'Name, role, years, hours/week, achievements', maxLength: 1000 },
          { id: 'activity3', label: 'Activity 3', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity4', label: 'Activity 4', type: 'textarea', required: false, maxLength: 1000 },
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
            hint: 'Write a thoughtful, personal essay (400-600 words)', maxLength: 4000 },
          { id: 'essayUpload', label: 'Or Upload Essay (Optional)', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', hint: 'Upload a PDF or image of your essay instead' }
        ]
      },
      {
        id: 'short-answers',
        title: 'Short Answer Questions',
        icon: '💬',
        fields: [
          { id: 'whySchool', label: 'Why are you interested in this school?', type: 'textarea', required: true,
            hint: '150-250 words', maxLength: 1500 },
          { id: 'uniqueQuality', label: 'What unique quality will you bring?', type: 'textarea', required: true,
            hint: '100-200 words', maxLength: 1200 },
          { id: 'academicInterest', label: 'What academic subject excites you most and why?', type: 'textarea', required: false,
            hint: '100-200 words', maxLength: 1200 }
        ]
      }
    ]
  },
  'college': {
    name: 'College',
    icon: '🎯',
    steps: [
      {
        id: 'target-school',
        title: 'Target School',
        icon: '🎓',
        description: 'Select your target school for personalized, school-specific feedback',
        fields: [
          { id: 'targetSchool', label: 'Target School', type: 'select', required: true,
            options: [
              { value: 'harvard', label: 'Harvard University (~3% acceptance) - Full Research' },
              { value: 'mit', label: 'MIT (~4% acceptance) - Full Research' },
              { value: 'stanford', label: 'Stanford University (~4% acceptance)' },
              { value: 'yale', label: 'Yale University (~4.5% acceptance)' },
              { value: 'princeton', label: 'Princeton University (~5% acceptance)' },
              { value: 'uchicago', label: 'University of Chicago (~5% acceptance)' },
              { value: 'columbia', label: 'Columbia University (~4.2% acceptance)' },
              { value: 'penn', label: 'UPenn / Wharton (~4.2% acceptance)' },
              { value: 'duke', label: 'Duke University (~6% acceptance)' },
              { value: 'caltech', label: 'Caltech (~3% acceptance)' },
              { value: 'brown', label: 'Brown University (~5% acceptance)' },
              { value: 'northwestern', label: 'Northwestern University (~7% acceptance)' },
              { value: 'cornell', label: 'Cornell University (~7.3% acceptance)' },
              { value: 'dartmouth', label: 'Dartmouth College (~6% acceptance)' },
              { value: 'other_ultra', label: 'Other Ultra-Selective (Under 10%)' },
              { value: 'other_highly', label: 'Other Highly Selective (10-20%)' },
              { value: 'other_very', label: 'Other Very Selective (20-35%)' },
              { value: 'other_selective', label: 'Other Selective (35-50%)' }
            ],
            hint: 'Your feedback will be calibrated to this school\'s specific criteria and culture' },
          { id: 'satScore', label: 'SAT Score (Optional)', type: 'text', required: false,
            hint: 'Total score out of 1600 (e.g., 1520)' },
          { id: 'actScore', label: 'ACT Score (Optional)', type: 'text', required: false,
            hint: 'Composite score out of 36 (e.g., 34)' }
        ]
      },
      {
        id: 'personal-info',
        title: 'Student Profile',
        icon: '👤',
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { id: 'intendedMajor', label: 'Intended Major', type: 'text', required: true },
          { id: 'gpa', label: 'Cumulative GPA', type: 'text', required: false,
            hint: 'e.g., 3.9/4.0 Unweighted or 4.3/5.0 Weighted' },
          { id: 'courseRigor', label: 'Course Rigor Summary', type: 'textarea', required: false,
            hint: 'Number of APs, Honors, IB courses taken', maxLength: 1000 }
        ]
      },
      {
        id: 'activities',
        title: 'Extracurricular Activities',
        icon: '🏆',
        fields: [
          { id: 'activity1', label: 'Activity 1 (Most Meaningful)', type: 'textarea', required: true,
            hint: 'Organization, Position, Years, Hours/week, Description of what you did and impact', maxLength: 1200 },
          { id: 'activity2', label: 'Activity 2', type: 'textarea', required: true, maxLength: 1000 },
          { id: 'activity3', label: 'Activity 3', type: 'textarea', required: true, maxLength: 1000 },
          { id: 'activity4', label: 'Activity 4', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'activity5', label: 'Activity 5', type: 'textarea', required: false, maxLength: 1000 },
          { id: 'honors', label: 'Honors & Awards', type: 'textarea', required: false,
            hint: 'List notable honors, awards, recognitions (name, level, year)', maxLength: 1500 }
        ]
      },
      {
        id: 'personal-essay',
        title: 'Personal Statement',
        icon: '✍️',
        fields: [
          { id: 'essayPrompt', label: 'Essay Prompt', type: 'select', required: true,
            options: [
              'Some students have a background, identity, interest, or talent...',
              'The lessons we take from obstacles we encounter...',
              'Reflect on a time when you questioned or challenged a belief...',
              'Reflect on something someone has done for you...',
              'Discuss an accomplishment that sparked personal growth...',
              'Describe a topic or concept you find engaging...',
              'Share an essay on any topic of your choice'
            ]},
          { id: 'personalStatement', label: 'Personal Statement', type: 'textarea', required: true,
            hint: 'Your main Common App essay (250-650 words)', maxLength: 4500 },
          { id: 'essayUpload', label: 'Or Upload Essay (Optional)', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', hint: 'Upload a PDF or image of your essay instead' }
        ]
      },
      {
        id: 'supplemental',
        title: 'Supplemental Essays',
        icon: '📝',
        fields: [
          { id: 'whyCollege', label: 'Why This College?', type: 'textarea', required: true,
            hint: 'Why are you interested in this institution? Be specific about programs, culture, opportunities (200-400 words)', maxLength: 2500 },
          { id: 'whyMajor', label: 'Why This Major?', type: 'textarea', required: true,
            hint: 'What draws you to your intended field? Share your journey and goals (200-400 words)', maxLength: 2500 },
          { id: 'additionalInfo', label: 'Additional Information (Optional)', type: 'textarea', required: false,
            hint: 'Context for your application, special circumstances, or anything else important', maxLength: 3000 },
          { id: 'supplementalUpload', label: 'Or Upload Essays (Optional)', type: 'file', required: false,
            accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', hint: 'Upload a PDF or image of your supplemental essays' }
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

// Track current demo level
let currentDemoLevel = 'middle-school';

function showDemo() {
  document.getElementById('landing-page').classList.add('hidden');
  document.getElementById('application-page').classList.add('hidden');
  document.getElementById('results-page').classList.add('hidden');
  document.getElementById('demo-page').classList.remove('hidden');
  document.getElementById('landing-footer').classList.add('hidden');
  
  // Reset to middle school demo and application tab
  switchDemoLevel('middle-school');
  window.scrollTo(0, 0);
}

function hideDemo() {
  document.getElementById('demo-page').classList.add('hidden');
  document.getElementById('landing-page').classList.remove('hidden');
  document.getElementById('landing-footer').classList.remove('hidden');
  window.scrollTo(0, 0);
}

function switchDemoLevel(level) {
  currentDemoLevel = level;
  
  // Update level tabs
  document.querySelectorAll('.demo-level-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Get the correct tab ID based on level
  const tabId = level === 'middle-school' ? 'demo-level-middle' : 
                level === 'high-school' ? 'demo-level-high' : 'demo-level-college';
  const tabElement = document.getElementById(tabId);
  if (tabElement) {
    tabElement.classList.add('active');
  }
  
  // Hide all demo level content
  document.querySelectorAll('.demo-level-content').forEach(content => {
    content.classList.add('hidden');
  });
  
  // Show the selected demo level
  const levelId = level === 'middle-school' ? 'demo-middle-school' : 
                  level === 'high-school' ? 'demo-high-school' : 'demo-college';
  const levelElement = document.getElementById(levelId);
  if (levelElement) {
    levelElement.classList.remove('hidden');
  }
  
  // Reset to application tab for the selected level
  showDemoTab('application', level);
  
  window.scrollTo(0, 0);
}

function showDemoTab(tabName, level = null) {
  const demoLevel = level || currentDemoLevel;
  
  // Get the correct demo container based on level
  let demoContainer;
  if (demoLevel === 'middle-school') {
    demoContainer = document.getElementById('demo-middle-school');
  } else if (demoLevel === 'high-school') {
    demoContainer = document.getElementById('demo-high-school');
  } else {
    demoContainer = document.getElementById('demo-college');
  }
  
  // Safety check - if container doesn't exist, return
  if (!demoContainer) {
    console.warn('Demo container not found for level:', demoLevel);
    return;
  }
  
  // Update tab buttons within this container
  demoContainer.querySelectorAll('.demo-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Find and activate the clicked tab
  const tabs = demoContainer.querySelectorAll('.demo-tab');
  if (tabs.length > 0) {
    if (tabName === 'application') {
      tabs[0].classList.add('active');
    } else if (tabs[1]) {
      tabs[1].classList.add('active');
    }
  }
  
  // Update content visibility based on level
  let applicationContent, reviewContent;
  
  if (demoLevel === 'middle-school') {
    applicationContent = document.getElementById('demo-application');
    reviewContent = document.getElementById('demo-review');
  } else if (demoLevel === 'high-school') {
    applicationContent = document.getElementById('demo-application-hs');
    reviewContent = document.getElementById('demo-review-hs');
  } else {
    applicationContent = document.getElementById('demo-application-college');
    reviewContent = document.getElementById('demo-review-college');
  }
  
  if (applicationContent && reviewContent) {
    if (tabName === 'application') {
      applicationContent.classList.remove('hidden');
      reviewContent.classList.add('hidden');
    } else {
      applicationContent.classList.add('hidden');
      reviewContent.classList.remove('hidden');
    }
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
    // Handle both simple string options and object options with value/label
    const options = field.options.map(opt => {
      if (typeof opt === 'object' && opt.value !== undefined) {
        // Object format: { value: 'harvard', label: 'Harvard University (~3%)' }
        return `<option value="${opt.value}" ${savedValue === opt.value ? 'selected' : ''}>${opt.label}</option>`;
      } else {
        // Simple string format
        return `<option value="${opt}" ${savedValue === opt ? 'selected' : ''}>${opt}</option>`;
      }
    }).join('');
    
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

async function submitApplication() {
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
      <p style="color: var(--color-text-secondary);">Our AI counselor is reviewing your materials</p>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-top: 1rem;">This usually takes 15-30 seconds</p>
    </div>
  `;
  
  try {
    // 1. Save application to Supabase
    const applicationData = {
      program_type: appState.currentProgram,
      status: 'submitted',
      form_data: appState.formData,
      anonymous_session_id: getSessionId(),
      submitted_at: new Date().toISOString()
    };
    
    const { data: application, error: insertError } = await supabase.from('applications').insert(applicationData);
    
    if (insertError) {
      console.error('Failed to save application:', insertError);
      throw new Error('Failed to save application');
    }
    
    console.log('Application saved:', application.id);
    
    // 2. Call Edge Function to generate review
    const { data: reviewResult, error: reviewError } = await supabase.functions.invoke('generate-review', {
      body: { applicationId: application.id }
    });
    
    if (reviewError) {
      console.error('Review generation failed:', reviewError);
      throw new Error(reviewError.message || 'Failed to generate review');
    }
    
    console.log('Review generated:', reviewResult);
    
    // 3. Fetch the full review from database
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewResult.reviewId)
      .single();
    
    if (fetchError || !review) {
      console.error('Failed to fetch review:', fetchError);
      // Fall back to the basic result we have
      renderResultsFromAPI({
        overallScore: reviewResult.overallScore,
        decision: reviewResult.decision,
        programName: PROGRAM_DATA[appState.currentProgram].name
      });
      return;
    }
    
    // 4. Render the results
    renderResultsFromAPI(review);
    
  } catch (error) {
    console.error('Submission error:', error);
    
    // Show error message with fallback option
    resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">
          ${error.message || 'We couldn\'t connect to our AI counselor. Please try again.'}
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="submitApplication()">
            Try Again
          </button>
          <button class="btn btn-outline" onclick="useMockReview()">
            Use Demo Review Instead
          </button>
        </div>
      </div>
    `;
  }
}

// Fallback to mock review if API fails
function useMockReview() {
  const results = generateMockReview();
  renderResults(results);
}

// Render results from API response
function renderResultsFromAPI(review) {
  // Check if this is the new comprehensive v2 format
  if (review.target_school_analysis && review.component_scores) {
    renderResultsV2(review);
    return;
  }

  // Otherwise use legacy rendering
  renderResultsLegacy(review);
}

// Enhanced rendering for comprehensive v2 reviews with university-specific feedback
function renderResultsV2(review) {
  const resultsContainer = document.querySelector('.results-container');
  const schoolAnalysis = review.target_school_analysis || {};
  const overall = review.overall_assessment || {};
  const components = review.component_scores || {};
  const narrative = review.narrative_assessment || {};
  const weaknesses = review.weaknesses || [];
  const redFlags = review.red_flags || [];
  const finalAssessment = review.final_assessment || '';

  // Build fit analysis section
  const fitData = components.university_fit || {};
  const alignmentItems = fitData.alignment_with_what_school_seeks || [];

  const fitAnalysisHTML = alignmentItems.length > 0 ? `
    <div class="fit-analysis-section" style="margin-top: var(--space-8); padding: var(--space-6); background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
      <h3 style="margin-bottom: var(--space-4);">🎯 Fit Analysis: Alignment with ${schoolAnalysis.school}</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">How well does this applicant match what ${schoolAnalysis.school} specifically seeks?</p>
      <div style="display: grid; gap: var(--space-4);">
        ${alignmentItems.map(item => `
          <div style="padding: var(--space-4); background: ${item.demonstrated ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-left: 3px solid ${item.demonstrated ? '#22c55e' : '#ef4444'}; border-radius: var(--radius-md);">
            <div style="display: flex; align-items: start; gap: var(--space-3);">
              <span style="font-size: 1.5rem;">${item.demonstrated ? '✅' : '❌'}</span>
              <div style="flex: 1;">
                <strong>${item.criterion}</strong>
                <p style="color: var(--color-text-secondary); margin-top: var(--space-2); font-size: 0.95rem;">${item.evidence}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--color-border);">
        <p><strong>Cultural Fit:</strong> ${fitData.cultural_fit_assessment || 'Not assessed'}</p>
        <p style="margin-top: var(--space-3);"><strong>Knowledge of School:</strong> ${fitData.knowledge_of_school || 'Not assessed'}</p>
        <p style="margin-top: var(--space-3);"><strong>Values Alignment:</strong> ${fitData.values_alignment || 'Not assessed'}</p>
      </div>
    </div>
  ` : '';

  // Build weaknesses section with common pitfalls highlighted
  const weaknessesHTML = weaknesses.length > 0 ? `
    <div class="weaknesses-section" style="margin-top: var(--space-8); padding: var(--space-6); background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
      <h3 style="margin-bottom: var(--space-4);">⚠️ Identified Weaknesses</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Areas where this application falls short of ${schoolAnalysis.school}'s expectations:</p>
      <div style="display: grid; gap: var(--space-4);">
        ${weaknesses.map(w => {
          const priorityColor = w.priority === 'HIGH' ? '#ef4444' : w.priority === 'MEDIUM' ? '#f59e0b' : '#6b7280';
          const priorityBg = w.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : w.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)';
          return `
            <div style="padding: var(--space-4); background: ${priorityBg}; border-left: 3px solid ${priorityColor}; border-radius: var(--radius-md);">
              <div style="display: flex; align-items: start; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-2);">
                <strong style="color: ${priorityColor};">${w.category}</strong>
                <span style="font-size: 0.85rem; padding: 2px 8px; background: ${priorityColor}; color: white; border-radius: 4px;">${w.priority}</span>
              </div>
              <p style="margin: var(--space-2) 0;"><strong>Issue:</strong> ${w.weakness}</p>
              <p style="color: var(--color-text-secondary); font-size: 0.95rem; margin: var(--space-2) 0;"><strong>Evidence:</strong> ${w.evidence}</p>
              <p style="color: var(--color-text-secondary); font-size: 0.95rem; margin-top: var(--space-2);"><strong>What ${schoolAnalysis.school} Expects:</strong> ${w.school_expectation}</p>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  // Build red flags section
  const redFlagsHTML = redFlags.length > 0 ? `
    <div class="red-flags-section" style="margin-top: var(--space-8); padding: var(--space-6); background: rgba(239, 68, 68, 0.05); border-radius: var(--radius-lg); border: 2px solid #ef4444;">
      <h3 style="margin-bottom: var(--space-4); color: #dc2626;">🚨 Red Flags Detected</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);"><strong>Warning:</strong> These are serious issues that often lead to rejection at ${schoolAnalysis.school}:</p>
      <div style="display: grid; gap: var(--space-4);">
        ${redFlags.map(flag => {
          const severityColor = flag.severity === 'critical' ? '#dc2626' : flag.severity === 'high' ? '#ea580c' : '#f59e0b';
          return `
            <div style="padding: var(--space-4); background: white; border-left: 4px solid ${severityColor}; border-radius: var(--radius-md);">
              <div style="display: flex; align-items: start; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-2);">
                <strong style="color: ${severityColor};">${flag.flag}</strong>
                <span style="font-size: 0.85rem; padding: 2px 8px; background: ${severityColor}; color: white; border-radius: 4px; text-transform: uppercase;">${flag.severity}</span>
              </div>
              <p style="margin: var(--space-2) 0;"><strong>Evidence:</strong> ${flag.evidence}</p>
              <p style="color: var(--color-text-secondary); margin-top: var(--space-2);"><strong>Impact:</strong> ${flag.impact}</p>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  // Render complete results
  resultsContainer.innerHTML = `
    <div class="results-header">
      <div class="decision-badge">
        ${overall.rating || 'Assessment Complete'}
      </div>
      <h1>Application Review for ${schoolAnalysis.school}</h1>
      <p style="font-size: 1.1rem; color: var(--color-text-secondary);">
        <strong>Tier:</strong> ${schoolAnalysis.tier} |
        <strong>Acceptance Rate:</strong> ${schoolAnalysis.acceptance_rate}
      </p>
    </div>

    <div class="overall-score">
      <div class="score-circle" style="--score-percent: ${overall.score || 0}%;">
        <span class="score-value">${overall.score || 0}</span>
        <span class="score-label">/ 100</span>
      </div>
      <h3>Overall Application Score</h3>
      <p style="color: var(--color-text-secondary); max-width: 600px; margin: var(--space-4) auto 0;">
        ${overall.admission_likelihood || 'Assessment of realistic chances'}
      </p>
    </div>

    <h2 style="font-family: var(--font-display); margin-bottom: var(--space-4);">What ${schoolAnalysis.school} Seeks</h2>
    <div style="padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); margin-bottom: var(--space-6);">
      <ul style="list-style: none; padding: 0; display: grid; gap: var(--space-2);">
        ${(schoolAnalysis.what_this_school_seeks || []).map(item => `
          <li style="padding-left: var(--space-6); position: relative;">
            <span style="position: absolute; left: 0;">✓</span>
            ${item}
          </li>
        `).join('')}
      </ul>
    </div>

    ${fitAnalysisHTML}
    ${weaknessesHTML}
    ${redFlagsHTML}

    ${finalAssessment ? `
      <div style="margin-top: var(--space-8); padding: var(--space-6); background: var(--color-surface); border-radius: var(--radius-lg);">
        <h3 style="margin-bottom: var(--space-4);">📝 Final Assessment</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${finalAssessment}</p>
      </div>
    ` : ''}

    <div class="results-actions" style="margin-top: var(--space-8);">
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

// Legacy rendering for old format reviews
function renderResultsLegacy(review) {
  const resultsContainer = document.querySelector('.results-container');
  const program = PROGRAM_DATA[appState.currentProgram];
  
  // Map API decision to display values
  const decisionMap = {
    likely_admit: { text: 'Likely Admit', emoji: '🎉', class: 'accept' },
    competitive: { text: 'Competitive Range', emoji: '📊', class: 'waitlist' },
    developing: { text: 'Developing', emoji: '📝', class: 'waitlist' },
    needs_work: { text: 'Needs Improvement', emoji: '⚠️', class: 'reject' }
  };
  
  const decision = decisionMap[review.decision] || decisionMap.developing;
  const overallScore = review.overall_score || review.overallScore || 0;
  const categoryScores = review.category_scores || {};
  const feedbackText = review.feedback_text || {};
  const improvementTips = review.improvement_tips || [];
  
  // Build category cards from API response
  const categoryCards = Object.entries(categoryScores).map(([key, data]) => {
    const icons = { essay: '✍️', academics: '📚', activities: '🏆', completeness: '📋' };
    const names = { essay: 'Essay Quality', academics: 'Academic Profile', activities: 'Extracurricular Impact', completeness: 'Application Completeness' };
    
    const score = typeof data === 'object' ? data.score : data;
    const feedback = feedbackText[key] || {};
    const summary = typeof feedback === 'object' ? feedback.summary : feedback;
    const improvements = typeof feedback === 'object' ? (feedback.improvements || []) : [];
    
    let scoreClass = 'poor';
    if (score >= 80) scoreClass = 'excellent';
    else if (score >= 65) scoreClass = 'good';
    else if (score >= 50) scoreClass = 'needs-work';
    
    return `
      <div class="feedback-card">
        <div class="feedback-header">
          <h3>${icons[key] || '📋'} ${names[key] || key}</h3>
          <span class="feedback-score ${scoreClass}">${score}/100</span>
        </div>
        <div class="feedback-body">
          <p>${summary || 'No detailed feedback available for this category.'}</p>
          ${improvements.length > 0 ? `
            <div class="feedback-tips">
              <h4>💡 Tips for Improvement</h4>
              <ul>
                ${improvements.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // Build improvement tips section
  const tipsHTML = improvementTips.length > 0 ? `
    <div class="improvement-section" style="margin-top: var(--space-8); padding: var(--space-6); background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
      <h3 style="margin-bottom: var(--space-4);">🎯 Priority Improvements</h3>
      <ol style="padding-left: var(--space-6); display: flex; flex-direction: column; gap: var(--space-3);">
        ${improvementTips.map(tip => `<li style="color: var(--color-text-secondary);">${tip}</li>`).join('')}
      </ol>
    </div>
  ` : '';
  
  // Build encouragement section
  const encouragement = feedbackText.encouragement || 'Remember: this is practice feedback to help you improve. Keep refining your application!';
  
  resultsContainer.innerHTML = `
    <div class="results-header">
      <div class="decision-badge ${decision.class}">
        ${decision.emoji} ${decision.text}
      </div>
      <h1>${program.name} Application Review</h1>
      <p>Here's our AI counselor's detailed analysis of your mock application.</p>
    </div>
    
    <div class="overall-score">
      <div class="score-circle" style="--score-percent: ${overallScore}%;">
        <span class="score-value">${overallScore}</span>
        <span class="score-label">/ 100</span>
      </div>
      <h3>Overall Application Score</h3>
      <p style="color: var(--color-text-secondary); max-width: 500px; margin: var(--space-4) auto 0;">
        ${feedbackText.overview || 'This score reflects the overall strength of your application across all evaluated categories.'}
      </p>
    </div>
    
    <h2 style="font-family: var(--font-display); margin-bottom: var(--space-6);">📊 Detailed Feedback</h2>
    
    <div class="feedback-grid">
      ${categoryCards}
    </div>
    
    ${tipsHTML}
    
    <div style="margin-top: var(--space-8); padding: var(--space-6); background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary)); border-radius: var(--radius-lg); color: white; text-align: center;">
      <p style="font-size: 1.1rem; opacity: 0.95;">${encouragement}</p>
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

// School data lookup for college applications
const SCHOOL_DATA = {
  harvard: {
    name: 'Harvard University',
    tier: 'ultra_selective',
    acceptance_rate: '~3%',
    sat_25th: 1470, sat_75th: 1600,
    gpa_expected: 3.9,
    what_they_seek: ['Clear narrative arc', 'Distinction in activities', 'Community impact', 'Authentic voice'],
    unique_check: (formData) => {
      // Harvard: Look for narrative arc
      const hasNarrative = formData.personalStatement?.length > 300;
      return { check: 'narrative_arc', passes: hasNarrative };
    }
  },
  mit: {
    name: 'Massachusetts Institute of Technology',
    tier: 'ultra_selective',
    acceptance_rate: '~4%',
    sat_25th: 1510, sat_75th: 1570,
    gpa_expected: 3.9,
    what_they_seek: ['Hands-on makers', 'Collaborative spirit', 'Risk-takers', 'Evidence of building/creating'],
    unique_check: (formData) => {
      // MIT: Look for maker/builder evidence
      const allContent = Object.values(formData).filter(v => typeof v === 'string').join(' ').toLowerCase();
      const hasMaker = /built|created|coded|designed|programmed|robotics|project|hackathon|maker/.test(allContent);
      return { check: 'maker_evidence', passes: hasMaker, weakness: hasMaker ? null : 'No evidence of hands-on making or building - critical for MIT' };
    }
  },
  stanford: {
    name: 'Stanford University',
    tier: 'ultra_selective',
    acceptance_rate: '~4%',
    sat_25th: 1500, sat_75th: 1580,
    gpa_expected: 3.9,
    what_they_seek: ['Intellectual vitality', 'Innovation', 'Entrepreneurial spirit', 'Authentic passion'],
    unique_check: (formData) => {
      const allContent = Object.values(formData).filter(v => typeof v === 'string').join(' ').toLowerCase();
      const hasVitality = /curious|fascinated|wondered|explored|questioned|discovered|passion/.test(allContent);
      return { check: 'intellectual_vitality', passes: hasVitality };
    }
  },
  yale: { name: 'Yale University', tier: 'ultra_selective', acceptance_rate: '~4.5%', sat_25th: 1470, sat_75th: 1570, gpa_expected: 3.9, what_they_seek: ['Humanities engagement', 'Deep thinking', 'Community contribution'] },
  princeton: { name: 'Princeton University', tier: 'ultra_selective', acceptance_rate: '~5%', sat_25th: 1500, sat_75th: 1580, gpa_expected: 3.9, what_they_seek: ['Undergraduate focus', 'Service orientation', 'Intellectual engagement'] },
  uchicago: { name: 'University of Chicago', tier: 'ultra_selective', acceptance_rate: '~5%', sat_25th: 1480, sat_75th: 1580, gpa_expected: 3.9, what_they_seek: ['Intellectual passion', 'Creative thinking', 'Love of ideas'] },
  columbia: { name: 'Columbia University', tier: 'ultra_selective', acceptance_rate: '~4.2%', sat_25th: 1490, sat_75th: 1570, gpa_expected: 3.9, what_they_seek: ['Core Curriculum enthusiasm', 'NYC engagement', 'Intellectual breadth'] },
  penn: { name: 'University of Pennsylvania', tier: 'ultra_selective', acceptance_rate: '~4.2%', sat_25th: 1480, sat_75th: 1570, gpa_expected: 3.9, what_they_seek: ['Interdisciplinary thinking', 'Collaborative spirit', 'School-specific fit'] },
  duke: { name: 'Duke University', tier: 'ultra_selective', acceptance_rate: '~6%', sat_25th: 1470, sat_75th: 1570, gpa_expected: 3.85, what_they_seek: ['Purpose-driven learning', 'Campus engagement', 'Community contribution'] },
  caltech: { name: 'California Institute of Technology', tier: 'ultra_selective', acceptance_rate: '~3%', sat_25th: 1530, sat_75th: 1580, gpa_expected: 3.95, what_they_seek: ['Pure STEM passion', 'Research experience', 'Collaborative spirit'] },
  brown: { name: 'Brown University', tier: 'ultra_selective', acceptance_rate: '~5%', sat_25th: 1470, sat_75th: 1570, gpa_expected: 3.9, what_they_seek: ['Self-direction', 'Intellectual curiosity', 'Academic independence'] },
  northwestern: { name: 'Northwestern University', tier: 'highly_selective', acceptance_rate: '~7%', sat_25th: 1450, sat_75th: 1550, gpa_expected: 3.85, what_they_seek: ['Pre-professional focus', 'Program-specific interest', 'Interdisciplinary thinking'] },
  cornell: { name: 'Cornell University', tier: 'ultra_selective', acceptance_rate: '~7.3%', sat_25th: 1450, sat_75th: 1560, gpa_expected: 3.85, what_they_seek: ['College-specific fit', 'Practical application', 'Diverse interests'] },
  dartmouth: { name: 'Dartmouth College', tier: 'ultra_selective', acceptance_rate: '~6%', sat_25th: 1460, sat_75th: 1560, gpa_expected: 3.9, what_they_seek: ['Undergraduate focus', 'Community engagement', 'Outdoor/rural fit'] },
  other_ultra: { name: 'Ultra-Selective University', tier: 'ultra_selective', acceptance_rate: '<10%', sat_25th: 1450, sat_75th: 1570, gpa_expected: 3.9, what_they_seek: ['Distinction', 'Clear narrative', 'Authentic voice'] },
  other_highly: { name: 'Highly Selective University', tier: 'highly_selective', acceptance_rate: '10-20%', sat_25th: 1350, sat_75th: 1500, gpa_expected: 3.7, what_they_seek: ['Strong passion', 'Consistent commitment', 'Authentic essays'] },
  other_very: { name: 'Very Selective University', tier: 'very_selective', acceptance_rate: '20-35%', sat_25th: 1250, sat_75th: 1420, gpa_expected: 3.5, what_they_seek: ['Genuine interest', 'Consistent involvement', 'Good writing'] },
  other_selective: { name: 'Selective University', tier: 'selective', acceptance_rate: '35-50%', sat_25th: 1150, sat_75th: 1350, gpa_expected: 3.3, what_they_seek: ['Academic readiness', 'Some involvement', 'Interest in school'] }
};

function getSchoolData(targetSchool) {
  return SCHOOL_DATA[targetSchool] || SCHOOL_DATA.other_highly;
}

function generateMockReview() {
  const program = PROGRAM_DATA[appState.currentProgram];
  const formData = appState.formData;
  
  // Get target school for college applications
  const targetSchool = formData.targetSchool || 'other_highly';
  const schoolData = getSchoolData(targetSchool);
  const isCollegeApp = appState.currentProgram === 'college';
  
  // Sophisticated content analysis (school-calibrated for college)
  const essayAnalysis = analyzeEssayContent(formData, isCollegeApp ? schoolData : null);
  const activityAnalysis = analyzeActivityContent(formData, isCollegeApp ? schoolData : null);
  const academicAnalysis = analyzeAcademicContent(formData, isCollegeApp ? schoolData : null);
  const narrativeAnalysis = analyzeNarrative(formData);
  
  // Detect weaknesses (school-calibrated for college)
  const weaknesses = detectApplicationWeaknesses(formData, essayAnalysis, activityAnalysis, academicAnalysis, narrativeAnalysis, isCollegeApp ? schoolData : null);
  
  // Generate scores for each category
  const categories = [];
  
  // Essay Quality - Sophisticated Analysis
  categories.push({
    name: 'Essay Quality',
    icon: '✍️',
    score: essayAnalysis.score,
    feedback: generateSophisticatedEssayFeedback(essayAnalysis, weaknesses),
    weaknesses: weaknesses.filter(w => w.category === 'Essays').map(w => w.weakness)
  });
  
  // Academic Profile - Sophisticated Analysis
  categories.push({
    name: 'Academic Profile',
    icon: '📚',
    score: academicAnalysis.score,
    feedback: generateSophisticatedAcademicFeedback(academicAnalysis, weaknesses),
    weaknesses: weaknesses.filter(w => w.category === 'Academics').map(w => w.weakness)
  });
  
  // Extracurriculars - With Tier Assessment
  categories.push({
    name: 'Extracurricular Impact',
    icon: '🏆',
    score: activityAnalysis.score,
    feedback: generateSophisticatedActivityFeedback(activityAnalysis, weaknesses),
    tierAssessment: activityAnalysis.highestTier,
    weaknesses: weaknesses.filter(w => w.category === 'Extracurriculars').map(w => w.weakness)
  });
  
  // Narrative Coherence - NEW
  categories.push({
    name: 'Narrative Coherence',
    icon: '📖',
    score: narrativeAnalysis.score,
    feedback: generateNarrativeFeedback(narrativeAnalysis, weaknesses),
    archetype: narrativeAnalysis.archetype,
    weaknesses: weaknesses.filter(w => w.category === 'Narrative').map(w => w.weakness)
  });
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    academicAnalysis.score * 0.25 +
    activityAnalysis.score * 0.30 +
    essayAnalysis.score * 0.25 +
    narrativeAnalysis.score * 0.20
  );
  
  // Determine decision based on score AND weaknesses
  let decision = 'reject';
  let decisionRationale = '';
  const highPriorityWeaknesses = weaknesses.filter(w => w.priority === 'HIGH');
  
  // School-calibrated decision (more critical for ultra-selective)
  if (isCollegeApp && schoolData.tier === 'ultra_selective') {
    // Ultra-selective: much harder to get "accept" prediction
    if (overallScore >= 85 && highPriorityWeaknesses.length === 0) {
      decision = 'accept';
      decisionRationale = `Strong application for ${schoolData.name}. However, at ${schoolData.acceptance_rate} acceptance, even strong applications face steep odds.`;
    } else if (overallScore >= 70 && highPriorityWeaknesses.length <= 1) {
      decision = 'waitlist';
      decisionRationale = `Competitive but not distinguished. At ${schoolData.name} (${schoolData.acceptance_rate}), applications need exceptional qualities to stand out.`;
    } else {
      decision = 'reject';
      decisionRationale = `Application has significant gaps for ${schoolData.name}'s standards. Consider addressing weaknesses or expanding school list.`;
    }
  } else if (overallScore >= 80 && highPriorityWeaknesses.length === 0) {
    decision = 'accept';
    decisionRationale = 'Strong application with competitive credentials across all areas.';
  } else if (overallScore >= 65 || (overallScore >= 55 && highPriorityWeaknesses.length <= 1)) {
    decision = 'waitlist';
    decisionRationale = 'Competitive application with specific areas that need attention.';
  } else {
    decision = 'reject';
    decisionRationale = 'Application has significant gaps that would make admission unlikely.';
  }
  
  return {
    decision,
    finalScore: overallScore,
    categories,
    programName: program.name,
    weaknesses,
    narrativeArchetype: narrativeAnalysis.archetype,
    decisionRationale,
    // School-specific info for college apps
    targetSchool: isCollegeApp ? {
      name: schoolData.name,
      tier: schoolData.tier,
      acceptance_rate: schoolData.acceptance_rate,
      what_they_seek: schoolData.what_they_seek
    } : null
  };
}

// ═══════════════════════════════════════════════════════════════
// SOPHISTICATED ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function analyzeEssayContent(formData, schoolData = null) {
  const essayFields = ['personalEssay', 'personalStatement', 'whySchool', 'challenge', 'whyCollege', 'whyMajor'];
  let essayContent = essayFields
    .map(f => formData[f] || '')
    .filter(v => v.trim())
    .join(' ');
  
  const wordCount = essayContent.split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount < 50) {
    return {
      score: 30,
      wordCount,
      hasSpecificDetails: false,
      hasReflection: false,
      hasClichés: false,
      suspectedAdultVoice: false,
      analysis: schoolData 
        ? `Essays are too brief to evaluate for ${schoolData.name}.`
        : 'Essays are too brief to evaluate effectively.',
      schoolCalibration: schoolData ? schoolData.name : null
    };
  }
  
  let score = 50;
  const lowerContent = essayContent.toLowerCase();
  
  // Specificity indicators (positive)
  const specificDetailPatterns = /when i was|one day|i remember|specifically|for example|that moment|the first time|during my/gi;
  const specificMatches = lowerContent.match(specificDetailPatterns) || [];
  const hasSpecificDetails = specificMatches.length >= 2;
  if (hasSpecificDetails) score += 15;
  
  // Reflection indicators (positive)
  const reflectionPatterns = /i learned|i realized|this taught me|i grew|looking back|i understood|it changed|i began to see/gi;
  const reflectionMatches = lowerContent.match(reflectionPatterns) || [];
  const hasReflection = reflectionMatches.length >= 1;
  if (hasReflection) score += 10;
  
  // Cliché detection (negative)
  const clichePatterns = /changed my life|making a difference|passion for|giving back|since i was young|my whole life|always dreamed|truly believe/gi;
  const clicheMatches = lowerContent.match(clichePatterns) || [];
  const hasClichés = clicheMatches.length >= 2;
  if (hasClichés) score -= 10;
  
  // Adult voice detection (negative)
  const sophisticatedPatterns = /consequently|furthermore|nonetheless|paradigm|encompass|multifaceted|ubiquitous|dichotomy|juxtaposition/gi;
  const sophisticatedMatches = lowerContent.match(sophisticatedPatterns) || [];
  const suspectedAdultVoice = sophisticatedMatches.length >= 3;
  if (suspectedAdultVoice) score -= 15;
  
  // Length bonus
  if (wordCount >= 500) score += 10;
  else if (wordCount >= 300) score += 5;
  
  score = Math.min(100, Math.max(0, score));
  
  return {
    score,
    wordCount,
    hasSpecificDetails,
    hasReflection,
    hasClichés,
    suspectedAdultVoice,
    analysis: score >= 70 
      ? 'Essays show genuine voice and specific details.'
      : 'Essays could benefit from more specific, personal details and deeper reflection.'
  };
}

function analyzeActivityContent(formData, schoolData = null) {
  const activityFields = ['activity1', 'activity2', 'activity3', 'activity4', 'activity5'];
  const activities = activityFields
    .map(f => formData[f] || '')
    .filter(v => v.trim());
  
  const activityCount = activities.length;
  const content = activities.join(' ').toLowerCase();
  
  if (activityCount === 0) {
    return {
      score: 30,
      activityCount: 0,
      highestTier: 4,
      hasLeadership: false,
      hasQuantifiedImpact: false,
      depthVsBreadth: 'No activities provided',
      analysis: schoolData 
        ? `No extracurricular activities provided. ${schoolData.name} expects strong extracurricular involvement.`
        : 'No extracurricular activities provided.',
      schoolCalibration: schoolData ? schoolData.name : null
    };
  }
  
  let score = 40;
  let highestTier = 4;
  let schoolSpecificNotes = [];
  
  // Tier 1 indicators (national/international level)
  const tier1Patterns = /national|international|published|founded|patent|finalist|winner|champion|first place|gold medal/gi;
  const tier1Matches = content.match(tier1Patterns) || [];
  if (tier1Matches.length >= 1) {
    score += 30;
    highestTier = 1;
  }
  // Tier 2 indicators (state/regional)
  else {
    const tier2Patterns = /state|regional|all-state|all-region|president|captain|director|organized|created|launched/gi;
    const tier2Matches = content.match(tier2Patterns) || [];
    if (tier2Matches.length >= 1) {
      score += 20;
      highestTier = 2;
    }
    // Tier 3 indicators (school/local)
    else {
      const tier3Patterns = /varsity|lead|officer|vice president|treasurer|secretary|editor|manager/gi;
      const tier3Matches = content.match(tier3Patterns) || [];
      if (tier3Matches.length >= 1) {
        score += 10;
        highestTier = 3;
      }
    }
  }
  
  // Leadership indicators
  const leadershipPatterns = /led|managed|organized|supervised|mentored|taught|directed|coordinated/gi;
  const leadershipMatches = content.match(leadershipPatterns) || [];
  const hasLeadership = leadershipMatches.length >= 2;
  if (hasLeadership) score += 5;
  
  // Quantified impact
  const impactPatterns = /\d+\s*(people|members|students|participants|hours|raised|dollars|\$)/gi;
  const impactMatches = content.match(impactPatterns) || [];
  const hasQuantifiedImpact = impactMatches.length >= 1;
  if (hasQuantifiedImpact) score += 5;
  
  // Years of commitment
  const yearsPatterns = /(\d+)\s*years?|since\s*(freshman|sophomore|9th|10th)/gi;
  const yearsMatches = content.match(yearsPatterns) || [];
  if (yearsMatches.length >= 1) score += 5;
  
  // Depth vs breadth assessment
  let depthVsBreadth = 'Reasonable number of activities';
  if (activityCount >= 6) {
    depthVsBreadth = 'Many activities listed - may indicate breadth over depth';
    score -= 5;
  } else if (activityCount <= 2 && highestTier >= 3) {
    depthVsBreadth = 'Limited activity profile';
  }
  
  score = Math.min(100, Math.max(0, score));
  
  return {
    score,
    activityCount,
    highestTier,
    hasLeadership,
    hasQuantifiedImpact,
    depthVsBreadth,
    analysis: score >= 70
      ? `${activityCount} activities described. Shows meaningful commitment with Tier ${highestTier} achievements.`
      : `${activityCount} activities described. Lacks evidence of deep impact or distinction.`
  };
}

function analyzeAcademicContent(formData, schoolData = null) {
  const gpa = formData.gpa ? parseFloat(formData.gpa) : 0;
  const sat = formData.satScore ? parseInt(formData.satScore) : 0;
  const act = formData.actScore ? parseInt(formData.actScore) : 0;
  const courseRigor = (formData.courseRigor || '').toLowerCase();
  
  // School-calibrated expectations
  const expectedGPA = schoolData?.gpa_expected || 3.7;
  const sat25th = schoolData?.sat_25th || 1400;
  const sat75th = schoolData?.sat_75th || 1550;
  
  let score = 50;
  let analysisNotes = [];
  
  // GPA analysis (school-calibrated)
  if (gpa >= expectedGPA + 0.05) {
    score += 25;
    analysisNotes.push(`GPA of ${gpa} meets ${schoolData ? schoolData.name + "'s" : 'competitive'} expectations`);
  } else if (gpa >= expectedGPA - 0.1) {
    score += 15;
    analysisNotes.push(`GPA of ${gpa} is competitive but not exceptional${schoolData ? ' for ' + schoolData.name : ''}`);
  } else if (gpa >= 3.5) {
    score += 5;
    analysisNotes.push(`GPA of ${gpa} is below ${schoolData ? schoolData.name + "'s typical admit" : 'expectations for selective schools'}`);
  } else if (gpa > 0) {
    score -= 10;
    analysisNotes.push(`GPA of ${gpa} is significantly below expectations`);
  } else {
    score -= 15;
    analysisNotes.push('GPA not provided');
  }
  
  // SAT analysis (school-calibrated)
  if (sat > 0) {
    if (sat >= sat75th) {
      score += 15;
      analysisNotes.push(`SAT ${sat} is above ${schoolData ? schoolData.name + "'s" : ''} 75th percentile (${sat75th})`);
    } else if (sat >= (sat25th + sat75th) / 2) {
      score += 10;
      analysisNotes.push(`SAT ${sat} is at median range`);
    } else if (sat >= sat25th) {
      score += 5;
      analysisNotes.push(`SAT ${sat} is at 25th percentile - most admits scored higher`);
    } else {
      score -= 5;
      analysisNotes.push(`SAT ${sat} is BELOW 25th percentile (${sat25th})`);
    }
  }
  
  // Course rigor analysis
  let apCount = 0;
  const apMatch = courseRigor.match(/(\d+)\s*(ap|ib|advanced)/i);
  if (apMatch) {
    apCount = parseInt(apMatch[1]);
    if (apCount >= 10) {
      score += 20;
      analysisNotes.push(`Strong rigor with ${apCount} AP/IB courses`);
    } else if (apCount >= 6) {
      score += 10;
      analysisNotes.push(`Good rigor with ${apCount} AP/IB courses`);
    } else if (apCount >= 3) {
      score += 5;
      analysisNotes.push(`Some advanced courses (${apCount})`);
    }
  } else if (courseRigor.includes('ap') || courseRigor.includes('ib') || courseRigor.includes('honors')) {
    score += 5;
    analysisNotes.push('Some course rigor indicated');
  }
  
  score = Math.min(100, Math.max(0, score));
  
  const analysis = analysisNotes.join('. ') + '.';
  
  return {
    score,
    gpa,
    sat,
    apCount,
    analysis,
    schoolCalibration: schoolData ? {
      name: schoolData.name,
      gpa_expected: expectedGPA,
      sat_range: `${sat25th}-${sat75th}`
    } : null
  };
}

function analyzeNarrative(formData) {
  const allContent = Object.values(formData)
    .filter(v => typeof v === 'string')
    .join(' ')
    .toLowerCase();
  
  // Look for thematic coherence
  const stemKeywords = (allContent.match(/coding|programming|research|science|engineering|math|technology|computer|robot|data/gi) || []).length;
  const artsKeywords = (allContent.match(/art|music|theater|writing|creative|design|dance|perform|paint|compose/gi) || []).length;
  const leadershipKeywords = (allContent.match(/led|president|captain|founded|organized|initiative|started|created|launched/gi) || []).length;
  const serviceKeywords = (allContent.match(/volunteer|community|help|service|nonprofit|charity|mentor|teach|tutor/gi) || []).length;
  
  let archetype = 'None Clear';
  let hasNarrative = false;
  let score = 40;
  let canBeSummarizedAs = 'This is the student who... (no clear narrative emerges)';
  const coherenceIssues = [];
  
  // Determine if there's a clear theme
  if (stemKeywords >= 6 && leadershipKeywords >= 2) {
    archetype = 'The Tech Leader';
    hasNarrative = true;
    score = 75;
    canBeSummarizedAs = 'This is the student who builds things and leads technical projects';
  } else if (leadershipKeywords >= 5) {
    archetype = 'The Entrepreneur';
    hasNarrative = true;
    score = 75;
    canBeSummarizedAs = 'This is the student who takes initiative and creates new things';
  } else if (serviceKeywords >= 5) {
    archetype = 'The Community Builder';
    hasNarrative = true;
    score = 70;
    canBeSummarizedAs = 'This is the student who cares deeply about helping others';
  } else if (artsKeywords >= 5) {
    archetype = 'The Creative';
    hasNarrative = true;
    score = 70;
    canBeSummarizedAs = 'This is the student passionate about creative expression';
  } else if (stemKeywords >= 5) {
    archetype = 'The STEM Specialist';
    hasNarrative = true;
    score = 65;
    canBeSummarizedAs = 'This is the student focused on science and technology';
  }
  
  // Check for coherence issues
  if (stemKeywords >= 4 && artsKeywords >= 4) {
    coherenceIssues.push('Activities span multiple domains without clear connection');
    score -= 10;
  }
  
  if (formData.intendedMajor) {
    const major = formData.intendedMajor.toLowerCase();
    if (major.includes('computer') || major.includes('engineering')) {
      if (stemKeywords < 3) {
        coherenceIssues.push('Intended major not well-supported by activities');
        score -= 10;
      }
    }
  }
  
  score = Math.min(100, Math.max(0, score));
  
  return {
    score,
    archetype,
    hasNarrative,
    canBeSummarizedAs,
    coherenceIssues
  };
}

function detectApplicationWeaknesses(formData, essayAnalysis, activityAnalysis, academicAnalysis, narrativeAnalysis, schoolData = null) {
  const weaknesses = [];
  const schoolName = schoolData?.name || 'selective schools';
  const isUltraSelective = schoolData?.tier === 'ultra_selective';
  
  // HIGH PRIORITY WEAKNESSES
  
  // 1. Well-rounded but not distinguished
  if (activityAnalysis.activityCount >= 4 && activityAnalysis.highestTier >= 3) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Extracurriculars',
      weakness: 'Well-Rounded But Not Distinguished',
      evidence: `${activityAnalysis.activityCount} activities listed but none reach state/national level distinction`,
      impact: isUltraSelective
        ? `At ${schoolName} (${schoolData.acceptance_rate} acceptance), "well-rounded" is a weakness. Most admits have exceptional distinction in 1-2 areas.`
        : 'At highly selective schools, "well-rounded" is actually a weakness. They prefer "well-lopsided" students exceptional in 1-2 areas.'
    });
  }
  
  // 2. No clear narrative arc
  if (!narrativeAnalysis.hasNarrative) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Narrative',
      weakness: 'No Clear Narrative Arc',
      evidence: 'Application lacks a cohesive story - hard to summarize what makes this applicant distinctive',
      impact: schoolData?.name === 'Harvard University'
        ? 'Harvard explicitly looks for students with "clear arc" - the notable scientist, the future leader, the bridge-builder.'
        : 'The most memorable applicants have a clear identity. Admissions committees need to be able to say "This is the student who..."'
    });
  }
  
  // 3. Generic essays
  if (essayAnalysis.score < 60 || (essayAnalysis.hasClichés && !essayAnalysis.hasSpecificDetails)) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Essays',
      weakness: 'Essays Lack Distinctive Voice',
      evidence: essayAnalysis.hasClichés 
        ? 'Essays contain clichéd phrases and lack specific, personal details'
        : 'Essays don\'t have enough specific details or genuine personality to stand out',
      impact: isUltraSelective
        ? `${schoolName} reads 40,000+ applications. Essays are the primary tool for differentiation.`
        : 'Admissions officers read thousands of essays. Generic essays are forgettable.'
    });
  }
  
  // 4. Breadth over depth
  if (activityAnalysis.activityCount >= 6 && !activityAnalysis.hasLeadership) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Extracurriculars',
      weakness: 'Too Many Activities Without Depth',
      evidence: `${activityAnalysis.activityCount} activities with limited evidence of leadership or deep commitment`,
      impact: schoolData?.name === 'Massachusetts Institute of Technology'
        ? 'MIT says: "Don\'t expect million things. Put heart into few things you truly care about."'
        : 'Selective schools prefer 2-3 deep commitments over 10 shallow involvements.'
    });
  }
  
  // School-specific weaknesses
  if (schoolData?.name === 'Massachusetts Institute of Technology') {
    const allContent = Object.values(formData).filter(v => typeof v === 'string').join(' ').toLowerCase();
    const hasMaker = /built|created|coded|designed|programmed|robotics|project|hackathon|maker/.test(allContent);
    if (!hasMaker) {
      weaknesses.push({
        priority: 'HIGH',
        category: 'MIT-Specific',
        weakness: 'No Evidence of Hands-On Making',
        evidence: 'Application lacks evidence of building, creating, or making things',
        impact: 'MIT\'s motto is "Mens et Manus" (Mind and Hand). Applications without maker evidence are fundamentally misaligned with MIT.'
      });
    }
  }
  
  if (schoolData?.name === 'Stanford University') {
    const allContent = Object.values(formData).filter(v => typeof v === 'string').join(' ').toLowerCase();
    const hasVitality = /curious|fascinated|wondered|explored|questioned|discovered|passion/.test(allContent);
    if (!hasVitality) {
      weaknesses.push({
        priority: 'HIGH',
        category: 'Stanford-Specific',
        weakness: 'Limited Intellectual Vitality',
        evidence: 'Application doesn\'t demonstrate genuine intellectual curiosity beyond requirements',
        impact: 'Stanford explicitly evaluates "intellectual vitality" - evidence of curiosity and learning for its own sake.'
      });
    }
  }
  
  // MEDIUM PRIORITY WEAKNESSES
  
  // 5. Academic gaps (school-calibrated)
  if (academicAnalysis.score < 60) {
    weaknesses.push({
      priority: 'MEDIUM',
      category: 'Academics',
      weakness: 'Academic Profile Below Expectations',
      evidence: academicAnalysis.analysis,
      impact: isUltraSelective
        ? `At ${schoolName}, academics are a baseline filter. Most rejected applicants have strong GPAs.`
        : 'At selective schools, academic credentials are a baseline filter.'
    });
  }
  
  // SAT below school's 25th percentile
  if (academicAnalysis.sat > 0 && schoolData && academicAnalysis.sat < schoolData.sat_25th) {
    weaknesses.push({
      priority: 'MEDIUM',
      category: 'Academics',
      weakness: 'Test Scores Below School Range',
      evidence: `SAT of ${academicAnalysis.sat} is below ${schoolName}'s 25th percentile (${schoolData.sat_25th})`,
      impact: `This means 75%+ of admitted students at ${schoolName} scored higher.`
    });
  }
  
  // 6. Narrative coherence issues
  if (narrativeAnalysis.coherenceIssues.length > 0) {
    narrativeAnalysis.coherenceIssues.forEach(issue => {
      weaknesses.push({
        priority: 'MEDIUM',
        category: 'Narrative',
        weakness: 'Application Coherence Issue',
        evidence: issue,
        impact: 'Disconnects between stated interests and activities raise credibility concerns.'
      });
    });
  }
  
  // RED FLAGS
  
  // 7. Suspected adult voice
  if (essayAnalysis.suspectedAdultVoice) {
    weaknesses.push({
      priority: 'HIGH',
      category: 'Essays',
      weakness: 'Essay May Not Sound Authentic',
      evidence: 'Language sophistication exceeds typical high school level',
      impact: 'Admissions officers can detect adult intervention. This raises questions about the entire application.'
    });
  }
  
  return weaknesses;
}

function generateSophisticatedEssayFeedback(analysis, weaknesses) {
  const essayWeaknesses = weaknesses.filter(w => w.category === 'Essays');
  
  if (analysis.score >= 80) {
    return 'Your essays demonstrate strong writing ability with authentic voice and specific personal details. The narrative is compelling and reveals genuine insight.';
  } else if (analysis.score >= 65) {
    let feedback = 'Your essays show effort with some genuine moments. ';
    if (!analysis.hasSpecificDetails) {
      feedback += 'The essays would benefit from more concrete, specific examples. ';
    }
    if (!analysis.hasReflection) {
      feedback += 'Deeper reflection on what you learned would strengthen the impact. ';
    }
    return feedback;
  } else {
    let feedback = 'Your essays need significant development. ';
    if (analysis.hasClichés) {
      feedback += 'The writing contains clichéd phrases that don\'t differentiate you. ';
    }
    if (analysis.suspectedAdultVoice) {
      feedback += 'Some language seems inconsistent with typical high school writing. ';
    }
    if (analysis.wordCount < 200) {
      feedback += 'The content is too brief to make a strong impression. ';
    }
    return feedback;
  }
}

function generateSophisticatedAcademicFeedback(analysis, weaknesses) {
  if (analysis.score >= 80) {
    return `Strong academic profile with ${analysis.gpa ? 'a competitive GPA of ' + analysis.gpa : 'solid credentials'}${analysis.apCount > 0 ? ' and ' + analysis.apCount + ' advanced courses' : ''}. This demonstrates excellent preparation for rigorous college coursework.`;
  } else if (analysis.score >= 60) {
    return `Academic record shows ${analysis.gpa ? 'a GPA of ' + analysis.gpa : 'some achievement'}. For highly selective schools, this profile may be below the typical admitted student range. Course rigor ${analysis.apCount > 0 ? 'includes some advanced courses' : 'is not clearly documented'}.`;
  } else {
    return `Academic profile ${analysis.gpa ? 'shows a GPA of ' + analysis.gpa + ' which' : ''} may be below competitive range for selective schools. ${!analysis.gpa ? 'GPA information was not provided. ' : ''}Strong academics are a baseline filter at top schools.`;
  }
}

function generateSophisticatedActivityFeedback(analysis, weaknesses) {
  const tierDescriptions = {
    1: 'exceptional (national/international level)',
    2: 'strong (state/regional level)',
    3: 'solid (school/local level)',
    4: 'participation level'
  };
  
  if (analysis.score >= 80) {
    return `Your extracurricular profile shows meaningful commitment with ${tierDescriptions[analysis.highestTier]} achievements. ${analysis.hasLeadership ? 'Leadership experience is evident. ' : ''}${analysis.hasQuantifiedImpact ? 'The quantified impact strengthens your narrative.' : ''}`;
  } else if (analysis.score >= 60) {
    let feedback = `${analysis.activityCount} activities described with ${tierDescriptions[analysis.highestTier]} as highest achievement. `;
    if (!analysis.hasLeadership) {
      feedback += 'Limited evidence of leadership roles. ';
    }
    if (!analysis.hasQuantifiedImpact) {
      feedback += 'Impact is not quantified with specific numbers or outcomes. ';
    }
    return feedback;
  } else {
    return `Your extracurricular profile lacks the depth and distinction that selective schools typically seek. ${analysis.depthVsBreadth}. At top schools, quality and impact matter more than quantity.`;
  }
}

function generateNarrativeFeedback(analysis, weaknesses) {
  if (analysis.hasNarrative) {
    let feedback = `Your application tells a coherent story. Archetype: "${analysis.archetype}". `;
    feedback += analysis.canBeSummarizedAs + '. ';
    if (analysis.coherenceIssues.length > 0) {
      feedback += `However, there are some coherence issues: ${analysis.coherenceIssues.join('; ')}.`;
    }
    return feedback;
  } else {
    return 'Your application lacks a clear narrative arc. The most memorable applicants have a cohesive story - when all pieces are considered, there should be a clear identity. Currently, it\'s difficult to complete the sentence: "This is the student who..."';
  }
}

// Legacy feedback generators kept for compatibility
function generateEssayFeedback(score) {
  if (score >= 85) return 'Your essays demonstrate strong writing ability and personal insight.';
  if (score >= 70) return 'Your essays show good effort with clear ideas.';
  if (score >= 55) return 'Your essays cover the basics but could benefit from more depth.';
  return 'Your essays need significant development.';
}

function generateAcademicFeedback(score, gpa) {
  if (score >= 85) return `Your academic profile is strong with competitive credentials.`;
  if (score >= 70) return `Your academic record shows solid achievement.`;
  return `Your academic profile has room for improvement.`;
}

function generateActivityFeedback(score) {
  if (score >= 85) return 'Your extracurricular involvement shows meaningful commitment and leadership.';
  if (score >= 70) return 'You have a good foundation of activities.';
  return 'Your extracurricular profile could be stronger.';
}

function generateOverallFeedback(score) {
  if (score >= 85) return 'This is a compelling application with clear strengths.';
  if (score >= 70) return 'This is a solid application with good potential.';
  if (score >= 55) return 'This application has merit but needs refinement.';
  return 'This application needs significant improvement.';
}

function renderResults(results) {
  const resultsContainer = document.querySelector('.results-container');
  
  const decisionText = {
    accept: 'Highly Competitive',
    waitlist: 'Competitive Range',
    reject: 'Needs Strengthening'
  };
  
  const decisionEmoji = {
    accept: '🎯',
    waitlist: '📊',
    reject: '⚠️'
  };
  
  // Build weaknesses section if any exist
  const highPriorityWeaknesses = (results.weaknesses || []).filter(w => w.priority === 'HIGH');
  const otherWeaknesses = (results.weaknesses || []).filter(w => w.priority !== 'HIGH');
  
  const weaknessesHTML = results.weaknesses && results.weaknesses.length > 0 ? `
    <div class="weaknesses-section" style="margin-top: var(--space-8);">
      <h2 style="font-family: var(--font-display); margin-bottom: var(--space-6);">🔍 Identified Weaknesses</h2>
      
      ${highPriorityWeaknesses.length > 0 ? `
        <div class="weakness-group high-priority" style="margin-bottom: var(--space-6);">
          <h3 style="color: var(--color-warning); margin-bottom: var(--space-4);">⚠️ High Priority Issues</h3>
          ${highPriorityWeaknesses.map(w => `
            <div class="weakness-card" style="background: var(--color-surface); border: 1px solid rgba(255, 152, 0, 0.3); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-3);">
              <div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2);">${w.weakness}</div>
              <div style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: var(--space-2);"><strong>Evidence:</strong> ${w.evidence}</div>
              <div style="color: var(--color-text-tertiary); font-size: 0.85rem; font-style: italic;"><strong>Impact:</strong> ${w.impact}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${otherWeaknesses.length > 0 ? `
        <div class="weakness-group medium-priority">
          <h3 style="color: var(--color-text-secondary); margin-bottom: var(--space-4);">📋 Other Areas of Concern</h3>
          ${otherWeaknesses.map(w => `
            <div class="weakness-card" style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-3);">
              <div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2);">${w.weakness}</div>
              <div style="color: var(--color-text-secondary); font-size: 0.9rem;">${w.evidence}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  ` : '';
  
  // Narrative archetype display
  const narrativeHTML = results.narrativeArchetype ? `
    <div style="margin-top: var(--space-6); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
      <h4 style="margin-bottom: var(--space-2);">📖 Narrative Assessment</h4>
      <p style="color: var(--color-text-secondary);">
        Archetype Detected: <strong style="color: var(--color-primary);">${results.narrativeArchetype}</strong>
        ${results.narrativeArchetype === 'None Clear' ? ' — Your application lacks a cohesive narrative identity.' : ''}
      </p>
    </div>
  ` : '';
  
  resultsContainer.innerHTML = `
    <div class="results-header">
      <div class="decision-badge ${results.decision}">
        ${decisionEmoji[results.decision]} ${decisionText[results.decision]}
      </div>
      <h1>${results.programName} Application Review</h1>
      <p>Honest assessment of your mock application. This is what admissions officers would see.</p>
      ${results.decisionRationale ? `<p style="color: var(--color-text-secondary); margin-top: var(--space-2); font-style: italic;">${results.decisionRationale}</p>` : ''}
    </div>
    
    <div class="overall-score">
      <div class="score-circle" style="--score-percent: ${results.finalScore}%;">
        <span class="score-value">${results.finalScore}</span>
        <span class="score-label">/ 100</span>
      </div>
      <h3>Overall Application Score</h3>
      <p style="color: var(--color-text-secondary); max-width: 600px; margin: var(--space-4) auto 0;">
        Weighted assessment: Academics (25%), Activities (30%), Essays (25%), Narrative Coherence (20%)
      </p>
    </div>
    
    ${narrativeHTML}
    
    <h2 style="font-family: var(--font-display); margin: var(--space-8) 0 var(--space-6);">📊 Component Analysis</h2>
    
    <div class="feedback-grid">
      ${results.categories.map(category => renderFeedbackCard(category)).join('')}
    </div>
    
    ${weaknessesHTML}
    
    <div style="margin-top: var(--space-8); padding: var(--space-6); background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
      <h3 style="margin-bottom: var(--space-3);">📝 About This Assessment</h3>
      <p style="color: var(--color-text-secondary); font-size: 0.95rem;">
        This review identifies weaknesses without providing improvement suggestions—just like a real admissions committee would. 
        Use this honest feedback to understand where your application stands and what areas need attention. 
        At selective schools with 5-15% acceptance rates, even strong applicants face steep odds.
      </p>
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
  
  // Show weaknesses instead of tips for v2
  const weaknessesContent = category.weaknesses && category.weaknesses.length > 0 ? `
    <div class="category-weaknesses" style="margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--color-border);">
      <h4 style="color: var(--color-warning); font-size: 0.85rem; margin-bottom: var(--space-2);">⚠️ Issues Identified</h4>
      <ul style="padding-left: var(--space-4); margin: 0;">
        ${category.weaknesses.map(w => `<li style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: var(--space-1);">${w}</li>`).join('')}
      </ul>
    </div>
  ` : '';
  
  // Show tier assessment for activities
  const tierContent = category.tierAssessment ? `
    <div style="margin-top: var(--space-2); font-size: 0.85rem; color: var(--color-text-tertiary);">
      Highest Achievement Level: <strong>${category.tierAssessment === 1 ? 'Tier 1 (National/International)' : 
        category.tierAssessment === 2 ? 'Tier 2 (State/Regional)' : 
        category.tierAssessment === 3 ? 'Tier 3 (School/Local)' : 
        'Tier 4 (Participation)'}</strong>
    </div>
  ` : '';
  
  // Show archetype for narrative
  const archetypeContent = category.archetype ? `
    <div style="margin-top: var(--space-2); font-size: 0.85rem; color: var(--color-text-tertiary);">
      Detected Pattern: <strong style="color: var(--color-primary);">${category.archetype}</strong>
    </div>
  ` : '';
  
  return `
    <div class="feedback-card">
      <div class="feedback-header">
        <h3>${category.icon} ${category.name}</h3>
        <span class="feedback-score ${scoreClass}">${category.score}/100</span>
      </div>
      <div class="feedback-body">
        <p>${category.feedback}</p>
        ${tierContent}
        ${archetypeContent}
        ${weaknessesContent}
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

