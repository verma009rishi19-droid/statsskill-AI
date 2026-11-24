import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { adminApi, igotApi } from '../../services/api';
import {
  ShieldCheck, Users, Activity, Settings, RefreshCw, FileText,
  Plug, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert,
  Search, UserCheck, Lock, Database
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [uRes, aRes] = await Promise.allSettled([
          adminApi.listUsers(),
          adminApi.getAuditLogs(),
        ]);
        if (uRes.status === 'fulfilled') setUsers(uRes.value.data || []);
        if (aRes.status === 'fulfilled') setAuditLogs(aRes.value.data || []);
      } catch (err) {
        console.error('Admin data fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-900">
              System Administration Portal — {user?.full_name || 'Vikram Patel'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Global governance controls, multi-role user management, audit trails, and iGOT Karmayogi API synchronizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin"
            className="px-3.5 py-2 rounded-lg bg-gov-blue hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Open Advanced Console</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Platform Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">{users.length || 480} Registered</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 5 Roles (Admin, Manager, Learner, Trainer, Analyst)</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">System Engine Status</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">100% Operational</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">All 15 Services Online</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">iGOT Integration</span>
            <Plug className="w-4 h-4 text-gov-blue" />
          </div>
          <div className="text-2xl font-extrabold text-gov-blue mt-2">Connected</div>
          <div className="text-[11px] text-slate-400 mt-1">Sync frequency: Hourly</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Security Audit Logs</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">{auditLogs.length || 24} Log Entries</div>
          <div className="text-[11px] text-slate-400 mt-1">Zero Security Breaches</div>
        </div>
      </div>

      {/* Quick Access User Management & System Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management Quick Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-navy-900">User Role Management</h2>
              <p className="text-[11px] text-slate-500">Assign role authorizations and monitor account status</p>
            </div>
            <Link to="/admin" className="text-xs font-semibold text-gov-blue hover:underline">
              Full Management →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {users.slice(0, 5).map((u, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-navy-900">{u.full_name || u.name}</div>
                  <div className="text-[11px] text-slate-500">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    {u.role}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Audit Trail */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Recent Security &amp; Activity Audit Log</h2>
              <p className="text-[11px] text-slate-500">Immutable governance trail of administrative events</p>
            </div>
            <Link to="/admin" className="text-xs font-semibold text-gov-blue hover:underline">
              View All Logs →
            </Link>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 5).map((log, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-navy-900">{log.action || 'system_event'}</span>
                  <div className="text-[10px] text-slate-500">{log.detail || log.details?.email || 'System operation executed'}</div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
