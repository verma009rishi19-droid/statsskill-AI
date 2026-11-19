import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { ChevronRight, Home } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbTitle = (path: string) => {
    switch (path) {
      case '/': return 'Overview';
      case '/profile': return 'My Competency Profile';
      case '/assessments': return 'Competency Assessment';
      case '/skill-gaps': return 'Skill Gap Analysis';
      case '/learning-paths': return 'Personalized Learning Paths';
      case '/courses': return 'Course Catalogue';
      case '/nssta': return 'NSSTA Training Programmes';
      case '/assistant': return 'AI Learning Assistant';
      case '/quiz-studio': return 'AI Quiz Studio';
      case '/virtual-lab': return 'Interactive Learning Labs';
      case '/my-learning': return 'My Learning';
      case '/assessment-history': return 'Assessment History';
      case '/analytics': return 'Analytics and Reports';
      case '/settings': return 'Profile and Settings';
      case '/admin': return 'Platform Administration';
      default: return path.replace('/', '').replace('-', ' ').toUpperCase();
    }
  };

  const title = getBreadcrumbTitle(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Breadcrumb Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>/</span>
              <span className="text-slate-800 font-medium">{title}</span>
            </div>
            <div className="text-[11px] text-slate-700 hidden sm:block">
              India's Official Statistical System • MoSPI Capacity Building
            </div>
          </div>

          {/* Page Content Body */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
