import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Award, Target, Compass, Bot, FileQuestion, BookOpen
} from 'lucide-react';

interface BottomTab {
  name: string;
  path: string;
  icon: React.ElementType;
}

const BOTTOM_TABS: BottomTab[] = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Assess', path: '/assessments', icon: Award },
  { name: 'Skill Gap', path: '/skill-gaps', icon: Target },
  { name: 'AI Tutor', path: '/assistant', icon: Bot },
  { name: 'Quizzes', path: '/quiz-studio', icon: FileQuestion },
  { name: 'Catalog', path: '/courses', icon: BookOpen },
];

export const MobileBottomNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition active:scale-95 ${
                  isActive
                    ? 'text-gov-blue font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                      isActive ? 'bg-blue-50 text-gov-blue ring-1 ring-blue-200' : 'text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="mt-0.5 truncate max-w-[50px]">{tab.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
