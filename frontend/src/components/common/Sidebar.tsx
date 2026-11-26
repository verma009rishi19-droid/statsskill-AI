import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useMobileNav } from '../../features/nav/MobileNavContext';
import {
  LayoutDashboard, UserCheck, Award, Target, Compass, BookOpen,
  GraduationCap, Bot, FileQuestion, Terminal, BookmarkCheck, History,
  BarChart3, Settings, ShieldCheck, X, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  roles?: string[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isMobileMenuOpen, closeMobileMenu } = useMobileNav();
  const [collapsed, setCollapsed] = useState(true);

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'CORE INTELLIGENCE',
      items: [
        { name: 'Overview', path: '/', icon: LayoutDashboard },
        { name: 'Competency Profile', path: '/profile', icon: UserCheck },
        { name: 'Diagnostic Assessments', path: '/assessments', icon: Award, badge: 'Diagnostic' },
        { name: 'Skill Gap Analysis', path: '/skill-gaps', icon: Target, badge: 'Actionable' },
      ],
    },
    {
      title: 'LEARNING & CATALOGUES',
      items: [
        { name: 'Learning Paths', path: '/learning-paths', icon: Compass },
        { name: 'Course Catalogue', path: '/courses', icon: BookOpen },
        { name: 'NSSTA Programmes', path: '/nssta', icon: GraduationCap, badge: 'TPAC' },
        { name: 'My Learning', path: '/my-learning', icon: BookmarkCheck },
        { name: 'Assessment History', path: '/assessment-history', icon: History },
      ],
    },
    {
      title: 'AI & PRACTICAL LABS',
      items: [
        { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'Grounded' },
        { name: 'AI Quiz Studio', path: '/quiz-studio', icon: FileQuestion },
        { name: 'Virtual Learning Labs', path: '/virtual-lab', icon: Terminal, badge: 'Sandbox' },
      ],
    },
    {
      title: 'ANALYTICS & GOVERNANCE',
      items: [
        { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
        { name: 'Profile & Settings', path: '/settings', icon: Settings },
        { name: 'Administration', path: '/admin', icon: ShieldCheck, roles: ['admin'], badge: 'Admin' },
      ],
    },
  ];

  const renderSidebarContent = (isMobileDrawer = false) => {
    const isCompact = collapsed && !isMobileDrawer;

    return (
      <div className="flex flex-col h-full">
        {/* Mobile drawer header */}
        {isMobileDrawer ? (
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Platform Navigation
            </span>
            <button
              onClick={closeMobileMenu}
              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Desktop collapse/expand toggle bar */
          <div className={`px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center ${isCompact ? 'justify-center' : 'justify-between'}`}>
            {!isCompact && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">
                Navigation
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isCompact ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCompact ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCompact ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        )}

        <div className="flex-1 py-3 px-2.5 space-y-5 overflow-y-auto">
          {sections.map((sec, sIdx) => {
            const visibleItems = sec.items.filter(item => !item.roles || (user?.role && item.roles.includes(user.role)));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                {!isCompact && (
                  <div className="px-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    {sec.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={closeMobileMenu}
                        title={isCompact ? item.name : undefined}
                        className={({ isActive }) =>
                          `flex items-center ${isCompact ? 'justify-center px-2 py-2.5' : 'justify-between px-2.5 py-2'} rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/70 dark:border-indigo-500/30 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-transparent'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                                }`}
                              />
                              {!isCompact && <span className="truncate">{item.name}</span>}
                            </div>
                            {!isCompact && item.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer System Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-[11px] text-slate-600 dark:text-slate-400">
          {isCompact ? (
            <div className="flex justify-center" title="StatSkill AI Engine: Online">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-700 dark:text-slate-300">StatSkill Engine</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                MoSPI · NSSTA Capacity Portal
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex ${
          collapsed ? 'w-[68px]' : 'w-64'
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 min-h-[calc(100vh-56px)] transition-all duration-200`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
