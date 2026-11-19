import React, { useState, useEffect } from 'react';
import { assessmentApi } from '../services/api';
import {
  AssessmentSummary, AssessmentDetail, AssessmentResult, AssessmentQuestionPublic
} from '../types';
import {
  Award, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight,
  RefreshCw, Check, RotateCcw, ChevronRight, HelpCircle
} from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<AssessmentDetail | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (activeAssessment && !result && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeAssessment, result, timeLeft]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await assessmentApi.listAssessments();
      setAssessments(res.data);
    } catch (err) {
      console.error('Failed to load assessments', err);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (id: number) => {
    setLoading(true);
    try {
      const res = await assessmentApi.getAssessmentDetail(id);
      setActiveAssessment(res.data);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setResult(null);
      setTimeLeft(res.data.time_limit_minutes * 60);
    } catch (err) {
      console.error('Failed to start assessment', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = async () => {
    if (!activeAssessment) return;
    setSubmitting(true);
    try {
      const payload = {
        assessment_id: activeAssessment.id,
        responses: activeAssessment.questions.map((q) => ({
          question_id: q.id,
          selected_option_index: selectedAnswers[q.id] ?? null,
          time_taken_seconds: 15,
        })),
      };
      const res = await assessmentApi.submitAssessment(payload);
      setResult(res.data);
    } catch (err) {
      console.error('Failed to submit assessment', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
      </div>
    );
  }

  // View 1: Active Assessment Taking Mode
  if (activeAssessment && !result) {
    const q: AssessmentQuestionPublic = activeAssessment.questions[currentQIndex];
    const isAnswered = selectedAnswers[q.id] !== undefined;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Progress & Timer Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Question {currentQIndex + 1} of {activeAssessment.questions.length}
            </span>
            <h2 className="text-sm font-bold text-navy-900 mt-0.5">{activeAssessment.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-mono">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold shadow-xs transition"
            >
              {submitting ? 'Submitting...' : 'Finish Assessment'}
            </button>
          </div>
        </div>

        {/* Question Body Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-blue-100 text-gov-blue border border-blue-200">
              {q.difficulty?.toUpperCase()} • {q.points} Points
            </span>
            <p className="text-base font-semibold text-slate-900 leading-relaxed">
              {q.question_text}
            </p>
          </div>

          {/* 4 Distinct Options */}
          <div className="space-y-3 pt-2">
            {q.options.map((opt, idx) => {
              const selected = selectedAnswers[q.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(q.id, idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                    selected
                      ? 'border-gov-blue bg-blue-50/70 text-gov-darkblue font-semibold shadow-xs ring-1 ring-gov-blue'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        selected ? 'bg-gov-blue text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {selected && <Check className="w-4 h-4 text-gov-blue" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Previous
            </button>

            <div className="flex gap-1.5">
              {activeAssessment.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-6 h-6 rounded text-[11px] font-bold ${
                    currentQIndex === idx
                      ? 'bg-gov-blue text-white ring-2 ring-blue-300'
                      : selectedAnswers[activeAssessment.questions[idx].id] !== undefined
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQIndex < activeAssessment.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="px-4 py-2 rounded-lg bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold shadow-xs transition"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Submit Answers
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View 2: Assessment Results Review Mode
  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Banner Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-navy-900">Assessment Evaluation Results</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.passed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {result.passed ? 'Benchmark Met (Passed)' : 'Development Benchmark Required'}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1">{result.assessment_title}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gov-blue">{result.percentage}%</div>
                <div className="text-[11px] text-slate-700">
                  {result.score} / {result.max_score} Total Points
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveAssessment(null);
                  setResult(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to Catalogue</span>
              </button>
            </div>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
              <span className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Demonstrated Strengths
              </span>
              <ul className="mt-2 space-y-1 list-disc list-inside text-emerald-800">
                {result.strengths.length > 0 ? (
                  result.strengths.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li>No specific domain met the &gt;70% proficiency threshold.</li>
                )}
              </ul>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Target Areas for Improvement
              </span>
              <ul className="mt-2 space-y-1 list-disc list-inside text-amber-800">
                {result.areas_for_improvement.length > 0 ? (
                  result.areas_for_improvement.map((imp, i) => <li key={i}>{imp}</li>)
                ) : (
                  <li>Full mastery demonstrated across assessed competencies!</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Competency Mastery Breakdown Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-navy-900 border-b border-slate-100 pb-3 mb-3">
            Competency-Level Proficiency Breakdown
          </h2>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Competency</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Mastery</th>
                <th className="py-2.5 px-3">Assigned Level</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.competency_breakdown.map((b) => (
                <tr key={b.competency_id}>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{b.competency_name}</td>
                  <td className="py-2.5 px-3">
                    {b.score} / {b.max_score}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-navy-900">{b.percentage}%</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-gov-blue">
                      Level {b.assigned_proficiency.toFixed(1)} / 4.0
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        b.status === 'Mastered' || b.status === 'Competent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Question by Question Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-navy-900 border-b border-slate-100 pb-3">
            Detailed Question Explanations & Methodological Review
          </h2>
          <div className="space-y-4">
            {result.question_reviews.map((rev, i) => (
              <div
                key={rev.question_id}
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  rev.is_correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-slate-900">
                    Q{i + 1}. {rev.question_text}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      rev.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {rev.is_correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="text-slate-700">
                    Your Answer:{' '}
                    <strong className={rev.is_correct ? 'text-emerald-700' : 'text-rose-700'}>
                      {rev.selected_option_index !== null && rev.selected_option_index !== undefined
                        ? rev.options[rev.selected_option_index]
                        : 'Skipped'}
                    </strong>
                  </div>
                  {!rev.is_correct && (
                    <div className="text-slate-700">
                      Correct Answer:{' '}
                      <strong className="text-emerald-700">
                        {rev.options[rev.correct_option_index]}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  <strong className="text-slate-900 block font-semibold mb-0.5">Methodological Rationale:</strong>
                  {rev.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View 3: Default Assessment Catalogue
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h1 className="text-xl font-bold text-navy-900">Competency Assessment Engine</h1>
        <p className="text-xs text-slate-700 mt-1">
          Standardized diagnostic assessments mapped to official job-role requirements in India's Statistical System.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-100 text-gov-blue">
                  {a.difficulty}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{a.time_limit_minutes} mins</span>
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 leading-snug">{a.title}</h2>
              <p className="text-xs text-slate-600 line-clamp-2">{a.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-700 font-medium">
                {a.total_questions} Questions
              </span>
              <button
                onClick={() => startAssessment(a.id)}
                className="px-3.5 py-1.5 rounded-lg bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
