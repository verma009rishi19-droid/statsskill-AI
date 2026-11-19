import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learningPathApi } from '../services/api';
import { LearningPath, LearningPathModule } from '../types';
import {
  RefreshCw, AlertCircle, BookOpen, Clock, CheckCircle2,
  Play, ChevronRight, ExternalLink, GraduationCap, Award,
  Compass, CircleDot, Shield, Layers
} from 'lucide-react';

export const LearningPathPage: React.FC = () => {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingModuleId, setUpdatingModuleId] = useState<number | null>(null);

  const loadPath = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await learningPathApi.getMyPath();
      setPath(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPath(null);
      } else {
        setError('Failed to load your learning path. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPath();
  }, []);

  const handleModuleAction = async (mod: LearningPathModule) => {
    if (mod.status === 'completed') return;

    setUpdatingModuleId(mod.id);
    try {
      let newStatus: string;
      let newProgress: number;

      if (mod.status === 'not_started') {
        newStatus = 'in_progress';
        newProgress = 25;
      } else {
        // in_progress: advance by 25%
        newProgress = Math.min(mod.progress_pct + 25, 100);
        newStatus = newProgress >= 100 ? 'completed' : 'in_progress';
      }

      await learningPathApi.updateProgress(mod.id, {
        status: newStatus,
        progress_pct: newProgress,
      });

      // Refresh full path to get updated totals
      const res = await learningPathApi.getMyPath();
      setPath(res.data);
    } catch (err) {
      console.error('Failed to update module progress', err);
    } finally {
      setUpdatingModuleId(null);
    }
  };

  const getStatusConfig = (status: LearningPathModule['status']) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-emerald-500',
          ring: 'ring-emerald-200',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          label: 'Completed',
          icon: <CheckCircle2 className="w-5 h-5 text-white" />,
          line: 'bg-emerald-300',
        };
      case 'in_progress':
        return {
          color: 'bg-amber-500',
          ring: 'ring-amber-200',
          text: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          label: 'In Progress',
          icon: <Play className="w-4 h-4 text-white fill-white" />,
          line: 'bg-amber-300',
        };
      default:
        return {
          color: 'bg-slate-300',
          ring: 'ring-slate-100',
          text: 'text-slate-500',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          label: 'Not Started',
          icon: <CircleDot className="w-4 h-4 text-white" />,
          line: 'bg-slate-200',
        };
    }
  };

  const getActionButton = (mod: LearningPathModule) => {
    const isUpdating = updatingModuleId === mod.id;

    if (mod.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed ✓
        </span>
      );
    }

    if (mod.status === 'in_progress') {
      return (
        <button
          onClick={() => handleModuleAction(mod)}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-60"
        >
          {isUpdating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
          Continue
        </button>
      );
    }

    return (
      <button
        onClick={() => handleModuleAction(mod)}
        disabled={isUpdating}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gov-blue text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {isUpdating ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5" />
        )}
        Start Module
      </button>
    );
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-sm text-slate-700">{error}</p>
        <button
          onClick={loadPath}
          className="px-4 py-2 text-xs font-semibold bg-gov-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- Empty State ---
  if (!path || path.modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <Compass className="w-8 h-8 text-gov-blue" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-navy-900">No Learning Path Yet</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Complete your competency assessment first. Your personalized learning path
            will be generated based on the skill gaps identified.
          </p>
        </div>
        <Link
          to="/assessments"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold bg-gov-blue text-white hover:bg-blue-700 transition-colors"
        >
          <GraduationCap className="w-4 h-4" />
          Take Assessment
        </Link>
      </div>
    );
  }

  const sortedModules = [...path.modules].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-6">
      {/* ===== Header Card ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-navy-900">{path.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-gov-blue border border-blue-200">
                Personalized
              </span>
            </div>
            {path.description && (
              <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                {path.description}
              </p>
            )}
          </div>

          {/* Overall Progress Ring */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg border border-slate-200 px-4 py-3">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28" cy="28" r="24"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="5"
                />
                <circle
                  cx="28" cy="28" r="24"
                  fill="none"
                  stroke={path.progress_pct >= 100 ? '#10b981' : '#1d4ed8'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(path.progress_pct / 100) * 150.8} 150.8`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-navy-900">{Math.round(path.progress_pct)}%</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">Overall</span>
              <span className="text-sm font-bold text-navy-900 block">Progress</span>
            </div>
          </div>
        </div>

        {/* Full-width progress bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
            <span>Path Completion</span>
            <span className="font-semibold">{path.completed_modules} of {path.total_modules} modules</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                path.progress_pct >= 100 ? 'bg-emerald-500' : 'bg-gov-blue'
              }`}
              style={{ width: `${Math.min(path.progress_pct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ===== Stats Row ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Modules',
            value: path.total_modules,
            icon: <Layers className="w-4 h-4 text-gov-blue" />,
            bg: 'bg-blue-50',
            border: 'border-blue-100',
          },
          {
            label: 'Completed',
            value: path.completed_modules,
            icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
          },
          {
            label: 'Est. Hours',
            value: `${path.estimated_hours}h`,
            icon: <Clock className="w-4 h-4 text-amber-600" />,
            bg: 'bg-amber-50',
            border: 'border-amber-100',
          },
          {
            label: 'Progress',
            value: `${Math.round(path.progress_pct)}%`,
            icon: <Award className="w-4 h-4 text-violet-600" />,
            bg: 'bg-violet-50',
            border: 'border-violet-100',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">{stat.label}</span>
                <span className="text-lg font-bold text-navy-900">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Module Timeline ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-6">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gov-blue" />
            Learning Modules
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Complete each module in sequence to build your competencies progressively.
          </p>
        </div>

        <div className="relative">
          {sortedModules.map((mod, idx) => {
            const config = getStatusConfig(mod.status);
            const isLast = idx === sortedModules.length - 1;

            return (
              <div key={mod.id} className="relative flex gap-4">
                {/* Timeline track */}
                <div className="flex flex-col items-center">
                  {/* Node */}
                  <div
                    className={`w-9 h-9 rounded-full ${config.color} ring-4 ${config.ring} flex items-center justify-center flex-shrink-0 z-10`}
                  >
                    {config.icon}
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-[24px] ${config.line}`} />
                  )}
                </div>

                {/* Content card */}
                <div className={`flex-1 mb-6 border rounded-xl p-4 ${config.border} ${config.bg} transition-colors`}>
                  {/* Top row: order, title, badges */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Module {mod.order_index}
                        </span>
                        {mod.is_mandatory && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-0.5">
                            <Shield className="w-2.5 h-2.5" />
                            Mandatory
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-navy-900 mt-1">{mod.title}</h3>
                      {mod.description && (
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {mod.description}
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="flex-shrink-0">
                      {getActionButton(mod)}
                    </div>
                  </div>

                  {/* Meta row: competency, hours, course/nssta link */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px]">
                    {mod.estimated_hours > 0 && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        {mod.estimated_hours}h estimated
                      </span>
                    )}

                    {mod.competency_name && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-gov-blue border border-blue-100 font-medium">
                        <GraduationCap className="w-3 h-3" />
                        {mod.competency_name}
                      </span>
                    )}

                    {mod.course_title && mod.course_url && (
                      <a
                        href={mod.course_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gov-blue font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {mod.course_title}
                        {mod.course_provider && (
                          <span className="text-slate-400 font-normal">({mod.course_provider})</span>
                        )}
                      </a>
                    )}

                    {mod.course_title && !mod.course_url && (
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <BookOpen className="w-3 h-3" />
                        {mod.course_title}
                      </span>
                    )}

                    {mod.nssta_title && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100 font-medium">
                        <Award className="w-3 h-3" />
                        NSSTA: {mod.nssta_title}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-500">Module Progress</span>
                      <span className={`font-bold ${config.text}`}>{mod.progress_pct}%</span>
                    </div>
                    <div className="w-full bg-white/80 rounded-full h-1.5 border border-slate-200/50">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          mod.status === 'completed'
                            ? 'bg-emerald-500'
                            : mod.status === 'in_progress'
                            ? 'bg-amber-500'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.min(mod.progress_pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
