import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import {
  History, RefreshCw, AlertCircle, Award, ChevronRight,
  CheckCircle2, XCircle, Calendar, Target
} from 'lucide-react';

interface AttemptRecord {
  attempt_id?: number;
  id?: number;
  assessment_id?: number;
  assessment_title?: string;
  title?: string;
  score?: number;
  max_score?: number;
  percentage?: number;
  passed?: boolean;
  status?: string;
  started_at?: string;
  completed_at?: string;
  competency_breakdown?: Array<{
    competency_name: string;
    percentage: number;
    status: string;
  }>;
}

export const AssessmentHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await assessmentApi.getMyHistory();
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load assessment history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading assessment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <p className="text-sm text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  const totalAttempts = history.length;
  const passedCount = history.filter(a => a.passed).length;
  const avgScore = totalAttempts > 0
    ? Math.round(history.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gov-blue" />
              <h1 className="text-xl font-bold text-navy-900">Assessment History</h1>
            </div>
            <p className="text-sm text-slate-600 mt-1">Complete record of your competency assessment attempts and results</p>
          </div>
          <Link
            to="/assessments"
            className="px-4 py-2 bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" /> Take New Assessment
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Total Attempts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{totalAttempts}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Assessments Passed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{passedCount}<span className="text-sm text-slate-500 ml-1">/ {totalAttempts}</span></div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{avgScore}%</div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-navy-900">All Attempts</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sorted by most recent first</p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700 mb-1">No assessments taken yet</h3>
            <p className="text-xs text-slate-500 mb-4">Take a diagnostic assessment to evaluate your competencies</p>
            <Link
              to="/assessments"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold rounded-lg transition"
            >
              <Award className="w-4 h-4" /> Start Assessment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((attempt, idx) => (
              <div
                key={attempt.attempt_id || attempt.id || idx}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">
                        {attempt.assessment_title || attempt.title || 'Assessment'}
                      </h4>
                      {attempt.passed != null && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border flex items-center gap-1 ${
                          attempt.passed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          {attempt.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'In progress'}
                      </span>
                      {attempt.score != null && attempt.max_score != null && (
                        <span>Score: {attempt.score}/{attempt.max_score}</span>
                      )}
                    </div>

                    {/* Competency breakdown mini display */}
                    {attempt.competency_breakdown && attempt.competency_breakdown.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {attempt.competency_breakdown.map((cb, ci) => (
                          <span
                            key={ci}
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              cb.percentage >= 70
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : cb.percentage >= 40
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {cb.competency_name}: {Math.round(cb.percentage)}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className={`text-xl font-bold ${
                      (attempt.percentage || 0) >= 70 ? 'text-emerald-600' :
                      (attempt.percentage || 0) >= 40 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {attempt.percentage != null ? `${Math.round(attempt.percentage)}%` : '--'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
