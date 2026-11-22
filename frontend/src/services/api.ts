import axios from 'axios';

// Detect whether running inside native mobile Capacitor shell (iOS or Android)
const isNativeMobile = typeof window !== 'undefined' && 
  (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:' || (window as any).Capacitor?.isNativePlatform?.());

// When running inside native Android / iOS or remote mobile client, support configurable API URL
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api/v1`;
  }
  if (isNativeMobile) {
    // Default to localhost or configured backend host for mobile device testing
    return 'http://10.0.2.2:8000/api/v1'; // 10.0.2.2 maps to host in Android emulator
  }
  return '/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('statskill_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if we're on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('statskill_token');
        localStorage.removeItem('statskill_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API Methods
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const profileApi = {
  getMyProfile: () => api.get('/profiles/me'),
  updateMyProfile: (data: any) => api.put('/profiles/me', data),
  getDepartments: () => api.get('/profiles/departments'),
  getJobRoles: () => api.get('/profiles/job-roles'),
};

export const competencyApi = {
  listDomains: () => api.get('/competencies/domains'),
  listCompetencies: (domainId?: number) => api.get('/competencies', { params: { domain_id: domainId } }),
  getCompetencyDetail: (id: number) => api.get(`/competencies/${id}`),
};

export const assessmentApi = {
  listAssessments: () => api.get('/assessments'),
  getAssessmentDetail: (id: number) => api.get(`/assessments/${id}`),
  submitAssessment: (data: any) => api.post('/assessments/submit', data),
  getMyAttempts: () => api.get('/assessments/attempts/my-history'),
};

export const skillGapApi = {
  getMyGaps: () => api.get('/skill-gaps/my-gaps'),
  getDepartmentGaps: (departmentId?: number) => api.get('/skill-gaps/department', { params: { department_id: departmentId } }),
};

export const recommendationApi = {
  getMyRecommendations: () => api.get('/recommendations/my-recommendations'),
};

export const courseApi = {
  listCourses: (params?: any) => api.get('/courses', { params }),
  getCourseDetail: (id: number) => api.get(`/courses/${id}`),
};

export const nsstaApi = {
  listProgrammes: (params?: any) => api.get('/nssta/programmes', { params }),
  getProgrammeDetail: (id: number) => api.get(`/nssta/programmes/${id}`),
};

export const igotApi = {
  getStatus: () => api.get('/igot/status'),
  triggerSync: () => api.post('/igot/sync'),
  getLogs: () => api.get('/igot/logs'),
};

export const learningPathApi = {
  getMyPath: () => api.get('/learning-paths/my-path'),
  updateProgress: (moduleId: number, data: any) => api.put(`/learning-paths/modules/${moduleId}/progress`, data),
};

export const quizStudioApi = {
  uploadDocument: (formData: FormData) => api.post('/quiz-studio/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  generateQuiz: (data: any) => api.post('/quiz-studio/generate', data),
  saveQuiz: (data: any) => api.post('/quiz-studio/save', data),
  listQuizzes: () => api.get('/quiz-studio/quizzes'),
  getQuizDetail: (id: number) => api.get(`/quiz-studio/quizzes/${id}`),
  submitQuizAttempt: (data: any) => api.post('/quiz-studio/submit', data),
  getMyHistory: () => api.get('/quiz-studio/attempts/my-history'),
};

export const assistantApi = {
  chat: (data: any) => api.post('/assistant/chat', data),
  getHistory: () => api.get('/assistant/history'),
};

export const virtualLabApi = {
  execute: (data: any) => api.post('/virtual-lab/execute', data),
};

export const analyticsApi = {
  getLearnerDashboard: () => api.get('/analytics/learner-dashboard'),
  getDepartmentAnalytics: (departmentId?: number) => api.get('/analytics/department', { params: { department_id: departmentId } }),
  getPredictiveWorkforce: () => api.get('/analytics/predictive-workforce'),
};

export const adminApi = {
  listUsers: (role?: string) => api.get('/admin/users', { params: { role } }),
  updateRole: (userId: number, role: string) => api.put(`/admin/users/${userId}/role`, null, { params: { new_role: role } }),
  getAuditLogs: (limit?: number) => api.get('/admin/audit-logs', { params: { limit } }),
  getIntegrationSettings: () => api.get('/admin/integration-settings'),
  updateIntegrationSetting: (serviceName: string, data: any) => api.put(`/admin/integration-settings/${serviceName}`, data),
};

export const notificationApi = {
  listNotifications: () => api.get('/notifications'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
};
