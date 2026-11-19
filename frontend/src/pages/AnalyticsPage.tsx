import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { analyticsApi, profileApi } from '../services/api';
import { DepartmentAnalytics, PredictiveWorkforceAnalytics, Department } from '../types';
import {
  BarChart3, RefreshCw, AlertCircle, Users, CheckCircle2,
  TrendingUp, BookOpen, Target, AlertTriangle, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

type ActiveSection = 'department' | 'predictive';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [section, setSection] = useState<ActiveSection>('department');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | undefined>(undefined);
  const [deptAnalytics, setDeptAnalytics] = useState<DepartmentAnalytics | null>(null);
  const [predictive, setPredictive] = useState<PredictiveWorkforceAnalytics | null>(null);
  const [loadingDept, setLoadingDept] = useState(true);
  const [loadingPred, setLoadingPred] = useState(false);
  const [error, setError] = useState('');

  // Fetch departments
  useEffect(() => {
    profileApi.getDepartments().then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  // Fetch department analytics
  useEffect(() => {
    const fetchDept = async () => {
      setLoadingDept(true);
      setError('');
      try {
        const res = await analyticsApi.getDepartmentAnalytics(selectedDept);
        setDeptAnalytics(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load department analytics');
      } finally {
        setLoadingDept(false);
      }
    };
    fetchDept();
  }, [selectedDept]);

  const fetchPredictive = async () => {
    setLoadingPred(true);
    try {
      const res = await analyticsApi.getPredictiveWorkforce();
      setPredictive(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load predictive analytics');
    } finally {
      setLoadingPred(false);
    }
  };

  useEffect(() => {
    if (section === 'predictive' && !predictive) {
      fetchPredictive();
    }
  }, [section]);

  const priorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      High: 'bg-rose-100 text-rose-800 border-rose-200',
      Medium: 'bg-amber-100 text-amber-800 border-amber-200',
      Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return map[priority] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const criticalityBadge = (c: string) => {
    const map: Record<string, string> = {
      high: 'bg-rose-100 text-rose-800 border-rose-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return map[c.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-gov-blue" />
          <h1 className="text-xl font-bold text-navy-900">Analytics & Reports</h1>
        </div>
        <p className="text-sm text-slate-600">Organizational competency analytics and workforce readiness insights</p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSection('department')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition border ${
            section === 'department'
              ? 'bg-gov-blue text-white border-gov-blue shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" /> Department Analytics
        </button>
        <button
          onClick={() => setSection('predictive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition border ${
            section === 'predictive'
              ? 'bg-gov-blue text-white border-gov-blue shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Predictive Workforce Analytics
        </button>
      </div>

      {/* Department Analytics Section */}
      {section === 'department' && (
        <div className="space-y-6">
          {/* Department Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-700">Department:</label>
              <select
                value={selectedDept ?? ''}
                onChange={e => setSelectedDept(e.target.value ? parseInt(e.target.value) : undefined)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gov-blue focus:outline-none"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {loadingDept ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <RefreshCw className="w-6 h-6 text-gov-blue animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6 text-rose-500" />
                <p className="text-xs text-slate-600">{error}</p>
              </div>
            </div>
          ) : deptAnalytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600">Total Officials</span>
                    <Users className="w-4 h-4 text-gov-blue" />
                  </div>
                  <div className="mt-1.5 text-xl font-bold text-navy-900">{deptAnalytics.total_officials}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600">Assessed</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-1.5 text-xl font-bold text-navy-900">{deptAnalytics.assessed_officials_count}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600">Assessment Coverage</span>
                    <Target className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="mt-1.5 text-xl font-bold text-navy-900">{deptAnalytics.assessment_coverage_pct}%</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600">Training Participation</span>
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="mt-1.5 text-xl font-bold text-navy-900">{deptAnalytics.training_participation_rate_pct}%</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600">Path Completion</span>
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="mt-1.5 text-xl font-bold text-navy-900">{deptAnalytics.learning_path_completion_rate_pct}%</div>
                </div>
              </div>

              {/* Two Column: Skills Gap Table + Domain Avg Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Skill Gaps Table */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-navy-900">Top Skill Gaps</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Highest-impact competency gaps across the department</p>
                  </div>
                  {deptAnalytics.top_skill_gaps.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No skill gap data available</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600">
                            <th className="text-left px-3 py-2 font-semibold">Competency</th>
                            <th className="text-left px-3 py-2 font-semibold">Domain</th>
                            <th className="text-center px-3 py-2 font-semibold">Affected</th>
                            <th className="text-center px-3 py-2 font-semibold">Avg Gap</th>
                            <th className="text-center px-3 py-2 font-semibold">Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deptAnalytics.top_skill_gaps.map((gap, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="px-3 py-2 font-medium text-slate-800">{gap.competency}</td>
                              <td className="px-3 py-2 text-slate-600">{gap.domain}</td>
                              <td className="px-3 py-2 text-center">{gap.officials_affected}</td>
                              <td className="px-3 py-2 text-center font-semibold">{gap.average_gap.toFixed(1)}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${priorityBadge(gap.priority)}`}>
                                  {gap.priority}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Domain Averages Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-navy-900">Competency Domain Averages</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Current vs Required proficiency by domain</p>
                  </div>
                  {deptAnalytics.competency_domain_averages.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No domain data available</p>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptAnalytics.competency_domain_averages} margin={{ top: 10, right: 10, left: -15, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="domain" tick={{ fill: '#475569', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                          <YAxis domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="current_avg" name="Current Avg" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="required_avg" name="Required Avg" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Predictive Workforce Analytics Section */}
      {section === 'predictive' && (
        <div className="space-y-6">
          {loadingPred ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <RefreshCw className="w-6 h-6 text-gov-blue animate-spin" />
            </div>
          ) : !predictive ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6 text-rose-500" />
                <p className="text-xs text-slate-600">Failed to load predictive analytics</p>
              </div>
            </div>
          ) : (
            <>
              {/* Metadata Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Analysis Date:</span> {predictive.analysis_date} •{' '}
                  <span className="font-semibold">Officials Analyzed:</span> {predictive.baseline_officials_analyzed} •{' '}
                  <span className="font-semibold">Data Sufficiency:</span> {predictive.data_sufficiency_status}
                  <p className="mt-1 text-[11px] text-blue-700">{predictive.methodology_notes}</p>
                </div>
              </div>

              {/* Emerging Competency Trends */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-navy-900">Emerging Competency Trends</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Forecasted competency demand changes</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="text-left px-3 py-2 font-semibold">Competency</th>
                        <th className="text-left px-3 py-2 font-semibold">Domain</th>
                        <th className="text-center px-3 py-2 font-semibold">Demand Index</th>
                        <th className="text-center px-3 py-2 font-semibold">Forecasted Growth</th>
                        <th className="text-center px-3 py-2 font-semibold">Criticality</th>
                        <th className="text-left px-3 py-2 font-semibold">Driver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictive.emerging_competency_trends.map((t, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-medium text-slate-800">{t.competency_name}</td>
                          <td className="px-3 py-2 text-slate-600">{t.domain}</td>
                          <td className="px-3 py-2 text-center font-semibold">{t.current_demand_index}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="text-emerald-600 font-semibold">+{t.forecasted_growth_pct}%</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${criticalityBadge(t.criticality)}`}>
                              {t.criticality}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600">{t.driver}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Training Priorities + Resource Hotspots */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Training Priorities */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-navy-900">Departmental Training Priorities</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ranked interventions for capacity building</p>
                  </div>
                  <div className="space-y-3">
                    {predictive.departmental_training_priorities.map((p, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-gov-blue text-white text-xs font-bold flex items-center justify-center">{p.rank}</span>
                              <span className="text-xs font-bold text-slate-900">{p.priority_area}</span>
                            </div>
                            <div className="mt-1.5 text-[11px] text-slate-600 pl-8 space-y-0.5">
                              <div><span className="font-medium">Cadre:</span> {p.recommended_cadre}</div>
                              <div><span className="font-medium">Target Officials:</span> {p.target_officials}</div>
                              <div><span className="font-medium">Partner:</span> {p.institutional_partner}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resource Gap Hotspots */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-navy-900">Resource Gap Hotspots</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Areas requiring immediate attention</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600">
                          <th className="text-left px-3 py-2 font-semibold">Competency</th>
                          <th className="text-center px-3 py-2 font-semibold">Coverage</th>
                          <th className="text-center px-3 py-2 font-semibold">Shortage</th>
                          <th className="text-center px-3 py-2 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictive.resource_gap_hotspots.map((h, i) => {
                          const statusMap: Record<string, string> = {
                            critical: 'bg-red-100 text-red-800 border-red-200',
                            warning: 'bg-amber-100 text-amber-800 border-amber-200',
                            adequate: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          };
                          return (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="px-3 py-2 font-medium text-slate-800">{h.competency}</td>
                              <td className="px-3 py-2 text-center">{h.current_coverage}</td>
                              <td className="px-3 py-2 text-center font-semibold">{h.shortage_level}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                  statusMap[h.status.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {h.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Disclaimer:</span> Predictive workforce analytics are derived from
                  currently available assessment and profile data. Forecasts are illustrative estimates and should be interpreted
                  alongside expert domain knowledge. Data sufficiency directly affects confidence levels.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
