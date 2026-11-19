import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { profileApi, competencyApi } from '../services/api';
import { OfficialProfile, CompetencyResult } from '../types';
import {
  UserCheck, Building2, Briefcase, Award, GraduationCap, Clock,
  Calendar, CheckCircle, Edit3, Save, X, RefreshCw, ShieldAlert
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<OfficialProfile | null>(null);
  const [competencyResults, setCompetencyResults] = useState<CompetencyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [currentAssignment, setCurrentAssignment] = useState('');
  const [careerObjectives, setCareerObjectives] = useState('');
  const [statePosting, setStatePosting] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        profileApi.getMyProfile(),
        competencyApi.getMyResults()
      ]);
      setProfile(pRes.data);
      setCompetencyResults(cRes.data || []);
      setCurrentAssignment(pRes.data.current_assignment || '');
      setCareerObjectives(pRes.data.career_objectives || '');
      setStatePosting(pRes.data.state_posting || '');
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileApi.updateMyProfile({
        current_assignment: currentAssignment,
        career_objectives: careerObjectives,
        state_posting: statePosting,
      });
      setProfile(updated.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gov-blue text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-navy-900">{user?.full_name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {profile?.cadre || 'SSS Cadre'}
                </span>
                {profile?.verified_by_manager ? (
                  <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-gov-blue border border-blue-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified Official Record
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Self-Reported Baseline
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {profile?.designation} • {profile?.department?.name}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 mt-2">
                <span>Employee Code: <strong className="text-slate-800">{profile?.employee_code || 'N/A'}</strong></span>
                <span>Posting: <strong className="text-slate-800">{profile?.state_posting}</strong></span>
                <span>Service: <strong className="text-slate-800">{profile?.work_experience_years} Years</strong></span>
              </div>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-gov-blue text-white text-xs font-semibold hover:bg-gov-darkblue flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Current Assignment & Objectives */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Current Operational Assignment
            </span>
            {isEditing ? (
              <textarea
                value={currentAssignment}
                onChange={(e) => setCurrentAssignment(e.target.value)}
                rows={3}
                className="mt-1.5 w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-gov-blue"
              />
            ) : (
              <p className="mt-1 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {profile?.current_assignment || 'No active operational assignment specified.'}
              </p>
            )}
          </div>

          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Career Development Objectives
            </span>
            {isEditing ? (
              <textarea
                value={careerObjectives}
                onChange={(e) => setCareerObjectives(e.target.value)}
                rows={3}
                className="mt-1.5 w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-gov-blue"
              />
            ) : (
              <p className="mt-1 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {profile?.career_objectives || 'No career development objectives entered.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Qualifications & Past Trainings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
            <GraduationCap className="w-4 h-4 text-gov-blue" />
            <h2 className="text-sm font-bold text-navy-900">Educational Qualifications</h2>
          </div>
          <div className="space-y-3">
            {profile?.educational_qualifications?.map((q: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="font-semibold text-slate-800">{q.degree}</div>
                <div className="text-slate-700 mt-0.5">{q.institution} ({q.year})</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
            <Award className="w-4 h-4 text-gov-blue" />
            <h2 className="text-sm font-bold text-navy-900">Authorized Previous Training Records</h2>
          </div>
          <div className="space-y-3">
            {profile?.previous_trainings?.map((t: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="font-semibold text-slate-800">{t.title}</div>
                <div className="text-slate-700 mt-0.5">{t.institute} ({t.year})</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assessed Competency Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-navy-900">Assessed Competencies & Evidence Registry</h2>
            <p className="text-xs text-slate-700">Official proficiencies derived from diagnostic assessments and verified training records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-3">Competency</th>
                <th className="py-2.5 px-3">Assessed Level (1-4)</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Evidence Source</th>
                <th className="py-2.5 px-3">Last Assessed</th>
                <th className="py-2.5 px-3">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competencyResults.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {r.competency?.name || `Competency #${r.competency_id}`}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      r.assessed_proficiency >= 3.5 ? 'bg-purple-100 text-purple-800' :
                      r.assessed_proficiency >= 3.0 ? 'bg-emerald-100 text-emerald-800' :
                      r.assessed_proficiency >= 2.0 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Level {r.assessed_proficiency.toFixed(1)} / 4.0
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {Math.round(r.confidence_score * 100)}%
                  </td>
                  <td className="py-3 px-3">
                    <span className="capitalize text-slate-700 px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                      {r.evidence_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {new Date(r.last_assessed_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={r.supporting_notes || ''}>
                    {r.supporting_notes || 'Assessed through official diagnostic battery.'}
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
