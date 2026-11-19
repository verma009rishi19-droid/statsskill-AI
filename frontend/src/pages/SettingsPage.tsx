import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { profileApi } from '../services/api';
import { OfficialProfile, Department, JobRole } from '../types';
import {
  RefreshCw,
  AlertCircle,
  Save,
  User,
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Settings,
  ArrowLeft,
} from 'lucide-react';

interface Qualification {
  degree: string;
  institution: string;
  year: string;
}

interface Training {
  title: string;
  institute: string;
  year: string;
}

interface ProfileFormData {
  designation: string;
  department_id: string;
  job_role_id: string;
  employee_code: string;
  current_assignment: string;
  state_posting: string;
  work_experience_years: number;
  career_objectives: string;
  preferred_language: string;
  educational_qualifications: Qualification[];
  previous_trainings: Training[];
}

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);

  const [formData, setFormData] = useState<ProfileFormData>({
    designation: '',
    department_id: '',
    job_role_id: '',
    employee_code: '',
    current_assignment: '',
    state_posting: '',
    work_experience_years: 0,
    career_objectives: '',
    preferred_language: 'English',
    educational_qualifications: [],
    previous_trainings: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profile, depts, roles] = await Promise.all([
        profileApi.getMyProfile(),
        profileApi.getDepartments(),
        profileApi.getJobRoles(),
      ]);
      setDepartments(depts.data);
      setJobRoles(roles.data);
      setFormData({
        designation: profile.data.designation || '',
        department_id: profile.data.department_id || '',
        job_role_id: profile.data.job_role_id || '',
        employee_code: profile.data.employee_code || '',
        current_assignment: profile.data.current_assignment || '',
        state_posting: profile.data.state_posting || '',
        work_experience_years: profile.data.work_experience_years || 0,
        career_objectives: profile.data.career_objectives || '',
        preferred_language: profile.data.preferred_language || 'English',
        educational_qualifications: profile.data.educational_qualifications?.length
          ? profile.data.educational_qualifications
          : [],
        previous_trainings: profile.data.previous_trainings?.length
          ? profile.data.previous_trainings
          : [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ProfileFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Qualification handlers
  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      educational_qualifications: [
        ...prev.educational_qualifications,
        { degree: '', institution: '', year: '' },
      ],
    }));
  };

  const updateQualification = (
    index: number,
    field: keyof Qualification,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.educational_qualifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, educational_qualifications: updated };
    });
  };

  const removeQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educational_qualifications: prev.educational_qualifications.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // Training handlers
  const addTraining = () => {
    setFormData((prev) => ({
      ...prev,
      previous_trainings: [
        ...prev.previous_trainings,
        { title: '', institute: '', year: '' },
      ],
    }));
  };

  const updateTraining = (
    index: number,
    field: keyof Training,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.previous_trainings];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, previous_trainings: updated };
    });
  };

  const removeTraining = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      previous_trainings: prev.previous_trainings.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setNotification(null);
      await profileApi.updateMyProfile(formData);
      setNotification({
        type: 'success',
        message: 'Profile updated successfully.',
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
          <p className="text-sm text-slate-500">Loading profile settings…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="text-sm text-gov-blue hover:underline mt-1"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue transition';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gov-blue" />
              Profile &amp; Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your professional profile and preferences
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gov-blue text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {notification.message}
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <User className="w-4 h-4 text-gov-blue" />
            Profile Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Designation */}
          <div>
            <label className={labelClass}>Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              placeholder="e.g. Deputy Director"
              className={inputClass}
            />
          </div>

          {/* Department */}
          <div>
            <label className={labelClass}>Department</label>
            <select
              value={formData.department_id}
              onChange={(e) =>
                handleInputChange('department_id', e.target.value)
              }
              className={inputClass}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Job Role */}
          <div>
            <label className={labelClass}>Job Role</label>
            <select
              value={formData.job_role_id}
              onChange={(e) => handleInputChange('job_role_id', e.target.value)}
              className={inputClass}
            >
              <option value="">Select Job Role</option>
              {jobRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Code */}
          <div>
            <label className={labelClass}>Employee Code</label>
            <input
              type="text"
              value={formData.employee_code}
              onChange={(e) =>
                handleInputChange('employee_code', e.target.value)
              }
              placeholder="e.g. MoSPI/2024/001"
              className={inputClass}
            />
          </div>

          {/* Current Assignment */}
          <div>
            <label className={labelClass}>Current Assignment</label>
            <input
              type="text"
              value={formData.current_assignment}
              onChange={(e) =>
                handleInputChange('current_assignment', e.target.value)
              }
              placeholder="e.g. National Sample Survey Office"
              className={inputClass}
            />
          </div>

          {/* State Posting */}
          <div>
            <label className={labelClass}>State Posting</label>
            <input
              type="text"
              value={formData.state_posting}
              onChange={(e) =>
                handleInputChange('state_posting', e.target.value)
              }
              placeholder="e.g. New Delhi"
              className={inputClass}
            />
          </div>

          {/* Work Experience */}
          <div>
            <label className={labelClass}>Work Experience (Years)</label>
            <input
              type="number"
              min={0}
              max={50}
              value={formData.work_experience_years}
              onChange={(e) =>
                handleInputChange(
                  'work_experience_years',
                  parseInt(e.target.value) || 0
                )
              }
              className={inputClass}
            />
          </div>

          {/* Preferred Language */}
          <div>
            <label className={labelClass}>Preferred Language</label>
            <select
              value={formData.preferred_language}
              onChange={(e) =>
                handleInputChange('preferred_language', e.target.value)
              }
              className={inputClass}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          {/* Career Objectives - full width */}
          <div className="md:col-span-2">
            <label className={labelClass}>Career Objectives</label>
            <textarea
              value={formData.career_objectives}
              onChange={(e) =>
                handleInputChange('career_objectives', e.target.value)
              }
              placeholder="Describe your career goals and areas of interest…"
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>
        </div>
      </div>

      {/* Educational Qualifications */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gov-blue" />
            Educational Qualifications
          </h2>
          <button
            onClick={addQualification}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gov-blue hover:text-blue-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Qualification
          </button>
        </div>

        {formData.educational_qualifications.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-2">
              No qualifications added yet
            </p>
            <button
              onClick={addQualification}
              className="text-xs font-semibold text-gov-blue hover:underline"
            >
              Add your first qualification
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.educational_qualifications.map((qual, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Degree</label>
                    <input
                      type="text"
                      value={qual.degree}
                      onChange={(e) =>
                        updateQualification(index, 'degree', e.target.value)
                      }
                      placeholder="e.g. M.Sc. Statistics"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input
                      type="text"
                      value={qual.institution}
                      onChange={(e) =>
                        updateQualification(
                          index,
                          'institution',
                          e.target.value
                        )
                      }
                      placeholder="e.g. ISI Kolkata"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input
                      type="text"
                      value={qual.year}
                      onChange={(e) =>
                        updateQualification(index, 'year', e.target.value)
                      }
                      placeholder="e.g. 2018"
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeQualification(index)}
                  className="mt-5 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                  title="Remove qualification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Trainings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gov-blue" />
            Previous Trainings
          </h2>
          <button
            onClick={addTraining}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gov-blue hover:text-blue-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Training
          </button>
        </div>

        {formData.previous_trainings.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-2">
              No trainings added yet
            </p>
            <button
              onClick={addTraining}
              className="text-xs font-semibold text-gov-blue hover:underline"
            >
              Add your first training
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.previous_trainings.map((training, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Training Title</label>
                    <input
                      type="text"
                      value={training.title}
                      onChange={(e) =>
                        updateTraining(index, 'title', e.target.value)
                      }
                      placeholder="e.g. Advanced Survey Design"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Institute</label>
                    <input
                      type="text"
                      value={training.institute}
                      onChange={(e) =>
                        updateTraining(index, 'institute', e.target.value)
                      }
                      placeholder="e.g. NSSTA, Greater Noida"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input
                      type="text"
                      value={training.year}
                      onChange={(e) =>
                        updateTraining(index, 'year', e.target.value)
                      }
                      placeholder="e.g. 2023"
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeTraining(index)}
                  className="mt-5 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                  title="Remove training"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gov-blue text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
