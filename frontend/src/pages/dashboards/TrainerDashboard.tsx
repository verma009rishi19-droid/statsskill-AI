import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  GraduationCap, BookOpen, Plus, FileQuestion, Users, Award,
  CheckCircle2, Star, Sparkles, TrendingUp, Clock, Filter, ChevronRight
} from 'lucide-react';

interface ManagedCourse {
  id: number;
  title: string;
  category: string;
  enrolled: number;
  completionRate: number;
  avgRating: number;
  status: 'Published' | 'Draft';
}

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<ManagedCourse[]>([
    { id: 1, title: 'Price Index Compilation & Overlap Imputation', category: 'Price Statistics', enrolled: 142, completionRate: 84.5, avgRating: 4.8, status: 'Published' },
    { id: 2, title: 'Stratified Multistage Sampling in PLFS', category: 'Sample Surveys', enrolled: 98, completionRate: 78.0, avgRating: 4.6, status: 'Published' },
    { id: 3, title: 'Automated Survey Scrutiny with Python (pandas)', category: 'Technical Tools', enrolled: 180, completionRate: 91.2, avgRating: 4.9, status: 'Published' },
    { id: 4, title: 'System of National Accounts 2008 & GVA Estimation', category: 'National Accounts', enrolled: 64, completionRate: 72.0, avgRating: 4.5, status: 'Draft' },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Price Statistics');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newCourse: ManagedCourse = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      enrolled: 0,
      completionRate: 0,
      avgRating: 5.0,
      status: 'Published',
    };
    setCourses([newCourse, ...courses]);
    setNewTitle('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-900">
              NSSTA Faculty Portal — {user?.full_name || 'Dr. Rajesh Kumar'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              Trainer / Curriculum Lead
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Author and orchestrate official statistical training modules, review learner progress metrics, and ground diagnostic assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/quiz-studio"
            className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-gov-blue" />
            <span>AI Quiz Studio</span>
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg bg-gov-blue hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Courses</span>
            <BookOpen className="w-4 h-4 text-gov-blue" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">{courses.length} Modules</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 4 Competency Domains</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Enrolled Officials</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-600 mt-2">
            {courses.reduce((acc, c) => acc + c.enrolled, 0)} Trainees
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">SSS &amp; ISS Cadre Members</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Completion Rate</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">81.4%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Exceeds 75% MoSPI Target</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Faculty Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">4.78 / 5.0</div>
          <div className="text-[11px] text-slate-400 mt-1">Based on 320 Course Reviews</div>
        </div>
      </div>

      {/* Managed Courses Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-navy-900">Curriculum &amp; Course Management</h2>
            <p className="text-[11px] text-slate-500">Live inventory of courses authored for NSSTA and iGOT Karmayogi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Course Title</th>
                <th className="py-2.5 px-3">Domain Category</th>
                <th className="py-2.5 px-3">Enrolled</th>
                <th className="py-2.5 px-3">Completion Rate</th>
                <th className="py-2.5 px-3">Learner Rating</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-semibold text-navy-900">{c.title}</td>
                  <td className="py-3 px-3 text-slate-600">{c.category}</td>
                  <td className="py-3 px-3 font-medium text-navy-900">{c.enrolled} officials</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.completionRate}%` }} />
                      </div>
                      <span className="font-semibold text-[11px]">{c.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 font-semibold text-amber-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{c.avgRating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      c.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to="/quiz-studio"
                      className="px-2.5 py-1 text-[11px] font-semibold text-gov-blue hover:underline"
                    >
                      Manage Quizzes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-navy-900">Author New Statistical Training Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Course Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Modern Data Anomaly Detection in Official Surveys"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Domain Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue"
                >
                  <option value="Price Statistics">Price Statistics &amp; CPI Compilation</option>
                  <option value="Sample Surveys">Sample Surveys (NSSO / PLFS)</option>
                  <option value="National Accounts">National Accounts (SNA 2008)</option>
                  <option value="Technical Tools">Technical Tools (Python / R / SQL)</option>
                  <option value="Digital Governance">Digital Governance &amp; DQAF</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-gov-blue hover:bg-blue-700 rounded-lg shadow-xs transition"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
