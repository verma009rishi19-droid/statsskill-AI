// Fallback seed data for standalone preview & offline mobile deployments
export const MOCK_USERS: Record<string, any> = {
  learner: {
    id: 1,
    email: 'learner@mospi.gov.in',
    full_name: 'Priya Sharma',
    role: 'learner',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  trainer: {
    id: 2,
    email: 'trainer@nssta.gov.in',
    full_name: 'Dr. Rajesh Kumar',
    role: 'trainer',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  manager: {
    id: 3,
    email: 'manager@mospi.gov.in',
    full_name: 'Anita Desai',
    role: 'manager',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  admin: {
    id: 4,
    email: 'admin@statskill.gov.in',
    full_name: 'Vikram Patel',
    role: 'admin',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
};

export const MOCK_PROFILE = {
  id: 1,
  user_id: 1,
  designation: 'Assistant Director (Statistics)',
  department_name: 'Price Statistics Division (PSD)',
  job_role_title: 'Statistical Survey Officer',
  cadre: 'Subordinate Statistical Service (SSS)',
  state_posting: 'New Delhi (HQ)',
  work_experience_years: 4,
  educational_qualifications: [
    { degree: 'M.Sc. Statistics', institution: 'University of Delhi', year: 2021 },
    { degree: 'B.Sc. (Hons) Mathematical Statistics', institution: 'Hindu College', year: 2019 }
  ],
  previous_trainings: ['NSS Survey Field Methodology', 'Index Numbers Theory'],
  preferred_language: 'en',
  verified_by_manager: true
};

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

export const MOCK_COURSES = [
  {
    id: 1,
    title: 'Consumer Price Index (CPI) Compilation & Modern Quality Adjustment',
    provider: 'iGOT Karmayogi',
    course_type: 'self_paced_interactive',
    duration_hours: 12,
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
    rating: 4.7,
    enrollments_count: 620,
    skills_covered: ['National Accounts', 'Supply-Use Tables', 'Financial Intermediation'],
    description: 'Foundations of macroeconomic aggregates, gross value added estimation, and institutional sector accounts.'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Diagnostic Assessment Available',
    message: 'The annual Price Statistics Competency Benchmark assessment is now open for completion.',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'iGOT Karmayogi Course Synced',
    message: 'Your course progress for "Consumer Price Index Compilation" has been synced to your profile.',
    is_read: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];
