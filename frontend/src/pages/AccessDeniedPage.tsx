import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export const AccessDeniedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
            <Lock className="w-3.5 h-3.5" />
            <span>403 Access Forbidden</span>
          </div>
          <h1 className="text-xl font-bold text-navy-900">
            Restricted System Area
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your current assigned role ({user?.role ? user.role.toUpperCase() : 'ANONYMOUS'}) does not possess administrative or executive authorization to access this resource.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-left text-xs space-y-1 text-slate-600">
          <div className="flex justify-between font-medium">
            <span>Official Identity:</span>
            <span className="text-navy-900">{user?.full_name || 'Statistical Officer'}</span>
          </div>
          <div className="flex justify-between">
            <span>Assigned Role:</span>
            <span className="font-semibold text-gov-blue capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Governance Policy:</span>
            <span>MoSPI RBAC Standard 2026</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full py-2.5 px-4 rounded-xl bg-gov-blue text-white text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
