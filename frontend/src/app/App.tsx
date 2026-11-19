import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { AppLayout } from '../layouts/AppLayout';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { OverviewPage } from '../pages/OverviewPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AssessmentPage } from '../pages/AssessmentPage';
import { SkillGapPage } from '../pages/SkillGapPage';
import { LearningPathPage } from '../pages/LearningPathPage';
import { CourseCataloguePage } from '../pages/CourseCataloguePage';
import { NSSTAPage } from '../pages/NSSTAPage';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import { QuizStudioPage } from '../pages/QuizStudioPage';
import { VirtualLabPage } from '../pages/VirtualLabPage';
import { MyLearningPage } from '../pages/MyLearningPage';
import { AssessmentHistoryPage } from '../pages/AssessmentHistoryPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminPage } from '../pages/AdminPage';

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Renders an <Outlet /> so nested routes render inside it.
 */
const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-gov-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/**
 * GuestRoute — redirects authenticated users away from login.
 */
const GuestRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public / guest-only route */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected routes inside AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/assessments" element={<AssessmentPage />} />
              <Route path="/skill-gaps" element={<SkillGapPage />} />
              <Route path="/learning-paths" element={<LearningPathPage />} />
              <Route path="/courses" element={<CourseCataloguePage />} />
              <Route path="/nssta" element={<NSSTAPage />} />
              <Route path="/assistant" element={<AIAssistantPage />} />
              <Route path="/quiz-studio" element={<QuizStudioPage />} />
              <Route path="/virtual-lab" element={<VirtualLabPage />} />
              <Route path="/my-learning" element={<MyLearningPage />} />
              <Route path="/assessment-history" element={<AssessmentHistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
