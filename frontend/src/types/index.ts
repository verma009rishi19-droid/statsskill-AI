export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'learner' | 'trainer' | 'manager' | 'admin' | 'analyst';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface JobRole {
  id: number;
  department_id: number;
  title: string;
  code: string;
  cadre: string;
  description?: string;
}

export interface OfficialProfile {
  id: number;
  user_id: number;
  designation: string;
  department_id?: number;
  job_role_id?: number;
  employee_code?: string;
  current_assignment?: string;
  cadre: string;
  state_posting: string;
  educational_qualifications: Array<{ degree: string; institution: string; year: number }>;
  work_experience_years: number;
  previous_trainings: Array<{ title: string; institute: string; year: number }>;
  learning_preferences: Record<string, any>;
  preferred_language: string;
  career_objectives?: string;
  verified_by_manager: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;
  job_role?: JobRole;
}

export interface CompetencyDomain {
  id: number;
  name: string;
  code: string;
  description?: string;
  display_order: number;
}

export interface Competency {
  id: number;
  domain_id: number;
  name: string;
  code: string;
  description?: string;
  scale_min: number;
  scale_max: number;
  proficiency_rubric: Record<string, string>;
}

export interface SkillGapItem {
  competency_id: number;
  competency_name: string;
  competency_code: string;
  domain_name: string;
  domain_code: string;
  required_proficiency: number;
  current_proficiency: number | null;
  is_assessed: boolean;
  status_label: 'Assessment needed' | 'Proficient' | 'Skill Gap';
  gap: number;
  importance: 'critical' | 'high' | 'medium' | 'desirable';
  priority: 'High' | 'Medium' | 'Low' | 'None';
  priority_score: number;
  last_assessed_at?: string;
  evidence_type?: string;
  supporting_evidence?: string;
  recommended_action: string;
}

export interface SkillGapAnalysis {
  user_id: number;
  job_role_title: string;
  department_name: string;
  total_required_competencies: number;
  assessed_count: number;
  unassessed_count: number;
  competencies_with_gaps: number;
  average_gap: number;
  critical_gaps_count: number;
  high_priority_gaps_count: number;
  gaps: SkillGapItem[];
}

export interface AssessmentQuestionPublic {
  id: number;
  competency_id: number;
  question_text: string;
  options: string[];
  difficulty: string;
  points: number;
}

export interface AssessmentDetail {
  id: number;
  title: string;
  description?: string;
  job_role_id?: number;
  domain_id?: number;
  difficulty: string;
  time_limit_minutes: number;
  passing_score_pct: number;
  is_active: boolean;
  total_questions: number;
  questions: AssessmentQuestionPublic[];
}

export interface AssessmentSummary {
  id: number;
  title: string;
  description?: string;
  job_role_id?: number;
  difficulty: string;
  time_limit_minutes: number;
  passing_score_pct: number;
  total_questions: number;
  created_at: string;
}

export interface QuestionReview {
  question_id: number;
  question_text: string;
  options: string[];
  selected_option_index: number | null;
  correct_option_index: number;
  is_correct: boolean;
  explanation: string;
  points_awarded: number;
  competency_name: string;
}

export interface CompetencyScoreBreakdown {
  competency_id: number;
  competency_name: string;
  score: number;
  max_score: number;
  percentage: number;
  assigned_proficiency: number;
  proficiency_label: string;
  status: string;
}

export interface AssessmentResult {
  attempt_id: number;
  assessment_id: number;
  assessment_title: string;
  user_id: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  status: string;
  started_at: string;
  completed_at: string;
  strengths: string[];
  areas_for_improvement: string[];
  competency_breakdown: CompetencyScoreBreakdown[];
  question_reviews: QuestionReview[];
}

export interface Course {
  id: number;
  title: string;
  provider: string;
  provider_course_id?: string;
  external_url: string;
  description: string;
  duration_hours: number;
  difficulty_level: string;
  language: string;
  format: string;
  thumbnail_url?: string;
  is_active: boolean;
  competencies_covered: Array<{
    competency_id: number;
    competency_name: string;
    target_proficiency: number;
    coverage_weight: number;
  }>;
}

export interface NSSTATrainingProgramme {
  id: number;
  title: string;
  source_organization: string;
  tpac_approval_status: string;
  tpac_reference_number?: string;
  competencies_covered: string[];
  target_job_roles: string[];
  eligibility_criteria?: string;
  prerequisites?: string;
  duration_days: number;
  delivery_format: string;
  schedule_dates: Array<{ batch: number; start: string; end: string; venue?: string }>;
  official_url?: string;
  source_reference: string;
  last_verified_date: string;
}

export interface RecommendationItem {
  id: string;
  resource_type: string;
  title: string;
  provider: string;
  external_url?: string;
  addressed_competency_name: string;
  addressed_competency_code: string;
  gap_magnitude: number;
  priority_level: string;
  why_recommended: string;
  learning_objectives: string[];
  prerequisites: string;
  estimated_duration: string;
  expected_outcome: string;
  format: string;
}

export interface PersonalizedRecommendations {
  user_id: number;
  job_role: string;
  total_recommendations: number;
  top_priority_gap?: string;
  recommendations: RecommendationItem[];
}

export interface LearningPathModule {
  id: number;
  title: string;
  description?: string;
  order_index: number;
  competency_id?: number;
  competency_name?: string;
  course_id?: number;
  course_title?: string;
  course_url?: string;
  course_provider?: string;
  nssta_programme_id?: number;
  nssta_title?: string;
  is_mandatory: boolean;
  estimated_hours: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_pct: number;
}

export interface LearningPath {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  total_modules: number;
  completed_modules: number;
  progress_pct: number;
  estimated_hours: number;
  created_at: string;
  modules: LearningPathModule[];
}

export interface DocumentUploadResponse {
  id: number;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  word_count: number;
  text_preview: string;
  summary?: string;
  created_at: string;
}

export interface QuestionDraft {
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  difficulty: string;
  competency_id?: number;
  competency_name?: string;
  source_reference?: string;
}

export interface QuizGenerateResponse {
  document_id: number;
  title: string;
  difficulty: string;
  generated_questions: QuestionDraft[];
  generation_source: string;
}

export interface QuizDetail {
  id: number;
  title: string;
  description?: string;
  difficulty: string;
  total_questions: number;
  competency_id?: number;
  competency_name?: string;
  created_at: string;
  questions: Array<{
    id: number;
    question_text: string;
    options: string[];
    difficulty: string;
    source_reference?: string;
  }>;
}

export interface QuizAttemptResult {
  attempt_id: number;
  quiz_id: number;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  completed_at: string;
  question_reviews: Array<{
    question_id: number;
    question_text: string;
    options: string[];
    selected_option_index: number;
    correct_option_index: number;
    is_correct: boolean;
    explanation: string;
    source_reference?: string;
  }>;
}

export interface LearnerDashboardMetrics {
  user_id: number;
  full_name: string;
  designation: string;
  department_name: string;
  job_role_title: string;
  assessed_competencies_count: number;
  unassessed_competencies_count: number;
  critical_gaps_count: number;
  active_learning_paths_count: number;
  learning_path_progress_pct: number;
  total_learning_hours: number;
  quizzes_attempted_count: number;
  average_quiz_score_pct: number;
  next_recommended_action: string;
  competency_radar_data: Array<{
    competency: string;
    fullName: string;
    current: number;
    required: number;
    domain: string;
  }>;
  recent_activity: Array<{
    id: number;
    type: string;
    title: string;
    score: string;
    date: string;
    status: string;
  }>;
}

export interface DepartmentAnalytics {
  department_id?: number;
  department_name: string;
  total_officials: number;
  assessed_officials_count: number;
  assessment_coverage_pct: number;
  top_skill_gaps: Array<{
    competency: string;
    domain: string;
    officials_affected: number;
    average_gap: number;
    priority: string;
  }>;
  competency_domain_averages: Array<{
    domain: string;
    current_avg: number;
    required_avg: number;
    gap: number;
  }>;
  training_participation_rate_pct: number;
  learning_path_completion_rate_pct: number;
}

export interface PredictiveWorkforceAnalytics {
  analysis_date: string;
  baseline_officials_analyzed: number;
  data_sufficiency_status: string;
  methodology_notes: string;
  emerging_competency_trends: Array<{
    competency_name: string;
    domain: string;
    current_demand_index: number;
    forecasted_growth_pct: number;
    criticality: string;
    driver: string;
  }>;
  departmental_training_priorities: Array<{
    rank: number;
    priority_area: string;
    recommended_cadre: string;
    target_officials: number;
    institutional_partner: string;
  }>;
  resource_gap_hotspots: Array<{
    competency: string;
    current_coverage: string;
    shortage_level: string;
    status: string;
  }>;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}


export interface CompetencyResult {
  id: number;
  user_id: number;
  competency_id: number;
  assessed_proficiency: number;
  confidence_score: number;
  evidence_type: string;
  supporting_notes?: string;
  last_assessed_at: string;
  competency?: Competency;
}
