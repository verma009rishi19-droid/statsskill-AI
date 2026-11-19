import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { adminApi, igotApi } from '../services/api';
import {
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Users,
  Settings,
  FileText,
  ChevronDown,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Shield,
  Plug,
  Clock,
  Zap,
  Activity,
  Search,
  ArrowUpDown,
} from 'lucide-react';

type TabId = 'users' | 'integrations' | 'audit';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}

interface IntegrationSetting {
  service_name: string;
  enabled: boolean;
  config: Record<string, any>;
}

interface IGOTStatus {
  connected: boolean;
  last_sync: string | null;
  sync_in_progress: boolean;
  records_synced: number;
}

interface SyncLog {
  id: string;
  timestamp: string;
  status: string;
  records: number;
  message: string;
}

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('users');

  const isAuthorized =
    user?.role === 'admin' || user?.role === 'manager';

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400" />
          <h2 className="text-lg font-bold text-navy-900">Access Denied</h2>
          <p className="text-sm text-slate-500 max-w-sm">
            You do not have permission to access the administration panel. This
            page is restricted to administrators and managers.
          </p>
          <Link
            to="/dashboard"
            className="mt-2 text-sm font-semibold text-gov-blue hover:underline"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    {
      id: 'integrations',
      label: 'Integration Settings',
      icon: <Plug className="w-4 h-4" />,
    },
    { id: 'audit', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gov-blue" />
            Platform Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage users, integrations, and audit logs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-gov-blue text-gov-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UserManagementTab />}
      {activeTab === 'integrations' && <IntegrationSettingsTab />}
      {activeTab === 'audit' && <AuditLogsTab />}
    </div>
  );
};

/* ─── Tab 1: User Management ─── */
const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.listUsers(roleFilter || undefined);
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setChangingRole(userId);
      await adminApi.updateRole(Number(userId), newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setNotification({
        type: 'success',
        message: 'User role updated successfully.',
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update role.',
      });
    } finally {
      setChangingRole(null);
    }
  };

  const roleOptions = ['learner', 'manager', 'admin', 'instructor'];

  const statusBadge = (status: string) => {
    const isActive =
      status?.toLowerCase() === 'active';
    return (
      <span
        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
          isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-50 text-slate-500 border-slate-200'
        }`}
      >
        {status || 'Unknown'}
      </span>
    );
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-50 text-purple-700 border-purple-200',
      manager: 'bg-blue-50 text-blue-700 border-blue-200',
      instructor: 'bg-teal-50 text-teal-700 border-teal-200',
      learner: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
      <span
        className={`text-[10px] px-2 py-0.5 rounded font-semibold border capitalize ${
          colors[role] || colors.learner
        }`}
      >
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 text-gov-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchUsers}
          className="text-sm text-gov-blue hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notification && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {notification.message}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600">
          Filter by Role:
        </label>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue"
        >
          <option value="">All Roles</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          {users.length} user{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Change Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3">{statusBadge(u.status)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value)
                        }
                        disabled={changingRole === u.id}
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-gov-blue/20 disabled:opacity-50"
                      >
                        {roleOptions.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Tab 2: Integration Settings ─── */
const IntegrationSettingsTab: React.FC = () => {
  const [igotStatus, setIgotStatus] = useState<IGOTStatus | null>(null);
  const [settings, setSettings] = useState<IntegrationSetting[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchIntegrationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [status, integrations, logs] = await Promise.all([
        igotApi.getStatus(),
        adminApi.getIntegrationSettings(),
        igotApi.getLogs(),
      ]);
      setIgotStatus(status.data);
      setSettings(integrations.data);
      setSyncLogs(logs.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load integration data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await igotApi.triggerSync();
      setNotification({
        type: 'success',
        message: 'iGOT sync triggered successfully.',
      });
      // Refresh status
      const [status, logs] = await Promise.all([
        igotApi.getStatus(),
        igotApi.getLogs(),
      ]);
      setIgotStatus(status.data);
      setSyncLogs(logs.data);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to trigger sync.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleSetting = async (serviceName: string, enabled: boolean) => {
    try {
      await adminApi.updateIntegrationSetting(serviceName, { enabled: !enabled });
      setSettings((prev) =>
        prev.map((s) =>
          s.service_name === serviceName ? { ...s, enabled: !enabled } : s
        )
      );
      setNotification({
        type: 'success',
        message: `${serviceName} ${!enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update setting.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 text-gov-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchIntegrationData}
          className="text-sm text-gov-blue hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {notification.message}
        </div>
      )}

      {/* iGOT Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            iGOT Karmayogi Integration
          </h3>
        </div>

        {igotStatus && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    igotStatus.connected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  {igotStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Last Sync</p>
                <p className="text-sm font-medium text-slate-800">
                  {igotStatus.last_sync
                    ? new Date(igotStatus.last_sync).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Records Synced</p>
                <p className="text-sm font-medium text-slate-800">
                  {igotStatus.records_synced?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Sync Status</p>
                {igotStatus.sync_in_progress ? (
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                    In Progress
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-slate-50 text-slate-500 border-slate-200">
                    Idle
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing || igotStatus.sync_in_progress}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gov-blue text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              {syncing ? 'Syncing…' : 'Trigger Sync'}
            </button>
          </div>
        )}
      </div>

      {/* Integration Settings List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gov-blue" />
            Integration Services
          </h3>
        </div>

        {settings.length === 0 ? (
          <div className="text-center py-8">
            <Plug className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">
              No integration settings configured.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {settings.map((setting) => (
              <div
                key={setting.service_name}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {setting.service_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {setting.enabled ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleToggleSetting(setting.service_name, setting.enabled)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    setting.enabled ? 'bg-gov-blue' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Logs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gov-blue" />
            Sync Logs
          </h3>
        </div>

        {syncLogs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No sync logs available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : log.status === 'error'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">
                      {log.records}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Tab 3: Audit Logs ─── */
const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAuditLogs(limit);
      // Sort by most recent first
      const sorted = [...(res.data || [])].sort(
        (a: AuditLog, b: AuditLog) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setLogs(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 text-gov-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchLogs}
          className="text-sm text-gov-blue hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600">
          Show:
        </label>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue"
        >
          <option value={25}>25 entries</option>
          <option value={50}>50 entries</option>
          <option value={100}>100 entries</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          {logs.length} log{logs.length !== 1 ? 's' : ''} displayed
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {log.user}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-md truncate">
                      {log.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
