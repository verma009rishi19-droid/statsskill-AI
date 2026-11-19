import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { quizStudioApi } from '../services/api';
import {
  DocumentUploadResponse,
  QuizGenerateResponse,
  QuestionDraft,
  QuizDetail,
  QuizAttemptResult,
} from '../types';
import {
  RefreshCw,
  AlertCircle,
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  History,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Save,
  Play,
  Trophy,
  Clock,
  BarChart3,
  Trash2,
  Eye,
  SlidersHorizontal,
  FileUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Zap,
  Brain,
  GripVertical,
  Hash,
  Calendar,
  Award,
  Loader2,
  CircleDot,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Tab = 'generate' | 'quizzes' | 'history';
type GenerateStage = 'upload' | 'configure' | 'generate' | 'review' | 'save';
type Difficulty = 'easy' | 'medium' | 'hard';

interface QuizResponse {
  question_id: string;
  selected_option_index: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const QuizStudioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ---- Tab state ----
  const [activeTab, setActiveTab] = useState<Tab>('generate');

  // ---- Generate Quiz (Tab 1) state machine ----
  const [stage, setStage] = useState<GenerateStage>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentUploadResponse | null>(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionDraft[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- My Quizzes (Tab 2) ----
  const [quizzes, setQuizzes] = useState<QuizDetail[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);

  // Quiz-taking state
  const [activeQuiz, setActiveQuiz] = useState<QuizDetail | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttemptResult | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  // ---- Quiz History (Tab 3) – reuses quizResult type ----
  const [historyItems, setHistoryItems] = useState<QuizAttemptResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */

  const fetchQuizzes = useCallback(async () => {
    setQuizzesLoading(true);
    setQuizzesError(null);
    try {
      const res = await quizStudioApi.listQuizzes();
      setQuizzes(res.data);
    } catch (err: any) {
      setQuizzesError(err?.message ?? 'Failed to load quizzes');
    } finally {
      setQuizzesLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      // History endpoint – falls back to empty array if not available
      const res = await quizStudioApi.listQuizzes();
      // Filter quizzes that have attempts
      const withAttempts = (res.data || []).filter((q: any) => q.last_attempt_at);
      setHistoryItems(withAttempts as any);
    } catch (err: any) {
      setHistoryError(err?.message ?? 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'quizzes') fetchQuizzes();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab, fetchQuizzes, fetchHistory]);

  /* ---------------------------------------------------------------- */
  /*  Upload handlers                                                  */
  /* ---------------------------------------------------------------- */

  const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];
  const ACCEPTED_EXT = ['.pdf', '.docx', '.pptx', '.txt'];

  const handleFile = async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) {
      setUploadError(`Unsupported file type. Accepted: ${ACCEPTED_EXT.join(', ')}`);
      return;
    }
    setUploading(true);
    setUploadError(null);
    setGenerating(true);
    setGenerateError(null);
    try {
      // 1. Upload document directly
      const formData = new FormData();
      formData.append('file', file);
      const res = await quizStudioApi.uploadDocument(formData);
      const doc = res.data;
      setDocumentInfo(doc);

      const computedTitle = file.name.replace(/\.[^.]+$/, '') + ' Quiz';
      setQuizTitle(computedTitle);

      // 2. Automatically generate quiz questions without asking configuration
      const genRes = await quizStudioApi.generateQuiz({
        document_id: doc.id,
        num_questions: numQuestions,
        difficulty,
      });

      const questions = genRes.data.generated_questions || [];
      setGeneratedQuestions(questions);

      // 3. Automatically save the quiz so it is immediately playable
      const saveRes = await quizStudioApi.saveQuiz({
        document_id: doc.id,
        title: computedTitle,
        difficulty,
        questions: questions,
      });

      const newQuizId = saveRes.data.quiz_id || saveRes.data.id;
      setSavedQuizId(newQuizId);

      // 4. Immediately launch the interactive playable quiz mode!
      await fetchQuizzes();
      if (newQuizId) {
        await startQuiz(String(newQuizId));
      }
      setActiveTab('quizzes');
    } catch (err: any) {
      setUploadError(err?.message ?? 'Automatic quiz preparation failed');
      setStage('upload');
    } finally {
      setUploading(false);
      setGenerating(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = () => setDragActive(false);

  /* ---------------------------------------------------------------- */
  /*  Generate handler                                                 */
  /* ---------------------------------------------------------------- */

  const handleGenerate = async () => {
    if (!documentInfo) return;
    setGenerating(true);
    setGenerateError(null);
    setStage('generate');
    try {
      const res = await quizStudioApi.generateQuiz({
        document_id: documentInfo.id,
        num_questions: numQuestions,
        difficulty,
      });
      setGeneratedQuestions(res.data.generated_questions || []);
      setStage('review');
    } catch (err: any) {
      setGenerateError(err?.message ?? 'Quiz generation failed');
      setStage('configure');
    } finally {
      setGenerating(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Save handler                                                     */
  /* ---------------------------------------------------------------- */

  const handleSave = async () => {
    if (!documentInfo || generatedQuestions.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await quizStudioApi.saveQuiz({
        document_id: documentInfo.id,
        title: quizTitle,
        difficulty,
        questions: generatedQuestions,
      });
      setSavedQuizId(res.data.quiz_id || res.data.id);
      setStage('save');
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Quiz-taking handlers                                             */
  /* ---------------------------------------------------------------- */

  const startQuiz = async (quizId: string) => {
    try {
      const res = await quizStudioApi.getQuizDetail(Number(quizId));
      setActiveQuiz(res.data);
      setCurrentQuestionIdx(0);
      setResponses({});
      setQuizResult(null);
      setShowExplanations(false);
    } catch (err: any) {
      setQuizzesError(err?.message ?? 'Failed to load quiz');
    }
  };

  const selectOption = (questionId: string, optionIndex: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitQuizAttempt = async () => {
    if (!activeQuiz) return;
    setSubmittingQuiz(true);
    try {
      const formatted: { question_id: string; selected_option_index: number }[] = Object.entries(
        responses
      ).map(([question_id, selected_option_index]) => ({
        question_id,
        selected_option_index,
      }));
      const result = await quizStudioApi.submitQuizAttempt({
        quiz_id: (activeQuiz as any).quiz_id ?? activeQuiz.id,
        responses: formatted,
      });
      setQuizResult(result.data);
    } catch (err: any) {
      setQuizzesError(err?.message ?? 'Submission failed');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const resetGenerate = () => {
    setStage('upload');
    setDocumentInfo(null);
    setGeneratedQuestions([]);
    setQuizTitle('');
    setSavedQuizId(null);
    setUploadError(null);
    setGenerateError(null);
    setSaveError(null);
  };

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const scoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-600';
    if (pct >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  /* ================================================================ */
  /*  RENDER HELPERS                                                   */
  /* ================================================================ */

  /* ---------- Tab 1: Generate Quiz -------------------------------- */

  const renderUploadStage = () => (
    <div className="flex flex-col items-center gap-6">
      {/* Upload area */}
      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-gov-blue bg-blue-50'
            : 'border-slate-300 hover:border-gov-blue hover:bg-slate-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {uploading || generating ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-gov-blue animate-spin" />
            <p className="text-sm font-bold text-navy-900">Preparing and Generating Quiz Automatically…</p>
            <p className="text-xs text-slate-500">Extracting content &bull; Generating questions &bull; Opening quiz immediately</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-gov-blue flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <p className="text-base font-bold text-navy-900 mb-1">
              Upload Document for Instant Ready-to-Play Quiz
            </p>
            <p className="text-xs text-slate-500 mb-2">
              Drop any document here — our AI immediately compiles questions and launches the quiz with no extra questions or delays!
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Play &bull; Automated Scoring &bull; Scorecard Evaluation</span>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXT.join(',')}
          className="hidden"
          onChange={onFileInputChange}
        />
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {uploadError}
        </div>
      )}
    </div>
  );

  const renderConfigureStage = () => (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Document card */}
      {documentInfo && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gov-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy-900 truncate">
                {documentInfo.filename}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-slate-500">
                  {documentInfo.word_count?.toLocaleString() ?? '—'} words
                </span>
                {(documentInfo as any).page_count && (
                  <span className="text-xs text-slate-500">
                    {(documentInfo as any).page_count} pages
                  </span>
                )}
              </div>
              {(documentInfo.text_preview || (documentInfo as any).preview) && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                  {documentInfo.text_preview || (documentInfo as any).preview}
                </p>
              )}
            </div>
            <button
              onClick={resetGenerate}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Remove document"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Quiz Configuration
          </h3>
        </div>

        {/* Number of questions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Number of Questions: <span className="text-gov-blue">{numQuestions}</span>
          </label>
          <input
            type="range"
            min={5}
            max={20}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full accent-gov-blue"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  difficulty === d
                    ? d === 'easy'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 ring-1 ring-emerald-300'
                      : d === 'medium'
                      ? 'bg-amber-100 text-amber-700 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-red-100 text-red-700 border-red-300 ring-1 ring-red-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {d === 'easy' && <Zap className="w-3 h-3 inline mr-1" />}
                {d === 'medium' && <Target className="w-3 h-3 inline mr-1" />}
                {d === 'hard' && <Brain className="w-3 h-3 inline mr-1" />}
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue"
            placeholder="Enter a title for your quiz"
          />
        </div>

        {generateError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {generateError}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gov-blue text-white text-sm font-semibold rounded-lg hover:bg-gov-darkblue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Quiz…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Quiz
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderGeneratingStage = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-gov-blue animate-pulse" />
        </div>
        <RefreshCw className="w-5 h-5 text-gov-blue animate-spin absolute -bottom-1 -right-1" />
      </div>
      <p className="text-sm font-semibold text-navy-900">AI is generating your quiz…</p>
      <p className="text-xs text-slate-500">
        Analyzing document and creating {numQuestions} {difficulty} questions
      </p>
    </div>
  );

  const renderReviewStage = () => (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-navy-900">
            Generated Questions ({generatedQuestions.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and save your AI-generated quiz
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStage('configure');
              setGeneratedQuestions([]);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !quizTitle.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gov-blue text-white text-xs font-semibold rounded-lg hover:bg-gov-darkblue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                Save Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {saveError}
        </div>
      )}

      {generatedQuestions.map((q, idx) => (
        <div key={(q as any).question_id ?? idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-start gap-3 mb-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gov-blue text-white text-xs font-bold flex items-center justify-center">
              {idx + 1}
            </span>
            <p className="text-sm font-medium text-navy-900">{q.question_text ?? (q as any).question}</p>
          </div>

          <div className="ml-9 space-y-2 mb-3">
            {(q.options ?? []).map((opt, oi) => {
              const isCorrect = oi === q.correct_option_index;
              return (
                <div
                  key={oi}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <CircleDot className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>

          {q.explanation && (
            <div className="ml-9 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">{q.explanation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSaveStage = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <p className="text-sm font-bold text-navy-900">Quiz Saved Successfully!</p>
      <p className="text-xs text-slate-500">
        Your quiz "{quizTitle}" with {generatedQuestions.length} questions has been saved.
      </p>
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => {
            setActiveTab('quizzes');
            if (savedQuizId) startQuiz(savedQuizId);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gov-blue text-white text-xs font-semibold rounded-lg hover:bg-gov-darkblue transition-colors"
        >
          <Play className="w-3 h-3" />
          Take Quiz Now
        </button>
        <button
          onClick={resetGenerate}
          className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Create Another
        </button>
      </div>
    </div>
  );

  const renderGenerateTab = () => {
    // Stage progress bar
    const stages: { key: GenerateStage; label: string; icon: React.ReactNode }[] = [
      { key: 'upload', label: 'Upload', icon: <Upload className="w-3.5 h-3.5" /> },
      { key: 'configure', label: 'Configure', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
      { key: 'generate', label: 'Generate', icon: <Sparkles className="w-3.5 h-3.5" /> },
      { key: 'review', label: 'Review', icon: <Eye className="w-3.5 h-3.5" /> },
      { key: 'save', label: 'Saved', icon: <Check className="w-3.5 h-3.5" /> },
    ];
    const stageIdx = stages.findIndex((s) => s.key === stage);

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            {stages.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < stageIdx
                        ? 'bg-emerald-100 text-emerald-600'
                        : i === stageIdx
                        ? 'bg-gov-blue text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {i < stageIdx ? <Check className="w-3.5 h-3.5" /> : s.icon}
                  </div>
                  <span
                    className={`text-[11px] font-semibold hidden sm:inline ${
                      i <= stageIdx ? 'text-navy-900' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded ${
                      i < stageIdx ? 'bg-emerald-300' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stage content */}
        {stage === 'upload' && renderUploadStage()}
        {stage === 'configure' && renderConfigureStage()}
        {stage === 'generate' && renderGeneratingStage()}
        {stage === 'review' && renderReviewStage()}
        {stage === 'save' && renderSaveStage()}
      </div>
    );
  };

  /* ---------- Tab 2: My Quizzes ----------------------------------- */

  const renderQuizTaking = () => {
    if (!activeQuiz) return null;

    // Show result
    if (quizResult) {
      const pct = Math.round(
        ((quizResult.score ?? 0) / (quizResult.total_questions ?? activeQuiz.questions?.length ?? 1)) * 100
      );

      return (
        <div className="space-y-4 max-w-3xl mx-auto">
          <button
            onClick={() => {
              setActiveQuiz(null);
              setQuizResult(null);
            }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-gov-blue transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to quizzes
          </button>

          {/* Score card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-center">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 mb-3 shadow-inner">
              <Trophy className={`w-10 h-10 ${scoreColor(pct)}`} />
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 bg-slate-100 text-slate-700">
              Official Quiz Performance Scorecard
            </div>
            <p className={`text-4xl font-extrabold ${scoreColor(pct)}`}>{pct}%</p>
            <p className="text-sm font-semibold text-navy-900 mt-1">
              Score: {quizResult.score} / {quizResult.total_questions ?? activeQuiz.questions?.length} Correct
            </p>

            {/* Scorecard quick stats */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-600 block uppercase font-bold">Correct</span>
                <span className="text-base font-bold text-emerald-800">{quizResult.score}</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-600 block uppercase font-bold">Incorrect</span>
                <span className="text-base font-bold text-rose-800">
                  {(quizResult.total_questions ?? activeQuiz.questions?.length ?? 0) - (quizResult.score ?? 0)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-[10px] text-gov-blue block uppercase font-bold">Status</span>
                <span className="text-xs font-bold text-gov-blue">
                  {pct >= 60 ? 'Passed ✓' : 'Needs Review'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gov-blue border border-gov-blue/30 rounded-lg hover:bg-blue-50 transition-colors shadow-xs"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                {showExplanations ? 'Hide Explanations' : 'View Question Explanations'}
              </button>
              <button
                onClick={() => {
                  setActiveQuiz(null);
                  setQuizResult(null);
                  fetchQuizzes();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                Return to Quizzes
              </button>
            </div>
          </div>

          {/* Breakdown */}
          {showExplanations && quizResult.question_reviews && (
            <div className="space-y-3">
              {quizResult.question_reviews.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border p-4 shadow-xs ${
                    item.is_correct ? 'border-emerald-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {item.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm text-navy-900">{item.question_text}</p>
                  </div>
                  {!item.is_correct && item.correct_answer && (
                    <p className="ml-6 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded mb-1">
                      Correct answer: {item.correct_answer}
                    </p>
                  )}
                  {item.explanation && (
                    <div className="ml-6 flex items-start gap-1.5 mt-1">
                      <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600">{item.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Quiz-taking interface — one question at a time
    const questions = activeQuiz.questions ?? [];
    const currentQ = questions[currentQuestionIdx];
    if (!currentQ) return null;

    const qId = (currentQ as any).question_id ?? (currentQ as any).id ?? String(currentQuestionIdx);
    const answeredCount = Object.keys(responses).length;

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => {
            setActiveQuiz(null);
            setResponses({});
          }}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-gov-blue transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          Back to quizzes
        </button>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-navy-900">{activeQuiz.title}</p>
            <span className="text-[10px] text-slate-500">
              {answeredCount} / {questions.length} answered
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-gov-blue h-1.5 rounded-full transition-all"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
          {/* Question dots */}
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            {questions.map((q: any, i: number) => {
              const id = q.question_id ?? q.id ?? String(i);
              const answered = responses[id] !== undefined;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentQuestionIdx(i)}
                  className={`w-7 h-7 rounded text-[10px] font-semibold border transition-colors ${
                    i === currentQuestionIdx
                      ? 'bg-gov-blue text-white border-gov-blue'
                      : answered
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-start gap-3 mb-5">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gov-blue text-white text-xs font-bold flex items-center justify-center">
              {currentQuestionIdx + 1}
            </span>
            <p className="text-sm font-medium text-navy-900 leading-relaxed">
              {currentQ.question_text ?? (currentQ as any).question}
            </p>
          </div>

          <div className="space-y-2 ml-10">
            {(currentQ.options ?? []).map((opt: string, oi: number) => {
              const selected = responses[qId] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => selectOption(qId, oi)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left border transition-all ${
                    selected
                      ? 'bg-blue-50 border-gov-blue text-gov-blue ring-1 ring-gov-blue/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected ? 'border-gov-blue bg-gov-blue' : 'border-slate-300'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
            disabled={currentQuestionIdx === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Previous
          </button>

          {currentQuestionIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gov-blue border border-gov-blue/30 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={submitQuizAttempt}
              disabled={submittingQuiz || answeredCount < questions.length}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gov-blue text-white text-xs font-semibold rounded-lg hover:bg-gov-darkblue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submittingQuiz ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Submit Quiz
                  {answeredCount < questions.length && (
                    <span className="ml-1 text-[10px] opacity-70">
                      ({questions.length - answeredCount} unanswered)
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderQuizzesTab = () => {
    if (activeQuiz) return renderQuizTaking();

    if (quizzesLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-gov-blue animate-spin" />
        </div>
      );
    }

    if (quizzesError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{quizzesError}</p>
          <button
            onClick={fetchQuizzes}
            className="mt-2 px-3 py-1.5 text-xs font-semibold text-gov-blue border border-gov-blue/30 rounded-lg hover:bg-blue-50"
          >
            Retry
          </button>
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <BookOpen className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">No quizzes yet</p>
          <button
            onClick={() => setActiveTab('generate')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gov-blue text-white text-xs font-semibold rounded-lg hover:bg-gov-darkblue transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Generate Your First Quiz
          </button>
        </div>
      );
    }

    return (
      <div className="grid gap-3">
        {quizzes.map((quiz) => {
          const qId = (quiz as any).quiz_id ?? (quiz as any).id;
          return (
            <div
              key={qId}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-gov-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">{quiz.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${difficultyColor(
                          quiz.difficulty
                        )}`}
                      >
                        {quiz.difficulty}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {quiz.questions?.length ?? quiz.total_questions ?? '—'} questions
                      </span>
                      {quiz.created_at && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => startQuiz(qId)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gov-blue text-white text-xs font-semibold rounded-lg hover:bg-gov-darkblue transition-colors flex-shrink-0 ml-4"
                >
                  <Play className="w-3 h-3" />
                  Take Quiz
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ---------- Tab 3: Quiz History --------------------------------- */

  const renderHistoryTab = () => {
    if (historyLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-gov-blue animate-spin" />
        </div>
      );
    }

    if (historyError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{historyError}</p>
          <button
            onClick={fetchHistory}
            className="mt-2 px-3 py-1.5 text-xs font-semibold text-gov-blue border border-gov-blue/30 rounded-lg hover:bg-blue-50"
          >
            Retry
          </button>
        </div>
      );
    }

    if (historyItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <History className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">No quiz attempts yet</p>
          <p className="text-xs text-slate-400">Take a quiz to see your history here</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {historyItems.map((item: any, idx: number) => {
          const pct = item.total
            ? Math.round((item.score / item.total) * 100)
            : item.score_percentage ?? 0;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      pct >= 80
                        ? 'bg-emerald-50'
                        : pct >= 60
                        ? 'bg-amber-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <Award
                      className={`w-5 h-5 ${
                        pct >= 80
                          ? 'text-emerald-600'
                          : pct >= 60
                          ? 'text-amber-600'
                          : 'text-red-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">
                      {item.quiz_title ?? item.title ?? `Quiz Attempt #${idx + 1}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs font-bold ${scoreColor(pct)}`}>{pct}%</span>
                      <span className="text-[11px] text-slate-500">
                        {item.score}/{item.total ?? '—'} correct
                      </span>
                      {(item.completed_at || item.attempted_at || item.last_attempt_at) && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(
                            item.completed_at ?? item.attempted_at ?? item.last_attempt_at
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div
                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                      pct >= 80
                        ? 'border-emerald-400'
                        : pct >= 60
                        ? 'border-amber-400'
                        : 'border-red-400'
                    }`}
                  >
                    <span className={`text-xs font-bold ${scoreColor(pct)}`}>{pct}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ================================================================ */
  /*  MAIN RENDER                                                      */
  /* ================================================================ */

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'generate', label: 'Generate Quiz', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'quizzes', label: 'My Quizzes', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'history', label: 'Quiz History', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-blue to-indigo-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-navy-900">AI Quiz Studio</h1>
              <p className="text-xs text-slate-500">
                Upload documents and generate AI-powered quizzes
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-6 shadow-xs">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                if (t.key === 'quizzes') {
                  setActiveQuiz(null);
                  setQuizResult(null);
                }
              }}
              className={`flex items-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === t.key
                  ? 'bg-gov-blue text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'quizzes' && renderQuizzesTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>
    </div>
  );
};

export default QuizStudioPage;
