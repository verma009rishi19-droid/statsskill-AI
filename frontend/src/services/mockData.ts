// Comprehensive Fallback & Production Mock Data for All 15 Platform Modules
export const MOCK_USERS: Record<string, any> = {
  learner: {
    id: 1,
    email: 'learner@mospi.gov.in',
    full_name: 'Priya Sharma',
    role: 'learner',
    is_active: true,
    is_verified: true,
    created_at: '2026-01-15T10:00:00Z',
  },
  trainer: {
    id: 2,
    email: 'trainer@nssta.gov.in',
    full_name: 'Dr. Rajesh Kumar',
    role: 'trainer',
    is_active: true,
    is_verified: true,
    created_at: '2026-01-15T10:00:00Z',
  },
  manager: {
    id: 3,
    email: 'manager@mospi.gov.in',
    full_name: 'Anita Desai',
    role: 'manager',
    is_active: true,
    is_verified: true,
    created_at: '2026-01-15T10:00:00Z',
  },
  admin: {
    id: 4,
    email: 'admin@statskill.gov.in',
    full_name: 'Vikram Patel',
    role: 'admin',
    is_active: true,
    is_verified: true,
    created_at: '2026-01-15T10:00:00Z',
  },
};

export const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Price Statistics Division (PSD)', code: 'PSD', description: 'Consumer price index compilation and retail market monitoring' },
  { id: 2, name: 'National Accounts Division (NAD)', code: 'NAD', description: 'GDP, GVA, and national macroeconomic aggregates' },
  { id: 3, name: 'Field Operations Division (FOD)', code: 'FOD', description: 'Nationwide household survey operations and sample scrutiny' },
  { id: 4, name: 'Survey Design & Research Division (SDRD)', code: 'SDRD', description: 'Sampling frames, survey schedules, and estimation algorithms' },
  { id: 5, name: 'Data Quality Assurance Division (DQAD)', code: 'DQAD', description: 'Validation protocols, audit scrutiny, and SDC standards' },
];

export const MOCK_JOB_ROLES = [
  { id: 1, title: 'Statistical Survey Officer', code: 'SSO', department_id: 1, description: 'Field supervision and elementary price compilation' },
  { id: 2, title: 'Assistant Director (Statistics)', code: 'ADS', department_id: 2, description: 'Macroeconomic accounts estimation and GVA aggregation' },
  { id: 3, title: 'Junior Statistical Officer (JSO)', code: 'JSO', department_id: 3, description: 'Primary field enumeration and electronic data capture' },
  { id: 4, title: 'Director (Sampling & Methodology)', code: 'DSM', department_id: 4, description: 'Survey design and multiplier formula derivations' },
];

export const MOCK_PROFILE = {
  id: 1,
  user_id: 1,
  designation: 'Assistant Director (Statistics)',
  department_id: 1,
  department: MOCK_DEPARTMENTS[0],
  job_role_id: 1,
  job_role: MOCK_JOB_ROLES[0],
  department_name: 'Price Statistics Division (PSD)',
  job_role_title: 'Statistical Survey Officer',
  cadre: 'Subordinate Statistical Service (SSS)',
  employee_code: 'MOSPI-SSS-8492',
  state_posting: 'New Delhi (HQ)',
  work_experience_years: 4,
  current_assignment: 'Urban CPI basket quotation monitoring and Jevons aggregation quality checks',
  career_objectives: 'Advancement to Senior Statistical Officer with mastery in automated DQAF protocols and R/Python computing',
  educational_qualifications: [
    { degree: 'M.Sc. Statistics', institution: 'University of Delhi', year: 2021 },
    { degree: 'B.Sc. (Hons) Mathematical Statistics', institution: 'Hindu College', year: 2019 }
  ],
  previous_trainings: [
    { title: 'NSS Survey Field Methodology', institute: 'NSSTA Greater Noida', year: '2023' },
    { title: 'Index Numbers Theory & Price Collection', institute: 'Price Statistics Division', year: '2024' }
  ],
  learning_preferences: { formats: ['interactive_labs', 'microlearning'], weekly_hours: 6 },
  preferred_language: 'en',
  verified_by_manager: true
};

export const MOCK_COMPETENCY_RESULTS = [
  {
    competency_id: 1,
    competency_name: 'Price Statistics & CPI Compilation',
    domain_name: 'Methodological Statistics',
    assessed_level: 2.2,
    required_level: 3.5,
    gap: 1.3,
    status: 'In Progress',
    last_assessed: '2026-02-10T14:30:00Z',
    verified: true
  },
  {
    competency_id: 2,
    competency_name: 'Sampling Design & Multiplier Estimation',
    domain_name: 'Survey Operations',
    assessed_level: 3.0,
    required_level: 3.0,
    gap: 0.0,
    status: 'Benchmark Met',
    last_assessed: '2026-02-12T11:00:00Z',
    verified: true
  },
  {
    competency_id: 3,
    competency_name: 'Python for Statistical Computing & Validation',
    domain_name: 'Data Science & Technology',
    assessed_level: 1.5,
    required_level: 3.0,
    gap: 1.5,
    status: 'Critical Gap',
    last_assessed: '2026-02-14T09:15:00Z',
    verified: true
  },
  {
    competency_id: 4,
    competency_name: 'Data Quality Assurance Framework (DQAF)',
    domain_name: 'Statistical Governance',
    assessed_level: 2.8,
    required_level: 3.2,
    gap: 0.4,
    status: 'Near Benchmark',
    last_assessed: '2026-02-15T16:45:00Z',
    verified: true
  }
];

export const MOCK_LEARNER_DASHBOARD = {
  full_name: 'Priya Sharma',
  designation: 'Assistant Director (Statistics)',
  department_name: 'Price Statistics Division (PSD)',
  job_role_title: 'Statistical Survey Officer',
  assessed_competencies_count: 5,
  unassessed_competencies_count: 2,
  critical_gaps_count: 2,
  learning_path_progress_pct: 65,
  total_learning_hours: 24,
  next_recommended_action: 'Complete Module 3: Elementary Aggregate Index Formulas (Jevons vs Carli)',
  competency_radar_data: [
    { competency: 'Price Statistics & CPI', current: 2.2, required: 3.5, gap: 1.3 },
    { competency: 'Sampling Design (NSS)', current: 3.0, required: 3.0, gap: 0.0 },
    { competency: 'National Accounts (SNA)', current: 2.0, required: 2.5, gap: 0.5 },
    { competency: 'Data Quality (DQAF)', current: 2.8, required: 3.2, gap: 0.4 },
    { competency: 'Python for Statistics', current: 1.5, required: 3.0, gap: 1.5 },
  ],
};

export const MOCK_ASSESSMENTS = [
  {
    id: 1,
    title: 'Diagnostic Competency Assessment: Price Statistics & Field Verification',
    description: 'Comprehensive baseline evaluation covering consumer price collection, elementary indices, and data scrutiny under MoSPI standards.',
    difficulty: 'intermediate',
    time_limit_minutes: 20,
    passing_score_pct: 60,
    total_questions: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'NSSO Sampling Design & Household Survey Field Verification',
    description: 'Multi-stage stratified sampling, FSU selection protocols, and multiplier derivations in official survey operations.',
    difficulty: 'advanced',
    time_limit_minutes: 25,
    passing_score_pct: 70,
    total_questions: 8,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Python for Official Statistical Computing and DQAF Anomaly Scrutiny',
    description: 'Algorithmic outlier detection, robust Z-scores, and automated microdata validation pipelines.',
    difficulty: 'beginner',
    time_limit_minutes: 15,
    passing_score_pct: 50,
    total_questions: 5,
    created_at: new Date().toISOString(),
  }
];

export const MOCK_ASSESSMENT_DETAIL = {
  id: 1,
  title: 'Diagnostic Competency Assessment: Price Statistics & Field Verification',
  description: 'Comprehensive baseline evaluation covering consumer price collection, elementary indices, and data scrutiny under MoSPI standards.',
  job_role_id: 1,
  difficulty: 'intermediate',
  time_limit_minutes: 20,
  passing_score_pct: 60,
  created_at: new Date().toISOString(),
  questions: [
    {
      id: 101,
      question_text: 'In the Indian Consumer Price Index (CPI) methodology, which formula is predominantly adopted at the elementary aggregate level across urban markets?',
      options: [
        'Jevons Index (Geometric mean of price relatives)',
        'Carli Index (Arithmetic mean of price relatives)',
        'Dutot Index (Ratio of average prices)',
        'Harmonic mean index'
      ],
      points: 2,
      difficulty: 'intermediate'
    },
    {
      id: 102,
      question_text: 'When an item is permanently discontinued in a sample market, what is the recommended protocol under the Data Quality Assurance Framework (DQAF)?',
      options: [
        'Select a comparable popular replacement item and apply class-mean or overlap imputation',
        'Drop the item permanently and divide its weight across unrelated subgroups',
        'Carry forward the last recorded price indefinitely without adjustment',
        'Enter zero for all upcoming months until a new base year is declared'
      ],
      points: 2,
      difficulty: 'intermediate'
    },
    {
      id: 103,
      question_text: 'In NSSO multi-stage stratified survey rounds, what constitutes the First Stage Unit (FSU) in rural sectors?',
      options: [
        'Census village (or sub-unit where population exceeds threshold)',
        'Individual agricultural household',
        'Gram Panchayat office',
        'District statistical headquarters'
      ],
      points: 2,
      difficulty: 'intermediate'
    },
    {
      id: 104,
      question_text: 'What is the primary rationale for utilizing the Jevons formula over the Carli formula at the elementary aggregate level?',
      options: [
        'Jevons satisfies the time reversal property and avoids upward arithmetic drift',
        'Jevons requires fewer manual price observations',
        'Carli formula cannot handle positive values',
        'Jevons is identical to the Laspeyres index in all circumstances'
      ],
      points: 2,
      difficulty: 'intermediate'
    },
    {
      id: 105,
      question_text: 'Under the National Data Governance Framework, what mandatory measure is required before public dissemination of microdata?',
      options: [
        'Statistical Disclosure Control (SDC), top-coding, and record anonymization',
        'Direct identification linking with citizen registry numbers',
        'Manual inspection by every survey participant',
        'Exclusion of all geographic territory tags'
      ],
      points: 2,
      difficulty: 'intermediate'
    },
    {
      id: 106,
      question_text: 'In automated data validation pipelines using Python pandas, which metric is most resilient against extreme field reporting anomalies?',
      options: [
        'Interquartile Range (IQR) fence and Median Absolute Deviation (MAD)',
        'Unstandardized raw sample variance',
        'Simple arithmetic mean difference',
        'Maximum minus minimum span'
      ],
      points: 2,
      difficulty: 'intermediate'
    }
  ]
};

export const MOCK_SKILL_GAPS = {
  overall_score: 74,
  critical_gaps_count: 2,
  assessed_count: 5,
  total_count: 7,
  gaps: [
    {
      competency_id: 1,
      competency_name: 'Price Statistics & CPI Compilation',
      current_level: 2.2,
      required_level: 3.5,
      gap: 1.3,
      priority: 'High',
      priority_score: 85,
      recommended_action: 'Complete iGOT Course on CPI Index Formulas & NSSTA Workshop'
    },
    {
      competency_id: 2,
      competency_name: 'Python for Statistical Computing & Validation',
      current_level: 1.5,
      required_level: 3.0,
      gap: 1.5,
      priority: 'High',
      priority_score: 80,
      recommended_action: 'Complete Interactive Data Lab exercises on anomaly detection'
    },
    {
      competency_id: 3,
      competency_name: 'National Accounts (SNA 2008 & GVA Estimation)',
      current_level: 2.0,
      required_level: 2.5,
      gap: 0.5,
      priority: 'Medium',
      priority_score: 55,
      recommended_action: 'Review NSSTA Macroeconomic Accounting lecture notes'
    },
    {
      competency_id: 4,
      competency_name: 'Data Quality Assurance Framework (DQAF)',
      current_level: 2.8,
      required_level: 3.2,
      gap: 0.4,
      priority: 'Medium',
      priority_score: 45,
      recommended_action: 'Take Field Scrutiny refresher module'
    },
    {
      competency_id: 5,
      competency_name: 'Sampling Design & Multiplier Estimation (NSSO)',
      current_level: 3.0,
      required_level: 3.0,
      gap: 0.0,
      priority: 'Low',
      priority_score: 10,
      recommended_action: 'Benchmark met. Eligible for mentor designation.'
    }
  ]
};

export const MOCK_LEARNING_PATH = {
  id: 1,
  title: 'Official Price Statistics & Automated Data Verification Pathway',
  description: 'Curated curriculum aligned with Subordinate Statistical Service (SSS) requirements to bridge Price Statistics and Python computing gaps.',
  target_role: 'Statistical Survey Officer',
  progress_pct: 65,
  total_duration_hours: 42,
  modules: [
    {
      id: 1,
      title: 'Module 1: Principles of Consumer Price Collection & DQAF Scrutiny',
      competency_name: 'Data Quality Assurance Framework',
      duration_hours: 8,
      status: 'completed',
      progress_pct: 100,
      resource_url: 'https://igotkarmayogi.gov.in',
      resource_type: 'iGOT Course',
      order: 1
    },
    {
      id: 2,
      title: 'Module 2: Elementary Aggregate Indices — Jevons, Carli & Dutot Formulas',
      competency_name: 'Price Statistics & CPI Compilation',
      duration_hours: 12,
      status: 'completed',
      progress_pct: 100,
      resource_url: 'https://igotkarmayogi.gov.in',
      resource_type: 'iGOT Course',
      order: 2
    },
    {
      id: 3,
      title: 'Module 3: Advanced Quality Adjustment & Substitution Imputations',
      competency_name: 'Price Statistics & CPI Compilation',
      duration_hours: 10,
      status: 'in_progress',
      progress_pct: 60,
      resource_url: 'https://nssta.gov.in',
      resource_type: 'NSSTA Workshop',
      order: 3
    },
    {
      id: 4,
      title: 'Module 4: Python for Automated Survey Validation & Anomaly Detection',
      competency_name: 'Python for Statistical Computing',
      duration_hours: 12,
      status: 'not_started',
      progress_pct: 0,
      resource_url: '/virtual-lab',
      resource_type: 'Virtual Data Lab',
      order: 4
    }
  ]
};

export const MOCK_COURSES = [
  {
    id: 1,
    title: 'Consumer Price Index (CPI) Compilation & Modern Quality Adjustment',
    provider: 'iGOT Karmayogi',
    course_type: 'self_paced_interactive',
    duration_hours: 12,
    difficulty: 'intermediate',
    rating: 4.8,
    enrollments_count: 1420,
    skills_covered: ['Price Statistics', 'Jevons Formula', 'Imputation Protocols'],
    description: 'Comprehensive certified curriculum on retail price collection, elementary aggregation, and substitution management.'
  },
  {
    id: 2,
    title: 'Data Science & Python for Official Statistics Operations',
    provider: 'NSSTA',
    course_type: 'blended',
    duration_hours: 30,
    difficulty: 'beginner',
    rating: 4.9,
    enrollments_count: 850,
    skills_covered: ['Python', 'Pandas Vectorization', 'Outlier Detection', 'DQAF'],
    description: 'Hands-on practical computing designed specifically for Indian statistical officers handling large microdata sets.'
  },
  {
    id: 3,
    title: 'System of National Accounts (SNA 2008) and GVA Compilation',
    provider: 'MoSPI Academy',
    course_type: 'instructor_led',
    duration_hours: 18,
    difficulty: 'advanced',
    rating: 4.7,
    enrollments_count: 620,
    skills_covered: ['National Accounts', 'Supply-Use Tables', 'Financial Intermediation'],
    description: 'Foundations of macroeconomic aggregates, gross value added estimation, and institutional sector accounts.'
  },
  {
    id: 4,
    title: 'Survey Sampling Techniques & Multiplier Derivations',
    provider: 'iGOT Karmayogi',
    course_type: 'self_paced_interactive',
    duration_hours: 15,
    difficulty: 'intermediate',
    rating: 4.8,
    enrollments_count: 1100,
    skills_covered: ['Sampling Theory', 'Stratification', 'NSS Multipliers'],
    description: 'Practical training on probability sampling, PPSWR selection, and estimation of aggregates.'
  }
];

export const MOCK_NSSTA_PROGRAMMES = [
  {
    id: 1,
    title: 'Advanced Workshop on Price Index Number Compilation (TPAC-2026)',
    programme_code: 'NSSTA-PSD-2026-04',
    format: 'Residential Workshop',
    duration_days: 5,
    start_date: '2026-03-10',
    end_date: '2026-03-14',
    location: 'NSSTA Campus, Greater Noida',
    target_cadre: 'SSS & ISS Officers',
    total_seats: 35,
    enrolled_count: 28,
    syllabus_topics: [
      'Jevons and Dutot elementary aggregation formulas',
      'Quality adjustment for technology and fashion substitutions',
      'Electronic Price Collection App (EPCA) scrutiny workflows'
    ],
    status: 'Nomination Open'
  },
  {
    id: 2,
    title: 'Python for Statistical Data Processing & Anomaly Scrutiny',
    programme_code: 'NSSTA-ICT-2026-02',
    format: 'Blended (Lab + Online)',
    duration_days: 10,
    start_date: '2026-03-24',
    end_date: '2026-04-03',
    location: 'Computer Lab 2, NSSTA / Virtual',
    target_cadre: 'All Statistical Cadres',
    total_seats: 40,
    enrolled_count: 36,
    syllabus_topics: [
      'Pandas for tabular survey microdata handling',
      'Automated outlier tagging with IQR and modified Z-scores',
      'Statistical Disclosure Control (SDC) implementation'
    ],
    status: 'Nomination Open'
  },
  {
    id: 3,
    title: 'Macroeconomic Aggregates & System of National Accounts (SNA 2008)',
    programme_code: 'NSSTA-NAD-2026-01',
    format: 'Executive Seminar',
    duration_days: 3,
    start_date: '2026-04-14',
    end_date: '2026-04-16',
    location: 'Vigyan Bhawan, New Delhi',
    target_cadre: 'Deputy Directors & Joint Directors',
    total_seats: 50,
    enrolled_count: 42,
    syllabus_topics: [
      'Quarterly GDP compilation and deflator methodologies',
      'Financial intermediation services indirectly measured (FISIM)',
      'Supply and Use Tables (SUT) reconciliation'
    ],
    status: 'Confirmed'
  }
];

export const MOCK_ASSESSMENT_HISTORY = [
  {
    id: 1,
    attempt_id: 1,
    assessment_id: 1,
    title: 'Diagnostic Competency Assessment: Price Statistics & Field Verification',
    assessment_title: 'Diagnostic Competency Assessment: Price Statistics & Field Verification',
    score: 10,
    max_score: 12,
    percentage: 83.3,
    passed: true,
    status: 'Passed',
    started_at: '2026-02-18T10:15:00Z',
    completed_at: '2026-02-18T10:32:00Z',
    competency_breakdown: [
      { competency_name: 'Price Statistics & Index Numbers', percentage: 100, status: 'Mastered' },
      { competency_name: 'Field Verification & DQAF', percentage: 66.7, status: 'Competent' }
    ]
  },
  {
    id: 2,
    attempt_id: 2,
    assessment_id: 2,
    title: 'Baseline NSSO Sampling Design Assessment',
    assessment_title: 'Baseline NSSO Sampling Design Assessment',
    score: 14,
    max_score: 16,
    percentage: 87.5,
    passed: true,
    status: 'Passed',
    started_at: '2026-02-10T14:00:00Z',
    completed_at: '2026-02-10T14:22:00Z',
    competency_breakdown: [
      { competency_name: 'Sampling Theory & Frame Scrutiny', percentage: 90, status: 'Mastered' }
    ]
  }
];

export const MOCK_QUIZ_HISTORY = [
  {
    id: 101,
    quiz_title: 'Consumer Price Index Manual Quiz',
    title: 'Consumer Price Index Manual Quiz',
    score: 5,
    max_score: 6,
    percentage: 83.3,
    passed: true,
    status: 'Passed',
    completed_at: '2026-02-19T16:40:00Z'
  },
  {
    id: 102,
    quiz_title: 'National Accounts Principles Practice Quiz',
    title: 'National Accounts Principles Practice Quiz',
    score: 4,
    max_score: 5,
    percentage: 80.0,
    passed: true,
    status: 'Passed',
    completed_at: '2026-02-15T11:20:00Z'
  }
];

export const MOCK_DEPARTMENT_ANALYTICS = {
  department_id: 1,
  department_name: 'Price Statistics Division (PSD)',
  total_officials: 142,
  assessed_officials: 118,
  assessment_completion_rate: 83.1,
  average_proficiency_score: 2.85,
  critical_gaps_identified: 34,
  competency_averages: [
    { competency: 'Price Statistics & CPI Compilation', average_level: 2.4, target_level: 3.5, gap: 1.1 },
    { competency: 'Automated Python Validation', average_level: 1.8, target_level: 3.0, gap: 1.2 },
    { competency: 'Data Quality Framework (DQAF)', average_level: 3.1, target_level: 3.2, gap: 0.1 },
    { competency: 'Survey Scrutiny Protocols', average_level: 3.3, target_level: 3.0, gap: 0.0 }
  ],
  top_recommended_trainings: [
    { title: 'Advanced Workshop on Price Index Number Compilation (TPAC-2026)', recommended_officials: 48 },
    { title: 'Python for Statistical Computing & Outlier Scrutiny', recommended_officials: 62 }
  ]
};

export const MOCK_PREDICTIVE_WORKFORCE = {
  cadre_growth_forecast: [
    { year: '2026', current_strength: 2400, retirement_projected: 180, training_capacity: 450, certified_benchmark: 1850 },
    { year: '2027', current_strength: 2520, retirement_projected: 210, training_capacity: 600, certified_benchmark: 2100 },
    { year: '2028', current_strength: 2680, retirement_projected: 195, training_capacity: 750, certified_benchmark: 2450 },
  ],
  high_demand_skills: [
    { skill: 'Automated Microdata Anomaly Detection (Python/R)', urgency_level: 'Critical', readiness_pct: 38 },
    { skill: 'System of National Accounts 2008 & GVA Deflators', urgency_level: 'High', readiness_pct: 54 },
    { skill: 'Statistical Disclosure Control (SDC)', urgency_level: 'High', readiness_pct: 46 },
    { skill: 'Elementary Geometric Index Calculation (Jevons)', urgency_level: 'Moderate', readiness_pct: 72 }
  ]
};

export const MOCK_AUDIT_LOGS = [
  {
    id: 'aud_1',
    timestamp: '2026-02-22T14:32:00Z',
    user: 'Priya Sharma (learner@mospi.gov.in)',
    action: 'assessment_submitted',
    detail: 'Completed Diagnostic Competency Assessment: Price Statistics & Field Verification with score 83.3%'
  },
  {
    id: 'aud_2',
    timestamp: '2026-02-22T11:15:00Z',
    user: 'Vikram Patel (admin@statskill.gov.in)',
    action: 'role_updated',
    detail: 'Verified credentials and promoted Anita Desai to Manager role'
  },
  {
    id: 'aud_3',
    timestamp: '2026-02-21T09:40:00Z',
    user: 'Dr. Rajesh Kumar (trainer@nssta.gov.in)',
    action: 'programme_created',
    detail: 'Published NSSTA TPAC-2026 Workshop schedule for Price Index Numbers'
  }
];

export const MOCK_INTEGRATION_SETTINGS = [
  {
    service_name: 'iGOT Karmayogi API Gateway',
    enabled: true,
    config: {
      endpoint: 'https://api.igotkarmayogi.gov.in/v2/course-sync',
      auth_protocol: 'OAuth2 / National Government Exchange',
      last_synced: '2026-02-22T06:00:00Z',
      active_courses_tracked: 42
    }
  },
  {
    service_name: 'NSSTA Trainee Portal Sync',
    enabled: true,
    config: {
      endpoint: 'https://nssta.gov.in/api/v1/trainees',
      auth_protocol: 'mTLS Bearer',
      last_synced: '2026-02-22T06:00:00Z',
      verified_batches: 18
    }
  },
  {
    service_name: 'Government NIC Single Sign-On (Parichay)',
    enabled: true,
    config: {
      endpoint: 'https://parichay.nic.in/auth/saml',
      status: 'Active',
      two_factor_enforced: true
    }
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Diagnostic Assessment Evaluated',
    message: 'Your Diagnostic Competency Assessment results have been analyzed: 83.3% proficiency achieved.',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'iGOT Course Milestone Reached',
    message: 'Module 2: Elementary Aggregate Indices marked as complete.',
    is_read: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];
