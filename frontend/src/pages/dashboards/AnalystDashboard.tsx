import React, { useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import {
  BarChart3, Download, TrendingUp, AlertTriangle, ShieldCheck,
  CheckCircle2, Filter, Layers, Database, Eye, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

export const AnalystDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedDivision, setSelectedDivision] = useState('all');

  const macroMetrics = [
    { division: 'Price Statistics (PSD)', assessedOfficers: 42, readinessIndex: 82.4, skillGaps: 6 },
    { division: 'National Accounts (NAD)', assessedOfficers: 35, readinessIndex: 79.1, skillGaps: 8 },
    { division: 'Field Operations (FOD)', assessedOfficers: 120, readinessIndex: 74.0, skillGaps: 24 },
    { division: 'Social Statistics (SSD)', assessedOfficers: 28, readinessIndex: 86.5, skillGaps: 3 },
    { division: 'Economic Statistics (ESD)', assessedOfficers: 55, readinessIndex: 77.8, skillGaps: 12 },
  ];

  const workforceForecast = [
    { period: 'Q1 2026', currentCapability: 76, targetNeed: 80, gap: 4 },
    { period: 'Q2 2026', currentCapability: 79, targetNeed: 82, gap: 3 },
    { period: 'Q3 2026', currentCapability: 81, targetNeed: 85, gap: 4 },
    { period: 'Q4 2026', currentCapability: 84, targetNeed: 85, gap: 1 },
  ];

  const handleExportMacroCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Division,AssessedOfficers,ReadinessIndex,SkillGaps\n"
      + macroMetrics.map(m => `"${m.division}",${m.assessedOfficers},${m.readinessIndex},${m.skillGaps}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Macro_Statistical_Readiness_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-900">
              Statistical Intelligence Portal — {user?.full_name || 'Kavita Nair'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Analyst (Read-Only)
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Macro-level capability index, predictive workforce readiness modeling, and cross-cadre skill gap reports for India's Official Statistical System.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportMacroCSV}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">System Capability Index</span>
            <BarChart3 className="w-4 h-4 text-gov-blue" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">78.2 / 100</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">↑ +3.5% vs FY 2025-26 baseline</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monitored Personnel</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">280 Officers</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 5 Primary MoSPI Divisions</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Upcoming Survey Cycles</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">3 Major Surveys</div>
          <div className="text-[11px] text-slate-400 mt-1">PLFS 2026-27, ASI, CPI Revision</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Permission Profile</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-700 mt-2">Auditor Clearance</div>
          <div className="text-[11px] text-slate-400 mt-1">Read-Only Analytical Access</div>
        </div>
      </div>

      {/* Cross-Division Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Cross-Division Competency Readiness</h2>
              <p className="text-[11px] text-slate-500">Benchmarked average readiness index across technical cadres</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={macroMetrics} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="division" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="readinessIndex" fill="#0284c7" radius={[4, 4, 0, 0]} name="Readiness Index (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive 12-Month Capability Projection */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Predictive Workforce Readiness (FY 2026-27)</h2>
              <p className="text-[11px] text-slate-500">Projected competency fulfillment trajectory for survey readiness</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workforceForecast} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="currentCapability" fill="#10b981" radius={[4, 4, 0, 0]} name="Projected Capability" />
                <Bar dataKey="targetNeed" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Mandatory Requirement" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Macro Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-navy-900">Division Competency &amp; Skill Gap Summary Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Division</th>
                <th className="py-2.5 px-3">Active Cadre Strength</th>
                <th className="py-2.5 px-3">Average Readiness Index</th>
                <th className="py-2.5 px-3">Identified Critical Gaps</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {macroMetrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-semibold text-navy-900">{m.division}</td>
                  <td className="py-3 px-3">{m.assessedOfficers} officers</td>
                  <td className="py-3 px-3 font-bold text-navy-900">{m.readinessIndex}%</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-rose-600">{m.skillGaps} competencies</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      m.readinessIndex >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {m.readinessIndex >= 80 ? 'Low Risk • Operation Ready' : 'Moderate Gap • In Training'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
