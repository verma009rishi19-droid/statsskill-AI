import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learningPathApi, assessmentApi, quizStudioApi } from '../services/api';
import { LearningPath } from '../types';
import {
  BookmarkCheck, RefreshCw, AlertCircle, Compass, Award, FileQuestion,
  Clock, ChevronRight, CheckCircle2, ArrowRight, BookOpen, Target
} from 'lucide-react';

interface AttemptSummary {
  attempt_id?: number;
  id?: number;
  assessment_title?: string;
  quiz_title?: string;
  title?: string;
  score?: number;
  percentage?: number;
  passed?: boolean;
  completed_at?: string;
  status?: string;
}

export const MyLearningPage: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AttemptSummary[]>([]);
  const [quizHistory, setQuizHistory] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [lpRes, ahRes, qhRes] = await Promise.allSettled([
          learningPathApi.getMyPath(),
          assessmentApi.getMyHistory(),
          quizStudioApi.getMyHistory(),
        ]);
        if (lpRes.status === 'fulfilled') setLearningPath(lpRes.value.data);
        if (ahRes.status === 'fulfilled') setAssessmentHistory(Array.isArray(ahRes.value.data) ? ahRes.value.data : []);
        if (qhRes.status === 'fulfilled') setQuizHistory(Array.isArray(qhRes.value.data) ? qhRes.value.data : []);
      } catch (err: any) {
        setError('Failed to load learning data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  const totalModules = learningPath?.total_modules || 0;
  const completedModules = learningPath?.completed_modules || 0;
  const progressPct = learningPath?.progress_pct || 0;
  const estimatedHours = learningPath?.estimated_hours || 0;
  const avgQuizScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizHistory.length)
    : 0;

  const nextModule = learningPath?.modules?.find(m => m.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <BookmarkCheck className="w-5 h-5 text-gov-blue" />
          <h1 className="text-xl font-bold text-navy-900">My Learning</h1>
        </div>
        <p className="text-sm text-slate-600">Your learning journey, assessments, and quiz progress at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Active Learning Paths</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{learningPath ? 1 : 0}</div>
          <div className="mt-1 text-[11px] text-slate-500">{progressPct}% overall progress</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Modules Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{completedModules}<span className="text-sm text-slate-500 ml-1">/ {totalModules}</span></div>
          <div className="mt-1 text-[11px] text-slate-500">modules in current path</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Estimated Hours</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{estimatedHours}</div>
          <div className="mt-1 text-[11px] text-slate-500">total learning hours</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Avg Quiz Score</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{avgQuizScore}%</div>
          <div className="mt-1 text-[11px] text-slate-500">{quizHistory.length} quizzes attempted</div>
        </div>
      </div>

      {/* Current Learning Path */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-navy-900">Current Learning Path</h2>
            <p className="text-xs text-slate-500 mt-0.5">{learningPath?.title || 'No active learning path'}</p>
          </div>
          <Link to="/learning-paths" className="text-xs text-gov-blue font-semibold hover:underline flex items-center gap-1">
            View Full Path <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {learningPath ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600">{completedModules} of {totalModules} modules completed</span>
                <span className="font-bold text-gov-blue">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gov-blue h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {nextModule && (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-gov-blue bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                      UP NEXT — Module {nextModule.order_index + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">{nextModule.title}</h4>
                    {nextModule.description && <p className="text-xs text-slate-600 mt-0.5">{nextModule.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{nextModule.estimated_hours}h</span>
                      {nextModule.competency_name && (
                        <span className="flex items-center gap-1"><Target className="w-3 h-3" />{nextModule.competency_name}</span>
                      )}
                    </div>
                  </div>
                  <Link to="/learning-paths" className="px-4 py-2 bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5">
                    {nextModule.status === 'in_progress' ? 'Continue' : 'Start'} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-3">No learning path assigned yet</p>
            <Link to="/assessments" className="text-xs text-gov-blue font-semibold hover:underline">
              Take a diagnostic assessment to get started →
            </Link>
          </div>
        )}
      </div>

      {/* Recent Assessments & Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assessments */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-navy-900">Recent Assessments</h3>
            <Link to="/assessment-history" className="text-xs text-gov-blue font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {assessmentHistory.length === 0 ? (
            <div className="text-center py-6">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No assessments taken yet</p>
              <Link to="/assessments" className="text-xs text-gov-blue font-semibold hover:underline mt-2 block">Take your first assessment</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {assessmentHistory.slice(0, 5).map((a, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">{a.assessment_title || a.title || 'Assessment'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs font-bold text-navy-900">{a.percentage != null ? `${Math.round(a.percentage)}%` : '--'}</span>
                    {a.passed != null && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                        a.passed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {a.passed ? 'Passed' : 'Failed'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-navy-900">Recent Quizzes</h3>
            <Link to="/quiz-studio" className="text-xs text-gov-blue font-semibold hover:underline flex items-center gap-1">
              Quiz Studio <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {quizHistory.length === 0 ? (
            <div className="text-center py-6">
              <FileQuestion className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No quizzes attempted yet</p>
              <Link to="/quiz-studio" className="text-xs text-gov-blue font-semibold hover:underline mt-2 block">Generate a quiz from documents</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quizHistory.slice(0, 5).map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">{q.quiz_title || q.title || 'Quiz'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {q.completed_at ? new Date(q.completed_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs font-bold text-navy-900">{q.percentage != null ? `${Math.round(q.percentage)}%` : `${q.score || 0} pts`}</span>
                    {q.passed != null && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                        q.passed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {q.passed ? 'Passed' : 'Failed'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
