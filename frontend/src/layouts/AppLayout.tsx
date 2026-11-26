import React from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { MobileBottomNav } from '../components/common/MobileBottomNav';
import { MobileNavProvider } from '../features/nav/MobileNavContext';
import {
  Home, LayoutDashboard, Bot, Target, Compass, Award, BookOpen, Terminal
} from 'lucide-react';

const QUICK_TABS = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'AI Assistant', path: '/assistant', icon: Bot },
  { label: 'Skill Gap Radar', path: '/skill-gaps', icon: Target },
  { label: 'Learning Path', path: '/learning-paths', icon: Compass },
  { label: 'Courses', path: '/courses', icon: BookOpen },
  { label: 'Assessments', path: '/assessments', icon: Award },
  { label: 'Virtual Lab', path: '/virtual-lab', icon: Terminal },
];

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbTitle = (path: string) => {
    switch (path) {
      case '/': return 'Overview';
      case '/profile': return 'Competency Profile';
      case '/assessments': return 'Diagnostic Assessments';
      case '/skill-gaps': return 'Skill Gap Analysis';
      case '/learning-paths': return 'Personalized Learning Paths';
      case '/courses': return 'Course Catalogue';
      case '/nssta': return 'NSSTA Training Programmes';
      case '/assistant': return 'AI Learning Assistant';
      case '/quiz-studio': return 'AI Quiz Studio';
      case '/virtual-lab': return 'Virtual Learning Labs';
      case '/my-learning': return 'My Learning';
      case '/assessment-history': return 'Assessment History';
      case '/analytics': return 'Analytics and Reports';
      case '/settings': return 'Profile and Settings';
      case '/admin': return 'Platform Administration';
      default: return path.replace('/', '').replace(/-/g, ' ');
    }
  };

  const title = getBreadcrumbTitle(location.pathname);

  return (
    <MobileNavProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 lg:pb-0 transition-colors">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            {/* Clean Breadcrumb + Quick-Jump Sub-Nav Strip */}
            <div className="bg-white/80 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>/</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold capitalize truncate">
                  {title}
                </span>
              </div>

              {/* Quick-Access Pill Tabs (scrollable without visible scrollbar or clipping) */}
              <nav
                aria-label="Quick navigation"
                className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5"
              >
                {QUICK_TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <NavLink
                      key={t.path}
                      to={t.path}
                      end={t.path === '/'}
                      className={({ isActive }) =>
                        `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition shrink-0 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Page Content Body */}
            <div className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1440px] w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </MobileNavProvider>
  );
};
