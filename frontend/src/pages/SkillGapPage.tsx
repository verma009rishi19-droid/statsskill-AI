import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillGapApi } from '../services/api';
import { SkillGapAnalysis, SkillGapItem } from '../types';
import {
  Target, AlertTriangle, CheckCircle2, HelpCircle, Filter, ArrowRight,
  TrendingDown, RefreshCw, Compass, BookOpen, ChevronRight
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadGaps = async () => {
    setLoading(true);
    try {
      const res = await skillGapApi.getMyAnalysis();
      setAnalysis(res.data);
    } catch (err) {
      console.error('Failed to load skill gaps', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGaps();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
      </div>
    );
  }

  // Filter items
  const filteredGaps = (analysis?.gaps || []).filter((g) => {
    if (domainFilter !== 'all' && g.domain_code !== domainFilter) return false;
    if (priorityFilter !== 'all' && g.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'gap' && g.gap === 0) return false;
      if (statusFilter === 'unassessed' && g.is_assessed) return false;
      if (statusFilter === 'proficient' && (g.gap > 0 || !g.is_assessed)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Mathematical Formula Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-navy-900">Skill Gap Intelligence Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-gov-blue border border-blue-200">
                {analysis?.job_role_title}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              Rigorous competency comparison evaluated against officially defined job-role requirements.
            </p>
          </div>

          {/* Mathematical Rule Tag */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
            <span className="text-slate-700 font-bold block text-[10px] font-sans uppercase">Configured Formula</span>
            <span>gap = max(0, required_proficiency - current_proficiency)</span>
          </div>
        </div>

        {/* Summary Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-700 block">Total Required</span>
            <span className="text-xl font-bold text-navy-900 mt-0.5 block">{analysis?.total_required_competencies}</span>
          </div>
          <div>
            <span className="text-slate-700 block">Assessed Competencies</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{analysis?.assessed_count}</span>
          </div>
          <div>
            <span className="text-slate-700 block">Assessment Needed</span>
            <span className="text-xl font-bold text-amber-600 mt-0.5 block">{analysis?.unassessed_count}</span>
          </div>
          <div>
            <span className="text-slate-700 block">High Priority Gaps</span>
            <span className="text-xl font-bold text-rose-600 mt-0.5 block">{analysis?.high_priority_gaps_count}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-700 font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Domains</option>
            <option value="statistical">Statistical Competencies</option>
            <option value="technical">Technical Competencies</option>
            <option value="digital_governance">Digital Governance</option>
            <option value="behavioural_managerial">Behavioural & Managerial</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="gap">Has Active Gap</option>
            <option value="unassessed">Assessment Needed</option>
            <option value="proficient">Proficient</option>
          </select>
        </div>

        <div className="text-slate-700">
          Showing <strong>{filteredGaps.length}</strong> of {analysis?.gaps.length} competencies
        </div>
      </div>

      {/* Main Gaps Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Competency & Domain</th>
                <th className="py-3 px-4">Current Assessed</th>
                <th className="py-3 px-4">Required Standard</th>
                <th className="py-3 px-4">Gap Magnitude</th>
                <th className="py-3 px-4">Priority Level</th>
                <th className="py-3 px-4">Supporting Evidence</th>
                <th className="py-3 px-4">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGaps.map((g) => (
                <tr key={g.competency_id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{g.competency_name}</div>
                    <span className="text-[10px] text-slate-700 capitalize">{g.domain_name}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    {g.is_assessed ? (
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        Level {g.current_proficiency?.toFixed(1)}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Assessment needed
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-gov-blue">
                    Level {g.required_proficiency.toFixed(1)}
                  </td>

                  <td className="py-3.5 px-4">
                    {g.gap > 0 ? (
                      <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Δ {g.gap.toFixed(1)}
                      </span>
                    ) : g.is_assessed ? (
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        0.0 (Met)
                      </span>
                    ) : (
                      <span className="text-slate-700 font-medium">Pending</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        g.priority === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : g.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : g.priority === 'Low'
                          ? 'bg-blue-100 text-gov-blue border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {g.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-xs text-[11px] leading-tight">
                    {g.supporting_evidence}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-slate-700 font-medium line-clamp-1">
                        {g.recommended_action}
                      </span>
                      {g.is_assessed && g.gap > 0 ? (
                        <Link
                          to="/learning-paths"
                          className="text-[11px] text-gov-blue font-bold hover:underline flex items-center gap-0.5"
                        >
                          <span>Start Course</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : !g.is_assessed ? (
                        <Link
                          to="/assessments"
                          className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-0.5"
                        >
                          <span>Take Diagnostic</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : null}
                    </div>
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
