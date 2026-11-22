import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useMobileNav } from '../../features/nav/MobileNavContext';
import { notificationApi } from '../../services/api';
import { Notification } from '../../types';
import {
  Bell, Globe, LogOut, User, Shield, CheckCircle, ChevronDown,
  Activity, Sparkles, Menu, X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, loginAs, language, setLanguage } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileNav();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (user) {
      notificationApi.listNotifications().then(res => setNotifications(res.data)).catch(() => {});
    }
  }, [user]);

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
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trainer': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5">
        {/* Left: Mobile Menu Toggle + Branding Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger toggle (visible only on mobile/tablet < 1024px) */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition"
            aria-label="Toggle mobile menu"
            title="Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>

          {/* Logo & Brand title (Clicking functions as Home) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
            title="Return to StatSkill AI Home"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-gov-blue/20 ring-2 ring-white group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-navy-900 rounded-full p-0.5 shadow-xs">
                <Sparkles className="w-2.5 h-2.5 fill-current" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-extrabold text-navy-900 tracking-tight group-hover:text-gov-blue transition-colors">
                  StatSkill AI
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  MoSPI / NSSTA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none mt-0.5 hidden xs:block">
                Official Statistical Intelligence Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Quick Role Switcher, Language, Notifications, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Quick Demo Role Switcher (Compact on mobile) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 text-xs px-2 sm:px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition"
              title="Switch demo persona"
            >
              <Shield className="w-3.5 h-3.5 text-gov-blue shrink-0" />
              <span className="capitalize hidden sm:inline">{user?.role || 'Role'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Persona
                </div>
                {(['learner', 'trainer', 'manager', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      loginAs(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition capitalize ${
                      user?.role === r ? 'font-bold text-gov-blue bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    {user?.role === r && <CheckCircle className="w-3.5 h-3.5 text-gov-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bilingual Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 text-xs px-2 sm:px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition"
            title="Toggle Language: English / Hindi"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {language === 'en' ? 'हिन्दी' : 'EN'}
            </span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs && unreadCount > 0) markAllRead();
              }}
              className="relative p-1.5 sm:p-2 rounded-md hover:bg-slate-100 text-slate-600 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-navy-900">Notifications</span>
                  <span className="text-[11px] text-slate-500">{notifications.length} total</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-slate-50 transition ${
                          !n.is_read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="font-semibold text-slate-900 mb-0.5">{n.title}</div>
                        <p className="text-slate-600 line-clamp-2">{n.message}</p>
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
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 pl-1.5 sm:pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 border border-slate-200 transition"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gov-blue/10 text-gov-blue flex items-center justify-center font-bold text-xs">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-700 max-w-[80px] sm:max-w-[100px] truncate hidden md:inline">
                {user?.full_name || 'Official User'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 mr-0.5" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-navy-900 truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Official Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
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
