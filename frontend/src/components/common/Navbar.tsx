import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { notificationApi } from '../../services/api';
import { Notification } from '../../types';
import {
  Bell, Globe, LogOut, User, Shield, CheckCircle, AlertCircle, ChevronDown, RefreshCw
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, loginAs, language, setLanguage } = useAuth();
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
      <div className="flex items-center justify-between px-6 py-2.5">
        {/* Left: Branding & Sub-title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gov-blue flex items-center justify-center text-white font-bold shadow-sm">
            <span className="text-lg">Σ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-navy-900 tracking-tight">StatSkill AI</span>
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                MoSPI / NSSTA
              </span>
            </div>
            <p className="text-xs text-slate-700">Official Statistical System Skill Intelligence Platform</p>
          </div>
        </div>

        {/* Right: Quick Role Switcher, Language, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition"
              title="Switch demo persona"
            >
              <Shield className="w-3.5 h-3.5 text-gov-blue" />
              <span>Role: <strong className="capitalize">{user?.role || 'Learner'}</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 text-xs">
                <div className="px-3 py-1 font-semibold text-slate-700 border-b border-slate-100">
                  Switch Active Role Persona
                </div>
                <button
                  onClick={() => { loginAs('learner'); setShowRoleMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-800">Learner / Official</div>
                    <div className="text-[11px] text-slate-700">Ramesh Kumar (SSO - Price Stat)</div>
                  </div>
                  {user?.role === 'learner' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </button>
                <button
                  onClick={() => { loginAs('trainer'); setShowRoleMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-800">Trainer Faculty</div>
                    <div className="text-[11px] text-slate-700">Dr. Sunita Rao (NSSTA Faculty)</div>
                  </div>
                  {user?.role === 'trainer' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                </button>
                <button
                  onClick={() => { loginAs('manager'); setShowRoleMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-800">Department Manager</div>
                    <div className="text-[11px] text-slate-700">Vikramaditya Sharma (ADG)</div>
                  </div>
                  {user?.role === 'manager' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={() => { loginAs('admin'); setShowRoleMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-800">Platform Admin</div>
                    <div className="text-[11px] text-slate-700">System Administrator</div>
                  </div>
                  {user?.role === 'admin' && <CheckCircle className="w-4 h-4 text-purple-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs rounded font-medium transition ${language === 'en' ? 'bg-white text-gov-blue shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs rounded font-medium transition ${language === 'hi' ? 'bg-white text-gov-blue shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              हिन्दी
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">System Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-gov-blue hover:underline text-[11px]">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-700">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 ${n.is_read ? 'bg-white' : 'bg-blue-50/50'}`}>
                        <div className="font-semibold text-slate-900">{n.title}</div>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-700 mt-1 block">
                          {new Date(n.created_at).toLocaleDateString()}
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
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs border border-slate-300">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.full_name || 'Official'}</div>
                <div className="text-[10px] text-slate-700 capitalize">{user?.role || 'Learner'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900">{user?.full_name}</div>
                  <div className="text-[11px] text-slate-700 truncate">{user?.email}</div>
                  <div className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role?.toUpperCase()}
                  </div>
                </div>
                <a
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Competency Profile</span>
                </a>
                <button
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
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
