import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useMobileNav } from '../../features/nav/MobileNavContext';
import {
  LayoutDashboard, UserCheck, Award, Target, Compass, BookOpen,
  GraduationCap, Bot, FileQuestion, Terminal, BookmarkCheck, History,
  BarChart3, Settings, ShieldCheck, X
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isMobileMenuOpen, closeMobileMenu } = useMobileNav();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'CORE INTELLIGENCE',
      items: [
        { name: '1. Overview', path: '/', icon: LayoutDashboard },
        { name: '2. My Competency Profile', path: '/profile', icon: UserCheck },
        { name: '3. Competency Assessment', path: '/assessments', icon: Award, badge: 'Diagnostic' },
        { name: '4. Skill Gap Analysis', path: '/skill-gaps', icon: Target, badge: 'Actionable' },
      ],
    },
    {
      title: 'LEARNING & CATALOGUES',
      items: [
        { name: '5. Personalized Learning Paths', path: '/learning-paths', icon: Compass },
        { name: '6. Course Catalogue', path: '/courses', icon: BookOpen },
        { name: '7. NSSTA Programmes', path: '/nssta', icon: GraduationCap, badge: 'TPAC' },
        { name: '11. My Learning', path: '/my-learning', icon: BookmarkCheck },
        { name: '12. Assessment History', path: '/assessment-history', icon: History },
      ],
    },
    {
      title: 'AI & PRACTICAL LABS',
      items: [
        { name: '8. AI Learning Assistant', path: '/assistant', icon: Bot, badge: 'Grounded' },
        { name: '9. AI Quiz Studio', path: '/quiz-studio', icon: FileQuestion },
        { name: '10. Interactive Learning Labs', path: '/virtual-lab', icon: Terminal, badge: 'Sandbox' },
      ],
    },
    {
      title: 'ANALYTICS & GOVERNANCE',
      items: [
        { name: '13. Analytics & Reports', path: '/analytics', icon: BarChart3 },
        { name: '14. Profile & Settings', path: '/settings', icon: Settings },
        { name: '15. Administration', path: '/admin', icon: ShieldCheck, adminOnly: true, badge: 'Admin' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Mobile drawer header with Close Button */}
      <div className="lg:hidden p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
          Platform Navigation
        </span>
        <button
          onClick={closeMobileMenu}
          className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 py-3 px-3 space-y-5 overflow-y-auto">
        {sections.map((sec, sIdx) => {
          const visibleItems = sec.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                          isActive
                            ? 'bg-blue-50 text-gov-blue font-semibold border-l-4 border-gov-blue pl-2'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-blue-100 text-gov-blue border border-blue-200 shrink-0">
                          {item.badge}
                        </span>
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
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-[11px] text-slate-600">
        <div className="flex items-center justify-between font-medium">
          <span>StatSkill AI Engine</span>
          <span className="text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Online
          </span>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          MoSPI Official Statistical Intelligence
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Standard Sticky Sidebar (Visible >= 1024px) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-[calc(100vh-57px)]">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Responsive Slide-Over Drawer with Backdrop (Visible < 1024px when open) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
