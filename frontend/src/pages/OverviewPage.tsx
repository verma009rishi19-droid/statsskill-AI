import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { analyticsApi, recommendationApi } from '../services/api';
import { LearnerDashboardMetrics, RecommendationItem } from '../types';
import {
  Award, Target, Clock, Compass, TrendingUp, AlertTriangle, ArrowRight,
  BookOpen, CheckCircle2, ChevronRight, Zap, RefreshCw, BarChart2
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<LearnerDashboardMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, rRes] = await Promise.all([
        analyticsApi.getLearnerDashboard(),
        recommendationApi.getMyRecommendations()
      ]);
      setMetrics(mRes.data);
      setRecommendations(rRes.data.recommendations || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
          <p className="text-sm font-medium text-slate-700">Loading Official Competency Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Official Welcome & Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-navy-900">
                Welcome, {metrics?.full_name || user?.full_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-gov-blue border border-blue-200">
                {metrics?.job_role_title || 'Statistical Official'}
              </span>
            </div>
            <p className="text-sm text-slate-700 mt-1">
              {metrics?.designation} • {metrics?.department_name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/assessments"
              className="px-4 py-2 rounded-lg bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Award className="w-4 h-4" />
              <span>Take Diagnostic Assessment</span>
            </Link>
            <Link
              to="/skill-gaps"
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              View Skill Gaps
            </Link>
          </div>
        </div>

        {/* Priority Recommendation Alert Banner */}
        {metrics?.next_recommended_action && (
          <div className="mt-5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900">Recommended Action: </span>
                <span className="text-amber-800">{metrics.next_recommended_action}</span>
              </div>
            </div>
            <Link to="/learning-paths" className="text-amber-900 font-semibold hover:underline flex items-center gap-1 shrink-0">
              <span>Take Action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Assessed Competencies</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">{metrics?.assessed_competencies_count}</span>
            <span className="text-xs text-slate-700">of {(metrics?.assessed_competencies_count || 0) + (metrics?.unassessed_competencies_count || 0)} required</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium">
            {metrics?.unassessed_competencies_count} unassessed (Action required)
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Critical Skill Gaps</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">{metrics?.critical_gaps_count}</span>
            <span className="text-xs text-slate-700">High priority items</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-700">
            Based on role importance weights
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Learning Path Progress</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">{metrics?.learning_path_progress_pct}%</span>
            <span className="text-xs text-slate-700">completion</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gov-blue h-full rounded-full transition-all"
              style={{ width: `${metrics?.learning_path_progress_pct || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Logged Learning Hours</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">{metrics?.total_learning_hours}</span>
            <span className="text-xs text-slate-700">verified hours</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            From verified course completions
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Radar Chart & Bar Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency Radar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Competency Benchmark vs Job Role Standard</h2>
              <p className="text-xs text-slate-700">Assessed proficiency vs required benchmark on 1.0 - 4.0 scale</p>
            </div>
            <Link to="/profile" className="text-xs text-gov-blue font-semibold hover:underline flex items-center gap-1">
              <span>Full Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {metrics?.competency_radar_data && metrics.competency_radar_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={metrics.competency_radar_data} outerRadius={90}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="competency" tick={{ fill: '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Current Assessed" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Radar name="Required Level" dataKey="required" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-700">Take an assessment to generate radar visualization.</div>
            )}
          </div>
        </div>

        {/* Targeted Competency Gaps Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Direct Competency Gap Comparison</h2>
              <p className="text-xs text-slate-700">Numerical gap delta: gap = max(0, required - current)</p>
            </div>
            <Link to="/skill-gaps" className="text-xs text-gov-blue font-semibold hover:underline flex items-center gap-1">
              <span>Gap Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            {metrics?.competency_radar_data && metrics.competency_radar_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.competency_radar_data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="competency" tick={{ fill: '#475569', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="current" name="Current Proficiency" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="required" name="Job-Role Required" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-700">No gap data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Priority Recommendations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 2 Recommended Learning Interventions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Priority Learning Recommendations</h3>
              <p className="text-xs text-slate-700">Curated from verified iGOT Karmayogi and NSSTA TPAC courses</p>
            </div>
            <Link to="/learning-paths" className="text-xs text-gov-blue font-semibold hover:underline flex items-center gap-1">
              <span>View All ({recommendations.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-100 text-gov-blue border border-blue-200">
                      {rec.provider}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      {rec.priority_level}
                    </span>
                    <span className="text-[11px] text-slate-700 font-medium">
                      {rec.estimated_duration}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{rec.why_recommended}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {rec.external_url && (
                    <a
                      href={rec.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold transition"
                    >
                      Open Resource
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Official Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-navy-900">Recent Activity</h3>
            <p className="text-xs text-slate-700">Official assessments and learning milestones</p>
          </div>

          <div className="space-y-3.5">
            {metrics?.recent_activity?.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-gov-blue flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  <Clock className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800 truncate">{act.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-700 mt-0.5">
                    <span>{act.score}</span>
                    <span>{act.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
