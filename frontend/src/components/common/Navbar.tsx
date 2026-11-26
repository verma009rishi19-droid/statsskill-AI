import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useTheme } from '../../features/theme/ThemeContext';
import { useMobileNav } from '../../features/nav/MobileNavContext';
import { notificationApi } from '../../services/api';
import { Notification } from '../../types';
import {
  Bell, Globe, LogOut, User, Shield, CheckCircle, ChevronDown,
  Activity, Sparkles, Menu, X, Sun, Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, loginAs, language, setLanguage } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileNav();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      notificationApi.listNotifications().then(res => setNotifications(res.data)).catch(() => {});
    }
  }, [user]);

  // Close open menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    for (const n of notifications) {
      if (!n.is_read) {
        await notificationApi.markRead(n.id);
      }
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30';
      case 'manager': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
      case 'trainer': return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30';
      case 'analyst': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'System Admin';
      case 'manager': return 'Division Head';
      case 'trainer': return 'NSSTA Faculty';
      case 'analyst': return 'Policy Analyst';
      default: return 'Statistical Officer';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between px-3 sm:px-6 h-14">
        {/* Left: Mobile Menu Toggle + Branding + Role Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
            aria-label="Toggle mobile menu"
            title="Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95 shrink-0"
            title="Return to StatSkill AI Home"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-white dark:ring-slate-800 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-0.5 shadow-xs">
                <Sparkles className="w-2.5 h-2.5 fill-current" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                StatSkill AI
              </span>
              <span className={`hidden md:inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${getRoleBadgeColor(user?.role)}`}>
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Persona Switcher, Language, Theme Toggle, Notifications, Profile & Sign Out */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Demo Role Switcher */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-200 transition"
              title="Switch demo persona"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="capitalize hidden sm:inline">{user?.role || 'Role'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Switch Persona
                </div>
                {(['learner', 'trainer', 'manager', 'admin', 'analyst'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      loginAs(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition capitalize ${
                      user?.role === r
                        ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{r}</span>
                    {user?.role === r && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bilingual Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition"
            title="Toggle Language: English / Hindi"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {language === 'en' ? 'हिन्दी' : 'EN'}
            </span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-amber-400 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs && unreadCount > 0) markAllRead();
              }}
              className="relative p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{notifications.length} total</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/70 transition ${
                          !n.is_read ? 'bg-indigo-50/40 dark:bg-indigo-500/10' : ''
                        }`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">{n.title}</div>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[110px] truncate hidden md:inline">
                {user?.full_name || 'Official User'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Competency Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
