import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from '../features/theme/ThemeContext';
import { analyticsApi, recommendationApi, learningPathApi } from '../services/api';
import { LearnerDashboardMetrics, RecommendationItem, LearningPath } from '../types';
import {
  Award, Target, Clock, Compass, AlertTriangle, ArrowRight,
  BookOpen, CheckCircle2, ChevronRight, Download, PlayCircle, Sparkles
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

const formatStatusLabel = (status?: string) => {
  switch (status) {
    case 'completed': return { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30' };
    case 'in_progress': return { label: 'In Progress', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30' };
    default: return { label: 'Queued', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
  }
};

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<LearnerDashboardMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, rRes, lpRes] = await Promise.allSettled([
        analyticsApi.getLearnerDashboard(),
        recommendationApi.getMyRecommendations(),
        learningPathApi.getMyPath(),
      ]);
      if (mRes.status === 'fulfilled') setMetrics(mRes.value.data);
      if (rRes.status === 'fulfilled') setRecommendations(rRes.value.data.recommendations || []);
      if (lpRes.status === 'fulfilled') setLearningPath(lpRes.value.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDownloadTranscript = () => {
    const officerName = metrics?.full_name || user?.full_name || 'Official Learner';
    const rows = [
      ['StatSkill AI — Official Competency Transcript'],
      ['Officer Name', officerName],
      ['Designation', metrics?.designation || 'Statistical Officer'],
      ['Department', metrics?.department_name || 'MoSPI'],
      ['Job Role Standard', metrics?.job_role_title || 'Statistical Official'],
      ['Assessed Competencies', String(metrics?.assessed_competencies_count ?? 0)],
      ['Critical Skill Gaps', String(metrics?.critical_gaps_count ?? 0)],
      ['Learning Path Progress', `${metrics?.learning_path_progress_pct ?? 0}%`],
      ['Verified Learning Hours', `${metrics?.total_learning_hours ?? 0} hrs`],
      [],
      ['Competency', 'Current Level (1-4)', 'Required Level (1-4)', 'Gap Delta'],
      ...(metrics?.competency_radar_data || []).map((c) => [
        c.competency,
        String(c.current),
        String(c.required),
        String(Math.max(0, Number((c.required - c.current).toFixed(2)))),
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StatSkill_Transcript_${officerName.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800/80" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800/80" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800/80" />
          <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800/80" />
        </div>
      </div>
    );
  }

  const totalRequired = (metrics?.assessed_competencies_count || 0) + (metrics?.unassessed_competencies_count || 0);
  const activeModules = learningPath?.modules || [];

  return (
    <div className="space-y-6">
      {/* Executive Identity & Transcript Hero Banner */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-7 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Statistical Competency Portal</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {metrics?.full_name || user?.full_name}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
                {metrics?.job_role_title || 'Statistical Official'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {metrics?.designation || 'Statistical Officer'} &nbsp;•&nbsp; {metrics?.department_name || 'Ministry of Statistics & Programme Implementation'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadTranscript}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Official Transcript</span>
            </button>
            <Link
              to="/assessments"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 active:scale-[0.99] text-xs font-semibold shadow-sm flex items-center gap-2 transition whitespace-nowrap"
            >
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Diagnostic Assessment</span>
            </Link>
          </div>
        </div>

        {/* Priority Recommendation Callout */}
        {metrics?.next_recommended_action && (
          <div className="mt-5 p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-200">Next Recommended Action: </span>
                <span className="text-slate-100">{metrics.next_recommended_action}</span>
              </div>
            </div>
            <Link
              to="/learning-paths"
              className="text-indigo-200 hover:text-white font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap"
            >
              <span>Open Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* 4-Column KPI Metric Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/profile"
          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/40 p-5 shadow-2xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Assessed Competencies</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {metrics?.assessed_competencies_count ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">of {totalRequired} required</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            {metrics?.unassessed_competencies_count ?? 0} pending diagnostic
          </div>
        </Link>

        <Link
          to="/skill-gaps"
          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-500/40 p-5 shadow-2xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Critical Skill Gaps</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {metrics?.critical_gaps_count ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">high priority</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            Weighted by cadre role standards →
          </div>
        </Link>

        <Link
          to="/learning-paths"
          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 p-5 shadow-2xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Learning Path Progress</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {metrics?.learning_path_progress_pct ?? 0}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">completion</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics?.learning_path_progress_pct || 0}%` }}
            />
          </div>
        </Link>

        <Link
          to="/my-learning"
          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/40 p-5 shadow-2xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Logged Learning Hours</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {metrics?.total_learning_hours ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">verified hours</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            iGOT &amp; NSSTA verified logs
          </div>
        </Link>
      </section>

      {/* Active Learning Modules + Recent Assessments Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled / Active Learning Modules */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Learning Modules</h2>
            </div>
            <Link to="/learning-paths" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              {activeModules.length} {activeModules.length === 1 ? 'Module' : 'Modules'} →
            </Link>
          </div>

          {activeModules.length > 0 ? (
            <div className="space-y-3 flex-1">
              {activeModules.slice(0, 3).map((item) => {
                const badge = formatStatusLabel(item.status);
                const pct = item.progress_pct ?? (item.status === 'completed' ? 100 : item.status === 'in_progress' ? 45 : 0);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.course_title || item.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.course_provider || 'iGOT Karmayogi'} &nbsp;•&nbsp; {item.estimated_hours || 4} hrs
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0 ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                        {pct}%
                      </span>
                      <Link
                        to="/learning-paths"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">No active modules yet.</p>
              <Link
                to="/courses"
                className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Browse Course Catalogue →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Assessment & Activity Ledger */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Assessments &amp; Activity</h2>
            </div>
            <Link to="/assessment-history" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              View all →
            </Link>
          </div>

          {metrics?.recent_activity && metrics.recent_activity.length > 0 ? (
            <div className="space-y-3 flex-1">
              {metrics.recent_activity.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{act.title}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{act.score}</span>
                      <span>{act.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No assessments completed yet. Take a diagnostic test to begin.
              </p>
              <Link
                to="/assessments"
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
              >
                Start Diagnostic
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Visual Analytics Row: Radar Chart & Bar Comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency Radar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Competency Benchmark vs Role Standard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assessed proficiency vs target benchmark (1.0 – 4.0 scale)</p>
            </div>
            <Link to="/profile" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5 shrink-0">
              <span>Full Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {metrics?.competency_radar_data && metrics.competency_radar_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={metrics.competency_radar_data} outerRadius={90}>
                  <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <PolarAngleAxis dataKey="competency" tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }} />
                  <Radar name="Current Assessed" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                  <Radar name="Required Level" dataKey="required" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">Take an assessment to generate radar visualization.</div>
            )}
          </div>
        </div>

        {/* Targeted Competency Gaps Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Direct Competency Gap Comparison</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">gap = max(0, required - current)</p>
            </div>
            <Link to="/skill-gaps" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5 shrink-0">
              <span>Gap Analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            {metrics?.competency_radar_data && metrics.competency_radar_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.competency_radar_data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="competency" tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis domain={[0, 4]} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="current" name="Current Proficiency" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="required" name="Job-Role Required" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 dark:text-slate-400">No gap data available.</div>
            )}
          </div>
        </div>
      </section>

      {/* Priority Learning Recommendations */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Priority Learning Recommendations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Curated from verified iGOT Karmayogi and NSSTA TPAC courses</p>
          </div>
          <Link to="/learning-paths" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5">
            <span>View All ({recommendations.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    {rec.provider}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                    {rec.priority_level}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {rec.estimated_duration}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{rec.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{rec.why_recommended}</p>
              </div>

              {rec.external_url && (
                <a
                  href={rec.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                >
                  <span>Open Resource</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
